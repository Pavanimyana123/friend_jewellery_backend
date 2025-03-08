const db = require("../db");

const getLastOrderNumber = (callback) => {
    const query = "SELECT order_number FROM orders WHERE order_number LIKE 'ORD%' ORDER BY id DESC";
    db.query(query, callback);
};

const createOrder = (orderData, callback) => {
    const sql = `INSERT INTO orders (
        account_id, mobile, account_name, email, address1, address2, city, pincode, state, state_code, 
        aadhar_card, gst_in, pan_card, date, order_number, metal, category, subcategory, product_design_name, purity, 
        gross_weight, stone_weight, stone_price, weight_bw, wastage_on, wastage_percentage, wastage_weight, 
        total_weight_aw, rate, amount, mc_on, mc_percentage, total_mc, tax_percentage, tax_amount, total_price, 
        remarks, image_url, order_status, qty
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, orderData, callback);
};

const getAllOrders = (callback) => {
    const sql = "SELECT * FROM orders";
    db.query(sql, callback);
};

const updateOrderAssignment = (orderId, assigned_status, worker_id, worker_name, work_status, callback) => {
  const sql = `
      UPDATE orders 
      SET assigned_status = ?, worker_id = ?, worker_name = ?, work_status = ? 
      WHERE id = ?`;
  db.query(sql, [assigned_status, worker_id, worker_name, work_status, orderId], callback);
};

const updateOrderStatus = (orderId, order_status, callback) => {
  const sql = `UPDATE orders SET order_status = ? WHERE id = ?`;
  db.query(sql, [order_status, orderId], callback);
};

const cancelOrder = (orderId, callback) => {
  const sql = `UPDATE orders SET order_status = 'Canceled' WHERE order_number = ?`;
  db.query(sql, [orderId], callback);
};

const updateWorkStatus = (orderId, work_status, callback) => {
  const sql = `UPDATE orders SET work_status = ? WHERE id = ?`;
  db.query(sql, [work_status, orderId], callback);
};

const updateAssignedStatus = (orderId, assigned_status, callback) => {
  const sql = `UPDATE orders SET assigned_status = ? WHERE id = ?`;
  db.query(sql, [assigned_status, orderId], callback);
};

module.exports = {
    getLastOrderNumber,
    createOrder,
    getAllOrders,
    updateOrderAssignment,
    updateOrderStatus,
    cancelOrder,
    updateWorkStatus,
    updateAssignedStatus
};
