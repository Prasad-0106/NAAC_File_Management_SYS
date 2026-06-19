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

  // Replace default state
  content = content.replace(
    /useState\(\s*params\.get\('year'\)\s*\|\|\s*ACADEMIC_YEARS\[ACADEMIC_YEARS\.length\s*-\s*2\]\s*\)/g,
    "useState(() => params.get('year') || localStorage.getItem('selectedAcademicYear') || ACADEMIC_YEARS[ACADEMIC_YEARS.length - 1])"
  );
  content = content.replace(
    /useState\(\s*ACADEMIC_YEARS\[ACADEMIC_YEARS\.length\s*-\s*2\]\s*\)/g,
    "useState(() => localStorage.getItem('selectedAcademicYear') || ACADEMIC_YEARS[ACADEMIC_YEARS.length - 1])"
  );

  // Replace onChange setYear
  content = content.replace(
    /onChange=\{e\s*=>\s*setYear\(e\.target\.value\)\}/g,
    "onChange={e => { setYear(e.target.value); localStorage.setItem('selectedAcademicYear', e.target.value); }}"
  );
  content = content.replace(
    /onChange=\{\(e\)\s*=>\s*setYear\(e\.target\.value\)\}/g,
    "onChange={(e) => { setYear(e.target.value); localStorage.setItem('selectedAcademicYear', e.target.value); }}"
  );

  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
}
