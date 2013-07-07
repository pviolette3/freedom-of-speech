var fs = require('fs'),
    path = require('path');
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

function newMLLinearCombCensor(weightsFilename, threshold) {
  var filename = weightsFilename || path.join('ml', 'weights.txt');
  console.log('reading ML weights from ' + filename);
  var data = fs.readFileSync(filename, 'utf8');
  var resultWeights = {} 
  lines = data.split(/\r\n|\r|\n/g);
  for(var i = 0; i < lines.length; i++) {
    tokens = lines[i].split(',');
    word = tokens[0]
    weight = tokens[1]
    resultWeights[word] = parseFloat(weight);
  }
  
  return new MLLinearCombCensor(resultWeights);
}

function MLLinearCombCensor(weights, threshold, tokenizer) {
  this.weights = weights || {};
  this.threshold = threshold || 10.0;
  this.tokenizer = tokenizer || ' ';
}

MLLinearCombCensor.prototype.censor = function(user, message) {
  if(this.score(message) >= this.threshold) {
    return new YesCensor(user, message, "Message received a score of " +
                          this.score(message) + " which was larger than " +
                          this.threshold);
  }
  else {
    return NoCensor;
  }
}

MLLinearCombCensor.prototype.score = function(message) {
  var tokens = message.split(this.tokenizer);
  var score = 0;
  for(var i = 0; i < tokens.length; i++) {
    score += this.scoreWord(tokens[i]);
  }
  return score;
}

MLLinearCombCensor.prototype.scoreWord = function(word) {
  var parsedWord = this.strip(word);
  return this.weights[parsedWord] || 0.0;
}

MLLinearCombCensor.prototype.strip = function(word) {
  return word.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()\s]/g,"")
              .toLowerCase();
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
exports.MLLinearCombCensor = MLLinearCombCensor;
exports.newMLLinearCombCensor = newMLLinearCombCensor;
