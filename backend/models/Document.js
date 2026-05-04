const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  academic_year:  { type: String, required: true },
  criterion_no:   { type: String, required: true },
  sub_criterion:  { type: String, required: true },
  original_name:  { type: String, required: true },
  stored_name:    { type: String, required: true },
  file_path:      { type: String, required: true },
  mime_type:      { type: String, required: true },
  file_size:      { type: Number, required: true },
  status:         { type: String, enum: ['Uploaded', 'Pending', 'Verified'], default: 'Uploaded' },
}, { timestamps: { createdAt: 'upload_date', updatedAt: false } });

module.exports = mongoose.model('Document', documentSchema);
