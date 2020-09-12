module.exports = function(app, server) {
  var io = require('socket.io').listen(server);

  var originalData;

  io.on('connection', function (socket) {
    console.log("Connected succesfully to the socket ...", originalData);
    socket.emit('paragraph', originalData);

    socket.on('paragraph', function (data) {
      console.log('Paragraph');
      originalData = data;
      io.emit('paragraph', data);
    });

    socket.on('command', function (data) {
      console.log('Command', data);
      io.emit('command', data);
    });
  });

  app.io = io;
}
