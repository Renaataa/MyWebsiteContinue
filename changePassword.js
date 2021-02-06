var mongodb = require('mongodb')

var lib = require('./lib')
var db = require('./db')

module.exports = { 

    handle: function(env) {

        var _id = ''
        var password = null
        if(env.sessionData._id) {
            try {
                _id = mongodb.ObjectID(env.sessionData._id)
            } catch(ex) {
                lib.serveError(env.res, 406, '_id ' + env.sessionData._id + ' is not valid')
                return
            }
        } 
        
        if(env.parsedUrl.query.password) password = env.parsedUrl.query.password
        
        switch(env.req.method) {
            case 'POST': 
                if(_id && password){
                    if(env.parsedPayload!=true && env.parsedPayload!=false){
                        lib.serveError(env.res, 404, 'no full data')
                        return 
                    }
                    var ifGenerated = env.parsedPayload
                    db.credentialsCollection.findOneAndUpdate({ person_id: _id }, { $set: { password: password, ifGenerated: ifGenerated} }, function(err, result) {
                        if(err || !result || !result.value) {
                            lib.serveError(env.res, 404, 'no person')
                            return 
                        }
                        lib.serveJson(env.res, result.value)
                    })
                }
                else lib.serveError(env.res, 404, 'no object id or/and password')
                break
            case 'GET':  
                if(_id){
                    db.credentialsCollection.findOne({ person_id: _id }, function(err, result) {
                        if(err || !result) {
                            lib.serveError(env.res, 404, 'no person')
                            return 
                        }
                        if(result.password!=password){
                            lib.serveError(env.res, 404, 'this password is wrong')
                            return 
                        } 
                        lib.serveJson(env.res, result)
                    })
                }
                else lib.serveError(env.res, 404, 'no object id')
                break
            default:
                lib.serveError(env.res, 405, 'method not implemented')
        }
    }
}