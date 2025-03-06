const express = require("express");
const orderController = require("../controllers/orderController");

const router = express.Router();

router.get("/lastOrderNumber", orderController.getLastOrderNumber);



module.exports = router;
