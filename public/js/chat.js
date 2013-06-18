var socket = io.connect(getHost());
//  var socket = io.connect('http://ec2-174-129-119-201.compute-1.amazonaws.com/');
document.name = prompt("Your name?");
socket.emit('adduser', document.name);

socket.on('updatechat', function(username, data) {
  $('#conversation').append('<b>' + username + ':</b> ' + data + '<br>');
});

socket.on('updateusers', function(data) {
  $('users').empty();
  $.each(data, function(key, value) {
    $('#users').append('<div>' + key + '</div>');
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
