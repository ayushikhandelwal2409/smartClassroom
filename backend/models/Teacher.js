const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    //email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    teacherId: { type: Number, required: true, unique: true },
    sectionsToTeach:{
        type: [String],
        required: true,
        enum: ['A', 'B', 'C']
    },
    subjectTaught:{
        type: [String],
        required: true,
        // enum of subject codes
        enum: ['BCSE 0105', 'BCSE 0255', 'BCSC 0022']  //ML,WEB,DAA
    },
    image:{
        type: String,
        required: true
    }
});

let Teacher=mongoose.model("Teacher",teacherSchema);
module.exports=Teacher;