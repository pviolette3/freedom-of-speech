var socket = io.connect(getHost());
var codes = {
  addUser: '1',
  removeUser: '2',
  message: '3',
  censored: '4'
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
  socket.user = getUser();
  socket.emit('adduser', socket.user);
  
  function updateUsers(users) {
    $('#users').empty();
    $.each(users, function(key, value) {
      var userRep = value.name;
      console.log('socket.user is ' + socket.user);
      console.log(value);
      if(socket.user === value.name) {
        userRep = '<b>' + userRep + '</b>'
      }
      $('#users').append('<div>' + userRep + '</div>');
    });
  }

  function addConversation(message) {
   $('#conversation').prepend(message); 
  }

  socket.on(codes.message, function(data) {
     addConversation('<div><b>' + data.from.name +'</b>: ' + data.message + '</div>');
  });

  socket.on(codes.addUser, function(data) {
    addConversation('<div>' + data.changed.name + ' was added.</div>');
    updateUsers(data.all);
  });

  socket.on(codes.removeUser, function(data) {
    addConversation('<div>' + data.changed.name + ' has left.</div>'); 
    updateUsers(data.all);
  });

  socket.on(codes.censored, function(data){
    if(data.from && data.reason) {
      addConversation('<div class="text-error"><b>' + data.from.name +
                                 '</b> was censored because ' + data.reason + '</div>');
    } 
  });
});

