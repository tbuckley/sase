var Symbol = require("./symbol");

// A pattern is a series of symbols at increasing position
// A sequence is a series of instances, with potentially empty positions
// A symbol can match a name
// An instance has a name, and therefore can match a symbol
// A symbol has a set of pre


function Pattern(options) {
  var pattern, positionsByName;
  pattern = this.pattern = options.pattern;
  positionsByName = this.positionsByName = {};
  pattern.forEach(function(symbol, i) {
    Symbol.forEachName(symbol, function(name) {
      if(name in positionsByName) {
        positionsByName[name].push(i);
      } else {
        positionsByName[name] = [i];
      }
    });
  });
}

Pattern.prototype.forEachSymbol = function(fn) {
  this.pattern.forEach(fn);
};

Pattern.prototype.forEachName = function(fn) {
  for(var name in this.positionsByName) {
    fn(name, this.positionsByName[name], this.positionsByName);
  }
};

Pattern.prototype.getPositionsForName = function(name) {
  return this.positionsByName[name];
};

// getPositives returns a sequence containing only positive symbols
Pattern.prototype.getPositives = function(sequence) {
  return this.pattern.map(function(name, i) {
    return (i in sequence) ? sequence[i] : null;
  }).filter(function(val, i) {
    return !Symbol.isNeg(this.pattern[i]);
  });
};

Pattern.prototype.positionPred = function(pos, pred) {
  return pred(this.pattern[pos]);
};

// isStartPosition tests if the given position is the start of the pattern
// Returns boolean
Pattern.prototype.isStartPosition = function(pos) {
  return pos === 0;
};

// isEndPosition tests if the given position is the end of the pattern
// Returns boolean
Pattern.prototype.isEndPosition = function(pos) {
  return pos+1 === this.pattern.length;
};

// isEndSymbol tests if the given name is a valid end to the pattern
// Returns boolean
Pattern.prototype.isEndSymbol = function(name) {
  var endIndex = this.pattern.length - 1;
  var endSymbol = this.pattern[lastIndex];
  return nameMatchesSymbol(name, endSymbol);
};

// isStartSymbol tests if the given name is a valid start to the pattern
// Returns boolean
Pattern.prototype.isStartSymbol = function(name) {
  var startSymbol = this.pattern[0];
  return nameMatchesSymbol(name, startSymbol);
};

exports.Pattern = Pattern;