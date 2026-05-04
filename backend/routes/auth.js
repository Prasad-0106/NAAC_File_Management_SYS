const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, designation, qualification, experience, phone } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }
    if (role === 'teacher' && !password) {
      return res.status(400).json({ error: 'Password is required for teachers' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    let finalPassword = password;
    if (role === 'hod') {
      finalPassword = 'DBATU2026';
    }

    const password_hash = await bcrypt.hash(finalPassword, 10);
    const profile_complete = (role === 'hod' || (department && designation)) ? 1 : 0;

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

router.post('/google', async (req, res) => {
  try {
    const { token, role } = req.body; // role is passed if registering
    if (!token) return res.status(400).json({ error: 'Google token required' });

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user if they don't exist
      const newRole = role || 'teacher';
      const password_hash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10); // Random password for google users
      user = new User({
        name,
        email,
        password_hash,
        role: newRole,
        profile_complete: 0
      });
      await user.save();
      logAudit(user._id, user.name, user.role, 'REGISTER_GOOGLE', 'users', user._id, 'User registered via Google', req.ip);
    } else {
      logAudit(user._id, user.name, user.role, 'LOGIN_GOOGLE', 'users', user._id, 'User logged in via Google', req.ip);
    }

    const jwtToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    
    const userObj = user.toObject();
    delete userObj.password_hash;
    userObj.id = userObj._id;

    res.json({ token: jwtToken, user: userObj });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }); // Allow both teachers and HODs to reset

    if (!user) {
      return res.status(404).json({ error: 'If the email exists, a reset link will be sent.' }); // Don't leak emails
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'NAAC Portal - Password Reset',
      text: `You requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`
    };

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('EMAIL NOT CONFIGURED. Reset URL:', resetUrl); // Fallback for testing
    }

    res.json({ message: 'If the email exists, a reset link will be sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    user.password_hash = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    logAudit(user._id, user.name, user.role, 'PASSWORD_RESET', 'users', user._id, 'Password reset successful', req.ip);

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
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
