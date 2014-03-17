meta("SwitchLights")
  .seq("Beat")
  .where(["Music.Playing", function(musicPlaying, beat) {
    return musicPlaying;
  }]);

handle("SwitchLights", function() {
  var lights = pickRandomLights();
  lights.forEach(function(light) {
    light.setRandomColor();
  });
});