const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Pavani@123',
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


// Dynamic Customer Login API
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM account_details WHERE email = ?";
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

        res.status(200).json({ message: "Login Successful" });
    });
});

// POST API to create a new account
app.post("/add-account", (req, res) => {
    const {
        account_name, print_name, account_group, address1, address2, city, pincode, state, state_code,
        phone, mobile, email, birthday, anniversary, bank_account_no, bank_name,
        ifsc_code, branch, gst_in, aadhar_card, pan_card
    } = req.body;

    // Set default password as account_name@123
    const password = `${account_name}@123`;

    const sql = `
        INSERT INTO account_details (
            account_name, print_name, account_group, address1, address2, city, pincode, state, state_code,
            phone, mobile, email, password, birthday, anniversary, bank_account_no, bank_name,
            ifsc_code, branch, gst_in, aadhar_card, pan_card
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        account_name, print_name, account_group, address1, address2, city, pincode, state, state_code,
        phone, mobile, email, password, birthday, anniversary, bank_account_no, bank_name,
        ifsc_code, branch, gst_in, aadhar_card, pan_card
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error inserting account details:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "Account added successfully!", accountId: result.insertId });
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
    const {
        account_name, print_name, account_group, address1, address2, city, pincode, state, state_code,
        phone, mobile, email, birthday, anniversary, bank_account_no, bank_name,
        ifsc_code, branch, gst_in, aadhar_card, pan_card
    } = req.body;

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

app.post("/api/orders", (req, res) => {
    const {
        account_id,
        mobile,
        account_name,
        email,
        address1,
        address2,
        city,
        pincode,
        state,
        state_code,
        aadhar_card,
        gst_in,
        pan_card,
        date,
        order_number,
        metal,
        category,
        subcategory,
        product_design_name,
        purity,
        gross_weight,
        stone_weight,
        stone_price,
        weight_bw,
        wastage_on,
        wastage_percentage,
        wastage_weight,
        total_weight_aw,
        rate,
        amount,
        mc_on,
        mc_percentage,
        total_mc,
        tax_percentage,
        tax_amount,
        total_price,
        remarks,
        image_url,
    } = req.body;

    const sql = `
    INSERT INTO orders (
        account_id, mobile, account_name, email, address1, address2, city, pincode, state, state_code, 
        aadhar_card, gst_in, pan_card, date, order_number, metal, category, subcategory, product_design_name, purity, 
        gross_weight, stone_weight, stone_price, weight_bw, wastage_on, wastage_percentage, wastage_weight, 
        total_weight_aw, rate, amount, mc_on, mc_percentage, total_mc, tax_percentage, tax_amount, total_price, 
        remarks, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const values = [
    account_id, mobile, account_name, email, address1, address2, city, pincode, state, state_code,
    aadhar_card, gst_in, pan_card, date, order_number, metal, category, subcategory, product_design_name, purity,
    gross_weight, stone_weight, stone_price, weight_bw, wastage_on, wastage_percentage, wastage_weight,
    total_weight_aw, rate, amount, mc_on, mc_percentage, total_mc, tax_percentage, tax_amount, total_price,
    remarks, image_url || null // Ensure `image_url` is included even if null
];

db.query(sql, values, (err, result) => {
    if (err) {
        console.error("Error inserting order:", err);
        return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "Order added successfully", orderId: result.insertId });
});

});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
