const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Can be null (e.g., failed login)
  user_name:  { type: String, default: 'System' },
  user_role:  { type: String, default: 'System' },
  action:     { type: String, required: true },
  target:     { type: String, default: null },
  target_id:  { type: mongoose.Schema.Types.Mixed, default: null },
  detail:     { type: String, default: null },
  ip_address: { type: String, default: null },
}, { timestamps: { createdAt: 'timestamp', updatedAt: false } });

module.exports = mongoose.model('AuditLog', auditLogSchema);
