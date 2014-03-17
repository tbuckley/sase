var EventEmitter = require("events").EventEmitter;
var util = require("util");

function Cursor(options) {
  this.name = options.name;
  this.withinLimit = null;
}
util.inherits(Cursor, EventEmitter);

Cursor.prototype.seq = function() {
  var sequence, indexedSequence, negSequence, negatives, posSequence, positives, prevs;
  var isFirst, isLast;

  sequence = Array.prototype.slice.apply(arguments);
  prevs = new Array(sequence.length);
  stacks = new Array(sequence.length);

  // Store previous stacks for each stack
  prevs[0] = [];
  sequence.forEach(function(name, i, ls) {
    isFirst = i === 0;
    isLast = i+1 === ls.length;
    if(!isLast) {
      if(!isNeg(name)) {
        prevs[i+1] = [i];
      } else {
        prevs[i+1] = prevs[i].concat([i]);
      }
    }
  });

  // Initialize stacks to null
  sequence.forEach(function(name, i, ls) {
    stacks[i] = null;
  });

  this.sequence = sequence;
  this.prevs = prevs;
  this.stacks = stacks;

  return this;
};

Cursor.prototype.attach = function(stream) {
  var val, name;
  this.sequence.forEach(function(name, i) {
    name = getName(name);
    stream.on(name, this.handle.bind(this, getName(name), i));
  }.bind(this));
  return this;
};
Cursor.prototype.getRIP = function(index) {
  var rip, candidate, prevs, i;
  rip = null;
  prevs = this.prevs[index];
  for(i = 0; i < prevs.length; i++) {
    candidate = this.stacks[prevs[i]];
    if(candidate === null) {continue;}
    if(rip === null) {
      rip = candidate;
    } else if(candidate.time > rip.time) {
      rip = candidate;
    }
  }
  return rip;
};
Cursor.prototype.filterOld = function(element, time) {
  if(element !== null && this.withinLimit !== null) {
    if(element.time < time - this.withinLimit) {
      return null;
    }
  }
  return element;
};
Cursor.prototype.handle = function(name, index, data, time) {
  var prev, rip, stack, isLast;

  prev = this.stacks[index];
  rip = this.getRIP(index);

  // Prune out-dated elements from stack;
  prev = this.filterOld(prev, time);
  rip = this.filterOld(rip, time);

  stack = this.stacks[index] = {
    name: name,
    data: data,
    time: time,
    prev: prev,
    rip: rip,
    stack: index,
  };

  isLast = index+1 === this.sequence.length;
  if(isLast) {
    this.evaluate(stack);
  }
};
Cursor.prototype.evaluate = function(info) {
  var posSequence;
  var sequences = this.generateSequences(info, info.time - this.withinLimit);
  if(sequences) {
    sequences.forEach(function(sequence) {
      sequence = this.sequence.map(function(name, i) {
        if(i in sequence) {
          return sequence[i];
        }
        return null;
      });
      if(this.whereFn) {
        if(!this.whereFn.apply(null, sequence)) {
          return;
        }
      } else {
        // Check that no negs were hit
        var hasNeg = false;
        posSequence = this.sequence.map(function(name, i) {
          return {name: name, index: i};
        }).filter(function(val) {
          return isNeg(val.name);
        }).forEach(function(val) {
          if(sequence[val.index] !== null) {
            hasNeg = true;
          }
        });
        if(hasNeg) {
          return;
        }
      }
      posSequence = this.sequence.map(function(name, i) {
        return {name: name, index: i};
      }).filter(function(val) {
        return !isNeg(val.name);
      }).map(function(val) {
        return sequence[val.index];
      });
      this.emit(this.name, {_raw: posSequence});
    }.bind(this));
  }
};
Cursor.prototype.generateSequences = function(info, minTime) {
  var sequences, value, i, subSequences, subSequence;
  sequences = [];
  value = {name: info.name, time: info.time};
  if(info.rip !== null) {
    // Prune out-dated elements from stack;
    if(info.rip.time < minTime) {
      info.rip = null;
      return null;
    }
    var snaker = info.rip;
    while(snaker !== null) {
      subSequences = this.generateSequences(snaker, minTime);
      if(subSequences !== null) {
        sequences = sequences.concat(subSequences.map(function(subSequence) {
          subSequence[info.stack] = value;
          return subSequence;
        }));
      }
      // Prune out-dated elements from stack;
      if(snaker.prev && snaker.prev.time < minTime) {
        snaker.prev = null;
      }
      snaker = snaker.prev;
    }
    return sequences;
  } else {
    subSequence = {};
    subSequence[info.stack] = value;
    return [subSequence];
  }
};

Cursor.prototype.where = function(fn) {
  return this;
};

Cursor.prototype.within = function(time) {
  this.withinLimit = time;
  return this;
};

function getName(val) {
  if(typeof val == "object") {
    return val.value;
  }
  return val;
}
function isNeg(val) {
  return (typeof val) == "object" && val.type == "neg";
}

function neg(arg) {
  return {type: "neg", value: arg};
}
function any() {
  var args = Array.prototype.slice.apply(arguments);
  return {type: "any", value: args};
}

exports.Cursor = Cursor;
exports.neg = neg;
exports.any = any;