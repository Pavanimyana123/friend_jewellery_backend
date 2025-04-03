const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "manitejavadnala@gmail.com", 
        pass: "fppo lbmw edaf macr", 
    },
});

module.exports = transporter;

// const nodemailer = require("nodemailer");
// require('dotenv').config();

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL_USER || "manitejavadnala@gmail.com",
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
