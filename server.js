const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const moment = require("moment");
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
const fs = require("fs");

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});


const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
});


const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Pavani@123',
    // password: 'Bharath@123',

    // password: 'Bunny@123',
    database: 'friends_jewellerydb',
    port: 3307,
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL database");
    }
});

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "manitejavadnala@gmail.com", // Use your email
        pass: "fppo lbmw edaf macr",  // Use an App Password if using Gmail
    },
});

app.use('/uploads', express.static('uploads'));

app.post("/add-account", (req, res) => {
    const {
        account_name, print_name, account_group, address1, address2, city, pincode, state, state_code,
        phone, mobile, email, birthday, anniversary, bank_account_no, bank_name,
        ifsc_code, branch, gst_in, aadhar_card, pan_card
    } = req.body;

    const password = `${account_name}@123`;

    const sanitizeValue = (value) => (value === "" ? null : value);

    const sql = `
        INSERT INTO account_details (
            account_name, print_name, account_group, address1, address2, city, pincode, state, state_code,
            phone, mobile, email, password, birthday, anniversary, bank_account_no, bank_name,
            ifsc_code, branch, gst_in, aadhar_card, pan_card
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        account_name, print_name, account_group, sanitizeValue(address1), sanitizeValue(address2),
        sanitizeValue(city), sanitizeValue(pincode), sanitizeValue(state), sanitizeValue(state_code),
        sanitizeValue(phone), sanitizeValue(mobile), sanitizeValue(email), password,
        sanitizeValue(birthday), sanitizeValue(anniversary), sanitizeValue(bank_account_no),
        sanitizeValue(bank_name), sanitizeValue(ifsc_code), sanitizeValue(branch),
        sanitizeValue(gst_in), sanitizeValue(aadhar_card), sanitizeValue(pan_card)
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error inserting account details:", err);
            return res.status(500).json({ error: "Database error" });
        }

        // Prepare email
        const mailOptions = {
            from: "manitejavadnala@gmail.com",
            to: email,
            subject: "Account Successfully Created",
            text: `Hello ${account_name},\n\nYour account has been successfully created.\n\nYour login credentials:\nEmail: ${email}\nPassword: ${password}\n\nBest Regards,\nNew Friend's Jewellery`,
        };

        // Send email notification
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return res.status(500).json({ error: "Account created but email failed to send." });
            }
            res.status(201).json({ message: "Account added successfully! Email sent.", accountId: result.insertId });
        });
    });
});


app.post("/api/orders", upload.array("image"), async (req, res) => {
    try {
        // console.log("Uploaded Files:", req.files);
        // console.log("Request Body:", req.body.order);

        if (!req.body.order) {
            return res.status(400).json({ error: "Missing 'order' field in request body" });
        }

        const orders = Array.isArray(req.body.order) ? req.body.order : [req.body.order];

        const queries = orders.map(async (orderStr, index) => {
            const orderData = JSON.parse(orderStr);

            let imageUrl = null;
            let imageFile = req.files?.[index]; // Multer uploaded file

            // Handle Base64 Image Conversion
            if (orderData.imagePreview && orderData.imagePreview.startsWith("data:image")) {
                const base64Data = orderData.imagePreview.replace(/^data:image\/\w+;base64,/, "");
                const imageBuffer = Buffer.from(base64Data, "base64");
                const imageName = `uploads/${Date.now()}.png`;

                fs.writeFileSync(imageName, imageBuffer); // Save file
                imageUrl = `/${imageName}`; // Store path for DB
            }
            // If file is uploaded via FormData
            else if (imageFile) {
                imageUrl = `/uploads/${imageFile.filename}`;
            }

            return new Promise((resolve, reject) => {
                const sql = `INSERT INTO orders (
                    account_id, mobile, account_name, email, address1, address2, city, pincode, state, state_code, 
                    aadhar_card, gst_in, pan_card, date, order_number, metal, category, subcategory, product_design_name, status, purity, 
                    gross_weight, stone_weight, stone_price, weight_bw, wastage_on, wastage_percentage, wastage_weight, 
                    total_weight_aw, rate, amount, mc_on, mc_percentage, total_mc, tax_percentage, tax_amount, total_price, 
                    remarks, image_url, order_status, qty, cancel_req_status, worker_comment
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                const values = [
                    orderData.account_id || null, orderData.mobile || "", orderData.account_name || "",
                    orderData.email || "", orderData.address1 || "", orderData.address2 || "",
                    orderData.city || "", orderData.pincode || "", orderData.state || "",
                    orderData.state_code || "", orderData.aadhar_card || "", orderData.gst_in || "",
                    orderData.pan_card || "", orderData.date || new Date().toISOString().split("T")[0],
                    orderData.order_number || "", orderData.metal || "", orderData.category || "",
                    orderData.subcategory || "", orderData.product_design_name || "", orderData.status || "", orderData.purity || null,
                    orderData.gross_weight || 0, orderData.stone_weight || 0, orderData.stone_price || 0,
                    orderData.weight_bw || 0, orderData.wastage_on || "", parseFloat(orderData.wastage_percentage) || 0,
                    orderData.wastage_weight || 0, orderData.total_weight_aw || 0, orderData.rate || 0,
                    orderData.amount || 0, orderData.mc_on || "", parseFloat(orderData.mc_percentage) || 0,
                    orderData.total_mc || 0, parseFloat(orderData.tax_percentage) || 0, orderData.tax_amount || 0,
                    orderData.total_price || 0, orderData.remarks || "", imageUrl, orderData.order_status || "", orderData.qty || "",
                    orderData.cancel_req_status || "", orderData.worker_comment || "",
                ];

                db.query(sql, values, (err, result) => {
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
});

app.get("/api/orders", (req, res) => {
    const sql = "SELECT * FROM orders";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching accounts:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(200).json(results);
    });
});

// Dynamic Customer Login API
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT id, account_name, account_group, mobile, email, password FROM account_details WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }

        const user = results[0];

        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        // Remove password from response
        delete user.password;

        res.status(200).json({
            message: "Login Successful",
            user
        });
    });
});

// GET API to fetch all accounts
app.get("/accounts", (req, res) => {
    const sql = "SELECT * FROM account_details";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching accounts:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(200).json(results);
    });
});

// GET API to fetch an account by ID
app.get("/account/:id", (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM account_details WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error fetching account:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Account not found" });
        }
        res.status(200).json(result[0]);
    });
});

app.put("/update-account/:id", (req, res) => {
    const accountId = req.params.id;
    let {
        account_name, print_name, account_group, address1, address2, city, pincode, state, state_code,
        phone, mobile, email, birthday, anniversary, bank_account_no, bank_name,
        ifsc_code, branch, gst_in, aadhar_card, pan_card
    } = req.body;

    // Convert dates to MySQL format (YYYY-MM-DD)
    birthday = birthday ? moment(birthday).format("YYYY-MM-DD") : null;
    anniversary = anniversary ? moment(anniversary).format("YYYY-MM-DD") : null;

    const sql = `
        UPDATE account_details
        SET account_name=?, print_name=?, account_group=?, address1=?, address2=?, city=?, pincode=?, state=?, state_code=?,
            phone=?, mobile=?, email=?, birthday=?, anniversary=?, bank_account_no=?, bank_name=?,
            ifsc_code=?, branch=?, gst_in=?, aadhar_card=?, pan_card=?
        WHERE id=?
    `;

    const values = [
        account_name, print_name, account_group, address1, address2, city, pincode, state, state_code,
        phone, mobile, email, birthday, anniversary, bank_account_no, bank_name,
        ifsc_code, branch, gst_in, aadhar_card, pan_card, accountId
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating account:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Account not found" });
        }
        res.status(200).json({ message: "Account updated successfully!" });
    });
});

app.get("/api/getorder/:id", (req, res) => {
    const orderId = req.params.id;
    const sql = "SELECT * FROM orders WHERE id = ?";

    db.query(sql, [orderId], (err, result) => {
        if (err) {
            console.error("Error fetching order:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json(result[0]); // Send the first result as an object
    });
});

// app.put("/api/orders/:id", (req, res) => {
//     const orderId = Number(req.params.id); // Convert to number
//     const orderData = req.body;
//     console.log("orderdata=", req.body);

//     if (!orderId) {
//         return res.status(400).json({ error: "Invalid order ID" });
//     }

//     if (!Object.keys(orderData).length) {
//         return res.status(400).json({ error: "Empty request body" });
//     }

//     const sql = `UPDATE orders SET 
//         account_id = ?, mobile = ?, account_name = ?, email = ?, address1 = ?, address2 = ?, city = ?, pincode = ?, state = ?, state_code = ?, 
//         aadhar_card = ?, gst_in = ?, pan_card = ?, date = ?, order_number = ?, metal = ?, category = ?, subcategory = ?, product_design_name = ?, status = ?, purity = ?, 
//         gross_weight = ?, stone_weight = ?, stone_price = ?, weight_bw = ?, wastage_on = ?, wastage_percentage = ?, wastage_weight = ?, 
//         total_weight_aw = ?, rate = ?, amount = ?, mc_on = ?, mc_percentage = ?, total_mc = ?, tax_percentage = ?, tax_amount = ?, total_price = ?, 
//         remarks = ?, order_status = ?, qty = ? 
//         WHERE id = ?`;

//     const values = [
//         orderData.account_id || null, orderData.mobile || null, orderData.account_name || "", 
//         orderData.email || "", orderData.address1 || "", orderData.address2 || "", 
//         orderData.city || "", orderData.pincode || "", orderData.state || "", orderData.state_code || "", 
//         orderData.aadhar_card || "", orderData.gst_in || "", orderData.pan_card || "", 
//         orderData.date || "", orderData.order_number || "", orderData.metal || "", 
//         orderData.category || "", orderData.subcategory || "", orderData.product_design_name || "", 
//         orderData.status || "", orderData.purity || "", orderData.gross_weight || 0, 
//         orderData.stone_weight || 0, orderData.stone_price || 0, orderData.weight_bw || 0, 
//         orderData.wastage_on || "", orderData.wastage_percentage || 0, orderData.wastage_weight || 0, 
//         orderData.total_weight_aw || 0, orderData.rate || 0, orderData.amount || 0, 
//         orderData.mc_on || "", orderData.mc_percentage || 0, orderData.total_mc || 0, 
//         orderData.tax_percentage || 0, orderData.tax_amount || 0, orderData.total_price || 0, 
//         orderData.remarks || "", orderData.order_status || "", orderData.qty || 0, 
//         orderId
//     ];

//     db.query(sql, values, (err, result) => {
//         if (err) {
//             console.error("Error updating order:", err);
//             return res.status(500).json({ error: "Database error" });
//         }

//         if (result.affectedRows === 0) {
//             return res.status(404).json({ error: "Order not found" });
//         }

//         res.status(200).json({ message: "Order updated successfully" });
//     });
// });


app.put("/api/updateorders/:id", async (req, res) => {
    try {
        const { id } = req.params;
        let updatedOrder = { ...req.body };

        // console.log("Requested order =", updatedOrder);

        // Remove imagePreview since it's not a column in the database
        delete updatedOrder.imagePreview;

        let imageUrl = null;
        let imageFile = req.files?.image; // If using Multer

        // Function to format date for MySQL
        const formatDateForMySQL = (dateString) => {
            if (!dateString) return null; // If date is null, return null
            return moment(dateString).format("YYYY-MM-DD HH:mm:ss");
        };

        // Convert date fields before updating DB
        if (updatedOrder.date) {
            updatedOrder.date = formatDateForMySQL(updatedOrder.date);
        }
        if (updatedOrder.estimated_delivery_date) {
            updatedOrder.estimated_delivery_date = formatDateForMySQL(updatedOrder.estimated_delivery_date);
        }
        if (updatedOrder.delivery_date) {
            updatedOrder.delivery_date = formatDateForMySQL(updatedOrder.delivery_date);
        }
        if (updatedOrder.created_at) {
            updatedOrder.created_at = formatDateForMySQL(updatedOrder.created_at);
        }
        if (updatedOrder.updated_at) {
            updatedOrder.updated_at = formatDateForMySQL(updatedOrder.updated_at);
        }

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

        // Construct SET clause dynamically
        const fields = Object.keys(updatedOrder).map(field => `${field} = ?`).join(", ");
        const values = Object.values(updatedOrder);

        const query = `UPDATE orders SET ${fields} WHERE id = ?`;

        // Execute query with values using `db.promise()`
        const [result] = await db.promise().execute(query, [...values, id]);

        // Check if update was successful
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Order not found or no changes made" });
        }

        res.status(200).json({ message: "Order updated successfully", imageUrl });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ error: "Failed to update order" });
    }
});

app.delete("/delete-account/:id", (req, res) => {
    const accountId = req.params.id;

    const sql = "DELETE FROM account_details WHERE id = ?";

    db.query(sql, [accountId], (err, result) => {
        if (err) {
            console.error("Error deleting account:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Account not found" });
        }
        res.status(200).json({ message: "Account deleted successfully!" });
    });
});

app.get("/states", (req, res) => {
    const sql = "SELECT * FROM states";
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

// ✅ PUT API - Update Order with Assigned Worker
// app.put("/api/orders/:orderId", (req, res) => {
//     const { orderId } = req.params;
//     const { order_status, assigned_status, worker_id, worker_name, work_status } = req.body;

//     const sql = `
//         UPDATE orders 
//         SET order_status = ?, assigned_status = ?, worker_id = ?, worker_name = ?, work_status = ? 
//         WHERE id = ?`;

//     db.query(sql, [order_status, assigned_status, worker_id, worker_name, work_status, orderId], (err, result) => {
//         if (err) {
//             console.error("Error updating order:", err);
//             return res.status(500).json({ error: "Database error" });
//         }

//         if (result.affectedRows === 0) {
//             return res.status(404).json({ error: "Order not found" });
//         }

//         res.status(200).json({ message: "Order updated successfully" });
//     });
// });

app.put("/api/orders/assign/:orderId", (req, res) => {
    const { orderId } = req.params;
    const { assigned_status, worker_id, worker_name, work_status } = req.body;

    const sql = `
        UPDATE orders 
        SET assigned_status = ?, worker_id = ?, worker_name = ?, work_status = ? 
        WHERE id = ?`;

    db.query(sql, [assigned_status, worker_id, worker_name, work_status, orderId], (err, result) => {
        if (err) {
            console.error("Error updating order assignment:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: "Order assignment updated successfully" });
    });
});

app.put("/api/orders/status/:orderId", (req, res) => {
    const { orderId } = req.params;
    const { order_status } = req.body;

    const sql = `
        UPDATE orders 
        SET order_status = ? 
        WHERE id = ?`;

    db.query(sql, [order_status, orderId], (err, result) => {
        if (err) {
            console.error("Error updating order status:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: "Order status updated successfully" });
    });
});

app.put("/api/orders/work-status/:orderId", (req, res) => {
    const { orderId } = req.params;
    const { work_status, worker_comment } = req.body;

    const sql = `
        UPDATE orders 
        SET work_status = ?, worker_comment = ?
        WHERE id = ?`;

    db.query(sql, [work_status, worker_comment, orderId], (err, result) => {
        if (err) {
            console.error("Error updating work status:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: "Work status updated successfully" });
    });
});

app.put("/api/orders/assign-status/:orderId", (req, res) => {
    const { orderId } = req.params;
    const { assigned_status } = req.body;

    const sql = `
        UPDATE orders 
        SET assigned_status = ? 
        WHERE id = ?`;

    db.query(sql, [assigned_status, orderId], (err, result) => {
        if (err) {
            console.error("Error updating work status:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: "Work status updated successfully" });
    });
});

// API to get the last order number
app.get("/api/lastOrderNumber", (req, res) => {
    const query = "SELECT order_number FROM orders WHERE order_number LIKE 'ORD%' ORDER BY id DESC";

    db.query(query, (err, result) => {
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
});


app.put("/api/orders/cancel/:orderId", (req, res) => {
    const { orderId } = req.params;

    const sql = `
        UPDATE orders 
        SET cancel_req_status = 'Pending' 
        WHERE id = ?`;

    db.query(sql, [orderId], (err, result) => {
        if (err) {
            console.error("Error updating cancel request:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: "Order cancellation requested successfully" });
    });
});

app.put("/api/orders/cancel/handle/:orderId", (req, res) => {
    const { orderId } = req.params;
    const { action } = req.body; // "Approved" or "Rejected"

    let sql;
    let values;

    if (action === "Approved") {
        sql = `
            UPDATE orders 
            SET order_status = 'Canceled', cancel_req_status = 'Approved'
            WHERE id = ?`;
        values = [orderId];
    } else if (action === "Rejected") {
        sql = `
            UPDATE orders 
            SET cancel_req_status = 'Rejected' 
            WHERE id = ?`;
        values = [orderId];
    } else {
        return res.status(400).json({ error: "Invalid action" });
    }

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating cancel request:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: `Order cancellation ${action.toLowerCase()} successfully` });
    });
});

app.post('/api/designs', (req, res) => {
    const { order_id, account_name, requested_design_name, approve_status } = req.body;

    if (!order_id || !account_name || !requested_design_name) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const sql = 'INSERT INTO designs (order_id, account_name, requested_design_name, approve_status) VALUES (?, ?, ?, ?)';
    db.query(sql, [order_id, account_name, requested_design_name, approve_status], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({ message: 'Design change request submitted successfully!' });
    });
});

app.get("/api/designs", (req, res) => {
    const sql = "SELECT * FROM designs";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching accounts:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(200).json(results);
    });
});

app.put("/api/designs/:id/approve-status", (req, res) => {
    const { id } = req.params;
    const { approve_status } = req.body;

    // SQL query to update approve_status in designs table
    const updateDesignSql = "UPDATE designs SET approve_status = ? WHERE id = ?";

    db.query(updateDesignSql, [approve_status, id], (err, result) => {
        if (err) {
            console.error("Error updating approve status:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (approve_status === "Approved") {
            // First, fetch the order details and requested_design_name
            const fetchOrderSql = `
                SELECT orders.*, designs.requested_design_name 
                FROM orders 
                JOIN designs ON orders.id = designs.order_id 
                WHERE designs.id = ?
            `;

            db.query(fetchOrderSql, [id], (fetchErr, orders) => {
                if (fetchErr) {
                    console.error("Error fetching order details:", fetchErr);
                    return res.status(500).json({ error: "Database error while fetching order details" });
                }

                if (orders.length === 0) {
                    return res.status(404).json({ error: "Order not found" });
                }

                const order = orders[0]; // Get the fetched order details

                // Update the existing order's status to 'Modified Order'
                const updateOrderSql = "UPDATE orders SET status = 'Modified Order' WHERE id = ?";

                db.query(updateOrderSql, [order.id], (orderErr) => {
                    if (orderErr) {
                        console.error("Error updating order status:", orderErr);
                        return res.status(500).json({ error: "Database error while updating order status" });
                    }

                    const insertOrderSql = `
                        INSERT INTO orders 
                        (account_id, mobile, account_name, email, address1, address2, city, pincode, state, state_code, 
                        aadhar_card, gst_in, pan_card, date, order_number, estimated_delivery_date, metal, category, subcategory, product_design_name, status, purity, 
                        gross_weight, stone_weight, stone_price, weight_bw, wastage_on, wastage_percentage, wastage_weight, 
                        total_weight_aw, rate, amount, mc_on, mc_percentage, total_mc, tax_percentage, tax_amount, total_price, 
                        remarks, delivery_date, image_url, order_status, qty) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    const newOrderValues = [
                        order.account_id, order.mobile, order.account_name, order.email, order.address1, order.address2,
                        order.city, order.pincode, order.state, order.state_code, order.aadhar_card, order.gst_in, order.pan_card,
                        order.date, order.order_number, order.estimated_delivery_date, order.metal, order.category, order.subcategory, order.requested_design_name, // Use requested_design_name
                        "Actual Order", order.purity, order.gross_weight, order.stone_weight, order.stone_price, order.weight_bw,
                        order.wastage_on, order.wastage_percentage, order.wastage_weight, order.total_weight_aw, order.rate, order.amount,
                        order.mc_on, order.mc_percentage, order.total_mc, order.tax_percentage, order.tax_amount, order.total_price,
                        order.remarks, order.delivery_date, order.image_url, order.order_status, order.qty
                    ];

                    db.query(insertOrderSql, newOrderValues, (insertErr) => {
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
});

app.delete("/api/delete-order/:id", (req, res) => {
    const orderId = req.params.id;

    const sql = "DELETE FROM orders WHERE id = ?";

    db.query(sql, [orderId], (err, result) => {
        if (err) {
            console.error("Error deleting order:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.status(200).json({ message: "Order deleted successfully!" });
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
