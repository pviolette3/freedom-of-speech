var socket = io.connect(getHost());
var codes = {
  userChange: '1',
  message: '2',
  censored: '3'
};
$(function() {
  $('#data').focus();
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
socket.on('connect', function() {
  socket.user = prompt('Name?');
  socket.emit('adduser', socket.user);
  
  socket.on(codes.message, function(data) {
     $('#conversation').prepend('<div><b>' + data.from.name +':</b>' + data.message + '</div>');
  });

  socket.on(codes.userChange, function(data) {
    $('#users').empty();
    $.each(data.all, function(key, value) {
      var userRep = value.name;
      console.log('socket.user is ' + socket.user);
      console.log(value);
      if(socket.user === value.name) {
        userRep = '<b>' + userRep + '</b>'
      }
      $('#users').append('<div>' + userRep + '</div>');
    });
  });

  socket.on(codes.censored, function(data){
    if(data.from && data.reason) {
      $('#conversation').prepend('<div class="censored"><b>' + data.from.name +
                                 '</b> was censored because ' + data.reason + '</div>');
    } 
  });
});

