require('proof')(1, require('cadence/redux')(prove))

require('cadence/ee')

function prove (async, assert) {
    var Pseudo = require('../..')
    var pseudo = new Pseudo
    var http = require('http')
    var server = http.createServer(pseudo.dispatch()), request
    async(function () {
        server.listen(8080, '127.0.0.1', async())
    }, function () {
        request = http.request({
            host: '127.0.0.1',
            port: 8080,
            path: '/test',
            method: 'POST',
            headers: {
                'content-type': 'text/plain'
            }
        })
        request.end(new Buffer(1024 * 1024 * 4))
        async.ee(request).end('response').error()
    }, function (response) {
        assert(response.statusCode, 413, 'errored')
        request.abort() // <- why?
    }, function () {
        server.close(async())
    })
}
