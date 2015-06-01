require('../proof')(1, require('cadence/redux')(prove))

function prove (async, assert) {
    var stream = require('stream')
    var Pseudo = require('../../http/pseudo'),
        UserAgent = require('../../http/ua'),
        Binder = require('../../net/binder'),
        Bouquet = require('../../net/bouquet'),
        pems = require('../../http/pems')
    var pseudo = new Pseudo(new Binder('https://127.0.0.1:8080', pems)),
        ua = new UserAgent
    var http = require('https')
    var server = http.createServer(pems, pseudo.dispatch())
    async(function () {
        server.listen(8080, '127.0.0.1', async())
    }, function () {
        ua.fetch(pseudo.binder, {
            url: '/test',
            headers: {
                'content-type': 'text/plain'
            },
            payload: new Buffer(1024 * 1024 * 4)
        }, async())
    }, function (body, response) {
        assert(response.statusCode, 413, 'errored')
    }, function () {
        server.close(async())
    })
}
