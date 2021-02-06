var db = require('./db')
var login = require('./login')
var collectionRest = require('./collectionRest')
var transfer = require('./transfer')
var changePassword = require('./changePassword')
const lib = require('./lib')

module.exports = {

    handle: function(env) {

        function dataValidate(method, data){
            if(data.email==null) return false
            if(data.role==null) return false
            if(data.firstName==null) return false
            if(data.lastName==null) return false
            if(data.year==null) return false
            if(method == 'POST' && data.password==null) return false

            return true
        }

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
                    collectionRest.handle(env, db.personCollection, /*options ,*/ function(env){
                        if(env.sessionData.role != 1) return false
                        if((env.req.method == 'POST' || env.req.method == 'PUT') && !dataValidate(env.req.method, env.parsedPayload)) return false
                        return true
                    })
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
                //collectionRest.handle(env, db.groupCollection)
                lib.serveError(env.res, 404, 'this page is not found')
                break
            case '/transfer':
                if(env.sessionData.role == 2) {
                    transfer.perform(env)
               } else { 
                    lib.serveError(env.res, 403, 'permission denied')
                }
                break
            case '/changePassword':
                changePassword.handle(env)
                break
            default:
                return false
        }
        return true
    }

}