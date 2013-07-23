function activate(app, check, sanitize, chatroom, censorers, io, models) {

  app.get('/', function(req, res) {
    res.redirect('/login');
  });

  app.get('/chat', function(req, res) {
    console.log('GET /chat');
    if(!req.cookies.user) {
      return res.redirect('/login');
    }
    res.render('start_chat', {rooms: rooms, user: req.cookies.user || 'none'});
  });

  app.get('/chat/:id', function(req, res) {
    try {
      check(req.params.id).isInt();
    }catch(e) { 
      res.statusCode = 404;
      return res.send('Error: 404 not found');
    }
    if(req.params.id < 0) {
      res.statusCode = 404;
      return res.send('Error: 404 not found');
    }
    var id = req.params.id;
    if(!rooms[id]) {
      return res.send('Error: No room with ' + id + ' exists.');
    }
    if(req.cookies.user) {
      return res.render('active_chat', {host: req.host, name: rooms[id].name, user: req.cookies.user, id: id, admin: rooms[id].admin});
    }else {
      res.redirect('login', {error: 'Please log in.'});
    }
  });

  app.get('/chat/:id/settings', function(req, res) {
    try {
      check(req.params.id).isInt();
    }catch(e) { 
      res.statusCode = 404;
      return res.send('Error: 404 not found');
    }
    if(req.params.id < 0) {
      res.statusCode = 404;
      return res.send('Error: 404 not found');
    }

    if(!req.cookies.user) {
      return res.redirect('/login');
    }
    var id = req.params.id;
    if(!rooms[id]) {
      return res.send(404, 'That room does not exist');
    }
    var room = rooms[id];
    return res.render('chat_settings', {
      name: room.name,
      id: id,
      weights: room.weights
    });
  });

  app.post('/chat/:id/weights', function(req, res) {
    try {
      check(req.params.id).isInt();
    }catch(e) { 
      res.statusCode = 404;
      return res.send('Error: 404 not found');
    }
    if(req.params.id < 0) {
      res.statusCode = 404;
      return res.send('Error: 404 not found');
    }

    if(!req.cookies.user) {
      return res.redirect('/login');
    }
    var id = req.params.id;
    if(!rooms[id]) {
      return res.send(404, 'That room does not exist');
    }
    var room = rooms[id];
    room.weights[req.body.word] =  req.body.weight;
    return res.redirect('/chat/' + id + '/settings');
  });

  app.get('/login', function(req, res) {
   if(req.cookies.user) {
     return res.redirect('/chat');
   }
   return res.render('login', {error: null});
  });

  app.post('/login', function(req, res) {
    console.log('Got POST /login: cookies are');
    var their_name = req.body.user;
    try {
      check(their_name, {
        notNull: 'Please enter your username',
        notEmpty: 'Please enter your username',
        isAlphanumeric: 'Please enter only numbers and letters'
      }).notNull().notEmpty().isAlphanumeric();
      sanitize(their_name).xss();
    }catch(e) {
      console.log(e);
      return res.render('login', {error: e.message});
    }
    //success!
    console.log('success!! Logging in...');
    res.clearCookie('error', {path: '/login'});
    res.cookie('user', their_name, {path: '/login'});
    res.cookie('user', their_name, {path: '/chat'});
    res.redirect('/chat');
  });

  function hash(string) {
      var result = 0, i, char;
      if (string.length === 0) return result;
      for (i = 0, l = string.length; i < l; i++) {
              char  = string.charCodeAt(i);
              result  = ((result<<5)-result)+char;
              result |= 0; // Convert to 32bit integer
      }
      if(result < 0) { return -result;}
      return result;
  }

  var rooms = {};
  app.post('/chat/new', function(req, res) {
    if(!req.cookies.user) {
      return res.redirect('/login');
    }
    var name = clean(req.body.name);
    if(name.length > 15) {
      return res.render('start_chat', {error: "Name too long"});
    }
    var id = hash(name);
    if(rooms[id]) {
      return res.redirect('/chat/' + id);
    }
    var roominfo = createRoom(chatroom, censorers, io, id);
    rooms[id] = {
      room: roominfo.room,
      name: name,
      weights: roominfo.weights,
      admin: req.cookies.user
    };
    return res.redirect('/chat/' + id);
  });

  function clean(data) {
    return sanitize(data).xss();
  }

  function createRoom(chatroom, censorers, io, id) {
    var listeners = [];
    if(process.env.RUNMONGO && process.env.RUNMONGO != 'no') {
      models.activate();
      listeners.push(models.newMongoDBListener());
    }
    if(process.env.RUNLOG && process.env.RUNLOG != 'no') {
      listeners.push(new chatroom.FSCensorLogger('ml/' + id + 'censored.txt', 'ml/' + id + 'noncensored.txt'));
    }
    var censorer = censorers.newMLLinearCombCensor('ml/weights.txt', 10);
    
    var theRoom = chatroom.createRoomWithListeners(listeners, censorer);
    io.of('/' + id).on('connection', function(socket) {
      console.log("Connecting to " + id);
      theRoom.addListener(new chatroom.SocketIOForwardListener(socket));
      socket.on('adduser', function(data) {
        console.log("Listening for " + id);
        console.log("Got adduser " + data.id);
        if(data.id == id) {
          socket.user = new chatroom.User(clean(data.user));
          theRoom.addUser(socket.user);
        }
      });
      socket.on('disconnect', function() {
        theRoom.removeUser(socket.user);
      });
      socket.on('sendchat', function(data) {
        console.log("Listening for " + id);
        console.log("Got sendchat for " + data.id);
        if(data.id == id) {
          theRoom.sendMessage(socket.user, clean(data.message));
        }
      });
    });
    return {room: theRoom, weights: censorer.weights};
  }

  app.get('/logout', function(req, res) {
    res.clearCookie('user', {path: '/login'});
    res.clearCookie('user', {path: '/chat'});
    res.redirect('/login');
  });

  app.get('/about', function(req, res) {
    return res.render('about');
  });

  app.get('/rules', function(req, res) {
    return res.render('rules');
  });

  app.get('/country_laws', function(req, res) {
    return res.render('country_laws');
  });
}

exports.activate = activate;
