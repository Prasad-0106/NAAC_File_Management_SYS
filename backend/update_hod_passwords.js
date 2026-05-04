const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function updateHodPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const passwordHash = await bcrypt.hash('DBATU2026', 10);
    const result = await User.updateMany({ role: 'hod' }, { $set: { password_hash: passwordHash } });
    
    console.log(`Updated ${result.modifiedCount} HOD passwords to DBATU2026`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateHodPasswords();
