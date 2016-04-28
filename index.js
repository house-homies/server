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

  socket.on('new message', function (data) {
    socket.broadcast.emit('new message', {
      message: data
    });
  });

});
