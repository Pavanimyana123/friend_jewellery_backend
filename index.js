const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const accountRoutes = require("./routes/accountRoutes");
const stateRoutes = require("./routes/stateRoutes");
const loginRoutes = require("./routes/loginRoutes");
const orderRoutes = require("./routes/orderRoute");
const rateRoutes = require("./routes/ratesRoute");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

app.use("/", accountRoutes);
app.use("/", stateRoutes);
app.use("/", loginRoutes);
app.use("/api", orderRoutes);
app.use("/", rateRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
