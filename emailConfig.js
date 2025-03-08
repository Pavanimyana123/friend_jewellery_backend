const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "manitejavadnala@gmail.com", 
        pass: "fppo lbmw edaf macr", 
    },
});

module.exports = transporter;
