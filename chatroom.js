var fs = require('fs');
var censorers = require('./censorers');

function Room(censor) {
  this.users = [];
  this.notifications = {};
  this.censor = censor || censorers.censorNothing;
  this.listeners = [];
}

Room.prototype.constructor = Room;
var doNothing = function(update) {}

Room.prototype.addUser = function(user, callback) {
  this.users.push(user);
  this.notifications[user] = callback || doNothing;
  var update = new Update(updateCodes.addUser, new UserChangeData(user, this.users));
  this.notifyAllUsers(update);
}

Room.prototype.removeUser = function(user) {
  var rmIndex = this.users.indexOf(user);
  if(rmIndex > -1) {
    this.users.splice(rmIndex, 1);
    this.notifications[user] = undefined;
  }
  var update = new Update(updateCodes.removeUser, new UserChangeData(user, this.users));
  this.notifyAllUsers(update);
}

Room.prototype.notifyAllUsers = function(update) {
  var that = this;
  this.users.forEach(function(user) {
    if(that.notifications[user] && typeof(that.notifications[user] === 'function' )) {
      that.notifications[user](update); 
    }
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
  var rmIndex = this.listeners.indexOf(listener);
  if(rmIndex > -1) {
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

var updateCodes = {
  addUser: 1,
  removeUser: 2,
  message: 3,
  censored: 4
};


function SocketIOForwardListener(to) {
  this.to = to;
}

SocketIOForwardListener.prototype. onUpdate = function(update) {
    if((update.code === updateCodes.message) ||
       (update.code === updateCodes.addUser) ||
       (update.code === updateCodes.removeUser) ||
       (update.code === updateCodes.censored) ) {
      console.log('Sending update:');
      console.log(update);
      this.to.emit(update.code, update.data);
    }
    else {
      console.log('Unrecognized message type: ');
      console.log(update);
    }
};

function FSLogger(censoredName, noncensoredName) {
  this.censoredName = censoredName;
  this.noncensoredName = noncensoredName;
}

FSLogger.prototype.onUpdate = function(update) {
  var that = this;
    if(update.code === updateCodes.message) {
      fs.appendFile(this.noncensoredName, update.data.message + '\n', function(err) {
        if(err) {
          console.log("ERROR appending to file " + that.censoredName);
          console.log(err);
        }
      });
    }
    else if(update.code === updateCodes.censored) {
      fs.appendFile(this.censoredName, update.data.message + '\n', function(err) {
         if(err) {
          console.log("ERROR appending to file " + that.noncensoredName);
          console.log(err);
        }
     });
    }
}
function createRoomWithListeners(listeners, censor) {
  var room = new Room(censor);
  listeners.forEach(function(listener) {
    room.addListener(listener);
  });
  console.log("Adding listener");
  return room;
}

module.exports = {
  Room: Room,
  User: User,
  codes: updateCodes,
  createRoomWithListeners: createRoomWithListeners,
  SocketIOForwardListener: SocketIOForwardListener,
  FSCensorLogger: FSLogger
};
