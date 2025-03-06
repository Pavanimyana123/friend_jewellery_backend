const db = require("../db");



const getLastOrderNumber = (callback) => {
  const query = "SELECT order_number FROM orders WHERE order_number LIKE 'ORD%' ORDER BY id DESC";
  db.query(query, callback);
};



module.exports = { getLastOrderNumber };
