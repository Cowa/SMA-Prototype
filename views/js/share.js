// Socket connection to server
var socket = io.connect('192.168.0.34:1337');

// Tell server we wanna share
socket.emit('new');

socket.on('room_state', function(msg) {
	
	if (msg == 0) {
		$('#state').text('You are alone, please wait.').show();
		$('#under_state').text('Don\'t worry, someone will soon be connected (hopefully).').show();
		$('#share_box').hide();
	} else if (msg == 1) {
		$('#state').hide();
		$('#under_state').text('You are in touch with someone.').show();
		$('#share_box').show();
	} else {
		$('#state').text('Error.').show();
		$('#under_state').text('Error.').show();
	}
	$('#tryAgain').hide();
});

socket.on('role', function(role) {
	
	var message = 'clockwork';
	
	if(role == 'sender') {
		message = 'Your turn to share.';
		$('#share_form').show();
	} else if(role == 'receiver') {
		message = 'Please wait the share.';
		$('#share_form').hide();
	}
	$('#vote').hide();
	$('#role').text(message);
	$('#tryAgain').hide();
});

socket.on('receive_message', function(message) {

	$('#share_box_content').append('<p>Not me: '+ message +'</p>');
	$('#vote').show();
	$('#fine').text('Fun');
	$('#bad').text('Bad');
	$('#role').text('You got something. How is it ?');
	$('#under_state').text('Don\'t let the sharer waits too long.').show();
	$('#tryAgain').hide();
});

socket.on('clear_room', function() {
	$('#share_box_content').empty();
});

socket.on('eos', function(message) {

	var state, under_state;
	
	if(message == 1) state = 'So... it was bad ?', under_state = 'I\'m sure next time will be way better.';
	if(message == 0) state = 'Your share was bad.', under_state = 'From the receiver\'s point of view.';
	
	$('#state').text(state).show();
	$('#under_state').text(under_state).show();
	$('#share_box').hide();
	$('#tryAgain').show();
});

// When client shares something
function share() {

	var message = $('#to_share').val();
	
	socket.emit('send_message', message);
	
	$('#share_form').hide();
	$('#to_share').val('').focus();
	$('#share_box_content').append('<p>Me: '+ message +'</p>');
	$('#role').text('Well done. Now wait the vote.');
	$('#under_state').text('It may take a moment depending on the share.').show();
}

$('#share_form').submit(function () {
    share();
    return false; // avoid page reloading
});

// When client likes the share
function fine() {
	socket.emit('fine');
}

// When client dislike the share
function bad() {
	socket.emit('bad');
}
