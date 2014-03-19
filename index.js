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


meta("SomeoneCameHome")
  .seq("dooropen", ANY("doorclose"), "motion")
  .where(function(e1, e2, e3) {

  })
  .within(30);

state("TomIsHome")
  .init()
  .on("");