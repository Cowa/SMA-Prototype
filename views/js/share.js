/****************
 ** CONNECTION **
 ****************/
 
// Socket connection to server
var socket = io.connect('192.168.0.34:1337');

// Tell server we wanna share
socket.emit('new');

/***********************
 ** SOCKET 'ON' EVENT **
 ***********************/

// When client gets room' state
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

// When client gets his role (sender or receiver)
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

// When client (the receiver) receives an image
socket.on('receive_image', function(image) {

	$('#vote').show();
	$('#fine').text('Fun');
	$('#bad').text('Bad');
	$('#role').text('You got something. How is it ?');
	$('#under_state').text('Don\'t let the sharer waits too long.').show();
	$('#tryAgain').hide();

	show_image(image);
});

// When client (the receiver) receives a video
socket.on('receive_video', function(video) {

	$('#vote').show();
	$('#fine').text('Fun');
	$('#bad').text('Bad');
	$('#role').text('You got something. How is it ?');
	$('#under_state').text('Don\'t let the sharer waits too long.').show();
	$('#tryAgain').hide();

	show_youtube(video);
});

// Remove share box content
socket.on('clear_room', function() {
	clear_share();
});

// When End Of Stream occured, the receiver puts an end by voting 'Bad'
socket.on('eos', function(message) {

	var state = 'Error eos.', under_state = 'See below.';
	
	if(message == 1)      state = 'So... it was bad ?', under_state = 'Oh. You were right. It was bad.';
	else if(message == 0) state = 'Your share was bad.', under_state = 'Don\'t be sad. Life is unfair.';
	
	$('#state').text(state).show();
	$('#under_state').text(under_state).show();
	$('#share_box').hide();
	$('#tryAgain').show();
});

/***************
 ** FUNCTIONS **
 ***************/

// Clear the share
function clear_share() {
	$('#share_box_content').empty();
}

// When client shares something
function share() {

	$('#share_form').hide();
	$('#role').text('Well done. Now wait the vote.');
	$('#under_state').text('It may take a moment depending on the share.').show();
}

// Display the shared image in the share box content
function show_image(image) {

	$('#share_box_content').append('<a href="'+ image +'"><img src="' + image + '"/></a>');
	$('#share_box_content > a').fancybox();
}

// Display the shared YouTube video
function show_youtube(video) {
	$('#share_box_content').append('<iframe id="ytplayer" type="text/html" width="640" height="360" src="https://www.youtube.com/embed/'+getYoutubeId(video)+'" frameborder="0" allowfullscreen>');
}

// When client likes the share
function fine() {
	socket.emit('fine');
}

// When client dislike the share
function bad() {
	socket.emit('bad');
}

// Share by URL
function share_any() {
	
	var url = $('#urlshare').val();
	
	if (isImage(url)) {
		show_image(url);
		socket.emit('send_image', url);
		share();
		$('#urlshare').attr('placeholder', 'URL to the share');
	} else if (isYoutube(url)) {
		show_youtube(url);
		socket.emit('send_video', url);
		share();
	} else {
		$('#urlshare').attr('placeholder', 'Invalid URL');
	}
	$('#urlshare').val('');
}

// Check if the given url is an image
function isImage(url) {
	return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

function isYoutube(url) {
	return(url.match(/watch\?v=([a-zA-Z0-9\-_]+)/) != null);
}

/*
* Get YouTube ID from various YouTube URL
* Author: takien
* URL: http://takien.com
*/
function getYoutubeId(url) {

	var id = '';
	url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
	if (url[2] !== undefined) {
		id = url[2].split(/[^0-9a-z_]/i);
		id = id[0];
	} else {
		id = url;
	}
	return id;
}

/*****************
 ** DOM SECTION **
 *****************/

$('#share_form').submit(function () {
    return false; // avoid page reloading
});

$('#imagefile').on('change', function(e) {

    var data = e.originalEvent.target.files[0];
	console.log(data);
	var reader = new FileReader();
    reader.onload = function(evt) {
		show_image(evt.target.result);
		socket.emit('send_image', evt.target.result);
		share();
    };
    reader.readAsDataURL(data);
});

$('#help_share').tooltip();
