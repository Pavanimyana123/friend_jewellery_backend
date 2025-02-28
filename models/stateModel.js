const db = require("../db");

const State = {
  getAllStates: (callback) => {
    const sql = "SELECT * FROM states";
    db.query(sql, (err, results) => {
      if (err) return callback(err, null);
      callback(null, results);
    });
  },
};

module.exports = State;
