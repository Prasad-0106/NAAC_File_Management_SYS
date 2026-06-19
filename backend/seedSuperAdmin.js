/**
 * Seed script: Creates the SuperAdmin account if it doesn't exist.
 * Run once: node seedSuperAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const SUPERADMIN_EMAIL = 'superadmin@dbatu.ac.in';
const SUPERADMIN_PASSWORD = 'DBATU@SuperAdmin2026'; // Change this immediately after first use!

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/naac_portal');
  console.log('✅ Connected to MongoDB');

  const existing = await User.findOne({ email: SUPERADMIN_EMAIL });
  if (existing) {
    console.log('ℹ️  SuperAdmin already exists:', SUPERADMIN_EMAIL);
    console.log('   Role:', existing.role);
    await mongoose.disconnect();
    return;
  }

  const password_hash = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);
  const admin = new User({
    name: 'Super Admin',
    email: SUPERADMIN_EMAIL,
    password_hash,
    role: 'superadmin',
    status: 'Active',
    profile_complete: 1,
    forcePasswordReset: false,
  });
  await admin.save();

  console.log('🎉 SuperAdmin created successfully!');
  console.log('   Email:    ', SUPERADMIN_EMAIL);
  console.log('   Password: ', SUPERADMIN_PASSWORD);
  console.log('\n⚠️  IMPORTANT: Change the password immediately after first login!');
  await mongoose.disconnect();
}

seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });
