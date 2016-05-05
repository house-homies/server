var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

server.listen(3000, function () {
  console.log('Server listening at port 3000');
});

// This will serve the static files from earlier
app.use(express.static(__dirname + '/static'));

io.on('connection', function (socket) {
  console.log("New connection");

  socket.on('join room', function (roomId) {
    console.log("Joined " + roomId);

    socket.join(roomId);
  });

  socket.on('new message', function (data) {
    console.log(data);
    var room = socket.rooms[1];

    socket.broadcast.to(room).emit('new message', {
      message: data
    });
  });

});
