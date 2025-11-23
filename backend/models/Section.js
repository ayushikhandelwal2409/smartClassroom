const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
  time: { type: String, required: true },
  subjectCode: { type: String, default: '' },
  roomNumber: { type: String, default: '' },
  academicBlock: { type: String, default: '' }
});

const DaySchema = new mongoose.Schema({
  day: { type: String, required: true },
  slots: { type: [SlotSchema], required: true }
});

const sectionSchema = new mongoose.Schema({
  sectionName: { 
    type: String, 
    required: true, 
    unique: true, 
    enum: ['A', 'B', 'C'] // optional, if you know section names
  },
  timetable: {
    type: [DaySchema],
    required: true
  },
  capacity: {
    type: Number,
    default: 50 // default capacity, can be overridden
  }
});


module.exports = mongoose.model('Section', sectionSchema);

