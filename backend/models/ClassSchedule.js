const mongoose = require('mongoose');

const ClassScheduleSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  dayOfWeek: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  startTime: { type: String, required: true }, 
  endTime: { type: String, required: true }, 

  // which group of student is studying
  year: { type: Number, required: true },
  section: { type: String, required: true },
  
}); 

module.exports = mongoose.model('ClassSchedule', ClassScheduleSchema);