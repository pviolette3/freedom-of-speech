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
  app.use(express.cookieParser());
  app.use(app.router);
});
console.log('Launching app on port ' + PORT + '.');
server.listen(PORT);
io = socketio.listen(server);
io.set('log level', 1);
routes.activate(app, check, sanitize, chatroom, censorers, io, models);
