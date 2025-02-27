const db = require("../db");

const create = (accountData, callback) => {
    const {
        account_name, print_name, account_group, address1, address2, city, pincode, state, state_code,
        phone, mobile, email, birthday, anniversary, bank_account_no, bank_name,
        ifsc_code, branch, gst_in, aadhar_card, pan_card
    } = accountData;

    const password = `${account_name}@123`; // Default password

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

    db.query(sql, values, callback);
};

const getAll = (callback) => {
    const sql = "SELECT * FROM account_details";
    db.query(sql, callback);
};

const getById = (id, callback) => {
    const sql = "SELECT * FROM account_details WHERE id = ?";
    db.query(sql, [id], callback);
};

module.exports = { create, getAll, getById };
