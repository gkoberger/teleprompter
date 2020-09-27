// This is Node (backend) code!

const io = require('socket.io-client');

const config = {
  // The base URL to where you're running the teleprompter.
  server: 'https://tele.gkoberger.com',

  // The email address you used for a multi-user version
  // of the teleprompter.
  // If you're doing this in single mode (the default),
  // set this to false or undefined!
  email: 'you@email.com',
};

const socket = io.connect(config.server, {
  secure: true,
  rejectUnauthorized: false,
  reconnect: true,
});

socket.on('connect', () => {
  socket.emit('room', { email: config.email || 'single' });
  console.log('Connected to the server....');
});

// handle the event sent with socket.send()
socket.on('command', data => {
  console.log(`The command ${data.command} with value ${data.value} was called!`);

  // Here's a demo of how it might work:
  if (data.command === 'camera') {
    require('./camera')(data.value);
  }
});
