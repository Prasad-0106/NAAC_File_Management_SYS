const fs = require('fs');

const files = [
  'b:/TY Project/InnovateX_2026/NAAC_File_Management_SYS/frontend/src/pages/hod/HodDashboard.jsx',
  'b:/TY Project/InnovateX_2026/NAAC_File_Management_SYS/frontend/src/pages/hod/HodExport.jsx',
  'b:/TY Project/InnovateX_2026/NAAC_File_Management_SYS/frontend/src/pages/hod/TeacherDetail.jsx',
  'b:/TY Project/InnovateX_2026/NAAC_File_Management_SYS/frontend/src/pages/hod/TeacherList.jsx',
  'b:/TY Project/InnovateX_2026/NAAC_File_Management_SYS/frontend/src/pages/teacher/CriteriaOverview.jsx',
  'b:/TY Project/InnovateX_2026/NAAC_File_Management_SYS/frontend/src/pages/teacher/CriterionPage.jsx',
  'b:/TY Project/InnovateX_2026/NAAC_File_Management_SYS/frontend/src/pages/teacher/Dashboard.jsx',
  'b:/TY Project/InnovateX_2026/NAAC_File_Management_SYS/frontend/src/pages/teacher/Documents.jsx',
  'b:/TY Project/InnovateX_2026/NAAC_File_Management_SYS/frontend/src/pages/teacher/ExportPage.jsx',
  'b:/TY Project/InnovateX_2026/NAAC_File_Management_SYS/frontend/src/pages/teacher/SubCriterionForm.jsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Also replace length - 2 just in case it was missed (like in TeacherDetail)
  content = content.replace(
    /useState\(\s*qp\.get\('year'\)\s*\|\|\s*ACADEMIC_YEARS\[ACADEMIC_YEARS\.length\s*-\s*2\]\s*\)/g,
    "useState(() => qp.get('year') || localStorage.getItem('naac_academic_year') || ACADEMIC_YEARS[ACADEMIC_YEARS.length - 1])"
  );
  
  // Replace the old localStorage key with a new one to force the default to 2026-27 for everyone
  content = content.replace(/selectedAcademicYear/g, 'naac_academic_year');

  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
}
