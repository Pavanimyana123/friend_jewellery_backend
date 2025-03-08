const db = require("../db");

const addAccount = (accountData, callback) => {
    const {
        account_name, print_name, account_group, address1, address2, city, pincode, state, state_code,
        phone, mobile, email, birthday, anniversary, bank_account_no, bank_name,
        ifsc_code, branch, gst_in, aadhar_card, pan_card
    } = accountData;

    const password = `${account_name}@123`;

    const sanitizeValue = (value) => (value === "" ? null : value);

    const sql = `
        INSERT INTO account_details (
            account_name, print_name, account_group, address1, address2, city, pincode, state, state_code,
            phone, mobile, email, password, birthday, anniversary, bank_account_no, bank_name,
            ifsc_code, branch, gst_in, aadhar_card, pan_card
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        account_name, print_name, account_group, sanitizeValue(address1), sanitizeValue(address2),
        sanitizeValue(city), sanitizeValue(pincode), sanitizeValue(state), sanitizeValue(state_code),
        sanitizeValue(phone), sanitizeValue(mobile), sanitizeValue(email), password,
        sanitizeValue(birthday), sanitizeValue(anniversary), sanitizeValue(bank_account_no),
        sanitizeValue(bank_name), sanitizeValue(ifsc_code), sanitizeValue(branch),
        sanitizeValue(gst_in), sanitizeValue(aadhar_card), sanitizeValue(pan_card)
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

module.exports = { addAccount, getAll, getById, updateAccountById,deleteAccount };
