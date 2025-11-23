const express = require('express');
const router = express.Router();

const { addLostItem, searchLostItem, latestLostItem, imageSearchLostItem } = require("../controllers/lostItemController.js");
const lostFoundUpload = require('../middleware/lostFoundUpload.js');

// add lost item
router.post("/add", lostFoundUpload, addLostItem);

// search lost item
router.post("/search", searchLostItem);

router.post("/search-image", lostFoundUpload, imageSearchLostItem);

// get latest lost item
router.get("/latest", latestLostItem);

module.exports = router;