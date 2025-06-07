const db = require("../db");

exports.getUserByEmailOrMobile = (field, value, callback) => {
  const sql = `SELECT id, account_name, account_group, mobile, email, password 
               FROM account_details 
               WHERE ${field} = ?`;
  
  db.query(sql, [value], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length === 0) {
      return callback(null, null);
    }
    callback(null, results[0]);
  });
};