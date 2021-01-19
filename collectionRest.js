var mongodb = require('mongodb')
const { parseUrl } = require('query-string')
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
                        { $addFields: { password: '$credentialsData.password' } },
                        { $project: { credentialsData: false } }
                    ]).toArray(function(err, result) {
                        if(err || !result || !result[0])
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
                        { $addFields: { password: '$credentialsData.password' } },
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
                collection.findOne({email: env.parsedPayload.email}, function(err, result){
                    if(err)
                        lib.serveError(env.res, 400)
                    if(result)
                        lib.serveError(env.res, 400, 'this email already exist')
                    else{
                        if(env.parsedPayload.role == 1 || env.parsedPayload.role == 2){
                            if(env.parsedPayload && env.parsedPayload.email){
                                collection.insertOne({
                                    role: env.parsedPayload.role,
                                    email: env.parsedPayload.email,
                                    firstName: env.parsedPayload.firstName,
                                    lastName: env.parsedPayload.lastName,
                                    year: env.parsedPayload.year
                                })
                                collection.findOne({email: env.parsedPayload.email}, function(err, result2){
                                    if(err || !result2)
                                        lib.serveError(env.res, 400, 'insert failed')
                                    db.credentialsCollection.insertOne({
                                        person_id: result2._id,
                                        password: env.parsedPayload.password,
                                        role: result2.role
                                    })
                                })
                                lib.serveJson(env.res, env.parsedPayload)
                            }
                            else lib.serveError(env.res, 400, 'no date to insert')
                        }
                        else lib.serveError(env.res, 400, 'wrong role value')
                    }
                })
                break    
            case 'PUT': 
                if(_id) {
                    collection.find({$and: [{email: env.parsedPayload.email}, 
                                    {_id: {$ne: _id}}]}).toArray(function(err, result){
                        if(err)
                            lib.serveError(env.res, 400)
                        if(result && result[0]){
                            lib.serveError(env.res, 400, 'this email already exist')
                        }
                        else{
                            if(env.parsedPayload.role == 1 || env.parsedPayload.role == 2){
                                delete env.parsedPayload._id
                                collection.findOneAndUpdate({ _id: _id },
                                                            { $set: env.parsedPayload },
                                                            { returnOriginal: false }, function(err, result2) {
                                if(err || !result2.value)
                                    lib.serveError(env.res, 404, 'object not found')
                                else{
                                    db.credentialsCollection.findOneAndUpdate({ person_id: _id }, { $set: { role: result2.value.role, password: result2.value.password } },
                                                                              { returnOriginal: false }, function(err, result3) {
                                        if(err || !result3.value) {
                                            lib.serveError(env.res, 404, 'no credentials')
                                            return
                                        }
                                    })
                                    lib.serveJson(env.res, result2.value)
                                }
                                })  
                            }
                            else lib.serveError(env.res, 400, 'wrong role value')
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