const fs = require("fs");
const OrderModel = require("../models/orderModel");
const db = require("../db");
const transporter = require('../emailConfig'); 

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

        // Fetch the current max actual_order_id
        const [rows] = await new Promise((resolve, reject) => {
            db.query("SELECT MAX(actual_order_id) AS maxId FROM orders", (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        let currentActualId = rows.maxId || 0;

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

            // Increment actual_order_id
            currentActualId += 1;

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
                    orderData.total_price || 0, orderData.remarks || "", orderData.delivery_date === "" ? null : orderData.delivery_date,
                    imageUrl, orderData.order_status || "", orderData.qty || "", orderData.status || "", orderData.assigned_status || "Not Assigned",
                    orderData.stone_name || "", orderData.o_size || "", orderData.o_length || "",
                    orderData.overall_total_weight || "", orderData.overall_total_price || "", orderData.advance_gross_wt || 0,
                    orderData.fine_wt || 0, orderData.advance_amount || 0, currentActualId, orderData.balance_amt || 0,
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

// const updateWorkStatus = (req, res) => {
//     const { orderId } = req.params;
//     const { work_status } = req.body;

//     OrderModel.updateWorkStatus(orderId, work_status, (err, result) => {
//         if (err) {
//             console.error("Error updating work status:", err);
//             return res.status(500).json({ error: "Database error" });
//         }
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ error: "Order not found" });
//         }
//         res.status(200).json({ message: "Work status updated successfully" });
//     });
// };

const updateWorkStatus = (req, res) => {
    const { orderId } = req.params;
    const { work_status } = req.body;

    let order_status = null;
    if (work_status === "In Progress" || work_status === "Hold") {
        order_status = "Processing";
    } else if (work_status === "Completed") {
        order_status = "Ready for Delivery";
    }

    OrderModel.updateWorkStatus(orderId, work_status, order_status, (err, result) => {
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

// const requestCancel = (req, res) => {
//     const { orderId } = req.params;

//     OrderModel.requestCancel(orderId, (err, result) => {
//         if (err) {
//             console.error("Error updating cancel request:", err);
//             return res.status(500).json({ error: "Database error" });
//         }

//         if (result.affectedRows === 0) {
//             return res.status(404).json({ error: "Order not found" });
//         }

//         res.status(200).json({ message: "Order cancellation requested successfully" });
//     });
// };


const requestCancel = (req, res) => {
    const { orderId } = req.params;
    const { customerEmail, category, subcategory, orderNumber } = req.body;

    OrderModel.requestCancel(orderId, (err, result) => {
        if (err) {
            console.error("Error updating cancel request:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        const mailOptions = {
            from: `"Customer" <${customerEmail}>`,
            to: "manitejavadnala079@gmail.com",
            subject: `Cancellation Request for Order #${orderId}`,
            text: `
A cancellation request has been made for the following order:

- Order ID: ${orderId}
- Order Number: ${orderNumber}
- Category: ${category}
- Subcategory: ${subcategory}
- Requested By: ${customerEmail}

Please review this request in the admin dashboard.
            `.trim()
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Failed to send cancellation email to admin:", error);
            } else {
                console.log("Cancellation email sent to admin:", info.response);
            }
        });

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

const updateApproveStatus = (req, res) => {
    const { id } = req.params;
    const { approve_status } = req.body;

    OrderModel.updateDesignApproveStatus(id, approve_status, (err, result) => {
        if (err) {
            console.error("Error updating approve status:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (approve_status === "Approved") {
            OrderModel.fetchOrderAndDesign(id, (fetchErr, orders) => {
                if (fetchErr) {
                    console.error("Error fetching order details:", fetchErr);
                    return res.status(500).json({ error: "Database error while fetching order details" });
                }

                if (orders.length === 0) {
                    return res.status(404).json({ error: "Order not found" });
                }

                const order = orders[0]; // Get the fetched order details

                OrderModel.updateStatus(order.id, (orderErr) => {
                    if (orderErr) {
                        console.error("Error updating order status:", orderErr);
                        return res.status(500).json({ error: "Database error while updating order status" });
                    }

                    OrderModel.insertNewOrder(order, (insertErr) => {
                        if (insertErr) {
                            console.error("Error inserting new order:", insertErr);
                            return res.status(500).json({ error: "Database error while inserting new order" });
                        }

                        res.status(200).json({ message: "Approve status updated, Order status modified, and new Actual Order created" });
                    });
                });
            });
        } else {
            res.status(200).json({ message: "Approve status updated successfully" });
        }
    });
};

const deleteOrder = (req, res) => {
    const orderId = req.params.id;

    OrderModel.deleteOrderById(orderId, (err, result) => {
        if (err) {
            console.error("Error deleting order:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.status(200).json({ message: "Order deleted successfully!" });
    });
};

const getOrderController = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await OrderModel.getOrderById(id);  // ✅ Use OrderModel.getOrderById

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ error: "Database error" });
    }
};

const updateOrderController = async (req, res) => {
    try {
        const { id } = req.params;
        let updatedOrder = { ...req.body };

        // Remove imagePreview since it's not stored in the database
        delete updatedOrder.imagePreview;

        let imageUrl = null;
        let imageFile = req.files?.image;

        // Handle Base64 Image Conversion
        if (req.body.imagePreview && req.body.imagePreview.startsWith("data:image")) {
            const base64Data = req.body.imagePreview.replace(/^data:image\/\w+;base64,/, "");
            const imageBuffer = Buffer.from(base64Data, "base64");
            const imageName = `uploads/${Date.now()}.png`;

            fs.writeFileSync(imageName, imageBuffer); // Save file
            imageUrl = `/${imageName}`; // Store path for DB
        }
        // If file is uploaded via FormData
        else if (imageFile) {
            imageUrl = `/uploads/${imageFile.filename}`;
        }

        // If an image was processed, update its URL in the database
        if (imageUrl) {
            updatedOrder.image_url = imageUrl;
        }

        // Update the order in the database
        const result = await OrderModel.updateOrder(id, updatedOrder);

        // Check if update was successful
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Order not found or no changes made" });
        }

        res.status(200).json({ message: "Order updated successfully", imageUrl });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ error: "Failed to update order" });
    }
};

// const updateInvoiceStatus = async (req, res) => {
//     const { orderIds, invoiceNumber } = req.body;

//     if (!orderIds || orderIds.length === 0 || !invoiceNumber) {
//         return res.status(400).json({ message: "Invalid request data" });
//     }

//     try {
//         await OrderModel.updateInvoiceStatus(orderIds, invoiceNumber);
//         res.json({ message: "Invoice status updated successfully" });
//     } catch (error) {
//         console.error("Error updating invoice status:", error);
//         res.status(500).json({ message: "Failed to update invoice status" });
//     }
// };


const updateInvoiceStatus = async (req, res) => {
    const { orderIds, invoiceNumber } = req.body;

    if (!orderIds || orderIds.length === 0 || !invoiceNumber) {
        return res.status(400).json({ message: "Invalid request data" });
    }

    try {
        // Update invoice status and order status to Delivered
        await OrderModel.updateInvoiceStatus(orderIds, invoiceNumber);

        // Also update order_status to 'Delivered'
        await OrderModel.updateOrderStatusToDelivered(orderIds);

        res.json({ message: "Invoice and order status updated successfully" });
    } catch (error) {
        console.error("Error updating invoice and order status:", error);
        res.status(500).json({ message: "Failed to update invoice and order status" });
    }
};

const getLatestInvoiceNumber = async (req, res) => {
    try {
        const latestInvoice = await OrderModel.getLatestInvoiceNumber();
        res.json({ latestInvoiceNumber: latestInvoice });
    } catch (error) {
        console.error("Error fetching latest invoice number:", error);
        res.status(500).json({ message: "Failed to fetch latest invoice number" });
    }
};

const updateEstimateStatus = async (req, res) => {
    const { orderIds, estimateNumber } = req.body;

    if (!orderIds || orderIds.length === 0 || !estimateNumber) {
        return res.status(400).json({ message: "Invalid request data" });
    }

    try {
        await OrderModel.updateEstimateStatus(orderIds, estimateNumber);
        res.json({ message: "Estimate status updated successfully" });
    } catch (error) {
        console.error("Error updating Estimate status:", error);
        res.status(500).json({ message: "Failed to update invoice status" });
    }
};

const getLatestEstimateNumber = async (req, res) => {
    try {
        const latestEstimate = await OrderModel.getLatestEstimateNumber();
        res.json({ latestEstimateNumber: latestEstimate });
    } catch (error) {
        console.error("Error fetching latest Estimate number:", error);
        res.status(500).json({ message: "Failed to fetch latest Estimate number" });
    }
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
    handleCancelRequest,
    updateApproveStatus,
    deleteOrder,
    getOrderController,
    updateOrderController,
    updateInvoiceStatus,
    getLatestInvoiceNumber,
    updateEstimateStatus,
    getLatestEstimateNumber
};
