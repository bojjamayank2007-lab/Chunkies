require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = 'admin@chunkies.local';
    const password = 'Chunkies@123';

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log(`Admin already exists: ${email}`);
      await mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await Admin.create({
      name: 'CHUNKIES Admin',
      email,
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    console.log('Admin created successfully');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Failed to seed admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();