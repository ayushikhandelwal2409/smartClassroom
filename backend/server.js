const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); 
const connectDB = require('./config/db'); // database connection

// routes
const authRoutes = require('./routes/auth');
const scheduleRoutes = require('./routes/schedule');

// environment variables from .env file
dotenv.config({ path: './.env' });

// Fallback values if .env doesn't load
process.env.PORT = process.env.PORT || '5000';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartclassroom';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

const app = express();

// connect toMongoDB
connectDB();

// middleware

app.use(cors()); // enable cross-origin resource Sharing (CORS) to allow frontend requests

app.use(express.json()); // parse incoming JSON payloads

// api routes

// root route
app.get('/', (req, res) => {
  res.send('Smart Classroom API is running...');
});

// auth routes ( login, register, me)
app.use('/api/auth', authRoutes);

app.use('/api/schedules', scheduleRoutes);

// --- Serve Static Files ---
// Make the 'uploads' folder publicly accessible to serve profile images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Server Listener ---
// Define the port the server will listen on
const PORT = process.env.PORT;

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});