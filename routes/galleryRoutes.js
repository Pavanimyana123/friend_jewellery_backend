const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db"); // Make sure this points to your actual database connection
// const galleryController = require("../controllers/galleryController");

const router = express.Router();

// Configure multer storage for gallery images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/gallery/"); // Ensure this folder exists or will be created
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Save file with timestamp to avoid name collision
    },
});

// Make sure 'uploads/gallery' directory exists
const galleryDir = path.join(__dirname, "../uploads/gallery");
if (!fs.existsSync(galleryDir)) {
    fs.mkdirSync(galleryDir, { recursive: true });
}

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB file size limit
        fieldSize: 50 * 1024 * 1024, // 50 MB field size limit
    },
});

// Route to add an item to the gallery (image upload and other details)
router.post("/add-gallery-item", upload.single("image"), (req, res) => {
    const {
        product_name = '0',
        catalog_reference = '0',
        catalog_name = '0',
        design_name = '0',
        // weight = 0
    } = req.body;

    const image = req.file ? req.file.filename : null;

    const sql = `
        INSERT INTO gallery (product_name, catalog_reference, catalog_name, design_name, image)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
        product_name,
        catalog_reference,
        catalog_name,
        design_name,
        // weight,
        image,
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Insert error:", err);
            return res.status(500).json({ error: "Database insert error" });
        }
        res.status(200).json({ message: "Gallery item added successfully", id: result.insertId });
    });
});


router.get("/gallery-items", (req, res) => {
    const sql = "SELECT * FROM gallery ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Fetch error:", err);
            return res.status(500).json({ error: "Database fetch error" });
        }
        res.status(200).json(results);
    });
});


module.exports = router;
