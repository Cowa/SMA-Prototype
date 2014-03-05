// Socket connection to server
var socket = io.connect('http://localhost:1337');

// Tell server we wanna share
socket.emit('new', 'Share.');