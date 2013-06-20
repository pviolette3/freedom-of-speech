var socket = io.connect(getHost());

var name = prompt("Your name?");
socket.emit('adduser', name);

socket.on('updatechat', function(data) {
  $('#conversation').empty();
  for(var i = 0; i < data.length; i++) {
    $('#conversation').prepend('<div>' + data[i] + '</div>');
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
