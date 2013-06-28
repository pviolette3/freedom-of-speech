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

    describe('sending messages', function() {
      var room = new chatroom.Room(),
        one = new chatroom.User('one'),
        two = new chatroom.User('two'),
        three = new chatroom.User('three');
      var messages = ['hi from one!',
                      'hello there from three', 
                      'whaddup from four'],
        froms = [one, three, two],
        i = 0,
        hits = 0,
        check = function(update) {
          if(update.code === chatroom.codes.message) {
            assert.equal(messages[i], update.data.message);
            assert.equal(froms[i], update.data.from);
            hits++;
          }
        };
      beforeEach(function() {
        room.addUser(one, check);
        room.addUser(two, check);
        room.addUser(three, check);
      });
      it('should send messages', function() {
        for(var cur = 0; cur < froms.length; cur++) {
          room.sendMessage(froms[cur], messages[cur]);
          i++;
        }
        assert.equal(9, hits);
      });
    });

    describe('#censor', function() {
      var gunCensor = {
        censor: function(user, message) {
          if(message.indexOf('guns') > -1) {
            return new chatroom.YesCensor(user, message, 'Contains guns. No good.');
          }
          return chatroom.NoCensor;
        } 
      };
      var users = [new chatroom.User('Tom Brady'),
                   new chatroom.User('Tiger Woods'),
                   new chatroom.User('Steve Jobs')],
          messages = ['hello there', 'i like guns :('],
          sent = 0,
          censors = 0,
          check = function(update) {
            if(update.code === chatroom.codes.censored) {
              censors++;
              assert.equal(messages[1], update.data.message);
              assert.equal(users[2], update.data.from);
              assert.equal('Contains guns. No good.', update.data.reason);
            }else if(update.code === chatroom.codes.message) {
              sent++
              assert.equal(messages[0], update.data.message);
              assert.equal(users[0], update.data.from);
            }
          };
       var room = new chatroom.Room(gunCensor);
       users.forEach(function(user){
         room.addUser(user, check);
       });
       it('should censor based on the censor', function() {
         room.sendMessage(users[0], messages[0]);
         assert.equal(3, sent);
         room.sendMessage(users[2], messages[1]);
         assert.equal(3, censors);
       });
    });

    describe('#listeners', function() {
      var room = new chatroom.Room(),
        users = [new chatroom.User('Elmo'),
                 new chatroom.User('Bert'),
                 new chatroom.User('Ernie')];
      it('takes listeners independent of users', function() {
        var listener = {
          i: 0,
          expected: [chatroom.codes.userChange, chatroom.codes.userChange, chatroom.codes.message,
                      chatroom.codes.userChange, chatroom.codes.message, chatroom.codes.message,
                      chatroom.codes.userChange, chatroom.codes.userChange, chatroom.codes.userChange],
          onUpdate: function(update) {
            assert.equal(this.expected[this.i], update.code);
            this.i++;
          },
          done: function() { return this.i >= this.expected.length;},
          toString: function() {return '12345';}
        };
        room.addListener(listener);
        room.addUser(users[0]);
        room.addUser(users[1]);
        room.sendMessage(users[0], 'Hi ' + users[1]);
        room.addUser(users[2]);
        room.sendMessage(users[2], "What's up guys??");
        room.sendMessage(users[1], 'Hiyah I am the Karate Kid!');
        users.forEach(function(user) {
          room.removeUser(user);
        });
        assert.equal(listener.expected.length, listener.i);
        var count_before = listener.i;
        room.removeListener(listener);
        room.addUser(users[0]);
        room.removeUser(users[0]);
        assert.equal(count_before, listener.i);
      });
    });
  });
});
