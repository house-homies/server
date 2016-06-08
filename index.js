require('dotenv').config();
//var    = require("./db.js");
var crypto = require('crypto');
var pg     = require('pg');

var conString = "postgres://kptristan:@localhost/homiedb";
var client = new pg.Client(conString);


client.connect(function(err) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }

  client.query('SELECT * FROM messages;', function(err, result) {
    //call `done()` to release the client back to the pool
    //done();

    if(err) {
      return console.error('error running query', err);
    }
    console.log("this");
    console.log(result.rows);
    //output: 1
    // client.end();
  });

  // var sql = "INSERT INTO messages (room_id, name, body) VALUES ($1, $2, $3);";
  // client.query(sql, [12, "Darth Vader","luke i am your father"], function(err, result) {
  //   //call `done()` to release the client back to the pool
  //   //done();
  //
  //   if(err) {
  //     return console.error('error running query', err);
  //   }
  //   console.log("this");
  //   console.log(result.rows);
  //   //output: 1
  //   // client.end();
  // });
});

function create_message(msg, cb) {
  var sql = "INSERT INTO messages (room_id, name, body) VALUES ($1, $2, $3) RETURNING *;";
  console.log(sql);
  find_room(msg.roomId, function(roomid) {
    console.log("msg.roomId = " + msg.roomId + "; derived roomid = " + roomid);
    client.query(sql, [roomid, msg.name, msg.text], (err, results) => {
      if (err) throw err;

      cb(results.rows[0]);

    });
  });
}

function create_room(name, cb) {
  var sql = 'INSERT INTO rooms (name, aes_key) VALUES ($1, $2) RETURNING *';
  var key = generate_aes_key();
  client.query(sql, [name, key.toString()], (err, results) => {
    if (err){
      throw err;
    }
    cb(results.rows[0]);
  });
}

function find_room(name, cb) {
  var sql = "SELECT * FROM rooms WHERE name = $1;";
  client.query(sql, [name], (err, results) => {
    if (err) throw err;

    cb(results.rows[0].id);
  });
}

function find_messages(room_id, cb) {
  var sql = 'SELECT * FROM messages WHERE room_id = $1';
  client.query(sql, [room_id], (err, results) => {
    if (err) throw err;
    cb(results.rows);
  });
}

function generate_aes_key() {
  return crypto.randomBytes(32).toString('hex');
}

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
  socket.on('join room',         join_room(socket));
  socket.on('new message',       new_message(socket));
  socket.on('previous messages', previous_messages(socket));
});

function join_room(socket) {
  var fn = function (encrypted_data) {
    // Decrypt with server RSA private key
    var unencrypted_data = encrypted_data;
    find_room(unencrypted_data, (room) => {
      socket.join(room);
    });
  };
  return fn;
}
// function join_room(encrypted_data) {
//   // Decrypt with server RSA private key
//   var unencrypted_data = encrypted_data;
//   find_room(unencrypted_data, (room) => {
//     socket.join(room);
//   });
// }

function new_message(socket) {
  var fn = function(message) {
    console.log(message);
    create_message(message, (msg) => {
      socket.broadcast.to(msg.roomId).emit('new message', msg);
    });
  };
  return fn;
}
// function new_message(message) {
//   console.log(message);
//   create_message(message, (msg) => {
//     socket.broadcast.to(msg.room_id).emit('new message', msg);
//   });
// }

function previous_messages(room_id) {
  find_messages(room_id, (messages) => {
    socket.emit("previous messages", messages);
  });
}

function previous_messages(socket) {
  var fn = function(room_id) {
    find_messages(room_id, (messages) => {
      socket.emit("previous messages", messages);
    });
  };
  return fn;
}
