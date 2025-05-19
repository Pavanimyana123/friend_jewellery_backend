const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const accountRoutes = require("./routes/accountRoutes");
const stateRoutes = require("./routes/stateRoutes");
const loginRoutes = require("./routes/loginRoutes");
const orderRoutes = require("./routes/orderRoute");
const authRoutes = require("./routes/authRoutes");
const rateRoutes = require("./routes/ratesRoute");
const designRoutes = require("./routes/designRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const broucherRoutes = require("./routes/broucherRoute");
const receiptRoutes = require("./routes/receiptRoute");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use('/uploads', express.static('uploads'));
app.use("/invoices", express.static(path.join(__dirname, "uploads/invoices")));


app.use("/", accountRoutes);
app.use("/api", authRoutes);
app.use("/", stateRoutes);
app.use("/", loginRoutes);
app.use("/api", orderRoutes);
app.use("/", rateRoutes);
app.use("/api", designRoutes);
app.use("/api", galleryRoutes);
app.use("/api", broucherRoutes);
app.use("/api", receiptRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
