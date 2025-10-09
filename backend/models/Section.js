const mongoose = require('mongoose');

const TimetableDaySchema = new mongoose.Schema({
  day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  slots: {
    type: [String],
    validate: {
      validator: function(v) { return Array.isArray(v) && v.length === 7; },
      message: 'Each day must have exactly 7 slots.'
    }
  }
}, { _id: false });

const SectionSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g., "A", "B", "C"
  classroom: { type: String, required: true }, // e.g., "SmartRoom-101"
  subjects: { type: [String], required: true }, // e.g., ["ML", "DSA", "Web"]
  timetable: { type: [TimetableDaySchema], required: true }
}, { timestamps: true, _id: false });

module.exports = mongoose.model('Section', SectionSchema, 'sections');

