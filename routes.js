function activate(app, check, sanitize) {
  app.get('/', function(req, res) {
    res.redirect('/login');
  });

  app.get('/chat', function(req, res) {
    console.log('GET /chat');
    res.render('chat', {host:req.host, user: req.cookies.user || 'none'});
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

  app.get('/login', function(req, res) {
   if(req.cookies.user) {
     return res.redirect('/chat');
   }
   return res.render('login');
  });

  app.post('/login', function(req, res) {
    console.log('Got POST /login: cookies are');
    console.log(req.cookies);
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
      res.cookie('error', e.message, {
          path: '/login', secure: true});
      return res.redirect('/login');
    }
    //success!
    console.log('success!! Logging in...');
    res.clearCookie('error', {path: '/login'});
    res.cookie('user', their_name, {path: '/login'});
    res.cookie('user', their_name, {path: '/chat'})
    res.redirect('/chat');
  });


  app.get('/logout', function(req, res) {
    res.clearCookie('user' {path: '/login'});
    res.clearCookie('user', {path: '/chat'});
    res.redirect('/login');
  });
}

exports.activate = activate;
