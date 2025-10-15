const mongoose = require('mongoose');


const buildingBlockSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    enum: ['AB1', 'AB2']
  },
  room:{
    type:Number,
    enum:[101,102,103,104,105,201,202,203,204,205]
  }
}, { timestamps: true });

let Block=mongoose.model("Block",buildingBlockSchema);
module.exports=Block;

