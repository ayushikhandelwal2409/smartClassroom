const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true }, // "DBMS"
  code: { type: String, required: true, unique: true }, // "BCS201"
  department: { type: String, required: true },

});

module.exports = mongoose.model('Course', CourseSchema);