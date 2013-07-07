var fs = require('fs');
var censors = require('censorers');

function newMLLinearCombCensor(weightsFilename) {
  fs.readFile(weightsFilename, functioin(err, data) {
    if(err) {
      return console.log(err);
    }
    
    for(var i = 0; i < data.length; i++) {
    
    }
  });
}

function MLLinearCombCensor(weights, threshold, tokenizer) {
  this.weights = weights || {};
  this.threshold = threshold || 10.0;
  this.tokenizer = tokenizer || ' ';
}


MLLinearCombCensor.prototype.censor = function(user, message) {
  if(this.score(message) >= this.threshold()) {
    return new censors.Yes(user, message, "Message received a score of " +
                          this.score(message) + " which was larger than " +
                          this.threshold());
  }
  else {
    return censors.No;
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
  return weights[parsedWord] || 0.0;
}

MLLinearCombCensor.prototype.strip = function(word) {
  return word.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()\s]/g,"")
              .toLowerCase();
}

MLLinearCombCensor.prototype.threshold = function() { return this.threshold;}
