const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");

router.post("/add-account", accountController.addAccount);
router.get("/accounts", accountController.getAllAccounts);
router.get("/account/:id", accountController.getAccountById);

module.exports = router;
