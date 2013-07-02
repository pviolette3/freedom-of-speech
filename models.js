var mongoose = require('mongoose');

function activate() {
  mongoose.connect('mongodb://localhost/test');

  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    console.log('database is open!')
  });
  //db.once('open', do something...exports can't be defined asysnchronously)
  //http://stackoverflow.com/questions/6425290/is-it-ok-to-initialize-exports-asynchronously-in-a-node-js-module
}

var userSchema = new mongoose.Schema({name: 'string'});
var User = mongoose.model('User', userSchema);
function userToDB(user) {
  return new User(user);
}

var updateSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  code: Number,
  data: mongoose.Schema.Types.Mixed
});

var Update = mongoose.model('Update', updateSchema);

var conversationSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  history: [updateSchema]
});

var Conversation = mongoose.model('Conversation', conversationSchema);

function MongoDBListener(conversation, autosave) {
  this.conversation = conversation;
  this.autosave = autosave;
  console.log('autosave is ' + autosave);
};

MongoDBListener.prototype.onUpdate = function(update) {
  console.log('mongodb listener was updated');
  this.conversation.history.push(new Update(update));
  if(this.autosave) {
    console.log('saving conversation...');
    console.log(this.conversation);
    this.conversation.save(function(err) {
      if(err) {
        console.log(err);
      }else {
        console.log('save successful');
      }
    });
  }
};

function newMongoDBListener() {
  return new MongoDBListener(new Conversation({history: []}), true);
}

exports.newMongoDBListener = newMongoDBListener;
exports.activate = activate;
