const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BuildingBlock = require('../models/BuildingBlock');

// seed default building block with subjects and timeslots
router.post('/seed', auth, async (req, res) => {
  try {
    const payload = req.body || {};
    const name = payload.name || 'default';
    const timeSlots = payload.timeSlots || [
      { index: 1, start: '10:00', end: '11:00', isLunch: false },
      { index: 2, start: '11:00', end: '12:00', isLunch: false },
      { index: 3, start: '12:00', end: '13:00', isLunch: false },
      { index: 4, start: '13:00', end: '14:00', isLunch: true },
      { index: 5, start: '14:00', end: '15:00', isLunch: false },
      { index: 6, start: '15:00', end: '16:00', isLunch: false },
      { index: 7, start: '16:00', end: '17:00', isLunch: false }
    ];
    const subjects = payload.subjects || [
      { _id: 'ML', name: 'Machine Learning', teachers: ['T1', 'T2'] },
      { _id: 'DSA', name: 'Data Structures & Algorithms', teachers: ['T3', 'T4'] },
      { _id: 'Web', name: 'Web Development', teachers: ['T5', 'T6'] }
    ];

    await BuildingBlock.findOneAndDelete({ name });
    const created = await BuildingBlock.create({ name, timeSlots, subjects });
    res.status(201).json(created);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// get current building blocks
router.get('/', auth, async (req, res) => {
  try {
    const all = await BuildingBlock.find({}).sort({ name: 1 });
    res.json(all);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

