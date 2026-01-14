const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// const {getDashboardStats, getAllStudents, toggleStudent, toggleTeacher, getAllTeachers, getLostItems, updateLostItemStatus, getSectionTimetable, updateSectionTimetable, } = require('../controllers/adminController');
const {getDashboardStats, getAllStudents, getAllTeachers, getLostItems, updateLostItemStatus, getSectionTimetable, updateSectionTimetable, uploadTimetableExcel, } = require('../controllers/adminController');
const timetableUpload = require('../middleware/timeTableUpload');


// dashboard
router.get('/stats', auth, isAdmin, getDashboardStats);

// students
router.get('/students', auth, isAdmin, getAllStudents);
// router.patch('/students/:id', auth, isAdmin, toggleStudent);

// teachers
router.get('/teachers', auth, isAdmin, getAllTeachers);
// router.patch('/teachers/:id', auth, isAdmin, toggleTeacher);

// lost & found
router.get('/lost-items', auth, isAdmin, getLostItems);
router.patch('/lost-items/:id', auth, isAdmin, updateLostItemStatus);


// timetable
router.get('/timetable/:section', auth, isAdmin, getSectionTimetable);
router.patch('/timetable/form/:section', auth, isAdmin, updateSectionTimetable);

// upload timetable via excel
router.post('/timetable/excel',auth,isAdmin,timetableUpload,uploadTimetableExcel);


module.exports = router;
