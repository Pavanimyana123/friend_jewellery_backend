const Design = require("../models/designModel");
const transporter = require('../emailConfig'); // adjust the path if it's inside a utils folder


// exports.createDesign = (req, res) => {
//   const { order_id, account_name, requested_design_name, approve_status } = req.body;

//   if (!order_id || !account_name || !requested_design_name) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   Design.create(order_id, account_name, requested_design_name, approve_status, (err, result) => {
//     if (err) {
//       console.error("Error inserting data:", err);
//       return res.status(500).json({ message: "Database error" });
//     }
//     res.status(201).json({ message: "Design change request submitted successfully!" });
//   });
// };


exports.createDesign = (req, res) => {
  const { order_id, account_name, requested_design_name, approve_status, customerEmail } = req.body;

  if (!order_id || !account_name || !requested_design_name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  Design.create(order_id, account_name, requested_design_name, approve_status, (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ message: "Database error" });
    }
    const mailOptions = {
      from: `"Customer" <${customerEmail}>`,
      to: "manitejavadnala079@gmail.com",
      subject: `Design Request for Order #${order_id}`,
      text: `
A Design request has been made for the following order:

- Order ID: ${order_id}
- Customer Name: ${account_name}
- Requested Design: ${requested_design_name}
- Approve Status: ${approve_status}
- Requested By: ${customerEmail}

Please review this request in the admin dashboard.
      `.trim()
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error("Failed to send Design Request email to admin:", error);
      } else {
          console.log("Design Request email sent to admin:", info.response);
      }
  });
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
