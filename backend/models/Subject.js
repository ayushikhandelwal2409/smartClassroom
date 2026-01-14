const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true }, // "ML"
  code: { type: String, required: true, unique: true }, // "BCSC 2001"
  // department: { type: String, required: true },

  

});

module.exports = mongoose.model('Course', CourseSchema);