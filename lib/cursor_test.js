var TestStream = require("./common_test").TestStream;
var cursor = require("./cursor"),
    Cursor = cursor.Cursor,
    neg = cursor.neg,
    any = cursor.any;

var stream = new TestStream();

// Create test query
var test = new Cursor({name: "test"})
  .seq("a", "b", neg("c"), "d")
  .within(5)
  .attach(stream);

var matches = [
  [1, 3, 5],
  [4, 6, 7],
];
var matchIndex = 0, calls = 0;
test.on("test", function(data) {
  calls += 1;

  var raw = data._raw,
      rawString = raw.map(function(x) {return x.time;}).toString();

  if(matchIndex >= matches.length) {
    console.log("ERROR: extra value of "+rawString);
    return;
  }
  var match = matches[matchIndex];
  if(raw.length !== match.length) {
    console.log("ERROR: "+rawString+" does not have same length as expected value "+match.toString());
    return;
  }
  for(var i = 0; i < raw.length; i++) {
    if(raw[i].time != match[i]) {
      console.log("ERROR: "+rawString+" does not match expected value "+match);
      return;
    }
  }

  console.log("MATCH!: "+rawString+" does not match expected value "+match);
  matchIndex += 1;
});

// Emit values
var values = ["a", "c", "b", "a", "d", "b", "d", "c", "d"];
for(var x = 0; x < 10; x++) {
  for(var i = 0; i < values.length; i++) {
    stream.emit(values[i], {}, x*values.length+i+1);
  }
}

if(calls === matches.length) {
  console.log("SUCCESS");
} else if(calls < matches.length) {
  console.log("ERROR: not enough calls");
} else {
  console.log("ERROR: too many calls");
}