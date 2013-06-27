var assert = require('assert'),
  chatroom = require('../chatroom');

describe('ChatCoordinator', function() {
  describe('#broacasting', function() {
    it('should add a user to the chat on get users', function() {
      var room = new chatroom.Room();
      var user = new chatroom.User('steve');
      room.addUser(user, function(update) {
        assert.equal(update.users, user);
        assert.equal(update.newConvo, chatroom.NoMessage);
        done();
      });
    });
  });

});
