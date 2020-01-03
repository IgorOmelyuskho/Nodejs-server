const mysql = require("mysql2");
const util = require('util');

// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   database: "new_schema",
//   password: "password"
// });

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

// connection.connect(function (err) {
//   if (err) {
//     return console.error("Ошибка: " + err.message);
//   }
//   else {
//     console.log("Подключение к серверу MySQL успешно установлено");
//   }
// });

module.exports = connection;



// закрытие подключения
// connection.end(function (err) {
//   if (err) {
//     return console.log("Ошибка: " + err.message);
//   }
//   console.log("Подключение закрыто");
// });