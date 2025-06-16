// controllers/authController.js

exports.login = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const user = await Admin.findOne({
      $or: [{ email }, { username }]
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '1d'
    });

    res.status(200).json({ 
      success: true, 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ✅ Define getMe OUTSIDE of login
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
};
