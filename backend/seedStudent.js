const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('./models/Student'); 

const students = [
  // SECTION A
  { Name: 'Ayushi Khandelwal', section: 'A', studentId: 2315000100, image: 'smartClassroom\\backend\\uploads\\profiles\\ayushi.jpg', password: 'password123' },
  { Name: 'Arya Pratap Singh', section: 'A', studentId: 2315000101, image: 'smartClassroom\\backend\\uploads\\profiles\\profileImage-1759646981589.jpg', password: 'password123' },
  { Name: 'Dhruv Agarwal', section: 'A', studentId: 2315000102, image: 'https://randomuser.me/api/portraits/men/13.jpg', password: 'password123' },
  { Name: 'Amrita Maurya', section: 'A', studentId: 2315000103, image: 'smartClassroom\\backend\\uploads\\profiles\\amrita.jpg', password: 'password123' },

  // SECTION B
  { Name: 'Ananya Verma', section: 'B', studentId: 2315000200, image: 'https://randomuser.me/api/portraits/women/21.jpg', password: 'password123' },
  { Name: 'Rohit Singh', section: 'B', studentId: 2315000201, image: 'https://randomuser.me/api/portraits/men/22.jpg', password: 'password123' },
  { Name: 'Neha Patel', section: 'B', studentId: 2315000202, image: 'https://randomuser.me/api/portraits/women/23.jpg', password: 'password123' },
  { Name: 'Aditya Jain', section: 'B', studentId: 2315000203, image: 'https://randomuser.me/api/portraits/men/24.jpg', password: 'password123' },

  // SECTION C
  { Name: 'Simran Kaur', section: 'C', studentId: 2315000300, image: 'https://randomuser.me/api/portraits/women/31.jpg', password: 'password123' },
  { Name: 'Vikram Yadav', section: 'C', studentId: 2315000301, image: 'https://randomuser.me/api/portraits/men/32.jpg', password: 'password123' },
  { Name: 'Meera Nair', section: 'C', studentId: 2315000302, image: 'https://randomuser.me/api/portraits/women/33.jpg', password: 'password123' },
  { Name: 'Raghav Kapoor', section: 'C', studentId: 2315000303, image: 'https://randomuser.me/api/portraits/men/34.jpg', password: 'password123' }
];



async function seedStudents() {
  try {
    await Student.deleteMany({}); // clear existing students

    // Hash passwords and prepare documents
    const hashedStudents = await Promise.all(
      students.map(async (s) => {
        const hashedPassword = await bcrypt.hash(s.password, 10); // default password
        return { ...s, password: hashedPassword };
      })
    );

    const result = await Student.insertMany(hashedStudents);
    console.log(`Inserted ${result.length} students successfully`);
  } catch (err) {
    console.error('Error inserting students:', err);
  } finally {
    mongoose.connection.close();
  }
}

// seedStudents();
module.exports = seedStudents;