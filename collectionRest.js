var mongodb = require('mongodb')
const { parseUrl } = require('query-string') 
const db = require('./db')

var lib = require('./lib') 

module.exports = {

    handle: function(env, collection, validator = null) {
        
        if(validator && !validator(env)){
            lib.serveError(env.res, 403, 'data is not validated')
            return
        }

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
                if(_id){ 
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
                        { $addFields: { password: {
                            $cond: {
                                if: {$eq: ['$credentialsData.ifGenerated', true]},
                                then: '$credentialsData.password',
                                else: null
                            }   
                        }
                        }},
                        { $project: { credentialsData: false } }
                    ]).toArray(function(err, result) {
                        if(err || !result || !result[0])
                            lib.serveError(env.res, 404, 'object not found')
                        else
                            lib.serveJson(env.res, result[0])
                    })}
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
                        { $addFields: { password: {
                            $cond: {
                                if: {$eq: ['$credentialsData.ifGenerated', true]},
                                then: '$credentialsData.password',
                                else: null
                            }   
                        }
                        }},
                        { $project: { credentialsData: false } }
                    ]).toArray(function(err, result) {
                        if(err || !result)
                            lib.serveError(env.res, 404, 'object not found')
                        else
                            lib.serveJson(env.res, result)
                    })
                }
                break
            case 'POST':
                if(env.parsedPayload.email=='') {
                    lib.serveError(env.res, 400, 'email is null')
                    return
                }
                if(env.parsedPayload.role != 1 && env.parsedPayload.role != 2)  {
                    lib.serveError(env.res, 400, 'wrong role value')
                    return
                }
                if(env.parsedPayload.password=="") {
                    lib.serveError(env.res, 400, 'password is null')
                    return
                }
                else {
                    collection.findOne({email: env.parsedPayload.email}, function(err, result){
                    if(err)
                        lib.serveError(env.res, 400)
                    if(result)
                        lib.serveError(env.res, 400, 'this email already exist')
                    else{
                        collection.insertOne({
                            email: env.parsedPayload.email,
                            firstName: env.parsedPayload.firstName,
                            lastName: env.parsedPayload.lastName,
                            year: env.parsedPayload.year
                        })
                        collection.findOne({email: env.parsedPayload.email}, function(err, result2){
                            if(err || !result2) lib.serveError(env.res, 400, 'insert failed')
                            db.credentialsCollection.insertOne({
                                person_id: result2._id,
                                password: env.parsedPayload.password,
                                role: env.parsedPayload.role,
                                ifGenerated: true
                            })
                            db.financialDataCollection.insertOne({
                                person_id: result2._id,
                                amount: 0
                            })
                            lib.serveJson(env.res, result2)
                        })
                    }
                    })
                }
                break     
            case 'PUT': 
                if(env.parsedPayload.email=='') {
                    lib.serveError(env.res, 400, 'email is null')
                    return
                }
                if(env.parsedPayload.role != 1 && env.parsedPayload.role != 2)  {
                    lib.serveError(env.res, 400, 'wrong role value')
                    return
                }
                else if(_id) {
                    collection.find({$and: [{email: env.parsedPayload.email}, 
                                            {_id: {$ne: _id}}]}).toArray(function(err, resultEmail){
                        if(err) lib.serveError(env.res, 400)
                        if(resultEmail && resultEmail[0]) lib.serveError(env.res, 400, 'this email already exist')
                        else{
                            delete env.parsedPayload._id
                            db.credentialsCollection.findOne({person_id: _id},function(err, resultPass){
                                if(err || !resultPass) lib.serveError(env.res, 404, 'object not found')
                                else if((env.parsedPayload.password && env.parsedPayload.password!="" && resultPass.ifGenerated) || !resultPass.ifGenerated){
                                    collection.findOneAndUpdate({ _id: _id },
                                                                { $set: {firstName: env.parsedPayload.firstName,
                                                                            lastName: env.parsedPayload.lastName,
                                                                            year: env.parsedPayload.year,
                                                                            email: env.parsedPayload.email }},
                                                                        { returnOriginal: false }, function(err, result){
                                            if(err || !result.value){
                                                lib.serveError(env.res, 404, 'object not found')
                                                return
                                            } else{
                                                db.credentialsCollection.findOneAndUpdate({ person_id: _id }, 
                                                                                            { $set: { role: env.parsedPayload.role } },
                                                                                            { returnOriginal: false }, function(err, resultCredentials) {
                                                    if(err || !resultCredentials.value) {
                                                        lib.serveError(env.res, 404, 'no credentials')
                                                        return
                                                    }
                                                    else {
                                                        db.credentialsCollection.findOneAndUpdate({ person_id: _id, ifGenerated: true }, 
                                                            { $set: { password: env.parsedPayload.password } },
                                                            { returnOriginal: false })
                                                    }
                                                    lib.serveJson(env.res, result.value)
                                                })
                                            }
                                        })
                                } else lib.serveError(env.res, 403, 'password can not be null')
                            })
                        }
                    }) 
                } else lib.serveError(env.res, 404, 'no object id')
                break
            case 'DELETE':
                if(_id) {
                    db.historyCollection.find({$or: [{sender: _id}, {recipient: _id}]}).toArray(function(err, resultHistory){
                        if(err)
                            lib.serveError(env.res, 400)
                        else if (resultHistory && resultHistory[0])
                            lib.serveError(env.res, 400, 'first delete history of this person')
                        else{
                            collection.findOneAndDelete({ _id: _id }, function(err, result) {
                                if(err || !result.value)
                                    lib.serveError(env.res, 404, 'object not found')
                                else{
                                    db.credentialsCollection.findOneAndDelete({ person_id: _id }, function(err, resultCredentials){
                                        if(err || !resultCredentials.value)
                                        lib.serveError(env.res, 404, 'credentials not found')
                                    })
                                    db.financialDataCollection.findOneAndDelete({ person_id: _id }, function(err, resultFinancialData){
                                        if(err || !resultFinancialData.value)
                                        lib.serveError(env.res, 404, 'financial data not found')
                                    })
                                lib.serveJson(env.res, result.value)
                                }
                            })
                        }
                    })
                } else lib.serveError(env.res, 400, 'no object id')
                break
            default:
                lib.serveError(env.res, 405, 'method not implemented')
        }
    }

}