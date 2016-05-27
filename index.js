require('dotenv').config();
require("./db.js");

var fs          = require("fs");
var express     = require('express');
var app         = express();
var server      = require('http').createServer(app);
var io          = require('socket.io')(server);
var rsa         = require('react-native-rsa');

var key_buffer  = fs.readFileSync("./private_key");
var key         = NodeRSA(key_buffer);

server.listen(5000, () => console.log('Server listening at port 5000'));

io.on('connection', (socket) => {
  console.log("New connection:", socket.id);
  socket.on('join room', join_room);
  socket.on('new message', new_message);
  socket.on('previous messages', previous_messages);
});

function join_room(encrypted_data) {
  // Decrypt with server RSA private key
  var unencrypted_data = encrypted_data;
  socket.join(unencrypted_data.room_id);
}

function new_message(message) {
  console.log(message);
  create_message(message, (msg) => {
    socket.broadcast.to(msg.room_id).emit('new message', msg);
  });
}

function previous_messages(room_id) {
  find_messages(room_id, (messages) => {
    socket.emit("previous messages", messages); 
  });
}

