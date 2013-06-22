var express = require('express');
var socketio = require('socket.io');
var path = require('path');

var app = express(),
  http = require('http'),
  server = http.createServer(app);

var coordinators = require('./chat_coordinator')

var PORT = 8080;
process.argv.forEach(function(val, index, array) {
  if(val == 'prod') {
    PORT = 80;
  }
});
app.set('view engine', 'ejs')
app.configure(function() {
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
});

server.listen(PORT);
io = socketio.listen(server);
io.set('log level', 1);

app.get('/', function(req, res) {
  res.render('chat', {host:req.host});
});

var chatCordinator = coordinators.factory.newTextFileCoordinator(); 

io.sockets.on('connection', function(socket) {

  socket.on('sendchat', function(data) {
    chatCordinator.addMessage(socket.user, data);
    io.sockets.emit('updatechat', chatCordinator.getMessages());
  });

  socket.on('adduser', function(username) {
    socket.user = username;
    chatCordinator.addUser(username);
    io.sockets.emit('updatechat', chatCordinator.getMessages());
    io.sockets.emit('updateusers', chatCordinator.getUsers());
  });

  socket.on('disconnect', function(){
    chatCordinator.removeUser(socket.user);
    io.sockets.emit('updateusers', chatCordinator.getUsers());
    io.sockets.emit('updatechat', chatCordinator.getMessages());
  });
});
