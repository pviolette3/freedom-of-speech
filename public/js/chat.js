function start() {
  var chatInfo = getChatInfo();
  var socket = io.connect(chatInfo.host);
  console.log(chatInfo.host);
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
      var sent = {
        message: message,
        id: chatInfo.id
      };
      socket.emit('sendchat', sent);
      console.log("Sent")
      console.log(sent)
    });

    $('#data').keypress(function(e) {
      if(e.which == 13) {//enter key
        $(this).blur();
        $('#datasend').focus().click();
      }
    });
  });
  socket.on('connect', function() {
    socket.user = chatInfo.user;
    socket.emit('adduser', {
      user: socket.user,
      id: chatInfo.id
    });
    
    function updateUsers(users) {
      $('#users').empty();
      $.each(users, function(key, value) {
        var userRep = value.name;
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
        var message = "because of the words ";
        var inserted = false
        for(var i = 0; i < data.reason.tokens.length; i++) {
          if(data.reason.tokenScores[i] > 0) {
            if(!inserted) {
              message = message + data.reason.tokens[i];
              inserted = true;
            }else {
              message = message + ", " + data.reason.tokens[i];
            }
          }
        }
        message += ".";
        addConversation('<div class="text-error"><b>' + data.from.name +
                                   '</b> was censored because ' + message + '</div>');
      } 
    });
  });
}
start();
