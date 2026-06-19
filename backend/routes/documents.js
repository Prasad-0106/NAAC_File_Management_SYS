const express = require('express');
const multer = require('multer');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');
const Document = require('../models/Document');
const { authenticate, requireHOD } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

const router = express.Router();
router.use(authenticate);

// Configure Cloudinary (reads CLOUDINARY_URL env var automatically, or use explicit config)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — files never touch disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const exts = /pdf|docx|jpg|jpeg|png/;
    if (exts.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only PDF, DOCX, JPG, PNG allowed'));
  }
});

// Helper: upload buffer to Cloudinary
function uploadToCloudinary(buffer, originalName) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(originalName).toLowerCase().replace('.', '');
    const resourceType = ['jpg', 'jpeg', 'png', 'pdf'].includes(ext) ? 'image' : 'raw';

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'naac_documents',
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// POST /upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { academic_year, criterion_no, sub_criterion } = req.body;
    if (!req.file || !academic_year || !criterion_no || !sub_criterion) {
      return res.status(400).json({ error: 'Missing required fields or file' });
    }

    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    const doc = new Document({
      user_id: req.user.id,
      academic_year,
      criterion_no,
      sub_criterion,
      original_name: req.file.originalname,
      stored_name: result.public_id,
      file_path: result.secure_url,       // Cloudinary HTTPS URL
      mime_type: req.file.mimetype,
      file_size: req.file.size
    });

    await doc.save();
    logAudit(req.user.id, req.user.name, req.user.role, 'UPLOAD_DOC', 'documents', doc._id, `Uploaded ${req.file.originalname}`, req.ip);

    const docObj = doc.toObject();
    docObj.id = docObj._id;
    res.json(docObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /list
router.get('/list', async (req, res) => {
  try {
    const { academic_year, criterion_no, sub_criterion } = req.query;
    const userId = req.query.teacher_id && req.user.role === 'hod' ? req.query.teacher_id : req.user.id;

    const query = { user_id: userId };
    if (academic_year) query.academic_year = academic_year;
    if (criterion_no) query.criterion_no = criterion_no;
    if (sub_criterion) query.sub_criterion = sub_criterion;

    const docs = await Document.find(query).sort({ upload_date: -1 }).lean();
    const results = docs.map(d => ({ ...d, id: d._id }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /view/:id  — redirect to Cloudinary URL (no local file serving)
router.get('/view/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'hod' && doc.user_id.toString() !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });

    // file_path is now the Cloudinary secure URL
    res.redirect(doc.file_path);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /:id
router.delete('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'hod' && doc.user_id.toString() !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });

    // Delete from Cloudinary
    if (doc.stored_name) {
      const ext = path.extname(doc.original_name).toLowerCase().replace('.', '');
      const resourceType = ['jpg', 'jpeg', 'png', 'pdf'].includes(ext) ? 'image' : 'raw';
      await cloudinary.uploader.destroy(doc.stored_name, { resource_type: resourceType });
    }

    await Document.findByIdAndDelete(req.params.id);
    logAudit(req.user.id, req.user.name, req.user.role, 'DELETE_DOC', 'documents', doc._id, `Deleted ${doc.original_name}`, req.ip);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /:id/rename
router.put('/:id/rename', async (req, res) => {
  try {
    const { original_name } = req.body;
    if (!original_name) return res.status(400).json({ error: 'New name required' });

    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'hod' && doc.user_id.toString() !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });

    doc.original_name = original_name;
    await doc.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /:id/status  (HOD only)
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
