const Account = require("../models/accountModel");

exports.addAccount = (req, res) => {
    Account.create(req.body, (err, result) => {
        if (err) {
            console.error("Error inserting account details:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "Account added successfully!", accountId: result.insertId });
    });
};

exports.getAllAccounts = (req, res) => {
    Account.getAll((err, results) => {
        if (err) {
            console.error("Error fetching accounts:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(200).json(results);
    });
};

exports.getAccountById = (req, res) => {
    const { id } = req.params;
    Account.getById(id, (err, result) => {
        if (err) {
            console.error("Error fetching account:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Account not found" });
        }
        res.status(200).json(result[0]);
    });
};
