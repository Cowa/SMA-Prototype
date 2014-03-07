// Socket connection to server
var socket = io.connect('192.168.0.34:1337');

// Tell server we wanna share
socket.emit('new', 'Share.');

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
});

socket.on('role', function(role) {
	
	var message = 'clockwork';
	
	if(role == 'sender')        message = 'Your turn to share.';
	else if(role == 'receiver') message = 'Please wait the share.';
	
	$('#role').text(message);
});

socket.on('receive_message', function(message) {
	$('#share_box_content').append('<p>Not me: '+ message +'</p>');
});

socket.on('clear_room', function() {
	$('#share_box_content').empty();
});

function share() {

	var message = $('#to_share').val();
	
	socket.emit('send_message', message);
	
	$('#to_share').val('').focus();
	$('#share_box_content').append('<p>Me: '+ message +'</p>');
}

$('#share_form').submit(function () {

    share();
    return false; // avoid page reloading
});