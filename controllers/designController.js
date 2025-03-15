const Design = require("../models/designModel");

exports.createDesign = (req, res) => {
  const { order_id, account_name, requested_design_name, approve_status } = req.body;

  if (!order_id || !account_name || !requested_design_name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  Design.create(order_id, account_name, requested_design_name, approve_status, (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(201).json({ message: "Design change request submitted successfully!" });
  });
};

exports.getAllDesigns = (req, res) => {
  Design.getAll((err, results) => {
    if (err) {
      console.error("Error fetching designs:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
};
