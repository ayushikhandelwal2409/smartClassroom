const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true }, // "101", "Lab 3"
  block: { type: String, required: true, enum: ['AB1', 'AB2'] },
  floor: { type: Number, required: true, enum: [1, 2] },
  capacity: { type: Number, default: 30 },
});


module.exports = mongoose.model('Room', RoomSchema);