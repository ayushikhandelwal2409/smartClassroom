const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  index: { type: Number, required: true, min: 1, max: 7 },
  start: { type: String, required: true }, // e.g., "10:00"
  end: { type: String, required: true },   // e.g., "11:00"
  isLunch: { type: Boolean, default: false }
}, { _id: false });

const SubjectSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g., "ML"
  name: { type: String, required: true },
  teachers: { type: [String], required: true }
}, { _id: false });

const BuildingBlockSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "default"
  timeSlots: {
    type: [TimeSlotSchema],
    validate: {
      validator: function(v) { return Array.isArray(v) && v.length === 7; },
      message: 'There must be exactly 7 timeslots per day.'
    }
  },
  subjects: { type: [SubjectSchema], required: true }
}, { timestamps: true });

module.exports = mongoose.model('BuildingBlock', BuildingBlockSchema, 'building_blocks');

