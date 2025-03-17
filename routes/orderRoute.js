const express = require("express");
const multer = require("multer");
const path = require("path");
const orderController = require("../controllers/orderController");

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

router.get("/lastOrderNumber", orderController.getLastOrderNumber);
router.post("/orders", upload.array("image"), orderController.createOrder);
router.get("/orders", orderController.getAllOrders);
router.put("/orders/assign/:orderId", orderController.assignOrder);
router.put("/orders/status/:orderId", orderController.updateStatus);
// router.put("/orders/cancel/:orderId", orderController.cancelOrder);
router.put("/orders/work-status/:orderId", orderController.updateWorkStatus);
router.put("/orders/assign-status/:orderId", orderController.updateAssignedStatus);
router.put("/orders/cancel/:orderId", orderController.requestCancel);
router.put("/orders/cancel/handle/:orderId", orderController.handleCancelRequest);
router.put("/designs/:id/approve-status", orderController.updateApproveStatus);

module.exports = router;
