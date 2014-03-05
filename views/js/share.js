// Socket connection to server
var socket = io.connect('http://localhost:1337');

// Tell server we're new
socket.emit('new', 'Hello World !');