const mongoose = require('mongoose');
const Course = require('./models/Subject');

const courses = [
  { name: 'Machine Learning', code: 'BCSE 0105' },
  { name: 'Analysis And Design Of Algorithm', code: 'BCSC 0022' },
  { name: 'Full Stack', code: 'BCSE 0255' }
];

async function seedCourses() {
  try {
    console.log('MongoDB Connected...');

    // Clear old data
    await Course.deleteMany({});
    console.log('Old courses removed.');

    // Insert new courses
    const result = await Course.insertMany(courses);
    console.log(`Inserted ${result.length} courses successfully.`);
  } catch (err) {
    console.error('Error inserting courses:', err);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeding function
// seedCourses();
module.exports=seedCourses;