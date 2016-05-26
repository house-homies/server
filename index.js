require('dotenv').config();
require("./db.js");

var fs          = require("fs");
var express     = require('express');
var app         = express();
var server      = require('http').createServer(app);
var io          = require('socket.io')(server);
var NodeRSA     = require('node-rsa');

var key_buffer  = fs.readFileSync("./private_key");
var key         = NodeRSA(key_buffer);

server.listen(5000, () => console.log('Server listening at port 5000'));
app.use(express.static(__dirname + '/static'));

io.on('connection', function (socket) {
  console.log("New connection:\t" + socket.id);

  setInterval( () => send_test_message(socket), 3000);

  socket.on('join room', join_room);
  socket.on('new message', new_message);
});

function send_test_message(socket) {
  var message = {
    text     : key.encrypt("Gucci", "hex"),
    name     : "Jonah",
    uniqueId : Math.round(Math.random() * 10000),
    date     : new Date(2016, 3, 14, 13, 0),
  };
  console.log(message);
  socket.emit('new message', message);
}

function send_public_key() {
  var message = { pkey: process.env.PUBLIC_KEY } 
  socket.emit('public key', message);
}

function send_private_key() {
  var message = { pkey: process.env.PRIVATE_KEY } 
  socket.emit('private key', message);
}

function join_room(encrypted_data) {
  // Decrypt with server RSA private key
  var unencrypted_data = encrypted_data;

  socket.join(unencrypted_data.room_id);
}

function new_message(message) {
  console.log(message);

  var message = {
    text     : message.text,
    name     : message.name,
    uniqueId : Math.round(Math.random() * 10000),
    date     : new Date(2016, 3, 14, 13, 0),
  };

  socket.broadcast
    .to(data.roomId)
    .emit('new message', message);
}

function RSAGetPrivateString(key) {
  var privateKeys = ['n', 'e', 'd', 'p', 'q', 'dmp1', 'dmq1', 'coeff'];
  var ret = {};
  var that = key;
  privateKeys.forEach(function(key) {
    ret[key] = that[key] && that[key].toString(16);
    if (key != 'e' && ret[key].length % 2 == 1) {
      ret[key] = '0' + ret[key];
    }
  });

  return JSON.stringify(ret);
}


