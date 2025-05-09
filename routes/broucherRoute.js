const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db"); // Your MySQL connection module

const router = express.Router();

// Directory to store uploaded files
const BROUCHER_DIR = path.join(__dirname, "../uploads/broucher");
if (!fs.existsSync(BROUCHER_DIR)) {
    fs.mkdirSync(BROUCHER_DIR, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, BROUCHER_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50 MB
    }
});

// 📤 POST: Add a new broucher
router.post("/add-broucher-item", upload.single("file"), (req, res) => {
    const { broucher_name, description } = req.body;
    const file_path = req.file ? req.file.filename : null;

    if (!broucher_name || !file_path) {
        return res.status(400).json({ error: "Product name and file are required" });
    }

    const sql = `INSERT INTO brouchers (broucher_name, description, file_path) VALUES (?, ?, ?)`;
    db.query(sql, [broucher_name, description, file_path], (err, result) => {
        if (err) {
            console.error("Database insert error:", err);
            return res.status(500).json({ error: "Database error while inserting" });
        }
        res.status(201).json({ message: "Broucher added successfully", id: result.insertId });
    });
});

// 📥 GET: Retrieve all brouchers
router.get("/broucher-items", (req, res) => {
    const sql = "SELECT * FROM brouchers ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database fetch error:", err);
            return res.status(500).json({ error: "Database error while fetching data" });
        }
        res.status(200).json(results);
    });
});

module.exports = router;
