const express = require("express");
const router = express.Router();
const { createAdminUser } = require("../controllers/adminuserController");

router.post("/", createAdminUser); 

module.exports = router;