const express = require('express');
const router = express.Router();
const { addLostItem, searchLostItem, latestLostItem, imageSearchLostItem, getAllLostItems,} = require("../controllers/lostItemController.js");
const lostFoundUpload = require('../middleware/lostFoundUpload.js');


// add lost item
router.post("/add", lostFoundUpload, addLostItem);

// search lost item
router.post("/search", searchLostItem);

router.post("/search-image", lostFoundUpload, imageSearchLostItem);

// get latest lost item
router.get("/latest", latestLostItem);

// get all items
router.get("/all", getAllLostItems);

module.exports = router;