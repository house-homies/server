var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

server.listen(5000, function () {
  console.log('Server listening at port 5000');
});

// This will serve the static files from earlier
app.use(express.static(__dirname + '/static'));

io.on('connection', function (socket) {
  console.log("New connection:\t" + socket.id);

  socket.on('join room', function (roomId) {
    socket.join(roomId);
  });

  socket.on('new message', function (data) {
    console.log(data);

    var message = {
      text: data.text,
      name: data.name,
      uniqueId: Math.round(Math.random() * 10000),
      date: new Date(2016, 3, 14, 13, 0),
      pkey: data.pkey
    };

    socket.broadcast.emit('new message', message);
  });

});
