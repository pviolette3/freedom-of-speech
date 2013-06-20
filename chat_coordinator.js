function ChatCoordinator() {
  this.users = []
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

module.exports = {
  ChatCoordinator: ChatCoordinator
}
