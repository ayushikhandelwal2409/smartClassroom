const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Section = require('../models/Section');

// seed default sections as per user specification
router.post('/seed', auth, async (req, res) => {
  try {
    const seed = req.body && req.body.sections ? req.body.sections : [
      // Section A (subjects per slot; index 4 is lunch hour, leave empty string)
      {
        _id: 'A',
        classroom: 'SmartRoom-101',
        subjects: ['ML', 'DSA', 'Web'],
        timetable: [
          { day: 'Monday',    slots: ['ML','ML','DSA','', 'Web','Web','DSA'] },
          { day: 'Tuesday',   slots: ['DSA','DSA','Web','', 'ML','ML','ML'] },
          { day: 'Wednesday', slots: ['Web','Web','ML','', 'DSA','DSA','ML'] },
          { day: 'Thursday',  slots: ['ML','ML','DSA','', 'Web','Web','DSA'] },
          { day: 'Friday',    slots: ['DSA','DSA','Web','', 'ML','ML','Web'] }
        ]
      },
      // Section B
      {
        _id: 'B',
        classroom: 'SmartRoom-102',
        subjects: ['ML', 'DSA', 'Web'],
        timetable: [
          { day: 'Monday',    slots: ['DSA','DSA','ML','', 'Web','Web','ML'] },
          { day: 'Tuesday',   slots: ['Web','Web','DSA','', 'ML','ML','DSA'] },
          { day: 'Wednesday', slots: ['ML','ML','Web','', 'DSA','DSA','Web'] },
          { day: 'Thursday',  slots: ['DSA','DSA','ML','', 'Web','Web','ML'] },
          { day: 'Friday',    slots: ['Web','Web','DSA','', 'ML','ML','DSA'] }
        ]
      },
      // Section C
      {
        _id: 'C',
        classroom: 'SmartRoom-103',
        subjects: ['ML', 'DSA', 'Web'],
        timetable: [
          { day: 'Monday',    slots: ['Web','Web','ML','', 'DSA','DSA','ML'] },
          { day: 'Tuesday',   slots: ['ML','ML','DSA','', 'Web','Web','DSA'] },
          { day: 'Wednesday', slots: ['DSA','DSA','Web','', 'ML','ML','Web'] },
          { day: 'Thursday',  slots: ['Web','Web','ML','', 'DSA','DSA','ML'] },
          { day: 'Friday',    slots: ['ML','ML','DSA','', 'Web','Web','DSA'] }
        ]
      }
    ];

    await Section.deleteMany({ _id: { $in: seed.map(s => s._id) } });
    const created = await Section.insertMany(seed);
    res.status(201).json(created);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// get all sections
router.get('/', auth, async (req, res) => {
  try {
    const all = await Section.find({}).sort({ _id: 1 });
    res.json(all);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

