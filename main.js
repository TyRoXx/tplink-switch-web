var http = require("http"),
url = require("url"),
port = process.argv[2] || 8888;

var writePage = function (response) {
    response.write('<li><a href="/on">Switch on</a>');
    response.write('<li><a href="/off">Switch off</a>');
};

var ok = function (response) {
    response.writeHead(200, {
        "Content-Type": "text/html"
    });
    writePage(response);
    response.end();
};

var encrypt = function (message) {
    var result = new Buffer(4 + message.length);
    var key = 171;
    for (let i = 0; i < message.length; ++i) {
        key = result[4 + i] = (message[i] ^ key);
    }
    return result;
};
var net = require('net');
var switchPlug = function (response, state) {
    var client = new net.Socket();
    client.connect(9999, '192.168.178.87', function () {
        var command = '{"system":{"set_relay_state":{"state":' + state + '}}}';
        console.log('Connected');
        var commandUtf8 = Buffer.from(command, 'utf8');
        console.log(encrypt(commandUtf8));
        client.write(encrypt(commandUtf8));
        client.on('data', function (data) {
            console.log('Received: ' + data);
            client.destroy();
        });
        client.on('close', function () {
            console.log('Connection closed');
        });
        ok(response);
    });
};

http.createServer(function (request, response) {
    var uri = url.parse(request.url).pathname;
    if (uri === "/") {
        ok(response);
    } else if (uri === "/on") {
        switchPlug(response, '1');
    } else if (uri === "/off") {
        switchPlug(response, '0');
    } else {
        response.writeHead(404, {
            "Content-Type": "text/plain"
        });
        response.write("404 Not Found\n");
        response.end();
    }
}).listen(parseInt(port, 10));
