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
}

exports.activate = activate;
