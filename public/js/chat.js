var socket = io.connect(getHost());

socket.on('updatechat', function(data) {
  users = data[0];
  message = data[1];

  $('#conversation').empty();
  for(var i = 0; i < message.length; i++) {
    if(message[i]) {
       $('#conversation').prepend('<div><b>' + users[i]+':</b>' +message[i] + '</div>');
    } else {//There was no message => censored
       $('#conversation').prepend('<div class=censored>' 
                                  + users[i] + ' got censored !</div>');
    }
  }
});

socket.on('updateusers', function(data) {
  $('#users').empty();
  $.each(data, function(key, value) {
    $('#users').append('<div>' + value + '</div>');
  });
});

$(function() {
  $('#datasend').click(function() {
    var message = $('#data').val();
    $('#data').val('');
    $('#data').focus();
    socket.emit('sendchat', message);
  });

  $('#data').keypress(function(e) {
    if(e.which == 13) {//enter key
      $(this).blur();
      $('#datasend').focus().click();
    }
  });
});

//after everything is set up, we add user
var name = prompt("Your name?");
socket.emit('adduser', name);
$('#data').focus();
