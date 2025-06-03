const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db");
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

// const upload = multer({ storage });

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 10 MB file size limit
        fieldSize: 50 * 1024 * 1024, // 10 MB field size limit
    },
});

// Ensure 'uploads/invoices' directory exists
const invoiceDir = path.join(__dirname, "../uploads/invoices");
if (!fs.existsSync(invoiceDir)) {
  fs.mkdirSync(invoiceDir, { recursive: true });
}

// Invoice Upload Configuration
const invoiceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, invoiceDir); // Save in /uploads/invoices
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep invoice number as filename (e.g., INV001.pdf)
  },
});

const uploadInvoice = multer({ storage: invoiceStorage });

// Route to upload invoice PDF
router.post("/upload-invoice", uploadInvoice.single("invoice"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({ message: "Invoice uploaded successfully", file: req.file.filename });
});



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
router.delete("/delete-order/:id", orderController.deleteOrder);
router.get("/getorder/:id", orderController.getOrderController);
router.put("/updateorders/:id", orderController.updateOrderController);

router.post("/update-invoice-status", orderController.updateInvoiceStatus);
router.get("/get-latest-invoice", orderController.getLatestInvoiceNumber);

router.post("/update-estimate-status", orderController.updateEstimateStatus);
router.get("/get-latest-estimate", orderController.getLatestEstimateNumber);

router.delete("/deleteorder/:orderNumber", orderController.deleteOrderByOrderNumber);



// router.put('/rate/:orderId', (req, res) => {
//   const { orderId } = req.params;
//   const { rating } = req.body;

//   // Basic validation
//   if (!rating || rating < 1 || rating > 5) {
//     return res.status(400).json({ error: 'Please provide a valid rating between 1 and 5' });
//   }

//   // Update query
//   const query = 'UPDATE orders SET customer_rating = ? WHERE id = ?';
//   db.query(query, [rating, orderId], (err, result) => {
//     if (err) {
//       console.error('Error submitting rating:', err);
//       return res.status(500).json({ error: 'Failed to submit rating' });
//     }

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     return res.json({
//       success: true,
//       message: 'Rating submitted successfully',
//       orderId,
//       new_rating: rating
//     });
//   });
// });

router.put('/rate/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { rating, reviewText } = req.body;

  // Basic validation
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Please provide a valid rating between 1 and 5' });
  }

  // Update query (including reviewText)
  const query = 'UPDATE orders SET customer_rating = ?, review_text = ? WHERE id = ?';
  db.query(query, [rating, reviewText, orderId], (err, result) => {
    if (err) {
      console.error('Error submitting rating:', err);
      return res.status(500).json({ error: 'Failed to submit rating' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json({
      success: true,
      message: 'Rating and review submitted successfully',
      orderId,
      new_rating: rating,
      new_review: reviewText
    });
  });
});




module.exports = router;
