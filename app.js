var express = require('express'),
    http    = require('http'),
    sio     = require('socket.io');

var app     = express(),
    server  = http.createServer(app),
    io      = sio.listen(server);

// Get handler

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/views/index.html');
})
.use(function(req, res, next) {
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Page not found');
});

// Sockets handler

io.sockets.on('connection', function(socket) {
    socket.on('new_connected', function(message) {
       console.log(message);
       socket.emit('connected', 'you are connected');
    });
});

server.listen(1337);
