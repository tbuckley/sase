var EventEmitter = require("events").EventEmitter;
var util = require("util");
var Pattern = require("./pattern").Pattern;
var Handler = require("./handler").Handler;

function Cursor(options) {
  this.name = options.name;
  this._seq = null;
  this._where = null;
  this._within = null;
}
util.inherits(Cursor, EventEmitter);

Cursor.prototype.seq = function() {
  var args = Array.prototype.slice.apply(arguments);
  this._seq = new Pattern({pattern: args});
  return this;
};

Cursor.prototype.attach = function(stream) {
  var handler = new Handler({
    pattern: this._seq,
    stream: stream,
  });
  return handler;
};

Cursor.prototype.where = function(fn) {
  this._where = fn;
  return this;
};

Cursor.prototype.within = function(time) {
  this._within = time;
  return this;
};

exports.Cursor = Cursor;