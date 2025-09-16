const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "friendsjewelleryldk@gmail.com", 
        pass: "pwum tufa shyr flce", 
    },
});

module.exports = transporter;

// const nodemailer = require("nodemailer");
// require('dotenv').config();

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL_USER || "friendsjewelleryldk@gmail.com",
//         pass: process.env.EMAIL_PASSWORD, // Always use environment variables for passwords
//     },
// });

// // Verify connection configuration
// transporter.verify((error) => {
//     if (error) {
//         console.error("Error with email configuration:", error);
//     } else {
//         console.log("Email server is ready to send messages");
//     }
// });

// module.exports = transporter;
