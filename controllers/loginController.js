const Login = require("../models/loginModel");

exports.login = (req, res) => {
    const { email, password } = req.body;

    Login.AccountfindByEmail(email, (err, results) => {
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