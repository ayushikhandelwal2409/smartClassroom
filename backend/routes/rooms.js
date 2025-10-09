const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Room = require('../models/Room');

// seed AB1/AB2 two floors with rooms 101-105 and 201-205
router.post('/seed', auth, async (req, res) => {
  try {
    const blocks = ['AB1', 'AB2'];
    const floors = [1, 2];
    const rooms = [];

    for (const block of blocks) {
      for (const floor of floors) {
        for (let i = 1; i <= 5; i++) {
          const roomNumber = `${floor}${(i).toString().padStart(2, '0')}`; // 101..105, 201..205
          rooms.push({ roomNumber, block, floor });
        }
      }
    }

    await Room.deleteMany({});
    const created = await Room.insertMany(rooms);
    res.status(201).json(created);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// list rooms
router.get('/', auth, async (req, res) => {
  try {
    const list = await Room.find({}).sort({ block: 1, floor: 1, roomNumber: 1 });
    res.json(list);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

