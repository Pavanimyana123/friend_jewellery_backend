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

const updateAccount = (accountId, accountData, callback) => {
    const sql = `
        UPDATE account_details
        SET account_name=?, print_name=?, account_group=?, address1=?, address2=?, city=?, pincode=?, state=?, state_code=?,
            phone=?, mobile=?, email=?, birthday=?, anniversary=?, bank_account_no=?, bank_name=?,
            ifsc_code=?, branch=?, gst_in=?, aadhar_card=?, pan_card=?
        WHERE id=?
    `;

    const values = [
        accountData.account_name, accountData.print_name, accountData.account_group, accountData.address1,
        accountData.address2, accountData.city, accountData.pincode, accountData.state, accountData.state_code,
        accountData.phone, accountData.mobile, accountData.email, accountData.birthday, accountData.anniversary,
        accountData.bank_account_no, accountData.bank_name, accountData.ifsc_code, accountData.branch,
        accountData.gst_in, accountData.aadhar_card, accountData.pan_card, accountId
    ];

    db.query(sql, values, callback);
};

// Function to delete an account by ID
const deleteAccount = (accountId, callback) => {
    const sql = "DELETE FROM account_details WHERE id = ?";

    db.query(sql, [accountId], callback);
};

// Function to find user by email
const AccountfindByEmail = (email, callback) => {
    const sql = "SELECT * FROM account_details WHERE email = ?";
    db.query(sql, [email], callback);
};


module.exports = { create, getAll, getById, updateAccount,deleteAccount,AccountfindByEmail };
