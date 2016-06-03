require('dotenv').config();
var dbfun    = require("./db.js");

var fs       = require("fs");
var express  = require('express');
var app      = express();
var server   = require('http').createServer(app);
var io       = require('socket.io')(server);
var rsa      = require('react-native-rsa');

var key_json = require("./bin/generate_key");
//var key      = rsa.setPrivateEx(key_json.n, key_json.e, key_json.d, key_json.p, key_json.q, key_json.dmp1, key_json.dmq1, key_json.coeff);

server.listen(5000, () => console.log('Server listening at port 5000'));

io.on('connection', (socket) => {
  console.log("New connection:", socket.id);
  socket.on('join room',         join_room);
  socket.on('new message',       new_message);
  socket.on('previous messages', previous_messages);
});

function join_room(encrypted_data) {
  // Decrypt with server RSA private key
  var unencrypted_data = encrypted_data;
  dbfun.find_room(unencrypted_data, (room) => {
    socket.join(room);
  });
}

function new_message(message) {
  console.log(message);
  dbfun.create_message(message, (msg) => {
    socket.broadcast.to(msg.room_id).emit('new message', msg);
  });
}

function previous_messages(room_id) {
  dbfun.find_messages(room_id, (messages) => {
    socket.emit("previous messages", messages);
  });
}
