var express = require('express');
var socketio = require('socket.io');
var path = require('path');

var app = express(),
  http = require('http'),
  server = http.createServer(app),
  sanitize = require('validator').sanitize,
    check = require('validator').check;


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
  res.redirect('/chat');
});

app.get('/chat', function(req, res) {
  res.render('chat', {host:req.host});
});

app.get('/chat/:id', function(req, res) {
  if(!check(req.params.id).isInt()) {
    res.statusCode = 404;
    return res.send('Error: 404 not found');
  }
  if(req.params.id < 0) {
    res.statusCode = 404;
    return res.send('Error: 404 not found');
  }
  return res.send(req.params.id);
});


function clean(data) {
  return sanitize(data).xss();
}
var chatroom = require('./chatroom');
var listeners = [new chatroom.SocketIOForwardListener(io.sockets)];
var theRoom = chatroom.createRoomWithListeners(listeners);

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
