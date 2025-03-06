const Account = require("../models/accountModel");
const moment = require("moment");

exports.addAccount = async (req, res) => {
    try {
        const accountId = await Account.createAccount(req.body);
        res.status(201).json({ message: "Account added successfully!", accountId });
    } catch (error) {
        console.error("Error inserting account details:", error);
        res.status(500).json({ error: "Database error" });
    }
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

exports.updateAccount = async (req, res) => {
    try {
        const accountId = req.params.id;
        let {
            account_name, print_name, account_group, address1, address2, city, pincode, state, state_code,
            phone, mobile, email, birthday, anniversary, bank_account_no, bank_name,
            ifsc_code, branch, gst_in, aadhar_card, pan_card
        } = req.body;

        // Convert dates to MySQL format (YYYY-MM-DD)
        birthday = birthday ? moment(birthday).format("YYYY-MM-DD") : null;
        anniversary = anniversary ? moment(anniversary).format("YYYY-MM-DD") : null;

        const updatedAccount = await Account.updateAccountById(accountId, {
            account_name, print_name, account_group, address1, address2, city, pincode, state, state_code,
            phone, mobile, email, birthday, anniversary, bank_account_no, bank_name,
            ifsc_code, branch, gst_in, aadhar_card, pan_card
        });

        if (updatedAccount.affectedRows === 0) {
            return res.status(404).json({ error: "Account not found" });
        }

        res.status(200).json({ message: "Account updated successfully!" });
    } catch (error) {
        console.error("Error updating account:", error);
        res.status(500).json({ error: "Database error" });
    }
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

