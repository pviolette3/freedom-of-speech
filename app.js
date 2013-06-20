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
io = socketio.listen(server);
io.set('log level', 1);

app.get('/', function(req, res) {
  res.render('chat', {host:req.host});
});

var users = []

io.sockets.on('connection', function(socket) {
  
  function addUser(user) {
    if(users.indexOf(user) < 0) {
      users.push(user);
    }
    return;
  }

  function removeUser(user) {
    var index = users.indexOf(user);
    if(index >= 0) {
      users.splice(index, 1);
    }
  }

  socket.on('sendchat', function(data) {
    io.sockets.emit('updatechat', socket.user, data);
  });

  socket.on('adduser', function(username) {
    console.log("got add user");
    socket.user = username;
    addUser(username);
    console.log(users);
    socket.emit('updatechat', 'SERVER', 'you have connected');
    socket.broadcast.emit('updatechat', 'SERVER: ', username + ' has connected.');
    io.sockets.emit('updateusers', users);
  });

  socket.on('disconnect', function(){
    removeUser(socket.user);
    io.sockets.emit('updateusers', users);
    socket.broadcast.emit('updatechat', 'SERVER ', socket.user + ' has left.');
  });
});
