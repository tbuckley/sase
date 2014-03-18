// Symbols can be one of the following:
// - Basic:
//   "name1"
// - Any of a set:
//   any("name1", "name2")
// - Negation:
//   neg("name1")
//   neg(any("name1", name2))


// neg will match if the provided symbol is not present
// Returns a symbol (or null)
function neg(symbol) {
  if(isAny(symbol) || isBasic(symbol)) {
    return {type: "neg", value: symbol};
  }
  return null;
}

// any will match if any of the provided symbols are present
// Returns a symbol (or null)
function any() {
  var symbols = Array.prototype.slice.apply(arguments);
  var valid = symbols.length > 0;
  symbols.forEach(function(s) {
    valid = valid && isBasic(s);
  });
  if(valid) {
    return {type: "any", value: symbols};
  }
  return null;
}

// nameMatchesSymbol tests to see if the name matches the symbol
// Returns boolean
function nameMatchesSymbol(name, symbol) {
  var matches = false;
  forEachName(symbol, function(sName) {
    matches = matches || sName === name;
  });
  return matches;
}

// Test to see if the symbol is a basic symbol (aka string)
// Returns boolean
function isBasic(symbol) {
  return typeof symbol === "string";
}

// isNeg tests to see if the symbol is a neg() symbol
// Returns boolean
function isNeg(symbol) {
  return typeof symbol === "object" && symbol.type === "neg";
}

// isAny tests to see if the symbol is an any() symbol
// Returns boolean
function isAny(symbol) {
  return typeof symbol === "object" && symbol.type === "any";
}

// isSymbol tests to see if the value is a symbol
// Returns boolean
function isSymbol(value) {
  return isNeg(value) || isAny(value) || isBasic(value);
}

function forEachName(symbol, fn) {
  if(isBasic(symbol)) {
    fn(symbol);
  } else if(isNeg(symbol)) {
    forEachName(symbol.value, fn);
  } else if(isAny(symbol)) {
    symbol.value.forEach(function(symbol) {
      fn(symbol);
    });
  }
}

exports.neg = neg;
exports.any = any;
exports.nameMatchesSymbol = nameMatchesSymbol;
exports.forEachName = forEachName;
exports.isBasic = isBasic;
exports.isNeg = isNeg;
exports.isAny = isAny;
exports.isSymbol = isSymbol;