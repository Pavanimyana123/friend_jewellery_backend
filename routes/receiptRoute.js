// routes/receipts.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');          // your existing callback connection

// POST /api/receipts
router.post('/receipts', async (req, res) => {
  try {
    const {
      date, receipt_no, mobile, account_name,
      order_number, total_amt, paid_amt, bal_amt
    } = req.body;

    /* 1️⃣ Insert receipt */
    await db.promise().query(
      `INSERT INTO receipts
       (date, receipt_no, mobile, account_name, order_number, total_amt, paid_amt, bal_amt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, receipt_no, mobile, account_name, order_number, total_amt, paid_amt, bal_amt]
    );

    /* 2️⃣ Fetch current amounts */
    const [rows] = await db.promise().query(
      'SELECT receipt_amt, balance_amt FROM orders WHERE order_number = ?',
      [order_number]
    );

    if (!rows.length) return res.status(404).json({ error: 'Order not found' });

    const currentReceipt = parseFloat(rows[0].receipt_amt || 0);
    const balanceAmt     = parseFloat(bal_amt);
    const paidAmount     = parseFloat(paid_amt);

    const newReceiptAmt  = currentReceipt + paidAmount;
    const newBalanceAmt  = balanceAmt - newReceiptAmt;

    /* 3️⃣ Update order */
    await db.promise().query(
      'UPDATE orders SET receipt_amt = ?, balance_amt = ? WHERE order_number = ?',
      [newReceiptAmt, balanceAmt, order_number]
    );

    res.json({ message: 'Receipt added and order updated' });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Simple GET API to fetch all receipts
router.get('/receipts', async (req, res) => {
  try {
    // Query to select all records from receipts table
    const [receipts] = await db.promise().query('SELECT * FROM receipts');
    
    // Return the receipts data
    res.json({
      success: true,
      data: receipts
    });
  } catch (err) {
    console.error('Error fetching receipts:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch receipts'
    });
  }
});

router.get("/lastReceiptNumber", (req, res) => {
    const query = "SELECT receipt_no FROM receipts WHERE receipt_no LIKE 'RCP%' ORDER BY id DESC";
    
    db.query(query, (err, result) => {
        if (err) {
            console.error("Error fetching last receipt number:", err);
            return res.status(500).json({ error: "Failed to fetch last receipt number" });
        }

        if (result.length > 0) {
            const ordNumbers = result
                .map(row => row.receipt_no)
                .filter(order => order.startsWith("RCP"))
                .map(order => parseInt(order.slice(3), 10));

            const lastOrderNumber = Math.max(...ordNumbers);
            const nextOrderNumber = `RCP${String(lastOrderNumber + 1).padStart(3, "0")}`;

            res.json({ lastOrderNumber: nextOrderNumber });
        } else {
            res.json({ lastOrderNumber: "RCP001" });
        }
    });
});

module.exports = router;
