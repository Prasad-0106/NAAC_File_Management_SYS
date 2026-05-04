const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  teacher_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hod_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  academic_year: { type: String, required: true },
  criterion_no:  { type: String, default: null }, // Null means all criteria
  status:        { type: String, enum: ['Verified', 'Needs Revision', 'Pending'], required: true },
  comment:       { type: String },
}, { timestamps: { createdAt: 'reviewed_at', updatedAt: false } });

module.exports = mongoose.model('Verification', verificationSchema);
