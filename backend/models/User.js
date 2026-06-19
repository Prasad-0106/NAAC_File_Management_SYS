const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash:    { type: String, required: true },
  role:             { type: String, enum: ['teacher', 'hod', 'superadmin'], required: true },
  department:       { type: String, default: null },
  designation:      { type: String, default: null },
  qualification:    { type: String, default: null },
  experience:       { type: String, default: null },
  phone:            { type: String, default: null },
  signature_url:    { type: String, default: null },
  profile_complete: { type: Number, default: 0 },
  status:           { type: String, enum: ['Pending', 'Approved', 'Active'], default: 'Active' },
  forcePasswordReset: { type: Boolean, default: false },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('User', userSchema);
