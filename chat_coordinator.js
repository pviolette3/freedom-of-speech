function ChatCoordinator() {
  this.users = [];
  this.messages = [];
}

ChatCoordinator.prototype.addUser = function(user) {
    if(this.users.indexOf(user) < 0) {
      this.users.push(user);
    }
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
  this.messages.push(user + ':' + ' ' + message);
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

module.exports = {
  ChatCoordinator: ChatCoordinator,
  NoGunsCoordinator: NoGunsCoordinator
}
