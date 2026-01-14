const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Event', 'Hackathon', 'Workshop', 'Seminar', 'Notice'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    date: {
      type: String, // date in this format "Friday, January 17, 2025"
      required: true
    },
    location: {
      type: String,
      required: true
    },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  { timestamps: true }
);

let Event = mongoose.model('Event', eventSchema);
module.exports = Event;