const orderModel = require("../models/uniqueOrderModel");

exports.getAllUniqueOrderDetails = (req, res) => {
    orderModel.getAllUniqueOrders((err, results) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ message: "Error fetching data" });
        }
        res.json(results);
    });
};

exports.getOrderDetailsByInvoiceNumber = (req, res) => {
    const { order_number } = req.params;

    if (!order_number) {
        return res.status(400).json({ message: "Invoice number is required" });
    }

    orderModel.getByOrderNumber(order_number, (err, results) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ message: "Error fetching data" });
        }

        if (!results.length) {
            return res.status(404).json({ message: "No data found for the given invoice number" });
        }

        // Extract unique and repeated data
        const uniqueData = {
            account_id: results[0].account_id,
            mobile: results[0].mobile,
            account_name: results[0].account_name,
            email: results[0].email,
            address1: results[0].address1,
            address2: results[0].address2,
            city: results[0].city,
            pincode: results[0].pincode,
            state: results[0].state,
            state_code: results[0].state_code,
            aadhar_card: results[0].aadhar_card,
            gst_in: results[0].gst_in,
            pan_card: results[0].pan_card,
            date: results[0].date,
            order_number: results[0].order_number,
            invoice_number: results[0].invoice_number,
            invoice_generated: results[0].invoice_generated,
            estimate_number: results[0].estimate_number,
            estimate_generated: results[0].estimate_generated,
            overall_total_weight: results[0].overall_total_weight,
            overall_total_price: results[0].overall_total_price,
            overall_stone_price: results[0].overall_stone_price,
            overall_total_mc: results[0].overall_total_mc,
            overall_tax_amt: results[0].overall_tax_amt,
            advance_gross_wt: results[0].advance_gross_wt,
            fine_wt: results[0].fine_wt,
            advance_finewt_amt: results[0].advance_finewt_amt,
            advance_amount: results[0].advance_amount,
            balance_amt: results[0].balance_amt,
            receipt_amt: results[0].receipt_amt,
            bal_after_receipt: results[0].bal_after_receipt,
            net_wt: results[0].net_wt,
            summary_price: results[0].summary_price,
            summary_rate: results[0].summary_rate,
        };

        const repeatedData = results.map((row) => {
            return {
                id: row.id,
                account_id: row.account_id,
                mobile: row.mobile,
                account_name: row.account_name,
                email: row.email,
                address1: row.address1,
                address2: row.address2,
                city: row.city,
                pincode: row.pincode,
                state: row.state,
                state_code: row.state_code,
                aadhar_card: row.aadhar_card,
                gst_in: row.gst_in,
                pan_card: row.pan_card,
                date: row.date,
                order_number: row.order_number,
                invoice_number: row.invoice_number,
                estimate_number: row.estimate_number,
                metal: row.metal,
                category: row.category,
                subcategory: row.subcategory,
                product_design_name: row.product_design_name,
                purity: row.purity,
                gross_weight: row.gross_weight,
                stone_weight: row.stone_weight,
                weight_bw: row.weight_bw,
                stone_price: row.stone_price,
                wastage_on: row.wastage_on,
                wastage_percentange: row.wastage_percentange,
                wastage_weight: row.wastage_weight,
                total_weight_aw: row.total_weight_aw,
                rate: row.rate,
                amount: row.amount,
                mc_on: row.mc_on,
                mc_percentage: row.mc_percentage,
                total_mc: row.total_mc,
                tax_percentage: row.tax_percentage,
                tax_amount: row.tax_amount,
                total_price: row.total_price,
                remarks: row.remarks,
                image_url: row.image_url,
                order_status: row.order_status,
                assigned_status: row.assigned_status,
                worker_id: row.worker_id,
                worker_name: row.worker_name,
                work_status: row.work_status,
                qty: row.qty,
                estimated_delivery_date: row.estimated_delivery_date,
                delivery_date: row.delivery_date,
                worker_comment: row.worker_comment,
                status: row.status,
                invoice_generated: row.invoice_generated,
                estimate_generated: row.estimate_generated,
                o_size: row.o_size,
                o_length: row.o_length,
                stone_name: row.stone_name,
                overall_total_price: row.overall_total_price,
                overall_total_weight: row.overall_total_weight,
                overall_stone_price: row.overall_stone_price,
                overall_total_mc: row.overall_total_mc,
                overall_tax_amt: row.overall_tax_amt,
                advance_amount: row.advance_amount,
                advance_gross_wt: row.advance_gross_wt,
                fine_wt: row.fine_wt,
                advance_finewt_amt: row.advance_finewt_amt,
                customer_rating: row.customer_rating,
                review_text: row.review_text,
                actual_order_id: row.actual_order_id,
                balance_amt: row.balance_amt,
                receipt_amt: row.receipt_amt,
                bal_after_receipt: row.bal_after_receipt,
                net_wt: row.net_wt,
                summary_price: row.summary_price,
                summary_rate: row.summary_rate,
                actual_order_id: row.actual_order_id
            };
        });


        res.json({ uniqueData, repeatedData });
    });
};

exports.getAllOrderDetailsByInvoiceNumber = (req, res) => {
    try {
        const { order_number } = req.params;

        if (!order_number) {
            return res.status(400).json({ message: "Invoice number is required" });
        }

        // Fetch data from the model
        orderModel.getAllOrderDetailsByInvoiceNumber(order_number, (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Error fetching data from the database" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "No repair details found for the given invoice number" });
            }

            res.json(results); // Send the fetched repair details as JSON
        });
    } catch (error) {
        console.error("Error processing request:", error.message);
        res.status(400).json({ message: "Invalid request" });
    }
};

