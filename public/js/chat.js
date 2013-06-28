var socket = io.connect(getHost());
var codes = {
  userChange: 1,
  message: 2,
  censored: 3
};

socket.on(codes.message, function(data) {
    if(data.from && data.message) {
       $('#conversation').prepend('<div><b>' + data.from.name +':</b>' + data.message + '</div>');
    } 
});

socket.on(codes.userChange, function(data) {
  $('#users').empty();
  $.each(data.all, function(key, value) {
    $('#users').append('<div>' + value + '</div>');
  });
});

socket.on(codes.censored, function(data){
  if(data.from && data.reason) {
    $('#conversation').prepend('<div class="censored"><b>' + data.from.name +
                               '</b> was censored because ' + data.reason + '</div>');
  } 
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
