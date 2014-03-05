var express = require('express'),
    http    = require('http'),
    sio     = require('socket.io');

var app     = express(),
    server  = http.createServer(app),
    io      = sio.listen(server);

/*****************
 ** GET HANDLER **
 *****************/

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

/*********************
 ** SOCKETS HANDLER **
 *********************/

io.sockets.on('connection', function(socket) {

    socket.on('new', function(message) {
		socket.leave('home');
		joinRoom(socket);
		updateNbSharingClient(socket);
    });
	
	socket.on('disconnect', function(message) {
		updateNbSharingClient(socket);
	});
	
	socket.on('home', function(message) {
		socket.join('home');
		socket.emit('nb', numberOfClient());
	});
});

server.listen(1337);

/***************
 ** FUNCTIONS ** 
 ***************/
 
// Tell clients at Home the number of people sharing
 function updateNbSharingClient(socket) {
	socket.broadcast.to('home').emit('nb', numberOfClient());
 }
 
// Join a room which has less than 2 clients
function joinRoom(socket) {
	
	var i     = 0,
		found = false,
	    room  = 'moor';
	
	// Join an existing room (with a client already)
	for (var key in io.sockets.manager.rooms) {
		if (key != "/home" && key != "") {
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

// Return the number of clients in all rooms
function numberOfClient() {

	var n = 0;
	
	for (var key in io.sockets.manager.rooms) {
		if (key != "/home" && key != "")
			n += io.sockets.clients(key.substring(1)).length;
	}
	
	return n;
}