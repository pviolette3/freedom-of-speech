var fs = require('fs');
var censors = require('censorers');

function newMLLinearCombCensor(weightsFilename, callback) {
  var data = fs.readSync(weightsFilename, 'utf8');
  var resultWeights = {} 
  lines = data.split(/\r\n|\r|\n/g);
  for(var i = 0; i < lines.length; i++) {
    tokens = lines[i].split(',');
    word = tokens[0]
    weight = tokens[1]
    resultWeights[word] = parseFloat(weight);
  }
  
 return new MLLinearCombCensor(resultWeights, threshold);
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
