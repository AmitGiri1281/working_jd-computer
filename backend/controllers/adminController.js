// controllers/adminController.js
const db = require('../db');
const bcrypt = require('bcrypt');

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    // 1. Find admin by email only
    const [admin] = await db.query(
      'SELECT * FROM admins WHERE email = ? LIMIT 1', 
      [email]
    );

    // 2. If no admin found
    if (!admin || admin.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Compare hashed password
    const isMatch = await bcrypt.compare(password, admin[0].password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 4. Successful login
    res.status(200).json({
      message: 'Login successful',
      token: 'dummy-token', // Replace with JWT later
      redirectUrl: '/admin/dashboard.html'
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};