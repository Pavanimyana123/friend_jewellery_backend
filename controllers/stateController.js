const State = require("../models/stateModel");

const getStates = (req, res) => {
  State.getAllStates((err, states) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(states);
  });
};

module.exports = { getStates };
