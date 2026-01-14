const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function seedAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await Admin.create({
    Name: 'Admin',
    adminId: 999999,
    password: hashedPassword
  });

  console.log('Admin created');
  mongoose.connection.close();
}

// seedAdmin();
module.exports = seedAdmin;
