const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected...");
    createAdmin();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const Admin = require('../models/Admin');

async function createAdmin() {
  const email = 'admin@example.com';
  const username = 'admin';
  const password = 'admin123';

  try {
    // Check if admin exists by either email or username
    const existingAdmin = await Admin.findOne({ 
      $or: [
        { email: email },
        { username: username }
      ] 
    });

    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      username: username,
      email: email,
      password: hashedPassword
    });

    await admin.save();
    console.log("✅ Admin created successfully.");
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`); // Only for initial setup - remove in production
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err.message);
    process.exit(1);
  }
}