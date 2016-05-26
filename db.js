var mysql = require('mysql');
var secureRandom = require('secure-random');

var conn = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_NAME,
});

function create_message(msg, cb) {
  conn.query('INSERT INTO messages VALUES (?, ?)', [msg.room_id, msg.body], function(err, rows, fields) {
    if (err) throw err;
    cb(rows); 
  });
}

function create_room(name, cb) {
  var key = generate_aes_key();    
  conn.query('INSERT INTO rooms VALUES (?, ?)', [name, key], function(err, rows, fields) {
    if (err) throw err;
    cb(rows); 
  });
}

function find_room(name, cb) {
  conn.query('SELECT * FROM rooms WHERE name = ?', [name], function(err, rows, fields) {
    if (err) throw err;
    cb(rows); 
  });
}

function find_messages(room_id, cb) {
  conn.query('SELECT * FROM messages WHERE room_id = ?', [room_id], function(err, rows, fields) {
    if (err) throw err;
    cb(rows); 
  });
}

function generate_aes_key() {
  return secureRandom(32, {type: 'Buffer'});
}
