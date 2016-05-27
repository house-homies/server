require('dotenv').config();

var crypto = require('crypto');
var pg     = require('pg');

var client = new pg.Client(process.env.DATABASE_URL);
client.connect();

function create_message(msg, cb) {
  var sql = 'INSERT INTO messages (room_id, name, body) VALUES ($1, $2) RETURNING *';
  client.query(sql, [msg.room_id, msg.name, msg.text], (err, results) => {
    if (err) throw err;
    cb(results.rows[0]); 
  });
}

function create_room(name, cb) {
  var sql = 'INSERT INTO rooms (name, aes_key) VALUES ($1, $2) RETURNING *'; 
  var key = generate_aes_key(); 
  client.query(sql, [name, key.toString()], (err, results) => {
    if (err) throw err;
    cb(results.rows[0]); 
  });
}

function find_room(name, cb) {
  var sql = "SELECT * FROM rooms WHERE name = $1"; 
  client.query(sql, [name], (err, results) => {
    if (err) throw err;
    cb(results.rows[0]); 
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
