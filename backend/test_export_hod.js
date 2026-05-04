const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const CriteriaData = require('./models/CriteriaData');
const Document = require('./models/Document');
const { generateConsolidatedExcel } = require('./utils/excelGenerator');
const { NAAC_CRITERIA } = require('./utils/naacData');

async function testExportHod() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const teachers = await User.find({ role: 'teacher' }).lean();
  const academic_year = '2023-2024';

  const allCriteria = await CriteriaData.find({ academic_year }).lean();
  const allDocs = await Document.find({ academic_year }).populate('user_id', 'name department').lean();

  const criteriaByTeacher = {};
  allCriteria.forEach(r => {
    const tid = r.user_id.toString();
    if (!criteriaByTeacher[tid]) criteriaByTeacher[tid] = {};
    if (!criteriaByTeacher[tid][r.criterion_no]) criteriaByTeacher[tid][r.criterion_no] = {};
    if (!criteriaByTeacher[tid][r.criterion_no][r.sub_criterion]) criteriaByTeacher[tid][r.criterion_no][r.sub_criterion] = {};
    criteriaByTeacher[tid][r.criterion_no][r.sub_criterion][r.field_name] = r.field_value;
  });

  const formattedDocs = allDocs.map(d => ({
    ...d,
    teacher_name: d.user_id?.name || 'Unknown',
    department: d.user_id?.department || 'Unknown'
  }));

  try {
    console.log('Generating hod excel...');
    const buffer = await generateConsolidatedExcel(teachers, academic_year, criteriaByTeacher, formattedDocs, NAAC_CRITERIA);
    console.log('Success, buffer size:', buffer.length);
  } catch (err) {
    console.error('Error generating hod excel:', err);
  }
  process.exit(0);
}

testExportHod();
