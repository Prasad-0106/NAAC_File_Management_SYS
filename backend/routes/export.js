const express = require('express');
const { generateTeacherExcel, generateConsolidatedExcel } = require('../utils/excelGenerator');
const { authenticate, requireHOD } = require('../middleware/auth');
const User = require('../models/User');
const CriteriaData = require('../models/CriteriaData');
const Document = require('../models/Document');
const Verification = require('../models/Verification');
const { NAAC_CRITERIA } = require('../utils/naacData');

const router = express.Router();
router.use(authenticate);

// Get all teachers for HOD dropdowns
router.get('/teachers', requireHOD, async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher', department: req.user.department }).select('id name department designation').lean();
    const results = teachers.map(t => ({ ...t, id: t._id }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get PDF data for one teacher
router.get('/pdf-data/:academic_year', async (req, res) => {
  try {
    const { academic_year } = req.params;
    const userId = req.query.teacher_id && req.user.role === 'hod' ? req.query.teacher_id : req.user.id;
    
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const criteriaRows = await CriteriaData.find({ user_id: userId, academic_year }).lean();
    const data = {};
    criteriaRows.forEach(r => {
      if (!data[r.criterion_no]) data[r.criterion_no] = {};
      if (!data[r.criterion_no][r.sub_criterion]) data[r.criterion_no][r.sub_criterion] = {};
      data[r.criterion_no][r.sub_criterion][r.field_name] = r.field_value;
    });

    const docs = await Document.find({ user_id: userId, academic_year }).lean();
    
    const verification = await Verification.findOne({ teacher_id: userId, academic_year }).sort({ reviewed_at: -1 }).lean();
    
    res.json({
      user,
      academicYear: academic_year,
      criteria: NAAC_CRITERIA,
      data,
      documents: docs,
      verificationStatus: verification?.status || 'Pending'
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Download Excel for one teacher
router.get('/excel/:academic_year', async (req, res) => {
  try {
    const { academic_year } = req.params;
    const userId = req.query.teacher_id && req.user.role === 'hod' ? req.query.teacher_id : req.user.id;
    
    const user = await User.findById(userId).lean();
    const criteriaRows = await CriteriaData.find({ user_id: userId, academic_year }).lean();
    const data = {};
    criteriaRows.forEach(r => {
      if (!data[r.criterion_no]) data[r.criterion_no] = {};
      if (!data[r.criterion_no][r.sub_criterion]) data[r.criterion_no][r.sub_criterion] = {};
      data[r.criterion_no][r.sub_criterion][r.field_name] = r.field_value;
    });
    const docs = await Document.find({ user_id: userId, academic_year }).lean();
    const verification = await Verification.findOne({ teacher_id: userId, academic_year }).sort({ reviewed_at: -1 }).lean();
    
    const buffer = await generateTeacherExcel(user, academic_year, data, docs, NAAC_CRITERIA, verification);
    
    res.attachment(`NAAC_Report_${academic_year}.xlsx`);
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Export Error:', err);
    res.status(500).json({ error: `Export failed: ${err.message}` });
  }
});

// HOD: Download Consolidated Excel
router.get('/consolidated/:academic_year', requireHOD, async (req, res) => {
  try {
    const { academic_year } = req.params;
    
    const teachers = await User.find({ role: 'teacher', department: req.user.department }).lean();
    const allCriteria = await CriteriaData.find({ academic_year }).lean();
    const allDocs = await Document.find({ academic_year }).populate('user_id', 'name department').lean();
    const allVerifications = await Verification.find({ academic_year }).lean();
    
    // Group criteria by teacher
    const criteriaByTeacher = {};
    allCriteria.forEach(r => {
      const tid = r.user_id.toString();
      if (!criteriaByTeacher[tid]) criteriaByTeacher[tid] = {};
      if (!criteriaByTeacher[tid][r.criterion_no]) criteriaByTeacher[tid][r.criterion_no] = {};
      if (!criteriaByTeacher[tid][r.criterion_no][r.sub_criterion]) criteriaByTeacher[tid][r.criterion_no][r.sub_criterion] = {};
      criteriaByTeacher[tid][r.criterion_no][r.sub_criterion][r.field_name] = r.field_value;
    });

    // Format docs
    const formattedDocs = allDocs.map(d => ({
      ...d,
      teacher_name: d.user_id?.name || 'Unknown',
      department: d.user_id?.department || 'Unknown'
    }));

    const buffer = await generateConsolidatedExcel(teachers, academic_year, criteriaByTeacher, formattedDocs, NAAC_CRITERIA, allVerifications);
    
    res.attachment(`NAAC_Consolidated_${academic_year}.xlsx`);
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
