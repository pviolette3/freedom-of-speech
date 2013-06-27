var assert = require('assert'),
  chatroom = require('../chatroom');

describe('chatroom package', function() {
  describe('User', function() {
    it('should have a name', function() {
      var user = new chatroom.User('bob');
      assert.equal('bob', user.name)
    });  
  })

  describe('Room', function() {
    describe('#broacasting', function() {
      it('should add a user to the chat on get users', function(done) {
        var room = new chatroom.Room();
        var user = new chatroom.User('steve');
        room.addUser(user, function(update) {
          assert.deepEqual([user], update.data.all);
          assert.equal(user, update.data.changed);
          assert.equal(chatroom.codes.userChange, update.code); 
          done();
        });
      });

      it('should update all users in the chat room', function(done) {
        var room = new chatroom.Room();
        var first = new chatroom.User('first');
        var second = new chatroom.User('second');
        var i = 0,
            expected = [[first],
                        [first, second]],
            changed = [first, second],
            check = function(update) {
              assert.equal(chatroom.codes.userChange, update.code);
              assert.deepEqual(expected[i], update.data.all);
              assert.equal(changed[i], update.data.changed);
              i++;
              if(i >= expected.length) { done(); }
            };
        room.addUser(first, check);
        room.addUser(second, function(update) {});
      });
      
      it('should update all users in the chat room when leaving', function(done) {
        var room = new chatroom.Room();
        var first = new chatroom.User('first');
        var second = new chatroom.User('second');
        var i = 0, j = 0,
            expected = [[first],
                        [first, second],
                        [second]],
            changed = [first, second, first],
            check = function(update) {
              assert.ok(i < 2);
              assert.equal(chatroom.codes.userChange, update.code);
              assert.deepEqual(expected[i], update.data.all);
              assert.equal(changed[i], update.data.changed);
              i++;
            };
        room.addUser(first, check);
        room.addUser(second, function(update) {
         assert.equal(chatroom.codes.userChange, update.code);
          if(i == 2 && j == 1) {
             assert.deepEqual(expected[i], update.data.all);
             assert.equal(changed[i], update.data.changed);
             done();
          }else if(i == 2) { j++; }
        });
        room.removeUser(first); 
      });
    });
  });
});
