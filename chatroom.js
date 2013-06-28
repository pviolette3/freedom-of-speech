var NoCensor = null; 

var noneCensor = {
  censor: function(user, message) {
    return NoCensor;
  }
};

function Room(censor) {
  this.users = [];
  this.notifications = {};
  this.censor = censor || noneCensor;
  this.listeners = [];
}

var updateCodes = {
  userChange: 1,
  message: 2,
  censored: 3
}

var doNothing = function(update) {}

Room.prototype.addUser = function(user, callback) {
  this.users.push(user);
  this.notifications[user] = callback || doNothing;
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
  this.listeners.forEach(function(listener) {
    listener.onUpdate(update);
  });
}

Room.prototype.sendMessage = function(user, message) {
  var objections = this.censor.censor(user, message);
  var update = null;
  if(objections) {
    update = new Update(updateCodes.censored, objections);
  }else {
    update = new Update(updateCodes.message, new MessageUpdate(user, message)); 
  }
  this.notifyAllUsers(update);
}

Room.prototype.addListener = function(listener) {
  this.listeners.push(listener);
}

Room.prototype.removeListener = function(listener) {
  console.log('im alive');
  var rmIndex = this.listeners.indexOf(listener);
  console.log('still there');
  if(rmIndex > -1) {
    console.log('rming');
    this.listeners.splice(rmIndex, 1);
  }
}

function MessageUpdate(from, message) {
  this.from = from;
  this.message = message;
}

MessageUpdate.prototype.toString = function() {
  return this.from.toString() + this.message.toString();
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

function YesCensor(from, message, reason ) {
  this.message = message;
  this.reason = reason;
  this.from = from;
}

YesCensor.prototype.toString = function() {return this.from.toString() + this.message.toString() + this.reason.toString();}

module.exports = {
 Room: Room,
 User: User,
 codes: updateCodes,
 NoCensor: NoCensor,
 YesCensor: YesCensor
};
