var MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

// First, go here and add the DB
// Next, add the user

const user = process.env.DB_USER;
const pass = process.env.DB_PASS;
const dbName = 'tele';

const config = {
  url: `mongodb://${user}:${pass}@gregs-everything-shard-00-00-aihwu.mongodb.net:27017,gregs-everything-shard-00-01-aihwu.mongodb.net:27017,gregs-everything-shard-00-02-aihwu.mongodb.net:27017/${dbName}?ssl=true&replicaSet=gregs-everything-shard-0&authSource=admin`,
  database: dbName,
};

var options = {
  mongos: {
    ssl: true,
    sslValidate: false,
  }
};

module.exports = function() {
  let db = false;
  var url = config.url;
  return function(req, res, next) {
    if (!db) {
      const connection = MongoClient.connect(url, options, (err, client) => {
        if (err) console.log(err)
        db = client.db(config.database);
        req.db = db;
        next();
      });
    } else {
      req.db = db;
      next();
    }
  };
};
