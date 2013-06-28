var assert = require('assert'),
    should = require('should'),
    censorers = require('../censorers');
var noUser = new require('../chatroom').User('no user');
describe('ListCensorer', function(){
  it('should censor based on words', function() {
    var targets = ['hello', 'World'];
    var goodlist = ['', 'multiple phrases without the words',
                    'this is the Life'];
    var blacklist = ['hello there', 'there hello', 'wOrLd', 
                      'what in the world', 'why jack, HelLo .']
    var censor = new censorers.ListCensorer(targets);
    blacklist.forEach(function(badwords) {
      var result = censor.censor(noUser, badwords);
      assert.equal(badwords, result.message);
    });
    goodlist.forEach(function(goodwords) {
      should.not.exist(censor.censor(noUser, goodwords)); 
    });
  }); 

  it('should not crash without an initial list', function() {
    var censor = new censorers.ListCensorer();
    should.not.exist(censor.censor(noUser, 'Hello'));
  });
});
