module.exports = function (app, server) {
  var io = require('socket.io').listen(server);

  var originalData;

  io.on('connection', function (socket) {
    socket.on('room', function (_data) {
      var email = _data.email;

      socket.join(email);

      console.log("Connected succesfully to the socket ...", email);

      if (email === 'single') {
        io.to(email).emit('paragraph', originalData);
      }

      socket.on('paragraph', function (data) {
        console.log('Paragraph', email);
        if (email === 'single') {
          originalData = data;
        }
        io.to(email).emit('paragraph', data);
      });

      socket.on('command', function (data) {
        console.log('Command', email, data);
        io.to(email).emit('command', data);
      });
    });
  });

  app.io = io;
};
