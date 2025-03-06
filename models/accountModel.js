const db = require("../db");

createAccount = (accountData) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO account_details (
                account_name, print_name, account_group, address1, address2, city, pincode, state, state_code,
                phone, mobile, email, password, birthday, anniversary, bank_account_no, bank_name,
                ifsc_code, branch, gst_in, aadhar_card, pan_card
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const sanitizeValue = (value) => (value === "" ? null : value);

        const values = [
            accountData.account_name, accountData.print_name, accountData.account_group,
            sanitizeValue(accountData.address1), sanitizeValue(accountData.address2),
            sanitizeValue(accountData.city), sanitizeValue(accountData.pincode), 
            sanitizeValue(accountData.state), sanitizeValue(accountData.state_code),
            sanitizeValue(accountData.phone), sanitizeValue(accountData.mobile), 
            sanitizeValue(accountData.email), `${accountData.account_name}@123`, // Default password
            sanitizeValue(accountData.birthday), sanitizeValue(accountData.anniversary),
            sanitizeValue(accountData.bank_account_no), sanitizeValue(accountData.bank_name),
            sanitizeValue(accountData.ifsc_code), sanitizeValue(accountData.branch),
            sanitizeValue(accountData.gst_in), sanitizeValue(accountData.aadhar_card),
            sanitizeValue(accountData.pan_card)
        ];

        db.query(sql, values, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.insertId);
            }
        });
    });
};

const getAll = (callback) => {
    const sql = "SELECT * FROM account_details";
    db.query(sql, callback);
};

const getById = (id, callback) => {
    const sql = "SELECT * FROM account_details WHERE id = ?";
    db.query(sql, [id], callback);
};

const updateAccountById = (id, accountData) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE account_details
            SET account_name=?, print_name=?, account_group=?, address1=?, address2=?, city=?, pincode=?, state=?, state_code=?,
                phone=?, mobile=?, email=?, birthday=?, anniversary=?, bank_account_no=?, bank_name=?,
                ifsc_code=?, branch=?, gst_in=?, aadhar_card=?, pan_card=?
            WHERE id=?
        `;

        const values = [
            accountData.account_name, accountData.print_name, accountData.account_group, accountData.address1, accountData.address2,
            accountData.city, accountData.pincode, accountData.state, accountData.state_code,
            accountData.phone, accountData.mobile, accountData.email, accountData.birthday, accountData.anniversary,
            accountData.bank_account_no, accountData.bank_name, accountData.ifsc_code, accountData.branch,
            accountData.gst_in, accountData.aadhar_card, accountData.pan_card, id
        ];

        db.query(sql, values, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const deleteAccount = (accountId, callback) => {
    const sql = "DELETE FROM account_details WHERE id = ?";

    db.query(sql, [accountId], callback);
};

module.exports = { createAccount, getAll, getById, updateAccountById,deleteAccount };
