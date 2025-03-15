const db = require("../db");

const Design = {
  create: (order_id, account_name, requested_design_name, approve_status, callback) => {
    const sql =
      "INSERT INTO designs (order_id, account_name, requested_design_name, approve_status) VALUES (?, ?, ?, ?)";
    db.query(sql, [order_id, account_name, requested_design_name, approve_status], callback);
  },

  getAll: (callback) => {
    const sql = "SELECT * FROM designs";
    db.query(sql, callback);
  },
};

module.exports = Design;
