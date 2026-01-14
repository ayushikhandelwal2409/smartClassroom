const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true
  },
  adminId: {
    type: Number,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
