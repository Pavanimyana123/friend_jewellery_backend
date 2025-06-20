// db.js
const mysql = require("mysql2");
const util = require("util");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Pavani@123",
  database: "friends_jewellerydb",
  port: 3307,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// Promisify the query method
db.query = util.promisify(db.query);

module.exports = db;


// const mysql = require("mysql2");
// const util = require("util");

// let db;

// function handleDisconnect() {
//   db = mysql.createConnection({
//     host: "127.0.0.1",
//     user: "root",
//     password: "Root@1234",
//     database: "newjewellery",
//     port: 3306,
//   });

//   db.connect((err) => {
//     if (err) {
//       console.error("Database connection failed:", err);
//       setTimeout(handleDisconnect, 2000); // Retry after 2 sec
//     } else {
//       console.log("Connected to MySQL database");
//     }
//   });

//   // Promisify after (re)connection
//   db.query = util.promisify(db.query);

//   db.on("error", (err) => {
//     console.error("MySQL error", err);
//     if (err.code === "PROTOCOL_CONNECTION_LOST") {
//       console.log("Reconnecting lost MySQL connection...");
//       handleDisconnect();
//     } else {
//       throw err;
//     }
//   });
// }

// handleDisconnect();

// module.exports = db;
