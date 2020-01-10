const mysql = require("mysql2");
const util = require('util');
const MongoClient = require("mongodb").MongoClient;
const thunky = require('thunky');


//SQL
const config = {
  host: "localhost",
  user: "root",
  database: "new_schema",
  password: "password"
};

function connectToDb(config) {
  const connection = mysql.createConnection(config);
  return {
    query(sql, args) {
      return util.promisify(connection.query)
        .call(connection, sql, args);
    },
    close() {
      return util.promisify(connection.end).call(connection);
    }
  };
}

const connection = connectToDb(config);





//MONGODB
// var mongoDBClient;

const url = "mongodb://localhost:27017/";
const mongoClient = new MongoClient(url, { useUnifiedTopology: true });
var mongoDB;

mongoClient.connect(function (err, client) {
  mongoDB = client.db("my_db");
});

function getMongoDb() {
  return mongoDB;
}


module.exports = {
  connection,
  getMongoDb
}

