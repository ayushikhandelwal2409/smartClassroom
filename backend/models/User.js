const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['student', 'teacher'] },

  
  // image
  profileImage: { type: String, required: true }, // store image path

  // student details
  studentId: { type: String, sparse: true, unique: true }, // `sparse` allows null values to not be unique
  department: { type: String },
  year: { type: Number }, // year of student
  section: {type: String},   // section of student

  // teacher details
  teacherId: { type: String, sparse: true, unique: true },
  title: { type: String }, // "Professor", "Assistant Professor"
}, { timestamps: true });

// hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);