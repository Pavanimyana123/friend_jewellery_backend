const fs = require("fs");
const OrderModel = require("../models/OrderModel");

const getLastOrderNumber = (req, res) => {
    OrderModel.getLastOrderNumber((err, result) => {
        if (err) {
            console.error("Error fetching last order number:", err);
            return res.status(500).json({ error: "Failed to fetch last order number" });
        }

        if (result.length > 0) {
            const ordNumbers = result
                .map(row => row.order_number)
                .filter(order => order.startsWith("ORD"))
                .map(order => parseInt(order.slice(3), 10));

            const lastOrderNumber = Math.max(...ordNumbers);
            const nextOrderNumber = `ORD${String(lastOrderNumber + 1).padStart(3, "0")}`;

            res.json({ lastOrderNumber: nextOrderNumber });
        } else {
            res.json({ lastOrderNumber: "ORD001" });
        }
    });
};

const createOrder = async (req, res) => {
    try {
        if (!req.body.order) {
            return res.status(400).json({ error: "Missing 'order' field in request body" });
        }

        const orders = Array.isArray(req.body.order) ? req.body.order : [req.body.order];

        const queries = orders.map(async (orderStr, index) => {
            const orderData = JSON.parse(orderStr);
            let imageUrl = null;
            let imageFile = req.files?.[index];

            if (orderData.imagePreview && orderData.imagePreview.startsWith("data:image")) {
                const base64Data = orderData.imagePreview.replace(/^data:image\/\w+;base64,/, "");
                const imageBuffer = Buffer.from(base64Data, "base64");
                const imageName = `uploads/${Date.now()}.png`;

                fs.writeFileSync(imageName, imageBuffer);
                imageUrl = `/${imageName}`;
            } else if (imageFile) {
                imageUrl = `/uploads/${imageFile.filename}`;
            }

            return new Promise((resolve, reject) => {
                const values = [
                    orderData.account_id || null, orderData.mobile || "", orderData.account_name || "",
                    orderData.email || "", orderData.address1 || "", orderData.address2 || "",
                    orderData.city || "", orderData.pincode || "", orderData.state || "",
                    orderData.state_code || "", orderData.aadhar_card || "", orderData.gst_in || "",
                    orderData.pan_card || "", orderData.date || new Date().toISOString().split("T")[0],
                    orderData.order_number || "", orderData.estimated_delivery_date === "" ? null : orderData.estimated_delivery_date, 
                    orderData.metal || "", orderData.category || "",
                    orderData.subcategory || "", orderData.product_design_name || "", orderData.purity || null,
                    orderData.gross_weight || 0, orderData.stone_weight || 0, orderData.stone_price || 0,
                    orderData.weight_bw || 0, orderData.wastage_on || "", parseFloat(orderData.wastage_percentage) || 0,
                    orderData.wastage_weight || 0, orderData.total_weight_aw || 0, orderData.rate || 0,
                    orderData.amount || 0, orderData.mc_on || "", parseFloat(orderData.mc_percentage) || 0,
                    orderData.total_mc || 0, parseFloat(orderData.tax_percentage) || 0, orderData.tax_amount || 0,
                    orderData.total_price || 0, orderData.remarks || "",orderData.delivery_date === "" ? null : orderData.delivery_date,
                    imageUrl, orderData.order_status || "", orderData.qty || "",
                ];

                OrderModel.createOrder(values, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
        });

        await Promise.all(queries);
        res.status(201).json({ message: "All orders added successfully", insertedRows: orders.length });

    } catch (error) {
        console.error("Error processing order:", error);
        res.status(400).json({ error: "Invalid request format", details: error.message });
    }
};

const getAllOrders = (req, res) => {
    OrderModel.getAllOrders((err, results) => {
        if (err) {
            console.error("Error fetching orders:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(200).json(results);
    });
};

const assignOrder = (req, res) => {
    const { orderId } = req.params;
    const { assigned_status, worker_id, worker_name, work_status } = req.body;

    OrderModel.updateOrderAssignment(orderId, assigned_status, worker_id, worker_name, work_status, (err, result) => {
        if (err) {
            console.error("Error updating order assignment:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.status(200).json({ message: "Order assignment updated successfully" });
    });
};

const updateStatus = (req, res) => {
    const { orderId } = req.params;
    const { order_status } = req.body;

    OrderModel.updateOrderStatus(orderId, order_status, (err, result) => {
        if (err) {
            console.error("Error updating order status:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.status(200).json({ message: "Order status updated successfully" });
    });
};

// const cancelOrder = (req, res) => {
//     const { orderId } = req.params;

//     OrderModel.cancelOrder(orderId, (err, result) => {
//         if (err) {
//             console.error("Error canceling order:", err);
//             return res.status(500).json({ error: "Database error" });
//         }
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ error: "Order not found" });
//         }
//         res.status(200).json({ message: "Order canceled successfully" });
//     });
// };

const updateWorkStatus = (req, res) => {
    const { orderId } = req.params;
    const { work_status } = req.body;

    OrderModel.updateWorkStatus(orderId, work_status, (err, result) => {
        if (err) {
            console.error("Error updating work status:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.status(200).json({ message: "Work status updated successfully" });
    });
};

const updateAssignedStatus = (req, res) => {
    const { orderId } = req.params;
    const { assigned_status } = req.body;

    OrderModel.updateAssignedStatus(orderId, assigned_status, (err, result) => {
        if (err) {
            console.error("Error updating assigned status:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.status(200).json({ message: "Assigned status updated successfully" });
    });
};

const requestCancel = (req, res) => {
    const { orderId } = req.params;

    OrderModel.requestCancel(orderId, (err, result) => {
        if (err) {
            console.error("Error updating cancel request:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: "Order cancellation requested successfully" });
    });
};

const handleCancelRequest = (req, res) => {
    const { orderId } = req.params;
    const { action } = req.body; // "Approved" or "Rejected"

    OrderModel.handleCancelRequest(orderId, action, (err, result) => {
        if (err) {
            console.error("Error updating cancel request:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: `Order cancellation ${action.toLowerCase()} successfully` });
    });
};

module.exports = { 
    getLastOrderNumber, 
    createOrder, 
    getAllOrders,
    assignOrder,
    updateStatus,
    // cancelOrder,
    updateWorkStatus,
    updateAssignedStatus,
    requestCancel,
    handleCancelRequest
};
