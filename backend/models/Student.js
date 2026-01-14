const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    //email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    studentId: { type: Number, required: true, unique: true },
    section:{
        type: String,
        required: true,
        enum: ['A', 'B', 'C']
    },
    image:{
        type: String,
        required: true
    },

    // add admin control to activate/deactivate student account
    active: {
        type: Boolean,
        default: true
    }

});

let Student=mongoose.model("Student",StudentSchema);
module.exports=Student;