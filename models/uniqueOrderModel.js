const db = require("../db");

exports.getAllUniqueOrders = (callback) => {
  const sql = `
    SELECT * 
    FROM orders r1
    WHERE r1.id = (
      SELECT MAX(r2.id) 
      FROM orders r2
      WHERE r1.order_number = r2.order_number
    )
  `;
  db.query(sql, callback);
};

exports.getByOrderNumber = (orderNumber, callback) => {
  const sql = `
    SELECT * 
    FROM orders
    WHERE order_number = ?
  `;
  db.query(sql, [orderNumber], callback);
};

exports.getAllOrderDetailsByInvoiceNumber = (order_number, callback) => {
  const sql = `
    SELECT * FROM orders
    WHERE order_number = ?
  `;

  // Query the database
  db.query(sql, [order_number], (err, results) => {
    if (err) {
      return callback(err); // Pass error to the controller
    }

    callback(null, results); // Return the results to the controller
  });
};

