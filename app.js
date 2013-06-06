var express = require('express');
var socketio = require('socket.io');

var app = express.createServer();
var io = socketio.listen(app);

app.listen(80);
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
  console.log("Sending index page...");
});

var users = {}

io.sockets.on('connection', function(socket) {
  
  socket.on('sendchat', function(data) {
    io.sockets.emit('updatechat', socket.user, data);
  });

  socket.on('adduser', function(username) {
    socket.user = username;
    users[username] = username; //add, but don't duplicate
    socket.emit('updatechat', 'SERVER', 'you have connected');
    socket.broadcast.emit('updatechat', 'SERVER', username + 'has connected.');
    io.sockets.emit('updateusers', username);
  });

  socket.on('disconnect', function(){
    delete users[socket.user];
    io.sockets.emit('updateusers', users);
    socket.broadcast.emit('updatechat', 'SERVER', socket.user + ' has left.');
  });
});
