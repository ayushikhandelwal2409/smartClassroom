const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: Number,
    required: true
  },

  studentName: {
    type: String,
    required: true
  },

  section: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C']
  },

  subjectCode: {
    type: String, // e.g. "BCSC 2001"
    required: true
  },

  teacherId: {
    type: Number,
    required: true
  },

  teacherName: {
    type: String,
    required: true
  },

  date: {
    type: String, // stored as "2025-01-12" to prevent duplicate day entries
    required: true
  },

  period: {
    type: Number, // 1, 2, 3, 4...
    required: true
  },

  status: {
    type: String,
    enum: ['present', 'absent'],
    default: 'present'
  },

  markedBy: {
    type: String,
    enum: ['manual', 'face-recognition'],
    default: 'manual'
  },

  timestamp: {
    type: Date,
    default: Date.now
  }
});

let Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports=Attendance;
