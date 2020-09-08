var MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

// First, go here and add the DB
// Next, add the user

const user = process.env.DB_USER;
const pass = process.env.DB_PASS;
const url = process.env.DB_URL;
const dbName = 'tele';

const config = {
  url: `mongodb://${user}:${pass}@${url}`,
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
