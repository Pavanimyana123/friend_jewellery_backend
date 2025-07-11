const db = require("../db");
const moment = require("moment");

// Function to format date for MySQL
const formatDateForMySQL = (dateString) => {
    if (!dateString) return null;
    return moment(dateString).format("YYYY-MM-DD HH:mm:ss");
};

const getLastOrderNumber = (callback) => {
  const query = "SELECT order_number FROM orders WHERE order_number LIKE 'ORD%' ORDER BY id DESC";
  db.query(query, callback);
};

const createOrder = (orderData, callback) => {
  const sql = `INSERT INTO orders (
        account_id, mobile, account_name, email, address1, address2, city, pincode, state, state_code, 
        aadhar_card, gst_in, pan_card, date, order_number, estimated_delivery_date, metal, category, subcategory, product_design_name, purity, 
        gross_weight, stone_weight, stone_price, weight_bw, wastage_on, wastage_percentage, wastage_weight, 
        total_weight_aw, rate, amount, mc_on, mc_percentage, total_mc, tax_percentage, tax_amount, total_price, 
        remarks, delivery_date, image_url, order_status, qty, status, assigned_status, stone_name, o_size, o_length, 
        overall_total_weight, overall_total_price, overall_stone_price, overall_total_mc, overall_tax_amt, advance_gross_wt, 
        fine_wt, advance_finewt_amt, advance_amount, balance_amt, net_wt, summary_price, summary_rate, receipt_amt, actual_order_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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

// const cancelOrder = (orderId, callback) => {
//   const sql = `UPDATE orders SET order_status = 'Canceled' WHERE order_number = ?`;
//   db.query(sql, [orderId], callback);
// };

// const updateWorkStatus = (orderId, work_status, callback) => {
//   const sql = `UPDATE orders SET work_status = ? WHERE id = ?`;
//   db.query(sql, [work_status, orderId], callback);
// };

const updateWorkStatus = (orderId, work_status, order_status, worker_comment, callback) => {
    let sql, params;

    if (order_status) {
        // Update work_status, order_status, and worker_comment
        sql = `UPDATE orders SET work_status = ?, order_status = ?, worker_comment = ? WHERE id = ?`;
        params = [work_status, order_status, worker_comment, orderId];
    } else {
        // Update work_status and worker_comment
        sql = `UPDATE orders SET work_status = ?, worker_comment = ? WHERE id = ?`;
        params = [work_status, worker_comment, orderId];
    }

    db.query(sql, params, callback);
};

const updateAssignedStatus = (orderId, assigned_status, callback) => {
  const sql = `UPDATE orders SET assigned_status = ? WHERE id = ?`;
  db.query(sql, [assigned_status, orderId], callback);
};

const requestCancel = (orderId, callback) => {
  const sql = `UPDATE orders SET cancel_req_status = 'Pending' WHERE id = ?`;
  db.query(sql, [orderId], callback);
};

const handleCancelRequest = (orderId, action, callback) => {
  let sql;
  if (action === "Approved") {
    sql = `UPDATE orders SET order_status = 'Canceled', cancel_req_status = 'Approved' WHERE id = ?`;
  } else if (action === "Rejected") {
    sql = `UPDATE orders SET cancel_req_status = 'Rejected' WHERE id = ?`;
  } else {
    return callback(new Error("Invalid action"), null);
  }
  db.query(sql, [orderId], callback);
};

const updateDesignApproveStatus = (designId, approve_status, callback) => {
  const sql = "UPDATE designs SET approve_status = ? WHERE id = ?";
  db.query(sql, [approve_status, designId], callback);
};

const fetchOrderAndDesign = (designId, callback) => {
  const sql = `
      SELECT orders.*, designs.requested_design_name 
      FROM orders 
      JOIN designs ON orders.id = designs.order_id 
      WHERE designs.id = ?
  `;
  db.query(sql, [designId], callback);
};

const updateStatus = (orderId, callback) => {
  const sql = "UPDATE orders SET status = 'Modified Order' WHERE id = ?";
  db.query(sql, [orderId], callback);
};

const insertNewOrder = (order, callback) => {
  const sql = `
      INSERT INTO orders 
      (account_id, mobile, account_name, email, address1, address2, city, pincode, state, state_code, 
      aadhar_card, gst_in, pan_card, date, order_number, estimated_delivery_date, metal, category, subcategory, 
      product_design_name, status, purity, gross_weight, stone_weight, stone_price, weight_bw, wastage_on, 
      wastage_percentage, wastage_weight, total_weight_aw, rate, amount, mc_on, mc_percentage, total_mc, 
      tax_percentage, tax_amount, total_price, remarks, delivery_date, image_url, order_status, qty, actual_order_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    order.account_id, order.mobile, order.account_name, order.email, order.address1, order.address2,
    order.city, order.pincode, order.state, order.state_code, order.aadhar_card, order.gst_in, order.pan_card,
    order.date, order.order_number, order.estimated_delivery_date, order.metal, order.category, order.subcategory,
    order.requested_design_name, // Use requested_design_name instead of product_design_name
    "Actual Order", order.purity, order.gross_weight, order.stone_weight, order.stone_price, order.weight_bw,
    order.wastage_on, order.wastage_percentage, order.wastage_weight, order.total_weight_aw, order.rate, order.amount,
    order.mc_on, order.mc_percentage, order.total_mc, order.tax_percentage, order.tax_amount, order.total_price,
    order.remarks, order.delivery_date, order.image_url, order.order_status, order.qty, order.actual_order_id
  ];

  db.query(sql, values, callback);
};

const deleteOrderById = (orderId, callback) => {
  const sql = "DELETE FROM orders WHERE id = ?";
  db.query(sql, [orderId], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};

const getOrderById = async (id) => {
  try {
      const sql = "SELECT * FROM orders WHERE id = ?";
      const [result] = await db.promise().query(sql, [id]);

      if (result.length === 0) {
          return null; // No order found
      }

      return result[0]; // Return the first order object
  } catch (error) {
      throw error;
  }
};

const updateOrder = async (id, updatedOrder) => {
  try {
    // Convert date fields before updating DB
    const dateFields = [
      "date",
      "estimated_delivery_date",
      "delivery_date",
      "created_at",
      "updated_at",
    ];

    dateFields.forEach((field) => {
      if (updatedOrder[field] === "") {
        updatedOrder[field] = null; // Convert empty string to NULL
      } else if (updatedOrder[field]) {
        updatedOrder[field] = formatDateForMySQL(updatedOrder[field]);
      }
    });

    // Construct SET clause dynamically
    const fields = Object.keys(updatedOrder)
      .map((field) => `${field} = ?`)
      .join(", ");
    const values = Object.values(updatedOrder);

    const query = `UPDATE orders SET ${fields} WHERE id = ?`;

    // Execute query with values using `db.promise()`
    const [result] = await db.promise().execute(query, [...values, id]);

    return result;
  } catch (error) {
    throw error;
  }
};

const updateInvoiceStatus = async (orderNumbers, invoiceNumber) => {
  const sql = "UPDATE orders SET invoice_generated = 'Yes', invoice_number = ? WHERE order_number IN (?)";
  return db.promise().query(sql, [invoiceNumber, orderNumbers]);
};

const updateOrderStatusToDelivered = async (orderNumbers) => {
  const sql = "UPDATE orders SET order_status = 'Delivered' WHERE order_number IN (?)";
  return db.promise().query(sql, [orderNumbers]);
};

const getLatestInvoiceNumber = async () => {
  const sql = "SELECT invoice_number FROM orders ORDER BY invoice_number DESC LIMIT 1";
  const [rows] = await db.promise().query(sql);
  return rows.length > 0 ? rows[0].invoice_number : null;
};

const updateEstimateStatus = async (orderNumbers, estimateNumber) => {
  const sql = "UPDATE orders SET estimate_generated = 'Yes', estimate_number = ? WHERE order_number IN (?)";
  return db.promise().query(sql, [estimateNumber, orderNumbers]);
};

const getLatestEstimateNumber = async () => {
  const sql = "SELECT estimate_number FROM orders ORDER BY estimate_number DESC LIMIT 1";
  const [rows] = await db.promise().query(sql);
  return rows.length > 0 ? rows[0].estimate_number : null;
};

const deleteOrderByOrderNumber = (orderNumber, callback) => {
  const sql = "DELETE FROM orders WHERE order_number = ?";
  db.query(sql, [orderNumber], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};

module.exports = {
  getLastOrderNumber,
  createOrder,
  getAllOrders,
  updateOrderAssignment,
  updateOrderStatus,
  // cancelOrder,
  updateWorkStatus,
  updateAssignedStatus,
  requestCancel,
  handleCancelRequest,
  updateDesignApproveStatus,
  fetchOrderAndDesign,
  updateStatus,
  insertNewOrder,
  deleteOrderById,
  getOrderById,
  updateOrder,
  updateInvoiceStatus,
  getLatestInvoiceNumber,
  updateEstimateStatus,
  getLatestEstimateNumber,
  updateOrderStatusToDelivered, 
  deleteOrderByOrderNumber
};
