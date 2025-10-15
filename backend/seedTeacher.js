
// seedTeachers.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Teacher = require('./models/Teacher'); 

const teachers = [
  {
    Name: 'Dr. Anjali Mehta',
    sectionsToTeach: ['A', 'B', 'C'],
    subjectTaught: ['BCSE 0105'],
    teacherId: 201034,
    image: 'https://randomuser.me/api/portraits/women/45.jpg',
    password: 'teach123'
  },
  {
    Name: 'Mr. Rajesh Kumar',
    sectionsToTeach: ['A', 'B', 'C'],
    subjectTaught: ['BCSE 0255'],
    teacherId: 431034,
    image: 'https://randomuser.me/api/portraits/men/46.jpg',
    password: 'teach123'
  },
  {
    Name: 'Ms. Sneha Reddy',
    sectionsToTeach: ['A', 'B', 'C'],
    subjectTaught: ['BCSC 0022'],
    teacherId: 301034,
    image: 'https://randomuser.me/api/portraits/women/47.jpg',
    password: 'teach123'
  }
];

async function seedTeachers() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');

    await Teacher.deleteMany({});
    console.log('Old teacher data removed.');

    const hashedTeachers = await Promise.all(
      teachers.map(async (t) => {
        const hashedPassword = await bcrypt.hash(t.password, 10);
        return { ...t, password: hashedPassword };
      })
    );

    const result = await Teacher.insertMany(hashedTeachers);
    console.log(`Inserted ${result.length} teachers successfully`);
  } catch (err) {
    console.error('Error inserting teachers:', err);
  } finally {
    mongoose.connection.close();
  }
}

// Run directly
module.exports = seedTeachers;
