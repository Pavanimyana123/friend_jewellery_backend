const db = require("../db");

const AccountfindByEmail = (email, callback) => {
    const sql = "SELECT * FROM account_details WHERE email = ?";
    db.query(sql, [email], callback);
};


module.exports = { AccountfindByEmail };