const Login = require("../models/loginModel");

exports.login = (req, res) => {
  const { email, mobile, password } = req.body;

  // Determine which field to use for lookup
  const lookupField = email ? 'email' : 'mobile';
  const lookupValue = email || mobile;

  Login.getUserByEmailOrMobile(lookupField, lookupValue, (err, user) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // Remove password from response
    delete user.password;

    res.status(200).json({ 
      message: "Login Successful", 
      user 
    });
  });
};