const mongoose = require('mongoose');

const criteriaDataSchema = new mongoose.Schema({
  user_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  academic_year: { type: String, required: true },
  criterion_no:  { type: String, required: true },
  sub_criterion: { type: String, required: true },
  field_name:    { type: String, required: true },
  field_value:   { type: String, default: '' },
}, { timestamps: { createdAt: false, updatedAt: 'updated_at' } });

// Compound index for unique constraint (replacement for ON CONFLICT in SQLite)
criteriaDataSchema.index({ user_id: 1, academic_year: 1, criterion_no: 1, sub_criterion: 1, field_name: 1 }, { unique: true });

module.exports = mongoose.model('CriteriaData', criteriaDataSchema);
