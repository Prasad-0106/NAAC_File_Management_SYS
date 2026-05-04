const AuditLog = require('../models/AuditLog');

const logAudit = async (userId, userName, userRole, action, target, targetId, detail, ip) => {
  try {
    await AuditLog.create({
      user_id: userId,
      user_name: userName,
      user_role: userRole,
      action,
      target,
      target_id: targetId,
      detail,
      ip_address: ip
    });
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
};

module.exports = { logAudit };
