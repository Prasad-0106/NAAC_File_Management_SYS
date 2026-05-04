const express = require('express');
const CriteriaData = require('../models/CriteriaData');
const User = require('../models/User');
const Verification = require('../models/Verification');
const { authenticate, requireHOD } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

const router = express.Router();
router.use(authenticate);

// Save / upsert field data
router.post('/save', async (req, res) => {
  try {
    const { academic_year, criterion_no, sub_criterion, fields } = req.body;
    if (!academic_year || !criterion_no || !sub_criterion || !fields) {
      return res.status(400).json({ error: 'academic_year, criterion_no, sub_criterion and fields required' });
    }

    const bulkOps = Object.entries(fields).map(([field_name, field_value]) => {
      return {
        updateOne: {
          filter: { 
            user_id: req.user.id, 
            academic_year, 
            criterion_no, 
            sub_criterion, 
            field_name 
          },
          update: { 
            $set: { field_value: field_value != null ? String(field_value) : '' }
          },
          upsert: true
        }
      };
    });

    if (bulkOps.length > 0) {
      await CriteriaData.bulkWrite(bulkOps);
    }

    logAudit(req.user.id, req.user.name, req.user.role, 'SAVE_CRITERIA', 'criteria_data', null, `Saved ${criterion_no}/${sub_criterion} for year ${academic_year}`, req.ip);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save criteria' });
  }
});

// HOD: Get all teachers summary (MUST be before /:academic_year to avoid param collision)
router.get('/hod/summary/:academic_year', requireHOD, async (req, res) => {
  try {
    const { academic_year } = req.params;
    const teachers = await User.find({ role: 'teacher', department: req.user.department }).lean();
    
    const result = await Promise.all(teachers.map(async (t) => {
      const criteriaDocs = await CriteriaData.find({ user_id: t._id, academic_year }).lean();
      
      const uniqueSubCriteria = new Set();
      let lastActivity = null;

      criteriaDocs.forEach(doc => {
        uniqueSubCriteria.add(doc.sub_criterion + doc.criterion_no);
        if (!lastActivity || new Date(doc.updated_at) > new Date(lastActivity)) {
          lastActivity = doc.updated_at;
        }
      });

      const verif = await Verification.findOne({ teacher_id: t._id, academic_year })
        .sort({ reviewed_at: -1 })
        .lean();

      return { 
        ...t, 
        id: t._id,
        filledSubCriteria: uniqueSubCriteria.size, 
        lastActivity, 
        verificationStatus: verif?.status || 'Pending' 
      };
    }));
    
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get summary' });
  }
});

// Get data for one sub-criterion
router.get('/:academic_year/:criterion_no/:sub_criterion', async (req, res) => {
  try {
    const { academic_year, criterion_no, sub_criterion } = req.params;
    const userId = req.query.teacher_id && req.user.role === 'hod' ? req.query.teacher_id : req.user.id;
    
    const rows = await CriteriaData.find({ user_id: userId, academic_year, criterion_no, sub_criterion }).lean();
    
    const data = {};
    let latestUpdate = null;
    rows.forEach(r => { 
      data[r.field_name] = r.field_value; 
      if (!latestUpdate || new Date(r.updated_at) > new Date(latestUpdate)) {
        latestUpdate = r.updated_at;
      }
    });
    res.json({ data, updated_at: latestUpdate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all data for one criterion
router.get('/:academic_year/:criterion_no', async (req, res) => {
  try {
    const { academic_year, criterion_no } = req.params;
    const userId = req.query.teacher_id && req.user.role === 'hod' ? req.query.teacher_id : req.user.id;
    
    const rows = await CriteriaData.find({ user_id: userId, academic_year, criterion_no }).lean();
    
    const data = {};
    rows.forEach(r => {
      if (!data[r.sub_criterion]) data[r.sub_criterion] = {};
      data[r.sub_criterion][r.field_name] = r.field_value;
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all data for a user (all criteria)
router.get('/:academic_year', async (req, res) => {
  try {
    const { academic_year } = req.params;
    const userId = req.query.teacher_id && req.user.role === 'hod' ? req.query.teacher_id : req.user.id;
    
    const rows = await CriteriaData.find({ user_id: userId, academic_year }).lean();
    
    const data = {};
    rows.forEach(r => {
      if (!data[r.criterion_no]) data[r.criterion_no] = {};
      if (!data[r.criterion_no][r.sub_criterion]) data[r.criterion_no][r.sub_criterion] = {};
      data[r.criterion_no][r.sub_criterion][r.field_name] = r.field_value;
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a sub-criterion's data
router.delete('/:academic_year/:criterion_no/:sub_criterion', async (req, res) => {
  try {
    const { academic_year, criterion_no, sub_criterion } = req.params;
    await CriteriaData.deleteMany({ user_id: req.user.id, academic_year, criterion_no, sub_criterion });
    
    logAudit(req.user.id, req.user.name, req.user.role, 'DELETE_CRITERIA', 'criteria_data', null, `Deleted ${criterion_no}/${sub_criterion} for year ${academic_year}`, req.ip);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
