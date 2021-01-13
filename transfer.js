var mongodb = require('mongodb')

var lib = require('./lib')
var db = require('./db')

module.exports = {

    perform: function(env) {

        var recipient = null
        try {
            recipient = mongodb.ObjectID(env.parsedUrl.query.recipient)
        } catch(ex) {
            lib.serveError(env.res, 406, 'recipient id ' + env.parsedUrl.query.recipient + ' broken')
            return
        }

        switch(env.req.method) {
            case 'GET':
                db.historyCollection.aggregate([
                    {
                        $match: {
                            $or: [
                                { sender: env.sessionData._id, delta: { $lt: 0 }},
                                { recipient: env.sessionData._id, delta: { $gt: 0 }}
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: 'persons',
                            localField: 'sender',
                            foreignField: '_id',
                            as: 'senderData'
                        }
                    },
                    {
                        $lookup: {
                            from: 'persons',
                            localField: 'recipient',
                            foreignField: '_id',
                            as: 'recipientData'
                        }
                    },
                    { $unwind: '$senderData' },
                    { $unwind: '$recipientData' },
                    { $addFields: { senderFirstName: '$senderData.firstName' } },
                    { $addFields: { senderLastName: '$senderData.lastName' } },
                    { $addFields: { recipientFirstName: '$recipientData.firstName' } },
                    { $addFields: { recipientLastName: '$recipientData.lastName' } },
                    { $project: { senderData: false, recipientData: false } }
                ]).toArray(function(err, result) {
                    if(err)
                        lib.serveError(env.res, 404, 'no transfers')
                    else
                        lib.serveJson(env.res, result)
                })
                break
            case 'POST':
                // id konta nadawcy: env.sessionData._id
                // id konta odbiorcy: recipient
                // kwota przelewu: env.parsedPayload.delta
                db.personCollection.findOne({ _id: env.sessionData._id }, function(err, senderData) {
                    if(err || !senderData) {
                        lib.serveError(env.res, 404, 'no sender')
                        return
                    }
                    var delta = isNaN(env.parsedPayload.delta) ? 0 : env.parsedPayload.delta
                    if(delta <= 0) {
                        lib.serveError(env.res, 400, 'delta should be positive')
                        return
                    }
                    if(senderData.amount < delta) {
                        lib.serveError(env.res, 400, 'not enough money')
                        return
                    }

                    senderData.amount -= delta

                    db.personCollection.findOneAndUpdate({ _id: recipient }, { $inc: { amount: delta } },
                        { returnOriginal: false }, function(err, result) {
                        if(err || !result.value) {
                            lib.serveError(env.res, 400, 'no recipient')
                            return
                        }
                        var recipientData = result.value

                        db.personCollection.findOneAndUpdate({ _id: senderData._id }, { $set: { amount: senderData.amount } })

                        var now = new Date().getTime()
                        db.historyCollection.insertOne({
                            date: now,
                            sender: senderData._id,
                            recipient: recipient,
                            delta: -delta,
                            amount_after: senderData.amount
                        })
                        db.historyCollection.insertOne({
                            date: now,
                            sender: senderData._id,
                            recipient: recipient,
                            delta: delta,
                            amount_after: recipientData.amount
                        })

                        lib.serveJson(env.res, senderData)
                    })
                })
                break
            case 'DELETE':
                db.personCollection.findOne({ _id: env.sessionData._id }, function(err, senderData) {
                    if(err || !senderData) {
                        lib.serveError(env.res, 404, 'no sender')
                        return
                    }
                    lib.serveJson(env.res, { amount: senderData.amount })
                })
                break
            default:
                lib.serveError(env.res, 405, 'method not implemented')
        }
    },

    personList: function(env) {
        db.personCollection.find({}).toArray(function(err, result) {
            lib.serveJson(env.res, result)
        })
    }
    
}