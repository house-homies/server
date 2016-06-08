require('dotenv').config();


var crypto = require('crypto');
var pg     = require('pg');

//var client = new pg.Client(process.env.DATABASE_URL);
//var conString = "postgres://localhost/homiedb";
//var client = new pg.Client(conString);
//client.connect();

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
    client.end();
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
      if (err){
        console.log(err);
        throw err;
      }
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
