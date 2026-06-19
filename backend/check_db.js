require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/naac_portal');
  const users = await User.find({ role: 'hod' });
  console.log('HOD Users found:', users.length);
  for (let u of users) {
    console.log(`Email: ${u.email}, profile_complete: ${u.profile_complete}, typeof: ${typeof u.profile_complete}`);
  }
  process.exit(0);
}
test();
