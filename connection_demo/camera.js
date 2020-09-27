// You need ECamm Live for this to work!

const osascript = require('node-osascript');
module.exports = function (value) {

  console.log("SWITCHING TO", value);

  const cameras = {
    main: 'FaceTime HD Camera (Built-in)',
    // Add more using the name of the Camera in ECammLive
  };

  const camera = cameras[value];

  // This is the simple version... but it's too slow (see the SO link below)
  const scriptOrig = `
tell application "System Events" to tell process "Ecamm Live"
    tell menu bar item 6 of menu bar 1
        click
        click menu item "${camera}" of menu 1
    end tell
end tell
`;

  // This is written this way to speed it up:
  // https://stackoverflow.com/questions/16126027/applescript-delay-issue/36370778#36370778

  const script = `
tell application "System Events" to tell process "Ecamm Live"
    tell menu bar item 6 of menu bar 1
        ignoring application responses
          click
        end ignoring
    end tell
end tell

do shell script "killall System\\\\ Events"
delay 0.1
tell application "System Events" to tell process "Ecamm Live"
    tell menu bar item 6 of menu bar 1
        click menu item "${camera}" of menu 1
    end tell
end tell
`;

  osascript.execute(script, function (err, result, raw) {
    if (err) {
      // Retry if it fails for some reason!
      console.log("ERROR, TRYING AGAIN");
      osascript.execute(script, function (err, result, raw) {
        console.log("ERROR SECOND TIME");
      });
      return console.error(err);
    }
    console.log(result);
  });
};
