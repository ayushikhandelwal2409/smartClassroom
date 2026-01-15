const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); 
const connectDB = require('./config/db'); // database connection
const seedStudents = require('./seedStudent'); // function to seed students
const seed = require('./seedSection'); // function to seed selections
const seedTeachers = require('./seedTeacher'); // function to seed teachers
const seedCourses = require('./seedSubject'); // function to seed courses
const seedBlocks = require('./seedBlock'); // function to seed blocks
const seedAdmin = require('./seedAdmin'); // function to seed admin

// routes
const lostFoundRoutes = require('./routes/lostFound')
const authRoutes = require('./routes/auth');
const timetableRoutes = require('./routes/timetable');
const blocksRoutes = require('./routes/blocks');
const studentsRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const faceRoutes = require('./routes/face');
const adminRoutes = require('./routes/admin');

// environment variables from .env file
dotenv.config({ path: './.env' });

// Fallback values if .env doesn't load
process.env.PORT = process.env.PORT || '5000';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartclassroom';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

const app = express();

// connect toMongoDB
connectDB();
//seedStudents(); // Seed the database with initial student data
// seed();
// seedTeachers();
// seedCourses();
// seedBlocks();
//seedAdmin();

// middleware

// app.use("/api/events", require("./routes/event"));

// enable cross-origin resource Sharing (CORS) to allow frontend requests
// app.use(cors()); 
app.use(cors({
  origin: "https://smartclassroom-frontend.onrender.com",
  credentials: true
}));

app.use(express.json()); // parse incoming JSON payloads
app.use(express.urlencoded({ extended: true }));

// api routes

// root route
app.get('/', (req, res) => {
  res.send('Smart Classroom API is running...');
});

// auth routes ( login, register, me)
app.use('/api/auth', authRoutes);
// timetable routes
app.use('/api/timetable', timetableRoutes);
// blocks routes
app.use('/api/blocks', blocksRoutes);

// admin routes
app.use('/api/admin', adminRoutes);

// students routes
app.use('/api/students', studentsRoutes);
// attendance routes
app.use('/api/attendance', attendanceRoutes);
// face recognition routes
app.use('/api/face', faceRoutes);


// --- Serve Static Files ---
// Make the 'uploads' folder publicly accessible to serve profile images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/lostfound', lostFoundRoutes)

// --- Server Listener ---
// Define the port the server will listen on
const PORT = process.env.PORT;

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});