const db = require("../db");

exports.getUserByEmail = (email, callback) => {
    const sql = "SELECT id, account_name, account_group, mobile, email, password FROM account_details WHERE email = ?";
    
    db.query(sql, [email], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        if (results.length === 0) {
            return callback(null, null);
        }
        callback(null, results[0]);
    });
};