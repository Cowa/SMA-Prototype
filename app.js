var express = require('express'),
    http    = require('http'),
    sio     = require('socket.io');

var app     = express(),
    server  = http.createServer(app),
    io      = sio.listen(server);

// Get handler

app.use('/css', express.static(__dirname + '/views/css'))
   .use('/js' , express.static(__dirname + '/views/js'))

.get('/', function(req, res) {
    res.sendfile(__dirname + '/views/index.html');
})

.get('/share', function(req, res) {
	res.sendfile(__dirname + '/views/share.html');
})

.use(function(req, res, next) {
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Page not found');
});

// Sockets handler

io.sockets.on('connection', function(socket) {
    socket.on('new', function(message) {
	   joinRoom(socket);
    });
});

server.listen(1337);

/***************
 ** FUNCTIONS ** 
 ***************/

// Join a room which has less than 2 clients
function joinRoom(socket) {
	
	var i     = 0,
		found = false,
	    room  = 'moor';
	
	// Join an existing room (with a client already)
	for (var key in io.sockets.manager.rooms) {
		if (key != "") {
			console.log(io.sockets.clients(key.substring(1)).length);
			if (io.sockets.clients(key.substring(1)).length < 2) {
				found = true;
				room = key.substring(1);
			}
		}
	}
	
	// Join a fresh room
	if (!found) {
		while (roomExists('room' + i)) i++;
		room = 'room' + i;
	}
	
	socket.join(room);
	console.log('Client entering ' + room);
}

// Check if a room exists
function roomExists(room) {
	return (typeof io.sockets.manager.rooms['/' + room] != 'undefined');
}