// An instance is an event that matches a specific symbol within a pattern
// Instances store pointers to 1) the most recent instance of the previous
// symbol and 2) the previous instance of its symbol

function Instance(options) {
  this.value = {
    name: options.name,
    data: options.data,
    time: options.time,
  };
  this.time = options.time;
  this.position = options.position;
  this.neg = options.neg;

  // Predecessor points to the previous instance of this instance's symbol
  this.predecessor = options.predecessor || null;
  // Previous points to the most recent instance of the previous symbol
  this.previous = options.previous || null;
}

Instance.prototype.isNeg = function() {
  return this.neg;
};

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
    pre(instance.value, instance.position);
  }
  if(instance.hasPrevious()) {
    var snaker = instance.getPrevious();
    if(snaker.isNeg()) {
      dfs_neg(snaker, pre, post);
    } else {
      dfs(snaker, pre, post);
      while(snaker.hasPredecessor()) {
        snaker = snaker.getPredecessor();
        dfs(snaker, pre, post);
      }
    }
  }
  if(post) {
    post(instance.value, instance.position);
  }
}


function timeOrder(instA, instB, afn, bfn) {
  if(instA && instB) {
    if(instA.time > instB.time) {
      afn(instA);
      timeOrder(instA.getPredecessor(), instB, afn, bfn);
    } else {
      bfn(instB);
      timeOrder(instA, instB.getPredecessor(), afn, bfn);
    }
  } else if(instA) {
    afn(instA);
    timeOrder(instA.getPredecessor(), instB, afn, bfn);
  } else if(instB) {
    bfn(instB);
    timeOrder(instA, instB.getPredecessor(), afn, bfn);
  }
}

/*
timeOrder()
c5 -> b3
c4 -> b3
      b2

*/
function dfs_neg(instance, pre, post) {
  var negs = [];
  timeOrder(instance, instance.getPrevious(), function(inst) {
    if(inst.value) {
      negs.push(inst.value);
    }
  }, function(pred) {
    if(pre) {pre(negs, instance.position);}
    dfs(pred, pre, post);
    if(post) {post(negs, instance.position);}
  });
}


exports.Instance = Instance;