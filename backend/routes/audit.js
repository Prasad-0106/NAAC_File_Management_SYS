const express = require('express');
const AuditLog = require('../models/AuditLog');
const { authenticate, requireHOD } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, requireHOD, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const actionFilter = req.query.action;

    const User = require('../models/User');
    const departmentUsers = await User.find({ department: req.user.department }).select('_id');
    const departmentUserIds = departmentUsers.map(u => u._id);

    const query = {
      user_role: { $ne: 'superadmin' },
      action: { $nin: ['UPDATE_PROFILE', 'LOGIN_FAILED'] },
      $or: [
        { user_id: { $in: departmentUserIds } },
        { target_id: { $in: departmentUserIds } }
      ]
    };

    if (actionFilter) {
      query.action = actionFilter;
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const results = logs.map(l => ({ ...l, id: l._id }));
    res.json({ total, page, limit, rows: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
