var fs = require('fs');

function ChatCoordinator() {
  this.users = [];
  this.messages = [[], []];
}

ChatCoordinator.prototype.addUser = function(user) {
    this.users.push(user);
    return;
}

ChatCoordinator.prototype.removeUser = function (user) {
  var index = this.users.indexOf(user);
  if(index >= 0) {
    this.users.splice(index, 1);
  }
}

ChatCoordinator.prototype.getUsers = function() {
  return this.users;
}

ChatCoordinator.prototype.getMessages = function() {
  return this.messages;
}

ChatCoordinator.prototype.addMessage = function(user, message) {
  this.messages[0].push(user);
  this.messages[1].push(message);
}

function NoGunsCoordinator() {
  ChatCoordinator.call(this);
}
NoGunsCoordinator.prototype = Object.create(ChatCoordinator.prototype);
NoGunsCoordinator.prototype.constructor = NoGunsCoordinator;

NoGunsCoordinator.prototype.addMessage = function(user, message) {
  censoredMessage = message.replace('guns', 'CENSORED');
  ChatCoordinator.prototype.addMessage.call(this, user, censoredMessage);
}

function TextFileCoordinator(filename) {
  this.censored = [];
  var censored = this.censored;
  console.log('reading: ' + filename);
  fs.readFile(filename, 'utf8', function(err, data) {
    if(err) {return console.log(err);}
    var words = data.split('\n');
    words.forEach(function(word) {
      if(word) {
        censored.push(word);
      }
    });
  });
  ChatCoordinator.call(this);
}

TextFileCoordinator.prototype = Object.create(ChatCoordinator.prototype);
TextFileCoordinator.prototype.constructor = TextFileCoordinator;

TextFileCoordinator.prototype.addMessage = function(user, message) {
  console.log('got message ' + message);
  console.log('censoring it with ' + this.censored);
  var words = message.split(' ');
  var censoredMessage = message;
  for(var i = 0; i < words.length; i++) { 
    var word = words[i];
    if(this.censored.indexOf(word) > -1) {
      censoredMessage = '';
      console.log('bad word! ' + word + ' matched ' + this.censored[this.censored.indexOf(word)]);
      break;
    }
    console.log('Did not contain ' + word);
   }
   console.log(message + ' => ' + censoredMessage);
  ChatCoordinator.prototype.addMessage.call(this, user, censoredMessage);
}

var chatCoordFactory = {
  newChatCoordinator: function() { return new ChatCoordinator();},
  newNoGunsCoordinator: function() { return new NoGunsCoordinator();},
  newTextFileCoordinator: function() {return new TextFileCoordinator('bannedwords.txt');}
};

module.exports = {
  factory: chatCoordFactory
}
