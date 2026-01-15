const express = require("express");
const router = express.Router();
const { getAllEvents } = require("../controllers/adminController");

// Public route
router.get("/events", getAllEvents);

module.exports = router;
