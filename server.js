var http = require('http')
var url = require('url')
var static = require('node-static')
var cookies = require('cookies')
var uuid = require('uuid')

var config = require('./config')
var db = require('./db')
var rest = require('./rest')

var httpServer = http.createServer()
var fileServer = new static.Server(config.frontendDir)

// sessions = { "1a3ae1d4-41e8-44da-a629-b04724d4813a": {}, ... }
var sessions = {}

httpServer.on('request', function(req, res) {

    var appCookies = new cookies(req, res)
    var session = appCookies.get('session')
    var now = Date.now()
    if(!session || !sessions[session]) {
        session = uuid.v4()
        sessions[session] = { from: req.connection.remoteAddress, created: now, touched: now }
    } else {
        sessions[session].touched = now
    }
    appCookies.set('session', session, { httpOnly: false })

    var env = {
        req: req,
        res: res,
        parsedUrl: {},
        parsedPayload: {},
        session: session,
        sessionData: sessions[session]
    }        

    var payload = ''
    req.on('data', function(data) {
        payload += data
    }).on('end', function() {

        try {
            env.parsedPayload = JSON.parse(payload)
        } catch(ex) {}
        try {
            env.parsedUrl = url.parse(req.url, true)
        } catch(ex) {}
        console.log(env.session, JSON.stringify(env.sessionData), req.method, env.parsedUrl.pathname, JSON.stringify(env.parsedUrl.query), JSON.stringify(env.parsedPayload))

        if(!rest.handle(env)) {
            fileServer.serve(req, res)
        }

    })
})

db.init(function() {
    console.log('Database connected, starting http server')
    httpServer.listen(config.port)
})