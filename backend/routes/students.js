const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// GET /api/students/section/:sectionName - Get all students by section
router.get('/section/:sectionName', auth, async (req, res) => {
  try {
    const { sectionName } = req.params;
    
    if (!sectionName) {
      return res.status(400).json({ msg: 'Section name is required' });
    }

    const students = await Student.find({ section: sectionName.toUpperCase() })
      .select('studentId Name section image')
      .sort({ studentId: 1 });

    res.json({ students });
  } catch (error) {
    console.error('Error fetching students by section:', error);
    res.status(500).json({ msg: 'Server Error', error: error.message });
  }
});

module.exports = router;


