require('proof')(13, require('cadence')(prove))

function prove (async, assert) {
    var Delta = require('delta')
    var Semblance = require('..')
    var semblance = new Semblance
    var http = require('http')
    var server = http.createServer(semblance.dispatch()), request
    var connection = process.version.split('.')[1] >= 12 ? 'close' : 'keep-alive'
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
        request.end(new Buffer(1024 * 1024 + 1))
        new Delta(async()).ee(request).on('response')
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
        new Delta(async()).ee(request).on('response')
    }, function (response) {
        assert(response.statusCode, 200, 'ok')
        var received = semblance.shift()
        delete received.headers
        assert(received, {
            method: 'POST',
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
        new Delta(async()).ee(request).on('response')
    }, function (response) {
        async(function () {
            new Delta(async()).ee(response).on('data', function (chunk) {
                assert(chunk.toString(), 'x', 'set payload')
            }).on('end')
        }, function () {
            assert(response.statusCode, 200, 'ok')
            var received = semblance.shift()
            assert(!('content-type' in received.headers), 'no mime type')
            delete received.headers
            assert(received, {
                method: 'POST',
                url: '/test',
                body: {}
            }, 'no mime type received')
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
        new Delta(async()).ee(request).on('response')
    }, function (response) {
        async(function () {
            new Delta(async()).ee(response).on('data', function (chunk) {
                assert(chunk.toString(), '{"message":"Hello, World!"}\n', 'set payload')
            }).on('end')
        }, function () {
            assert(response.statusCode, 200, 'ok')
            var received = semblance.shift()
            assert(received.headers['content-type'], 'application/json', 'mime type')
            delete received.headers
            assert(received, {
                method: 'POST',
                url: '/test',
                body: { key: 'value' }
            }, 'mime type received')
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
        new Delta(async()).ee(request).on('response')
    }, function (response) {
        request.abort()
        assert(semblance._received.length, 1, 'uncleared')
        semblance.clear()
        assert(semblance._received.length, 0, 'cleared')
        server.close(async())
    })
}
