require('proof')(11, require('cadence/redux')(prove))

require('cadence/ee')

function prove (async, assert) {
    var Semblance = require('../..')
    var semblance = new Semblance
    var http = require('http')
    var server = http.createServer(semblance.dispatch()), request
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
        request = http.request({
            host: '127.0.0.1',
            port: 8080,
            path: '/test',
            method: 'POST',
            headers: {
                'content-type': 'text/plain'
            }
        })
        request.end('hello, world')
        async.ee(request).end('response').error()
    }, function (response) {
        assert(response.statusCode, 200, 'ok')
        assert(semblance.shift(), {
            method: 'POST',
            headers: {
                'content-type': 'text/plain',
                host: '127.0.0.1:8080',
                connection: 'keep-alive',
                'transfer-encoding': 'chunked'
            },
            url: '/test',
            body: 'hello, world'
        }, 'plain text')
        request.abort() // <- why?
        semblance.push({ headers: { 'x-header': 'value' }, payload: new Buffer('x') })
        request = http.request({
            host: '127.0.0.1',
            port: 8080,
            path: '/test',
            method: 'POST'
        })
        request.end('hello, world')
        async.ee(request).end('response').error()
    }, function (response) {
        async(function () {
            async.ee(response).on('data', function (chunk) {
                assert(chunk.toString(), 'x', 'set payload')
            }).end('end').error()
        }, function () {
            assert(response.statusCode, 200, 'ok')
            assert(semblance.shift(), {
                method: 'POST',
                headers: {
                    host: '127.0.0.1:8080',
                    connection: 'keep-alive',
                    'transfer-encoding': 'chunked'
                },
                url: '/test',
                body: {}
            }, 'no mime type')
            request.abort()
        })
    }, function () {
        request = http.request({
            host: '127.0.0.1',
            port: 8080,
            path: '/test',
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            }
        })
        request.end(JSON.stringify({ key: 'value' }))
        async.ee(request).end('response').error()
    }, function (response) {
        async(function () {
            async.ee(response).on('data', function (chunk) {
                assert(chunk.toString(), '{"message":"Hello, World!"}\n', 'set payload')
            }).end('end').error()
        }, function () {
            assert(response.statusCode, 200, 'ok')
            assert(semblance.shift(), {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    host: '127.0.0.1:8080',
                    connection: 'keep-alive',
                    'transfer-encoding': 'chunked'
                },
                url: '/test',
                body: { key: 'value' }
            }, 'no mime type')
            request.abort()
        })
    }, function () {
        semblance.trace = true
        request = http.request({
            host: '127.0.0.1',
            port: 8080,
            path: '/test',
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            }
        })
        request.end(JSON.stringify({ key: 'value' }))
        async.ee(request).end('response').error()
    }, function (response) {
        request.abort()
        assert(semblance._received.length, 1, 'uncleared')
        semblance.clear()
        assert(semblance._received.length, 0, 'cleared')
        server.close(async())
    })
}
