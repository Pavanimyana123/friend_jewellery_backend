const express = require("express");
const router = express.Router();
const designController = require("../controllers/designController");

router.post("/designs", designController.createDesign);
router.get("/designs", designController.getAllDesigns);


module.exports = router;
