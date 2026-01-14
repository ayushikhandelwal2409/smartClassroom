const XLSX = require('xlsx');

const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const LostItem = require('../models/LostItem');
const Section = require('../models/Section');


// admin dashboard stats

const getDashboardStats = async (req, res) => {
  try {
    const students = await Student.countDocuments();
    const teachers = await Teacher.countDocuments();
    const lostItems = await LostItem.countDocuments();
    const pendingItems = await LostItem.countDocuments({ status: 'pending' });

    res.json({
      students,
      teachers,
      lostItems,
      pendingItems
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get all teachers
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().select('-password');
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// get all lost items
const getLostItems = async (req, res) => {
  try {
    const items = await LostItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update lost item status
const updateLostItemStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const item = await LostItem.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!item) return res.status(404).json({ msg: 'Item not found' });

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get section timetable
const getSectionTimetable = async (req, res) => {
  try {
    const section = await Section.findOne({
      sectionName: req.params.section.toUpperCase()
    });

    if (!section) return res.status(404).json({ msg: 'Section not found' });

    res.json(section.timetable);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update section timetable
const updateSectionTimetable = async (req, res) => {
  try {
    const { day, slotIndex, subjectCode, roomNumber, academicBlock } = req.body;
    const sectionName = req.params.section.toUpperCase();

    const section = await Section.findOne({ sectionName });
    if (!section) {
      return res.status(404).json({ msg: 'Section not found' });
    }

    const dayObj = section.timetable.find(d => d.day === day);
    if (!dayObj) {
      return res.status(400).json({ msg: 'Invalid day' });
    }

    if (!dayObj.slots[slotIndex]) {
      return res.status(400).json({ msg: 'Invalid slot index' });
    }

    dayObj.slots[slotIndex] = {
      time: dayObj.slots[slotIndex].time,
      subjectCode,
      roomNumber,
      academicBlock
    };

    await section.save();
    res.json({ msg: 'Timetable slot updated', timetable: section.timetable });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// upload timetable via Excel for desired section
// excel file must have columns in this format:
// | Section | Day    | Time                | SubjectCode | Room | Block |
//ex:   A    | Monday | 10:00 AM - 11:00 AM | BCSE0101    | 101  | AB1   |
// time slot in this format -> 10:00 AM - 11:00 AM

const uploadTimetableExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    // Group by section
    const grouped = {};

    for (const row of rows) {
      const section = row.Section.toUpperCase();
      if (!grouped[section]) grouped[section] = {};
      if (!grouped[section][row.Day]) grouped[section][row.Day] = [];

      grouped[section][row.Day].push({
        time: row.Time,
        subjectCode: row.SubjectCode || '',
        roomNumber: row.Room || '',
        academicBlock: row.Block || ''
      });
    }

    for (const sectionName in grouped) {
      const section = await Section.findOne({ sectionName });
      if (!section) continue;

      section.timetable.forEach(dayObj => {
        if (grouped[sectionName][dayObj.day]) {
          const slotMap = grouped[sectionName][dayObj.day];

          dayObj.slots.forEach(slot => {
            const match = slotMap.find(s => s.time === slot.time);
            if (match) {
              slot.subjectCode = match.subjectCode;
              slot.roomNumber = match.roomNumber;
              slot.academicBlock = match.academicBlock;
            }
          });
        }
      });

      await section.save();
    }

    res.json({ msg: 'Timetable updated successfully via Excel' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = { getDashboardStats, getAllStudents, getAllTeachers, getLostItems, updateLostItemStatus, getSectionTimetable, updateSectionTimetable, uploadTimetableExcel };