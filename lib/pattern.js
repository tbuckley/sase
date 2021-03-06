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

  this.length = pattern.length;
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

Pattern.prototype.testSymbol = function(pos, pred) {
  return pred(this.symbolAt(pos));
};

Pattern.prototype.isNegPosition = function(pos) {
  return this.testSymbol(pos, Symbol.isNeg);
};

// getStartPosition returns the position of the pattern's first symbol
// Returns position (int)
Pattern.prototype.getStartPosition = function() {
  return 0;
};

// isEndPosition returns the position of the pattern's final symbol
// Returns position (int)
Pattern.prototype.getEndPosition = function() {
  return this.pattern.length - 1;
};

// getStartSymbol returns the symbol at the start of the pattern
// Returns symbol
Pattern.prototype.getStartSymbol = function(name) {
  return this.symbolAt(this.getStartPosition());
};

// getEndSymbol returns the symbol at the end of the pattern
// Returns symbol
Pattern.prototype.getEndSymbol = function() {
  return this.symbolAt(this.getEndPosition());
};

Pattern.prototype.symbolAt = function(pos) {
  return this.pattern[pos];
};

exports.Pattern = Pattern;