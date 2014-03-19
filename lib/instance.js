// An instance is an event that matches a specific symbol within a pattern
// Instances store pointers to 1) the most recent instance of the previous
// symbol and 2) the previous instance of its symbol

function Instance(options) {
  this.value = {
    name: options.name,
    data: options.data,
    time: options.time,
  };
  this.position = options.position;

  // Predecessor points to the previous instance of this instance's symbol
  this.predecessor = options.predecessor || null;
  // Previous points to the most recent instance of the previous symbol
  this.previous = options.previous || null;
}

Instance.prototype.hasPredecessor = function() {
  return this.predecessor !== null;
};

Instance.prototype.getPredecessor = function() {
  return this.predecessor;
};

Instance.prototype.hasPrevious = function() {
  return this.previous !== null;
};

Instance.prototype.getPrevious = function() {
  return this.previous;
};

Instance.prototype.dfs = function(pre, post) {
  dfs(this, pre, post);
};

function dfs(instance, pre, post) {
  if(pre) {
    pre(instance);
  }
  if(instance.hasPrevious()) {
    var snaker = instance.getPrevious();
    dfs(snaker, pre, post);
    while(snaker.hasPredecessor()) {
      snaker = snaker.getPredecessor();
      dfs(snaker, pre, post);
    }
  }
  if(post) {
    post(instance);
  }
}

exports.Instance = Instance;