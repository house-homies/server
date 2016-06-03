require('dotenv').config();

var crypto = require('crypto');
var pg     = require('pg');

//var client = new pg.Client(process.env.DATABASE_URL);
var client = new pg.Client("postgres://localhost:5432/homiedb");
//client.connect();

pg.connect("postgres://localhost:5432/homiedb", function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  client.query('SELECT $1::int AS number', ['1'], function(err, result) {
    //call `done()` to release the client back to the pool
    done();

    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[0].number);
    //output: 1

  });
  client.query('SELECT * FROM messages;', function(err, result) {
    //call `done()` to release the client back to the pool
    done();

    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows);
    //output: 1

  });
});

var dbfun = module.exports = {

  create_message: function(msg, cb) {
    var sql = "INSERT INTO messages (room_id, name, body) VALUES ("+ msg.roomId +", "+ msg.name +", "+ msg.text +");";
    console.log(sql);
    client.query(sql, [msg.room_id, msg.name, msg.text], (err, results) => {
      if (err) throw err;
      cb(results.rows[0]);

    });
  },

  create_room: function(name, cb) {
    var sql = 'INSERT INTO rooms (name, aes_key) VALUES ($1, $2) RETURNING *';
    var key = generate_aes_key();
    client.query(sql, [name, key.toString()], (err, results) => {
      if (err) throw err;
      cb(results.rows[0]);
    });
  },

  find_room: function(name, cb) {
    var sql = "SELECT * FROM rooms WHERE name = '" + name + "';";
    console.log(sql);
    client.query(sql, [name], (err, results) => {
      if (err) throw err;
      cb(results.rows[0]);
    });
  },

  find_messages: function(room_id, cb) {
    var sql = 'SELECT * FROM messages WHERE room_id = $1';
    client.query(sql, [room_id], (err, results) => {
      if (err) throw err;
      cb(results.rows);
    });
  },

  generate_aes_key: function() {
    return crypto.randomBytes(32).toString('hex');
  }

}
