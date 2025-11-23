const mongoose = require('mongoose')

const LostItemSchema = new mongoose.Schema({
    // userId: { type: String, required: true },
    title: String,
    description: String,
    image_url: String,
    text_embedding: { type: [Number]},
    image_embedding: { type: [Number]},

    createdAt: { type: Date, default: Date.now }
})

let LostItem = mongoose.model('LostItem', LostItemSchema);

module.exports = LostItem;