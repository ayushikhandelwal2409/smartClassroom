const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student'); // adjust path if needed
const Teacher = require('../models/Teacher');
const upload = require('../middleware/upload'); 
const auth = require('../middleware/auth'); 

// GET api/auth/me - Get logged in user info
router.get('/me', auth, async (req, res) => {
  try {
    const { id, role } = req.user || {};
    if (!id) return res.status(401).json({ msg: 'Unauthorized' });

    let user = null;
    if (role === 'Teacher') {
      user = await Teacher.findById(id).select('-password');
    } else {
      user = await Student.findById(id).select('-password');
    }

    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST api/auth/register - Register new student
router.post('/register', (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ msg: err });

    if (!req.file) return res.status(400).json({ msg: 'Error: No File Selected!' });

    const { Name, email, password, studentId, section } = req.body;

    try {
      let user = await Student.findOne({ email });
      if (user) return res.status(400).json({ msg: 'User with this email already exists' });

      const newUser = new Student({
        Name,
        email,
        password,
        studentId,
        section,
        image: req.file.path
      });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(newUser.password, salt);

      await newUser.save();

      // Create JWT token
      const payload = { user: { id: newUser.id } };
      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your_default_secret',
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
});

// POST api/auth/login - Authenticate user (student/teacher) with 10-digit ID and get token
router.post('/login', async (req, res) => {
  const { userId, password, role } = req.body;

  if (!userId || !password || !role) {
    return res.status(400).json({ msg: 'Please provide userId, password, and role' });
  }

  // Validate numeric ID length by role
  const idString = String(userId);
  const isStudent = role === 'Student';
  const isTeacher = role === 'Teacher';
  if (!/^\d+$/.test(idString)) {
    return res.status(400).json({ msg: 'User ID must be numeric' });
  }
  if (isStudent && idString.length !== 10) {
    return res.status(400).json({ msg: 'Student ID must be 10 digits' });
  }
  if (isTeacher && idString.length !== 6) {
    return res.status(400).json({ msg: 'Teacher ID must be 6 digits' });
  }

  try {
    let user = null;
    if (isStudent) {
      user = await Student.findOne({ studentId: Number(idString) });
    } else if (isTeacher) {
      user = await Teacher.findOne({ teacherId: Number(idString) });
    } else {
      return res.status(400).json({ msg: 'Invalid role' });
    }

    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { user: { id: user.id, role } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_default_secret',
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
