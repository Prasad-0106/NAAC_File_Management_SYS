const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const CriteriaData = require('./models/CriteriaData');
const Document = require('./models/Document');
const { generateTeacherExcel } = require('./utils/excelGenerator');
const { NAAC_CRITERIA } = require('./utils/naacData');

async function testExport() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const user = await User.findOne({ role: 'teacher' }).lean();
  if (!user) {
    console.log('No teacher found');
    return process.exit(0);
  }

  const userId = user._id;
  const academic_year = '2023-2024';

  const criteriaRows = await CriteriaData.find({ user_id: userId, academic_year }).lean();
  const data = {};
  criteriaRows.forEach(r => {
    if (!data[r.criterion_no]) data[r.criterion_no] = {};
    if (!data[r.criterion_no][r.sub_criterion]) data[r.criterion_no][r.sub_criterion] = {};
    data[r.criterion_no][r.sub_criterion][r.field_name] = r.field_value;
  });
  const docs = await Document.find({ user_id: userId, academic_year }).lean();

  try {
    console.log('Generating excel...');
    const buffer = await generateTeacherExcel(user, academic_year, data, docs, NAAC_CRITERIA);
    console.log('Success, buffer size:', buffer.length);
  } catch (err) {
    console.error('Error generating excel:', err);
  }
  process.exit(0);
}

testExport();
