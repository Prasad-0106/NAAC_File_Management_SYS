const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const { authenticate, requireHOD } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

const router = express.Router();
router.use(authenticate);

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const exts = /pdf|docx|jpg|jpeg|png/;
    if (exts.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only PDF, DOCX, JPG, PNG allowed'));
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { academic_year, criterion_no, sub_criterion } = req.body;
    if (!req.file || !academic_year || !criterion_no || !sub_criterion) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Missing required fields or file' });
    }

    const doc = new Document({
      user_id: req.user.id,
      academic_year,
      criterion_no,
      sub_criterion,
      original_name: req.file.originalname,
      stored_name: req.file.filename,
      file_path: req.file.path,
      mime_type: req.file.mimetype,
      file_size: req.file.size
    });
    
    await doc.save();

    logAudit(req.user.id, req.user.name, req.user.role, 'UPLOAD_DOC', 'documents', doc._id, `Uploaded ${req.file.originalname}`, req.ip);
    
    const docObj = doc.toObject();
    docObj.id = docObj._id;
    res.json(docObj);
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const { academic_year, criterion_no, sub_criterion } = req.query;
    const userId = req.query.teacher_id && req.user.role === 'hod' ? req.query.teacher_id : req.user.id;

    const query = { user_id: userId };
    if (academic_year) query.academic_year = academic_year;
    if (criterion_no) query.criterion_no = criterion_no;
    if (sub_criterion) query.sub_criterion = sub_criterion;

    const docs = await Document.find(query).sort({ upload_date: -1 }).lean();
    
    const results = docs.map(d => ({...d, id: d._id}));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/view/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'hod' && doc.user_id.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    
    res.setHeader('Content-Type', doc.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${doc.original_name}"`);
    res.sendFile(doc.file_path);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'hod' && doc.user_id.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    if (fs.existsSync(doc.file_path)) fs.unlinkSync(doc.file_path);
    
    await Document.findByIdAndDelete(req.params.id);
    
    logAudit(req.user.id, req.user.name, req.user.role, 'DELETE_DOC', 'documents', doc._id, `Deleted ${doc.original_name}`, req.ip);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/rename', async (req, res) => {
  try {
    const { original_name } = req.body;
    if (!original_name) return res.status(400).json({ error: 'New name required' });
    
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'hod' && doc.user_id.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    doc.original_name = original_name;
    await doc.save();
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/status', requireHOD, async (req, res) => {
  try {
    const { status } = req.body;
    
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });

    doc.status = status;
    await doc.save();
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
