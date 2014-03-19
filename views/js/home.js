/****************
 ** CONNECTION **
 ****************/

// Socket connection to server
var socket = io.connect('192.168.0.34:1337');

// Tell server we're on home
socket.emit('home');

/**************************
 ** DOM & SOCKET SECTION **
 **************************/

socket.on('nb', function(data) {
	$('#sharingNb').text(data);
});
