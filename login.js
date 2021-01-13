var lib = require('./lib')
var db = require('./db')

var serveSessionData = function(env) {
    lib.serveJson(env.res, {
        session: env.session,
        login: env.sessionData.login,
        firstName: env.sessionData.firstName,
        role: env.sessionData.role
    })
}

module.exports = {
    handle: function(env) {
        switch(env.req.method) {
            case 'GET':
                serveSessionData(env)
                break
            case 'POST':
                db.personCollection.findOne({ email: env.parsedPayload.login }, function(err, result1) {
                    if(err || !result1) {
                        lib.serveError(env.res, 401, 'authorization failed')
                    } else {
                        db.credentialsCollection.findOne({ person_id: result1._id }, function(err, result2) {
                            if(err || !result2 || result2.password != env.parsedPayload.password) {
                                lib.serveError(env.res, 401, 'authorization failed')
                            } else {
                                env.sessionData.login = env.parsedPayload.login
                                env.sessionData.firstName = result1.firstName
                                env.sessionData.role = result2.role
                                env.sessionData._id = result1._id
                                serveSessionData(env)
                            }
                        })
                    }
                })
                break
            case 'DELETE':
                delete env.sessionData.login
                delete env.sessionData.firstName
                delete env.sessionData.role
                delete env.sessionData._id
                serveSessionData(env)
                break
            default:
                lib.serveError(env.res, 405, 'method not implemented')
                return
        }
    }
}