// Socket connection to server
var socket = io.connect('http://localhost:1337');

// Tell server we wanna share
socket.emit('new', 'Share.');

socket.on('room_state', function(msg) {
	
	var data  = "Error",
 	    under = "Error";
	
	if (msg == 0) data = "You are alone, please wait.", under = "Don't worry, someone will soon be connected (hopefully).";
	else if (msg == 1) data = "You are connected with someone.", under = "Yeah, time to share.";
	
	$('#state').text(data);
	$('#under_state').text(under);
});