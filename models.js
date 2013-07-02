var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongodb.connection;
db.on('error', console.error.bind(console, 'connection error:'));
//db.once('open', do something...exports can't be defined asysnchronously)
//http://stackoverflow.com/questions/6425290/is-it-ok-to-initialize-exports-asynchronously-in-a-node-js-module

var userSchema = new mongoose.Schema({name: 'string'});
var User = mongoose.model('User', userSchema);
function userToDB(user) {
  return new User(user);
}

var updateSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  code: Number,
  data: Schema.Types.Mixed
});

var Update = mongoose.model('Update', updateSchema);

var conversationSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  history: [updateSchema]
});

var Conversation = mongoose.model('Conversation', conversationSchema);

function MongoDBListener(conversation) {
  this.conversation = conversation;
};

MongoDBListener.prototype.onUpdate(update) {
  this.conversation.history.push(new Update(update));
};

function newMongoDBListener = function() { return new MongoDBListener(new Conversation({history: []}))}

exports.newMongoDBListener = newMongoDBListener;
