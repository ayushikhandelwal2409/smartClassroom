const express = require('express');
const router = express.Router();
const Section = require('../models/Section');

// GET /api/timetable/:sectionName
router.get('/:sectionName', async (req, res) => {
  try {
    const { sectionName } = req.params;
    if (!sectionName) {
      return res.status(400).json({ msg: 'Section name is required' });
    }

    const section = await Section.findOne({ sectionName: sectionName.toUpperCase() });
    if (!section) {
      return res.status(404).json({ msg: 'Section not found' });
    }

    res.json({ sectionName: section.sectionName, timetable: section.timetable });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;


