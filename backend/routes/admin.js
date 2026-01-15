const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const timetableUpload = require('../middleware/timeTableUpload');
const Event = require('../models/Event');


const {getDashboardStats, getAllStudents, getAllTeachers, getLostItems, updateLostItemStatus, getSectionTimetable, updateSectionTimetable, uploadTimetableExcel, createEvent, getAllEvents, } = require('../controllers/adminController');


// dashboard
router.get('/stats', auth, isAdmin, getDashboardStats);

// router.post("/events", auth, isAdmin, createEvent);


// students
router.get('/students', auth, isAdmin, getAllStudents);
// router.patch('/students/:id', auth, isAdmin, toggleStudent);

// teachers
router.get('/teachers', auth, isAdmin, getAllTeachers);
// router.patch('/teachers/:id', auth, isAdmin, toggleTeacher);

router.delete("/events/:id", auth, isAdmin, async (req, res) => {
  try {
    const eventId = req.params.id;

    if (!eventId) {
      return res.status(400).json({ msg: "Event ID missing" });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    await Event.findByIdAndDelete(eventId);

    res.json({ msg: "Event deleted successfully" });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});


// lost & found
router.get('/lost-items', auth, isAdmin, getLostItems);
router.patch('/lost-items/:id', auth, isAdmin, updateLostItemStatus);


// timetable
router.get('/timetable/:section', auth, isAdmin, getSectionTimetable);
router.patch('/timetable/form/:section', auth, isAdmin, updateSectionTimetable);

// upload timetable via excel
router.post('/timetable/excel',auth,isAdmin,timetableUpload,uploadTimetableExcel);

// events and announcements
router.post('/events',auth,isAdmin,createEvent);

router.get('/events', getAllEvents); // public: view events

module.exports = router;
