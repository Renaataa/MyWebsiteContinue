var db = require('./db')
var login = require('./login')
var collectionRest = require('./collectionRest')
var transfer = require('./transfer')
const lib = require('./lib')

module.exports = {

    handle: function(env) {
        switch(env.parsedUrl.pathname) {
            case '/login':
                login.handle(env) 
                break
            case '/person':
                if(env.sessionData.role == 1/* [1, 2].includes(env.sessionData.role) */) {
                    /*
                    var options = {}
                    options.availableMethods = env.sessionData.role == 1 ? [ 'GET', 'POST', 'PUT', 'DELETE'] : [ 'GET' ]
                    options.projectionGet = env.sessionData.role == 2 ? [ '_id', 'firstName', 'lastName' ] : null
                    */
                    collectionRest.handle(env, db.personCollection /*, options */)
                } else {
                    lib.serveError(env.res, 403, 'permission denied')
                }
                break
            case '/personList':
                if(env.sessionData.role == 2 && env.req.method == 'GET') {
                    transfer.personList(env)
                } else {
                    lib.serveError(env.res, 403, 'permission denied')
                }
                break
            case '/group':
                collectionRest.handle(env, db.groupCollection)
                break
            case '/transfer':
                if(env.sessionData.role == 2) {
                    transfer.perform(env)
                } else {
                    lib.serveError(env.res, 403, 'permission denied')
                }
                break
            default:
                return false
        }
        return true
    }

}