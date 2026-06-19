const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Email Sending via Brevo API (Bypasses Render SMTP restrictions) ──
async function sendEmailBrevo(toEmail, subject, htmlContent) {
  if (!process.env.BREVO_API_KEY) {
    console.warn('BREVO_API_KEY is not set. Email not sent.');
    return;
  }
  try {
    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { email: process.env.EMAIL_USER || 'parthsalunkhe0103@gmail.com', name: 'NAAC Portal' },
      to: [{ email: toEmail }],
      subject: subject,
      htmlContent: htmlContent
    }, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    console.log(`Email sent via Brevo to ${toEmail}`);
  } catch (error) {
    console.error('Brevo Email Error:', error.response?.data || error.message);
  }
}

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, department, designation, phone, qualification, experience } = req.body;
    const role = 'teacher'; // Force all public registrations to be teachers
    
    if (!name || !email || !department) {
      return res.status(400).json({ error: 'Name, email, and department are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Set a complex random placeholder password. HOD will approve and generate the real one.
    const password_hash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
    const profile_complete = 0; // Force to 0 so they must upload signature after approval

    const user = new User({
      name, email, password_hash, role, department, designation, qualification, experience, phone, profile_complete,
      status: 'Pending'
    });
    await user.save();

    logAudit(user._id, user.name, user.role, 'REGISTER_REQUEST', 'users', user._id, 'Teacher requested registration', req.ip);

    // Return success without JWT, since they cannot log in yet
    res.json({ message: 'Registration request submitted. Your HOD will review and email you the credentials once approved.' });
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

    if (user.status === 'Pending') {
      return res.status(403).json({ error: 'Your account is pending approval from your HOD.' });
    }

    if (user.forcePasswordReset) {
      // Issue a short-lived token specifically for password reset
      const resetToken = jwt.sign({ id: user._id, purpose: 'force_reset' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '15m' });
      return res.json({ requirePasswordReset: true, resetToken, email: user.email });
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
    
    const emailHtml = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
  <div style="background-color: #2563eb; color: white; padding: 24px; text-align: center;">
    <h2 style="margin: 0; font-size: 24px; letter-spacing: 0.5px;">DBATU NAAC Portal</h2>
  </div>
  <div style="padding: 32px; background-color: #ffffff; color: #1f2937;">
    <p style="font-size: 16px; margin-top: 0;">Hello,</p>
    <p style="font-size: 15px; line-height: 1.6;">We received a request to reset the password for your account on the NAAC File Management Portal.</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">Reset Password</a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-bottom: 24px; line-height: 1.5;">If you did not request this password reset, please ignore this email or contact support if you have questions. This link will expire in 1 hour.</p>
    
    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="font-size: 14px; color: #6b7280; margin-bottom: 0; line-height: 1.5;">Regards,<br><strong style="color: #374151;">System Administrator</strong><br>NAAC Portal – DBATU</p>
  </div>
</div>
    `.trim();

    await sendEmailBrevo(user.email, 'NAAC Portal - Password Reset', emailHtml);

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

// ─── Force Password Reset (first login with temp password) ──────────────────
router.post('/set-permanent-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) return res.status(400).json({ error: 'Token and new password required' });

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'fallback_secret');
    } catch {
      return res.status(401).json({ error: 'Token invalid or expired. Please log in again.' });
    }

    if (decoded.purpose !== 'force_reset') return res.status(401).json({ error: 'Invalid token purpose.' });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.forcePasswordReset = false;
    user.status = 'Active';
    await user.save();

    logAudit(user._id, user.name, user.role, 'SET_PERMANENT_PASSWORD', 'users', user._id, 'Teacher set permanent password', req.ip);

    // Now issue full session token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    const userObj = user.toObject();
    delete userObj.password_hash;
    userObj.id = userObj._id;
    res.json({ token, user: userObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── SuperAdmin: Invite a new HOD ───────────────────────────────────────────
router.post('/superadmin/invite-hod', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') return res.status(403).json({ error: 'Forbidden' });

    const { name, email, department } = req.body;
    if (!name || !email || !department) return res.status(400).json({ error: 'Name, email, department required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    // Create HOD with a random temp password
    const tempPassword = crypto.randomBytes(5).toString('hex').toUpperCase(); // e.g. "A3F7B2"
    const password_hash = await bcrypt.hash(tempPassword, 10);

    const hod = new User({
      name, email, password_hash, role: 'hod', department,
      status: 'Active', // HOD is active immediately but must reset password on first login
      forcePasswordReset: true,
      profile_complete: 0,
    });
    await hod.save();

    logAudit(req.user.id, req.user.name, 'superadmin', 'INVITE_HOD', 'users', hod._id, `Invited HOD: ${email}`, req.ip);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const emailHtml = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
  <div style="background-color: #2563eb; color: white; padding: 24px; text-align: center;">
    <h2 style="margin: 0; font-size: 24px; letter-spacing: 0.5px;">DBATU NAAC Portal</h2>
  </div>
  <div style="padding: 32px; background-color: #ffffff; color: #1f2937;">
    <p style="font-size: 16px; margin-top: 0;">Dear <strong>${name}</strong>,</p>
    <p style="font-size: 15px; line-height: 1.6;">You have been registered as the Head of Department (HOD) for the <strong>${department}</strong> department on the NAAC File Management Portal at DBATU.</p>
    
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold;">Your Account Details</p>
      <p style="margin: 8px 0; font-size: 16px;"><strong>Email:</strong> ${email}</p>
      <p style="margin: 8px 0; font-size: 16px;"><strong>Password:</strong> <span style="font-family: monospace; background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${tempPassword}</span></p>
    </div>
    
    <p style="font-size: 14px; color: #b91c1c; background-color: #fef2f2; padding: 12px; border-radius: 6px; border: 1px solid #f87171;">
      <strong>Security Notice:</strong> For your protection, you will be required to set a new permanent password immediately upon your first login.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${frontendUrl}/login" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">Login to Portal</a>
    </div>
    
    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="font-size: 14px; color: #6b7280; margin-bottom: 0; line-height: 1.5;">Regards,<br><strong style="color: #374151;">Super Admin</strong><br>NAAC Portal – DBATU</p>
  </div>
</div>
    `.trim();

    await sendEmailBrevo(email, 'NAAC Portal – HOD Account Created', emailHtml);
    
    res.json({ success: true, message: `HOD account created and credentials emailed to ${email}. (Please inform them to check their SPAM folder!)` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── SuperAdmin: List all HODs ───────────────────────────────────────────────
router.get('/superadmin/hods', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') return res.status(403).json({ error: 'Forbidden' });
    const hods = await User.find({ role: 'hod' }).select('-password_hash').lean();
    res.json(hods.map(h => ({ ...h, id: h._id })));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── HOD: Approve a pending teacher ─────────────────────────────────────────
router.post('/hod/approve-teacher', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'hod') return res.status(403).json({ error: 'Forbidden' });
    const { teacherId } = req.body;
    if (!teacherId) return res.status(400).json({ error: 'teacherId required' });

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') return res.status(404).json({ error: 'Teacher not found' });
    if (teacher.status !== 'Pending') return res.status(400).json({ error: 'Teacher is not in Pending state' });
    if (teacher.department !== req.user.department) return res.status(403).json({ error: 'Teacher is not in your department' });

    // Generate a readable temporary password
    const tempPassword = crypto.randomBytes(4).toString('hex').toUpperCase() + Math.floor(10 + Math.random() * 90);
    teacher.password_hash = await bcrypt.hash(tempPassword, 10);
    teacher.status = 'Approved';
    teacher.forcePasswordReset = true;
    await teacher.save();

    logAudit(req.user.id, req.user.name, 'hod', 'APPROVE_TEACHER', 'users', teacher._id, `Approved teacher: ${teacher.email}`, req.ip);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const emailBody = `
Dear ${teacher.name},

Your registration request for the NAAC File Management Portal has been approved by the Head of Department, ${req.user.department} Department.

Your login credentials are:
  Email:    ${teacher.email}
  Password: ${tempPassword}

You will be asked to set a new permanent password upon your first login.

Portal Link: ${frontendUrl}/login

Please do not share these credentials with anyone.

Regards,
${req.user.name}
HOD, ${req.user.department}
NAAC Portal – DBATU
    `.trim();

    const emailHtml = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
  <div style="background-color: #2563eb; color: white; padding: 24px; text-align: center;">
    <h2 style="margin: 0; font-size: 24px; letter-spacing: 0.5px;">DBATU NAAC Portal</h2>
  </div>
  <div style="padding: 32px; background-color: #ffffff; color: #1f2937;">
    <p style="font-size: 16px; margin-top: 0;">Dear <strong>${teacher.name}</strong>,</p>
    <p style="font-size: 15px; line-height: 1.6;">Your registration request for the NAAC File Management Portal has been officially <strong>approved</strong> by the Head of the <strong>${req.user.department}</strong> Department.</p>
    
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #10b981;">
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold;">Your Login Details</p>
      <p style="margin: 8px 0; font-size: 16px;"><strong>Email:</strong> ${teacher.email}</p>
      <p style="margin: 8px 0; font-size: 16px;"><strong>Password:</strong> <span style="font-family: monospace; background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${tempPassword}</span></p>
    </div>
    
    <p style="font-size: 14px; color: #b91c1c; background-color: #fef2f2; padding: 12px; border-radius: 6px; border: 1px solid #f87171;">
      <strong>Security Notice:</strong> You will be required to set a new permanent password immediately upon your first login.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${frontendUrl}/login" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">Access Portal</a>
    </div>
    
    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="font-size: 14px; color: #6b7280; margin-bottom: 0; line-height: 1.5;">Regards,<br><strong style="color: #374151;">${req.user.name}</strong><br>Head of Department, ${req.user.department}<br>NAAC Portal – DBATU</p>
  </div>
</div>
    `.trim();

    await sendEmailBrevo(teacher.email, 'NAAC Portal – Your Access Has Been Approved', emailHtml);

    res.json({ success: true, message: `Teacher approved and credentials emailed to ${teacher.email}. (Please inform them to check their SPAM folder!)` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── HOD: Reject a pending teacher ──────────────────────────────────────────
router.post('/hod/reject-teacher', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'hod') return res.status(403).json({ error: 'Forbidden' });
    const { teacherId } = req.body;
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') return res.status(404).json({ error: 'Teacher not found' });
    if (teacher.department !== req.user.department) return res.status(403).json({ error: 'Forbidden' });
    await User.deleteOne({ _id: teacherId });
    logAudit(req.user.id, req.user.name, 'hod', 'REJECT_TEACHER', 'users', teacherId, `Rejected teacher: ${teacher.email}`, req.ip);
    res.json({ success: true, message: 'Teacher request rejected and removed.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── HOD: Get pending teachers in own department ─────────────────────────────
router.get('/hod/pending-teachers', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'hod') return res.status(403).json({ error: 'Forbidden' });
    const pending = await User.find({ role: 'teacher', department: req.user.department, status: 'Pending' }).select('-password_hash').lean();
    res.json(pending.map(t => ({ ...t, id: t._id })));
  } catch (err) {
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
    const { name, department, designation, qualification, experience, phone, signature_url } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.name = name || user.name;
    user.department = department || user.department;
    user.designation = designation || user.designation;
    user.qualification = qualification || user.qualification;
    user.experience = experience || user.experience;
    user.phone = phone || user.phone;
    user.signature_url = signature_url || user.signature_url;
    
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

router.post('/upload-signature', authenticate, require('multer')().single('signature'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const streamifier = require('streamifier');
    const cloudinary = require('cloudinary').v2;

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'naac_portal/signatures', resource_type: 'auto' },
      async (err, result) => {
        if (err) return res.status(500).json({ error: 'Cloudinary upload failed' });
        
        const user = await User.findById(req.user.id);
        user.signature_url = result.secure_url;
        await user.save();
        
        res.json({ signature_url: result.secure_url });
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
