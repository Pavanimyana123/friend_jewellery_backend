const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "solutionsitech845@gmail.com", 
        pass: "yioq wuqy zofp jduj", 
    },
});

module.exports = transporter;
