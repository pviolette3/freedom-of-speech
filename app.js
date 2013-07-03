var express = require('express');
var socketio = require('socket.io');
var path = require('path');
var app = express(),
  http = require('http'),
  server = http.createServer(app),
  sanitize = require('validator').sanitize,
  models = require('./models');
  check = require('validator').check;


var chatroom = require('./chatroom'),
    censorers = require('./censorers'),
    routes = require('./routes');

var PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs')
app.configure(function() {
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
});
console.log('Launching app on port ' + PORT + '.');
server.listen(PORT);
io = socketio.listen(server);
io.set('log level', 1);

routes.activate(app, check);

function clean(data) {
  return sanitize(data).xss();
}
var listeners = [new chatroom.SocketIOForwardListener(io.sockets)];
if(process.env.RUNMONGO && process.env.RUNMONGO != 'no') {
  models.activate();
  listeners.push(models.newMongoDBListener());
}

var theRoom = chatroom.createRoomWithListeners(listeners, censorers.newBannedWordsCensorer('bannedwords.txt'));
io.sockets.on('connection', function(socket) {

  socket.on('adduser', function(username) {
    socket.user = new chatroom.User(clean(username));
    theRoom.addUser(socket.user);
  });
  socket.on('disconnect', function() {
    theRoom.removeUser(socket.user);
  });
  socket.on('sendchat', function(data) {
    theRoom.sendMessage(socket.user, clean(data));
  });
});
