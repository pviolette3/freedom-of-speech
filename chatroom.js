
function Room() {
  this.users = [];
  this.notifications = {};
}

var updateCodes = {
  userChange: 1,
  newMessage: 2
}

Room.prototype.addUser = function(user, callback) {
  this.users.push(user);
  this.notifications[user] = callback;
  var update = new Update(updateCodes.userChange, new UserChangeData(user, this.users));
  this.notifyAllUsers(update);
}

Room.prototype.removeUser = function(user) {
  var rmIndex = this.users.indexOf(user);
  if(rmIndex > -1) {
    this.users.splice(rmIndex, 1);
    this.notifications[user] = undefined;
  }
  var update = new Update(updateCodes.userChange, new UserChangeData(user, this.users));
  this.notifyAllUsers(update);
}

Room.prototype.notifyAllUsers = function(update) {
  var that = this;
  this.users.forEach(function(user) {
    that.notifications[user](update); 
  });
}

function Update(code, data) {
  this.code = code;
  this.data = data;
}

function UserChangeData(changed, all) {
  this.changed = changed;
  this.all = all;
}

UserChangeData.prototype.toString = function() {
  return this.changed.toString() + this.all;
}

function User(name) {
  this.name = name;
}

User.prototype.toString = function() {return this.name;}

module.exports = {
 Room: Room,
 User: User,
 codes: updateCodes
};
