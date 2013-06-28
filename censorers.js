var fs = require('fs');
var chatroom = require('./chatroom');

function newBannedWordsCensorer(filename) {
  var listCensored = new ListCensorer();
  fs.readFile(filename, 'utf8', function(err, data) {
    if(err) {return console.log(err);}
    var words = data.split(/\r\n|\r|\n/g);
    words.forEach(function(word) {
      if(word) {
        listCensored.addBannedWord(word);
      }
    });
  });
  return listCensored;
}
function ListCensorer(list) {
  this.censored = [];
  if(list) {
    var that = this;
    list.forEach(function(word) {
      that.addBannedWord(word);
    });
  }
};

ListCensorer.prototype.addBannedWord = function(word) {
  this.censored.push(word.toLowerCase());
};

ListCensorer.prototype.censor = function(from, message) {
  var words = message.split(' ');
  var censoredMessage = message;
  for(var i = 0; i < words.length; i++) { 
    var word = words[i];
    if(this.censored.indexOf(word.toLowerCase()) > -1) {
      return new YesCensor(from, message, 'message contained a banned word.');
    }
  }
  return NoCensor;
}

function YesCensor(from, message, reason ) {
  this.message = message;
  this.reason = reason;
  this.from = from;
}

YesCensor.prototype.toString = function() {return this.from.toString() + this.message.toString() + this.reason.toString();}

var NoCensor = null; 

var censorNothing = {
  censor: function(user, message) {
    return NoCensor;
  },
  toString: function() {return 'censor nothing';}
};

exports.censorNothing = censorNothing;
exports.results = {
    Yes: YesCensor,
    No: NoCensor
};
exports.ListCensorer = ListCensorer;
exports.newBannedWordsCensorer = newBannedWordsCensorer;
