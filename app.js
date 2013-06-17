var express = require('express');
var socketio = require('socket.io');

var app = express();
var os = require('os');
console.log('hostname ' + os.hostname());

function startServer() { 
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
  //  app.use(express.static(__dirname + '/public'));
    app.use(app.router);
  });

  var server = app.listen(PORT);
  console.log("" + server.address().port);
};

startServer();

app.get('/', function(req, res) {
  console.log('host', req.host);
  res.render('chat', {host:req.host});
});

var users = {}
var io = socketio.listen(app);
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
