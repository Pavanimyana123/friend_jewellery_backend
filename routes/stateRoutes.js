const express = require("express");
const router = express.Router();
const { getStates } = require("../controllers/stateController");

router.get("/states", getStates);

module.exports = router;
