const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const upload = require('../middleware/upload'); 
const auth = require('../middleware/auth'); 

//POST api/auth/me 
// about me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); 
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//POST api/auth/register 
// new user register
router.post('/register', (req, res) => {
  // upload middleware
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ msg: err });
    }
    
    // if no file uploaded
    if (req.file == undefined) {
      return res.status(400).json({ msg: 'Error: No File Selected!' });
    }

    const { firstName, lastName, email, password, role, studentId, department, year, section, teacherId, title } = req.body;
    
    try {
      // user exist or not
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User with this email already exists' });
      }

      // new user
      const newUser = new User({
        firstName,
        lastName,
        email,
        password,
        role,
        profileImage: req.file.path, // path of img
        studentId: role === 'student' ? studentId : undefined,
        department,
        year: role === 'student' ? year : undefined,
        section: role === 'student' ? section : undefined,
        teacherId: role === 'teacher' ? teacherId : undefined,
        title: role === 'teacher' ? title : undefined,
      });

      // hash password
      await newUser.save();

      // create and return JWT token
      const payload = { user: { id: newUser.id } };
      jwt.sign(payload, process.env.JWT_SECRET || 'your_default_secret', { expiresIn: 3600 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
});

// auth user,  get token
router.post('/login', async (req, res) => {
  const { email, password, role} = req.body;

  // validate
  if (!email || !password || !role) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    // this check if user exists or not
    const user = await User.findOne({ email });
    if (!user) {
      // error
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // this check if the user is student or teacher
    if(user.role != role.toLowerCase()){
      return res.status(403).json({msg: 'Access denied. Please use the correct portal.'})
    }

    // compare password with db hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // If password matches, create and return JWT
    const payload = {
      user: {
        id: user.id, // user id from db
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_default_secret',
      { expiresIn: 3600 }, // expires in 1 h
      (err, token) => {
        if (err) throw err;
        res.json({ token }); // send token to client
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});



module.exports = router;