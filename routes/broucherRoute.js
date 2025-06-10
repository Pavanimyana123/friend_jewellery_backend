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
    fileSize: 500 * 1024 * 1024 // 100 MB
}

});

// 📤 POST: Add a new broucher
router.post("/add-broucher-item", upload.single("file"), (req, res) => {
    const { broucher_name, description, purity, category } = req.body;
    const file_path = req.file ? req.file.filename : null;

    if (!broucher_name || !file_path) {
        return res.status(400).json({ error: "Product name and file are required" });
    }

    const sql = `INSERT INTO brouchers (broucher_name, description, purity, category, file_path) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [broucher_name, description,purity,category, file_path], (err, result) => {
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

router.put("/update-broucher-item/:id", upload.single("file"), (req, res) => {
    const { id } = req.params;
    const { broucher_name, description, purity, category } = req.body;
    
    // Check if a new file was uploaded
    let file_path = null;
    if (req.file) {
        file_path = req.file.filename;
    }

    // First, get the current item to handle file deletion if needed
    db.query('SELECT file_path FROM brouchers WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error("Database select error:", err);
            return res.status(500).json({ error: "Database error while fetching current item" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Broucher item not found" });
        }

        const currentItem = results[0];
        let updateValues = [broucher_name, description, purity, category];
        let sql = `UPDATE brouchers SET broucher_name = ?, description = ?, purity = ?, category = ?`;
        
        // If a new file was uploaded, update the file_path and delete the old file
        if (file_path) {
            sql += `, file_path = ?`;
            updateValues.push(file_path);
            
            // Delete the old file if it exists
            if (currentItem.file_path) {
                const oldFilePath = path.join(__dirname, '../uploads/broucher', currentItem.file_path);
                fs.unlink(oldFilePath, (err) => {
                    if (err) console.error("Error deleting old file:", err);
                });
            }
        }
        
        sql += ` WHERE id = ?`;
        updateValues.push(id);

        db.query(sql, updateValues, (err, result) => {
            if (err) {
                console.error("Database update error:", err);
                return res.status(500).json({ error: "Database error while updating" });
            }
            res.status(200).json({ message: "Broucher updated successfully" });
        });
    });
});

router.post("/delete-broucher-items", (req, res) => {
    const { ids } = req.body; // expects: { ids: [1, 2, 3] }

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No IDs provided for deletion" });
    }

    const placeholders = ids.map(() => '?').join(',');
    const deleteSql = `DELETE FROM brouchers WHERE id IN (${placeholders})`;

    db.query(deleteSql, ids, (err, result) => {
        if (err) {
            console.error("Delete error:", err);
            return res.status(500).json({ error: "Failed to delete brouchers items" });
        }

        res.status(200).json({ message: "brouchers items deleted successfully" });
    });
});


// GET all categories
router.get('/categories', (req, res) => {
  const query = 'SELECT * FROM categories ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

// POST a new category
router.post('/categories', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const query = 'INSERT INTO categories (name) VALUES (?)';
  db.query(query, [name], (err, result) => {
    if (err) {
      console.error('Error adding category:', err);
      return res.status(500).json({ error: 'Could not add category' });
    }

    // Return the newly inserted category with id and timestamp
    const selectQuery = 'SELECT * FROM categories WHERE id = ?';
    db.query(selectQuery, [result.insertId], (err2, rows) => {
      if (err2) {
        return res.status(500).json({ error: 'Error fetching inserted category' });
      }
      res.status(201).json(rows[0]);
    });
  });
});


module.exports = router;
