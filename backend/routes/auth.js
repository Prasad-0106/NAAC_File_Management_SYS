const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, designation, qualification, experience, phone } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const profile_complete = (department && designation) ? 1 : 0;

    const user = new User({
      name, email, password_hash, role, department, designation, qualification, experience, phone, profile_complete
    });
    await user.save();

    logAudit(user._id, user.name, user.role, 'REGISTER', 'users', user._id, 'User registered', req.ip);

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    
    // Convert to plain object and remove password
    const userObj = user.toObject();
    delete userObj.password_hash;
    // ensure id matches what frontend expects
    userObj.id = userObj._id;

    res.json({ token, user: userObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      logAudit(null, email, 'Unknown', 'LOGIN_FAILED', 'users', null, 'Invalid credentials', req.ip);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    logAudit(user._id, user.name, user.role, 'LOGIN', 'users', user._id, 'User logged in', req.ip);

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    
    const userObj = user.toObject();
    delete userObj.password_hash;
    userObj.id = userObj._id;

    res.json({ token, user: userObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const userObj = user.toObject();
    delete userObj.password_hash;
    userObj.id = userObj._id;
    res.json(userObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, department, designation, qualification, experience, phone } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.name = name || user.name;
    user.department = department || user.department;
    user.designation = designation || user.designation;
    user.qualification = qualification || user.qualification;
    user.experience = experience || user.experience;
    user.phone = phone || user.phone;
    
    if (user.department && user.designation) {
      user.profile_complete = 1;
    }

    await user.save();
    
    logAudit(user._id, user.name, user.role, 'UPDATE_PROFILE', 'users', user._id, 'Profile updated', req.ip);

    const userObj = user.toObject();
    delete userObj.password_hash;
    userObj.id = userObj._id;
    
    res.json(userObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
