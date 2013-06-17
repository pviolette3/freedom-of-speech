var express = require('express');
var socketio = require('socket.io');
var path = require('path');

var app = express(),
  http = require('http'),
  server = http.createServer(app);

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
console.log("" + server.address().port);
io = socketio.listen(server);
io.set('log level', 10);

app.get('/', function(req, res) {
  console.log('host', req.host);
  res.render('chat', {host:req.host});
});

var users = []
io.sockets.on('connection', function(socket) {
  socket.on('sendchat', function(data) {
    console.log('got send chat');
    io.sockets.emit('updatechat', socket.user, data);
  });

  socket.on('adduser', function(username) {
    console.log("got add user");
    socket.user = username;
    users[username] = username; //add, but don't duplicate
    socket.emit('updatechat', 'SERVER', 'you have connected');
    socket.broadcast.emit('updatechat', 'SERVER', username + 'has connected.');
    io.sockets.emit('updateusers', username);
  });

  socket.on('disconnect', function(){
    console.log('got disconnect');
    delete users[socket.user];
    io.sockets.emit('updateusers', users);
    socket.broadcast.emit('updatechat', 'SERVER', socket.user + ' has left.');
  });
});
