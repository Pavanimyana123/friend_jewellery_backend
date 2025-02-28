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

exports.updateAccount = (req, res) => {
    const accountId = req.params.id;

    Account.updateAccount(accountId, req.body, (err, result) => {
        if (err) {
            console.error("Error updating account:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Account not found" });
        }
        res.status(200).json({ message: "Account updated successfully!" });
    });
};

exports.deleteAccount = (req, res) => {
    const accountId = req.params.id;

    Account.deleteAccount(accountId, (err, result) => {
        if (err) {
            console.error("Error deleting account:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Account not found" });
        }
        res.status(200).json({ message: "Account deleted successfully!" });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    Account.AccountfindByEmail(email, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }

        const user = results[0];

        // Compare passwords (assuming plain text for now)
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        res.status(200).json({ message: "Login Successful", user });
    });
};