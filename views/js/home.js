// Socket connection to server
var socket = io.connect('http://localhost:1337');

// Tell server we're on home
socket.emit('home', 'Hi.');

socket.on('nb', function(data) {
	$('#sharingNb').text(data);
});