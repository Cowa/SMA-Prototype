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
.use('/js', express.static(__dirname + '/views/js'))
.use('/img', express.static(__dirname + '/views/img'))

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

	// Client disconnects
	socket.on('disconnect', function(message) {
		if (wasInRoom(socket)) {
			var room = getRoom(socket);
			socket.leave(room);
			
			updateNbSharingClient();
			updateRoomState(room);
			
			socket.broadcast.to(room).emit('clear_room', message);
		}
	});
	
	// Client wants to share
    socket.on('new', function(message) {
		socket.leave('home');
		joinRoom(socket);
		updateNbSharingClient();
    });
	
	// Client arrives on home page
	socket.on('home', function(message) {
		socket.join('home');
		socket.emit('nb', numberOfClient());
	});
	
	// Client sends something
	socket.on('send_message', function(message) {
		socket.broadcast.to(getRoom(socket)).emit('receive_message', message);
	});
});

server.listen(1337);

/***************
 ** FUNCTIONS ** 
 ***************/
 
// Tell clients at Home the number of people sharing
function updateNbSharingClient() {
	io.sockets.in('home').emit('nb', numberOfClient());
}
 
// Join a room which has less than 2 clients & set role
function joinRoom(socket) {
	
	var i     = 0,
		found = false,
	    room  = 'moor';
		role  = 'zombi';
	
	// Join an existing room (with a client already)
	for (var key in io.sockets.manager.rooms) {
		if (key != "/home" && key != "") {
			if (io.sockets.clients(key.substring(1)).length < 2) {
				found = true;
				room = key.substring(1);
				
				io.sockets.clients(room)[0].get('role', function(err, grole) {
					if(grole == 'receiver') role = 'sender';
					else role = 'receiver';
				});
			}
		}
	}
	
	// Join a fresh room
	if (!found) {
		while (roomExists('room' + i)) i++;
		room = 'room' + i;
		role = 'sender';
	}
	
	socket.set('role', role);
	socket.join(room);
	console.log('Client entering ' + room);
	
	updateRoomState(room, socket);
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

// Send the state of a room to clients from it (-1: error, 0: alone, 1: ok)
// And tell them which role they got ('sender' or 'receiver')
function updateRoomState(room, socket) {
	
	var msg = -1;
	
	if      (io.sockets.clients(room).length <= 1) msg = 0;
	else if (io.sockets.clients(room).length == 2) msg = 1;

	for(var cl in io.sockets.clients(room)) {
		io.sockets.clients(room)[cl].get('role', function(err, role) {
			io.sockets.clients(room)[cl].emit('role', role);
		});
	}
	
	io.sockets.in(room).emit('room_state', msg)
}

// Check if a client was in a room (and not in home)
function wasInRoom(socket) {
	
	var inRoom = false;
	
	for(var key in io.sockets.manager.roomClients[socket.id]) {
		if (key != "/home" && key != "")
			inRoom = true;
	}
	
	return inRoom;
}

// Return the socket's room name
function getRoom(socket) {

	var room = "";
	
	for(var key in io.sockets.manager.roomClients[socket.id]) {
		if (key != "/home" && key != "")
			room = key.substring(1);
	}
		
	return room;
}

// Switch role, sender becomes receiver & vice versa
function switchRole(room) {
	
	for(var cl in io.sockets.clients(room)) {
		io.sockets.clients(room)[cl].get('role', function(err, role) {
			if(role == 'sender') io.sockets.clients(room)[cl].set('role', 'receiver');
			else io.sockets.clients(room)[cl].set('role', 'receiver');
		});
	}
}
