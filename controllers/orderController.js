const orderModel = require("../models/orderModel");


const getLastOrderNumber = (req, res) => {
    orderModel.getLastOrderNumber((err, result) => {
        if (err) {
            console.error("Error fetching last order number:", err);
            return res.status(500).json({ error: "Failed to fetch last order number" });
        }

        if (result.length > 0) {
            // Process invoice numbers to find the next one
            const ordNumbers = result
                .map(row => row.order_number)
                .filter(order => order.startsWith("ORD"))
                .map(order => parseInt(order.slice(3), 10)); // Extract numeric part

            const lastOrderNumber = Math.max(...ordNumbers);
            const nextOrderNumber = `ORD${String(lastOrderNumber + 1).padStart(3, "0")}`;

            res.json({ lastOrderNumber: nextOrderNumber });
        } else {
            res.json({ lastOrderNumber: "ORD001" }); // Start with ORD001
        }
    });
};

module.exports = { getLastOrderNumber };
