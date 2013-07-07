function activate(app, check) {
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

  app.get('/login', function(req, res) {
    return res.render('login');
  });

  app.post('/login', function(req, res) {
    var their_name = req.body.user;
    try {
      check(their_name, {
        notNull: 'Please enter your username',
        notEmpty: 'Please enter your username',
        isAlphanumeric: 'Please enter only numbers and letters'
      }).notNull().notEmpty().isAlphanumeric();
    }catch(e) {
      res.redirect('/login')
    }
    res.render('/chat', {host: req.host, user: their_name})
  });
}

exports.activate = activate;
