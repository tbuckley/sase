var Pattern = require("./pattern").Pattern,
    Instance = require("./instance").Instance;

function Handler(options) {
  this.pattern = options.pattern;
  this.stream = options.stream;

  // Create stacks & prevs
  this.stacks = new Array(this.pattern.length);
  for(var i = 0; i < this.pattern.length; i++) {
    this.stacks[i] = null;
  }

  // Attach handlers
  this.pattern.forEachName(function(name) {
    this.stream.on(name, this.handleEvent.bind(this, name));
  }.bind(this));
}

Handler.prototype.handleEvent = function(name, data, time) {
  // @TODO process in reverse order to guarantee we don't cheat,
  // eg. match seq("a", "a", "a") with a single "a"
  var positions = this.pattern.getPositionsForName(name);
  positions.forEach(function(pos) {
    var instance = new Instance({
      name: name,
      data: data,
      time: time,
      position: pos,
      predecessor: this.stacks[pos],
      neg: this.pattern.isNegPosition(pos),
    });
    if(pos === this.pattern.getStartPosition()) {
      this.stacks[pos] = instance;
    } else {
      // Set previous for instance
      var previous = this.stacks[pos - 1];
      if(previous !== null) {
        instance.previous = previous;
      } else if(this.pattern.isNegPosition(pos-1)) {
        instance.previous = this.createBlank(pos - 1);
      } else {
        return;
      }

      if(pos === this.pattern.getEndPosition()) {
        this.processTerminator(instance);
      } else {
        this.stacks[pos] = instance;
      }
    }
  }.bind(this));
};

Handler.prototype.createBlank = function(pos) {
  var previous = this.stacks[pos - 1];
  var instance = new Instance({});
  instance.value = null;
  instance.time = previous.time;
  instance.previous = previous;
  instance.position = pos;
  instance.neg = true;
  return instance;
};

Handler.prototype.processTerminator = function(terminatingInstance) {
  var sequences = this.generateSequences(terminatingInstance);
  sequences.forEach(function(seq) {
    console.log(seq);
  });
};

Handler.prototype.generateSequences = function(terminatingInstance) {
  // Initialize stacks, one for each position
  var stacks = new Array(this.pattern.length);
  for(var i = 0; i < stacks.length; i++) {
    stacks[i] = [];
  }
  // Run DFS over instance graph, starting at terminating instance
  terminatingInstance.dfs(null, function(value, position) {
    if(position === 0) {
      // Base case: create a sequence of length 1 in stack 0
      stacks[0].push([value]);
    } else {
      // Inductive step: add symbol to the sequences of length n-1, and add these to stack n-1
      stacks[position - 1].forEach(function(seq) {
        seq.push(value);
      });
      stacks[position] = stacks[position].concat(stacks[position - 1]);
      stacks[position - 1] = [];
    }
  });
  return stacks[this.pattern.length - 1];
};

exports.Handler = Handler;