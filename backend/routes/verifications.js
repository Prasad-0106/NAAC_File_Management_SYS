const express = require('express');
const Verification = require('../models/Verification');
const Notification = require('../models/Notification');
const { authenticate, requireHOD } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

const router = express.Router();
router.use(authenticate);

// HOD: Submit review
router.post('/review', requireHOD, async (req, res) => {
  try {
    const { teacher_id, academic_year, criterion_no, status, comment } = req.body;
    if (!teacher_id || !academic_year || !status) return res.status(400).json({ error: 'Required fields missing' });

    const verif = new Verification({
      teacher_id,
      hod_id: req.user.id,
      academic_year,
      criterion_no: criterion_no || null,
      status,
      comment
    });
    await verif.save();

    // Auto-notify teacher
    let msg = `HOD marked your ${criterion_no ? `Criterion ${criterion_no}` : 'submission'} as '${status}'.`;
    if (comment) msg += ` Feedback: "${comment}"`;
    
    const notif = new Notification({
      recipient_id: teacher_id,
      sender_id: req.user.id,
      subject: `Review Update: ${status}`,
      message: msg
    });
    await notif.save();

    logAudit(req.user.id, req.user.name, req.user.role, 'REVIEW', 'verifications', verif._id, `Reviewed teacher ${teacher_id} ${criterion_no?'C'+criterion_no:''} -> ${status}`, req.ip);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get verification history for a teacher
router.get('/teacher/:teacher_id', async (req, res) => {
  try {
    if (req.user.role !== 'hod' && req.user.id !== req.params.teacher_id) return res.status(403).json({ error: 'Forbidden' });
    
    const query = { teacher_id: req.params.teacher_id };
    if (req.query.academic_year) query.academic_year = req.query.academic_year;

    const verifs = await Verification.find(query)
      .sort({ reviewed_at: -1 })
      .lean();
      
    const results = verifs.map(v => ({...v, id: v._id}));
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
