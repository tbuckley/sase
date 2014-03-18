// A pattern is a series of symbols at increasing position
// A sequence is a series of instances, with potentially empty positions
// A symbol can match a name
// An instance has a name, and therefore can match a symbol
// A symbol has a set of pre


function Pattern(options) {
  var pattern, prevs, stacks, positionsByName;
  pattern = this.pattern = options.pattern;
  prevs = this.prevs = []; // @TODO
  stacks = this.stacks = []; // @TODO
  positionsByName = this.positionsByName = {};

  pattern.forEach(function(symbol, i) {
    // Store indices for each name
    forEachName(symbol, function(name) {
      if(name in positionsByName) {
        positionsByName[name].push(i);
      } else {
        positionsByName[name] = [i];
      }
    });

    // Prevs
    prevs[i] = [];
    if(i > 0) {prevs[i].push(i-1);}
    if(i > 1 && isNeg(pattern[i-1])) {prevs[i].push(i-2);}

    // Init stack
    stacks[i] = null;
  });
}

Pattern.prototype.handleInstance = function(name, data, time) {
  var positions = this.getPositionsForName(name);
  positions.forEach(function(pos) {
    this.updateMostRecentInstanceForPos(pos, {
      name: name,
      data: data,
      time: time,
    });
  });
  this.pruneOldInstances();
  if(this.isLastSymbol(name)) {

  }
};

// getMostRecentInstanceForPos gets the instance that most recently matched the
// symbol at the given position
// Returns an instance (or null)
Pattern.prototype.getMostRecentInstanceForPos = function(pos) {
  return this.stacks[pos];
};

// updateMostRecentInstanceForPos saves the instance that most recently matched
// the symbol at the given position
// Returns nothing
Pattern.prototype.updateMostRecentInstanceForPos = function(pos, instance) {
  var mrp = this.getMostRecentPreviousInstanceForPos(pos);
  var mr = this.getMostRecentInstanceForPos(pos);
  if(this.isFirstPos(pos) || mrp !== null) {
    instance.mrp = mrp;
    instance.mr = mr;
    this.stacks[pos] = instance;
  }
};

Pattern.prototype.getPositionsForName = function(name) {
  return this.positionsByName[name];
};

Pattern.prototype.pruneOldInstances = function() {

};

// Get the instances that could have preceded the symbol at position pos
// Returns an array of instances (all guaranteed non-null)
Pattern.prototype.getPreviousInstancesForPos = function(pos) {
  return this.prevs[pos].map(function(pos) {
    return this.getMostRecentForPos(pos);
  }).filter(function(instance) {
    return instance !== null;
  });
};

// Get the instance that most recently preceded the symbol at position pos
// Returns an instance (or null)
Pattern.prototype.getMostRecentPreviousInstanceForPos = function(pos) {
  var mrp, candidate, prevInstances;
  prevInstances = this.getPreviousInstancesForPos(pos);
  if(prevInstances.length > 0) {
    mrp = prevInstances[0];
    prevInstances.slice(1).forEach(function(candidate) {
      if(candidate.time > mrp.time) {
        mrp = candidate;
      }
    });
    return mrp;
  } else {
    return null;
  }
};


// getPositives returns a sequence containing only positive symbols
Pattern.prototype.getPositives = function(sequence) {
  return this.pattern.map(function(name, i) {
    return (i in sequence) ? sequence[i] : null;
  }).filter(function(val, i) {
    return !isNeg(this.pattern[i]);
  });
};

// isFirstPos tests if the given position is the pattern's first
// Return boolean
Pattern.prototype.isFirstPos = function(pos) {
  return pos === 0;
};
// isLastPos tests if the given position is the pattern's last
// Return boolean
Pattern.prototype.isLastPos = function(pos) {
  return pos+1 === this.pattern.length;
};
// isLastSymbol tests if the given name matches the pattern's last symbol
// Return boolean
Pattern.prototype.isLastSymbol = function(name) {
  var lastIndex = this.pattern.length - 1;
  var lastSymbol = this.pattern[lastIndex];
  return nameMatchesSymbol(name, lastSymbol);
};