const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ClassSchedule = require('../models/ClassSchedule');
const User = require('../models/User');

require('../models/Course');
require('../models/Room');

// POST api/schedules
// create a new class schedule (Admin)
router.post('/', auth, async (req, res) => {

  // ensure only teachers can create schedules; adjust if you have an admin role
  try {
    const requestingUser = await User.findById(req.user.id).select('role');
    if (!requestingUser || requestingUser.role !== 'teacher') {
      return res.status(403).json({ msg: 'Forbidden: Only teachers can create schedules.' });
    }
  } catch (roleErr) {
    console.error(roleErr.message);
    return res.status(500).send('Server Error');
  }

  const { course, teacher, room, dayOfWeek, startTime, endTime, year, section } = req.body;

  try {

    // this check if this room is already booked for this time on this day or not
    const roomConflict = await ClassSchedule.findOne({
      room,
      dayOfWeek,
      // overlap if existing.start < new.end AND existing.end > new.start
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    });

    if (roomConflict) {
      return res.status(409).json({ msg: 'Conflict: This room is already scheduled at this time.' });
    }

    //this check if teacher has another class during this time or not
    const teacherConflict = await ClassSchedule.findOne({
      teacher,
      dayOfWeek,
      // overlap if existing.start < new.end AND existing.end > new.start
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    });

    if (teacherConflict) {
      return res.status(409).json({ msg: 'Conflict: This teacher is already scheduled for another class at this time.' });
    }

    // create new schedule
    const newSchedule = new ClassSchedule({
      course,
      teacher,
      room,
      dayOfWeek,
      startTime,
      endTime,
      year,
      section,
    });

    const schedule = await newSchedule.save();
    res.status(201).json(schedule); // 201 Created status

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


//GET api/schedules/teacher/me
// schedule for teacher( logged in)
router.get('/teacher/me', auth, async (req, res) => {
  try {
    const schedule = await ClassSchedule.find({ teacher: req.user.id })
      .sort({ startTime: 1 })
      .populate('course', ['name', 'code'])
      .populate('room', ['roomNumber', 'block']);
    res.json(schedule);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//GET api/schedules/student/me
// schedule for student (logged in)
router.get('/student/me', auth, async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student || !student.year || !student.section) {
      return res.status(400).json({ msg: 'Student year and section not found' });
    }

    const schedule = await ClassSchedule.find({ year: student.year, section: student.section })
      .sort({ startTime: 1 })
      .populate('course', ['name', 'code'])
      .populate('teacher', ['firstName', 'lastName'])
      .populate('room', ['roomNumber', 'block']);
      
    res.json(schedule);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;