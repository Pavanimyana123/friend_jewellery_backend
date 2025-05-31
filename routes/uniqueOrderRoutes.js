const express = require("express");
const router = express.Router();
const orderController = require("../controllers/uniqueOrderController");

router.get("/get-unique-order-details", orderController.getAllUniqueOrderDetails);
router.get("/get-order-details/:order_number", orderController.getOrderDetailsByInvoiceNumber);



router.get('/getorders/:order_number', orderController.getAllOrderDetailsByInvoiceNumber);



module.exports = router;

