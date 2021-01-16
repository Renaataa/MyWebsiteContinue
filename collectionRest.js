var mongodb = require('mongodb')
const db = require('./db')

var lib = require('./lib')

module.exports = {

    handle: function(env, collection) {

        var _id = null
        if(env.parsedUrl.query._id) {
            try {
                _id = mongodb.ObjectID(env.parsedUrl.query._id)
            } catch(ex) {
                lib.serveError(env.res, 406, '_id ' + env.parsedUrl.query._id + ' is not valid')
                return
            }
        }

        switch(env.req.method) {
            case 'GET':
                if(_id)
                    collection.aggregate([
                        {
                            $match:{_id: _id}
                        },
                        {
                            $lookup: {
                                from: 'credentials',
                                localField: '_id',
                                foreignField: 'person_id',
                                as: 'credentialsData'
                            }
                        },
                        { $unwind: '$credentialsData' },
                        { $addFields: { role: '$credentialsData.role' } },
                        { $project: { credentialsData: false } }
                    ]).toArray(function(err, result) {
                        if(err || !result)
                            lib.serveError(env.res, 404, 'object not found')
                        else
                            lib.serveJson(env.res, result[0])
                    })
                else {
                    collection.aggregate([
                        {
                            $match:{}
                        },
                        {
                            $lookup: {
                                from: 'credentials',
                                localField: '_id',
                                foreignField: 'person_id',
                                as: 'credentialsData'
                            }
                        },
                        { $unwind: '$credentialsData' },
                        { $addFields: { role: '$credentialsData.role' } },
                        { $project: { credentialsData: false } }
                    ]).toArray(function(err, result) {
                        db.credentialsCollection.find({}).toArray(function(err, result2){
                            lib.serveJson(env.res, result)
                        })
                        
                    })
                }
                break
            case 'POST':
                collection.insertOne(env.parsedPayload, function(err, result) {
                    if(err || !result.ops || !result.ops[0])
                        lib.serveError(env.res, 400, 'insert failed')
                    else{
                        db.credentialsCollection.insertOne({
                            person_id: result.ops[0]._id,
                            password: "",
                            role: result.ops[0].role
                        })
                        lib.serveJson(env.res, result.ops[0])
                    }      
                })
                break    
            case 'PUT': 
                if(_id) {
                    delete env.parsedPayload._id
                    collection.findOneAndUpdate({ _id: _id },
                                                { $set: env.parsedPayload },
                                                { returnOriginal: false }, function(err, result) {
                        if(err || !result.value)
                            lib.serveError(env.res, 404, 'object not found')
                        else{
                            db.credentialsCollection.findOneAndUpdate({ person_id: _id }, { $set: { role: result.value.role } },
                                { returnOriginal: false }, function(err, result2) {
                                if(err || !result2.value) {
                                    lib.serveError(env.res, 400, 'no credentials')
                                    return
                                }
                            })
                            lib.serveJson(env.res, result.value)
                        }
                    })
                } else
                    lib.serveError(env.res, 404, 'no object id')
                break
            case 'DELETE':
                if(_id) {
                    collection.findOneAndDelete({ _id: _id }, function(err, result) {
                        if(err || !result.value)
                            lib.serveError(env.res, 404, 'object not found')
                        else{
                            try{
                                db.credentialsCollection.findOneAndDelete({ person_id: _id })
                            } catch(e){
                                print(e)
                            }
                            lib.serveJson(env.res, result.value)
                        }
                    })
                } else {
                    lib.serveError(env.res, 400, 'no object id')
                }
                break
            default:
                lib.serveError(env.res, 405, 'method not implemented')
        }
    }

}