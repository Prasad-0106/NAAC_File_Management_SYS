const express = require('express');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { authenticate, requireHOD } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

const router = express.Router();
router.use(authenticate);

// HOD: Send notification to a teacher
router.post('/send', requireHOD, async (req, res) => {
  try {
    const { recipient_id, subject, message } = req.body;
    if (!recipient_id || !subject || !message) return res.status(400).json({ error: 'Missing fields' });

    const notif = new Notification({
      recipient_id,
      sender_id: req.user.id,
      subject,
      message
    });
    await notif.save();

    logAudit(req.user.id, req.user.name, req.user.role, 'SEND_NOTIFICATION', 'notifications', recipient_id, `Sent msg to ${recipient_id}`, req.ip);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// HOD: Broadcast to all teachers
router.post('/broadcast', requireHOD, async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ error: 'Missing fields' });

    const teachers = await User.find({ role: 'teacher', department: req.user.department }).lean();
    
    const notifs = teachers.map(t => ({
      recipient_id: t._id,
      sender_id: req.user.id,
      subject,
      message
    }));

    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    logAudit(req.user.id, req.user.name, req.user.role, 'BROADCAST', 'notifications', null, `Broadcast to ${teachers.length} teachers`, req.ip);
    res.json({ success: true, sent: teachers.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Teacher/HOD: Get own inbox
router.get('/inbox', async (req, res) => {
  try {
    const notifs = await Notification.find({ recipient_id: req.user.id })
      .populate('sender_id', 'name')
      .sort({ created_at: -1 })
      .lean();
      
    const results = notifs.map(n => ({
      ...n,
      id: n._id,
      sender_name: n.sender_id?.name || 'Unknown'
    }));
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/unread-count', async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient_id: req.user.id, is_read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    await Notification.updateOne(
      { _id: req.params.id, recipient_id: req.user.id },
      { $set: { is_read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient_id: req.user.id, is_read: false },
      { $set: { is_read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
