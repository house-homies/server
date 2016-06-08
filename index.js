require('dotenv').config();
require("./db.js");

var fs          = require("fs");
var crypto      = require('crypto');
var express     = require('express');
var app         = express();
var server      = require('http').createServer(app);
var io          = require('socket.io')(server);
//var NodeRSA     = require('node-rsa');
var RSAKey 	= require('react-native-rsa');

//var key_buffer  = fs.readFileSync("./private_key");
//var key         = NodeRSA(key_buffer);

server.listen(5000, () => console.log('Server listening at port 5000'));
app.use(express.static(__dirname + '/static'));
  
const bits = 1024;
const exponent = '10001'; // must be a string. This is hex string. decimal = 65537
var rsa = new RSAKey();
rsa.generate(bits, exponent);
var publicKey = rsa.getPublicString(); // return json encoded string
var privateKey = rsa.getPrivateString(); // return json encoded string

var aes_key = generate_aes_key();

io.on('connection', function (socket) {
  console.log("New connection:\t" + socket.id);
  
  // setInterval( () => send_test_message(socket, rsa), 3000);

  //socket.on('join room', join_room);
  socket.on('join room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('request_server_key', (message) => {
     socket.emit('broadcast_key', publicKey);
     console.log('sent server key to client');
  });

  socket.on('request_room_key', (message) => {
    roomId = rsa.decrypt(message.roomId);
    console.log("room requested: " + roomId);

    rsa.setPublicString(message.pkey);
    console.log('unencrypted room key: ', aes_key);
    roomKey = rsa.encrypt(aes_key);
    console.log(roomKey);
   
    socket.emit('room_key', roomKey);
    console.log('sent room key to client');
  });

  socket.on('new message', (message) => {
    console.log(message);

    var message = {
      text     : message.text,
      roomId   : message.roomId,
      name     : message.name,
      uniqueId : Math.round(Math.random() * 10000),
      date     : new Date(2016, 3, 14, 13, 0),
    };

    socket.broadcast
      .to(message.roomId)
      .emit('new message', message);
  });
});

function generate_aes_key() {
  return crypto.randomBytes(32).toString('base64');
}

function send_test_message(socket, rsa) {

  var message = {
    text     : rsa.encrypt("Gucci"),
    pkey     : rsa.getPrivateString(),
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

function join_room(roomId) {
  console.log('join room first');
  console.log(socket);
  socket.join(roomId);
  console.log('join room last');
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


