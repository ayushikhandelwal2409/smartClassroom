const express = require('express');
const rateLimit = require("express-rate-limit");
const router = express.Router();
const { addLostItem, searchLostItem, latestLostItem, imageSearchLostItem, getAllLostItems,} = require("../controllers/lostItemController.js");
const lostFoundUpload = require('../middleware/lostFoundUpload.js');


const limitLostItemPosting = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 minutes
  max: 3,                    // max 3 lost-item forms per window
  message: "Too many lost items reported. Try again later."
});

// add lost item
router.post("/add", limitLostItemPosting, lostFoundUpload, addLostItem);

// search lost item
router.post("/search", searchLostItem);

router.post("/search-image", lostFoundUpload, imageSearchLostItem);

// get latest lost item
router.get("/latest", latestLostItem);

// get all items
router.get("/all", getAllLostItems);

module.exports = router;