const ExcelJS = require('exceljs');
const db = require('../db/database');
const { NAAC_CRITERIA } = require('./naacData');

const CRITERION_MARKS = { '1': 100, '2': 350, '3': 120, '4': 100, '5': 130, '6': 100, '7': 100 };

async function generateTeacherExcel(userId, academicYear) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'NAAC File Management System';
  workbook.created = new Date();

  const user = db.prepare('SELECT * FROM users WHERE id=?').get(userId);
  const allData = {};
  const rows = db.prepare(`SELECT criterion_no, sub_criterion, field_name, field_value FROM criteria_data WHERE user_id=? AND academic_year=?`).all(userId, academicYear);
  rows.forEach(r => {
    if (!allData[r.criterion_no]) allData[r.criterion_no] = {};
    if (!allData[r.criterion_no][r.sub_criterion]) allData[r.criterion_no][r.sub_criterion] = {};
    allData[r.criterion_no][r.sub_criterion][r.field_name] = r.field_value;
  });

  // Summary sheet
  const summary = workbook.addWorksheet('Summary');
  summary.mergeCells('A1:D1');
  summary.getCell('A1').value = `NAAC Self-Study Report — ${user.name} — ${academicYear}`;
  summary.getCell('A1').font = { bold: true, size: 14 };
  summary.getCell('A1').alignment = { horizontal: 'center' };
  summary.getRow(2).values = ['Criterion', 'Title', 'Max Marks', 'Status'];
  summary.getRow(2).font = { bold: true };
  summary.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
  summary.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  NAAC_CRITERIA.forEach((c, i) => {
    const filledCount = allData[c.no] ? Object.keys(allData[c.no]).length : 0;
    const totalSub = c.subCriteria.length;
    const status = filledCount === 0 ? 'Not Started' : filledCount < totalSub ? 'In Progress' : 'Completed';
    const row = summary.addRow([`Criterion ${c.no}`, c.title, CRITERION_MARKS[c.no] || 100, status]);
    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? 'FFE8F0FE' : 'FFFFFFFF' } };
  });
  summary.columns = [{ width: 16 }, { width: 45 }, { width: 12 }, { width: 18 }];
  summary.views = [{ state: 'frozen', ySplit: 2 }];

  // One sheet per criterion
  for (const criterion of NAAC_CRITERIA) {
    const ws = workbook.addWorksheet(`C${criterion.no}`);
    ws.mergeCells('A1:D1');
    ws.getCell('A1').value = `Criterion ${criterion.no}: ${criterion.title} (${CRITERION_MARKS[criterion.no] || 100} marks)`;
    ws.getCell('A1').font = { bold: true, size: 12 };
    ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    ws.getCell('A1').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    ws.getCell('A1').alignment = { horizontal: 'center' };

    ws.getRow(2).values = ['Field Name', 'Value', 'Supporting Document', 'Status'];
    ws.getRow(2).font = { bold: true };
    ws.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E5090' } };
    ws.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    let rowIdx = 3;
    for (const sub of criterion.subCriteria) {
      const subRow = ws.getRow(rowIdx++);
      subRow.values = [`${sub.code}: ${sub.title}`, '', '', ''];
      subRow.font = { bold: true, italic: true };
      subRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCFD8DC' } };
      ws.mergeCells(`A${rowIdx - 1}:D${rowIdx - 1}`);

      const subData = allData[criterion.no]?.[sub.code] || {};
      const docs = db.prepare(`SELECT original_name, status FROM documents WHERE user_id=? AND academic_year=? AND criterion_no=? AND sub_criterion=?`).all(userId, academicYear, criterion.no, sub.code);

      for (const field of sub.fields) {
        const val = subData[field.name] || '';
        const docNames = docs.map(d => d.original_name).join(', ') || '';
        const status = docs[0]?.status || '';
        const dataRow = ws.addRow([field.label || field.name, val, docNames, status]);
        dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowIdx % 2 === 0 ? 'FFE8F0FE' : 'FFFFFFFF' } };
        rowIdx++;
      }
    }
    ws.columns = [{ width: 40 }, { width: 35 }, { width: 35 }, { width: 15 }];
    ws.views = [{ state: 'frozen', ySplit: 2 }];
  }

  // Document index sheet
  const docSheet = workbook.addWorksheet('Document Index');
  docSheet.getRow(1).values = ['File Name', 'Criterion', 'Sub-Criterion', 'Upload Date', 'Status'];
  docSheet.getRow(1).font = { bold: true };
  docSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
  docSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  const docs = db.prepare(`SELECT * FROM documents WHERE user_id=? AND academic_year=? ORDER BY upload_date`).all(userId, academicYear);
  docs.forEach((d, i) => {
    const r = docSheet.addRow([d.original_name, `Criterion ${d.criterion_no}`, d.sub_criterion, d.upload_date?.substring(0, 10), d.status]);
    r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? 'FFE8F0FE' : 'FFFFFFFF' } };
  });
  docSheet.columns = [{ width: 40 }, { width: 15 }, { width: 20 }, { width: 15 }, { width: 15 }];

  return workbook;
}

async function generateConsolidatedExcel(academicYear) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'NAAC File Management System';
  workbook.created = new Date();

  const teachers = db.prepare(`SELECT * FROM users WHERE role='teacher' ORDER BY department, name`).all();
  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
  const headerFont = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Summary sheet
  const summary = workbook.addWorksheet('Summary');
  summary.mergeCells('A1:G1');
  summary.getCell('A1').value = `NAAC Consolidated Report — Academic Year: ${academicYear}`;
  summary.getCell('A1').font = { bold: true, size: 14 };
  summary.getCell('A1').alignment = { horizontal: 'center' };
  summary.getRow(2).values = ['Teacher', 'Department', 'Email', 'Filled Sub-Criteria', 'Total Documents', 'Verification Status', 'Last Activity'];
  summary.getRow(2).fill = headerFill;
  summary.getRow(2).font = headerFont;

  teachers.forEach((t, i) => {
    const filledCount = db.prepare(`SELECT COUNT(DISTINCT criterion_no || sub_criterion) as cnt FROM criteria_data WHERE user_id=? AND academic_year=?`).get(t.id, academicYear)?.cnt || 0;
    const docCount = db.prepare(`SELECT COUNT(*) as cnt FROM documents WHERE user_id=? AND academic_year=?`).get(t.id, academicYear)?.cnt || 0;
    const lastActivity = db.prepare(`SELECT MAX(updated_at) as last FROM criteria_data WHERE user_id=? AND academic_year=?`).get(t.id, academicYear)?.last || 'N/A';
    const verif = db.prepare(`SELECT status FROM verifications WHERE teacher_id=? AND academic_year=? ORDER BY reviewed_at DESC LIMIT 1`).get(t.id, academicYear);
    const r = summary.addRow([t.name, t.department || 'N/A', t.email, filledCount, docCount, verif?.status || 'Pending', lastActivity?.substring(0, 10) || 'N/A']);
    r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? 'FFE8F0FE' : 'FFFFFFFF' } };
  });
  summary.columns = [{ width: 28 }, { width: 22 }, { width: 32 }, { width: 20 }, { width: 18 }, { width: 22 }, { width: 18 }];
  summary.views = [{ state: 'frozen', ySplit: 2 }];

  // One sheet per criterion with all teachers
  for (const criterion of NAAC_CRITERIA) {
    const ws = workbook.addWorksheet(`C${criterion.no} - All`);
    ws.mergeCells('A1:E1');
    ws.getCell('A1').value = `Criterion ${criterion.no}: ${criterion.title} — All Teachers — ${academicYear}`;
    ws.getCell('A1').fill = headerFill;
    ws.getCell('A1').font = { ...headerFont, size: 12 };
    ws.getCell('A1').alignment = { horizontal: 'center' };

    const headers = ['Teacher', 'Department', 'Sub-Criterion', 'Field', 'Value'];
    ws.getRow(2).values = headers;
    ws.getRow(2).fill = headerFill;
    ws.getRow(2).font = headerFont;

    let rowIdx = 3;
    for (const t of teachers) {
      for (const sub of criterion.subCriteria) {
        const dataRows = db.prepare(`SELECT field_name, field_value FROM criteria_data WHERE user_id=? AND academic_year=? AND criterion_no=? AND sub_criterion=?`).all(t.id, academicYear, criterion.no, sub.code);
        if (dataRows.length === 0) continue;
        dataRows.forEach(d => {
          const r = ws.addRow([t.name, t.department || 'N/A', sub.code, d.field_name, d.field_value]);
          r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowIdx % 2 === 0 ? 'FFE8F0FE' : 'FFFFFFFF' } };
          rowIdx++;
        });
      }
    }
    ws.columns = [{ width: 28 }, { width: 22 }, { width: 15 }, { width: 35 }, { width: 35 }];
    ws.views = [{ state: 'frozen', ySplit: 2 }];
  }

  // Document index — all teachers
  const docSheet = workbook.addWorksheet('All Documents');
  docSheet.getRow(1).values = ['Teacher', 'Department', 'File Name', 'Criterion', 'Sub-Criterion', 'Upload Date', 'Status'];
  docSheet.getRow(1).fill = headerFill;
  docSheet.getRow(1).font = headerFont;
  const allDocs = db.prepare(`
    SELECT d.*, u.name as teacher_name, u.department
    FROM documents d JOIN users u ON u.id=d.user_id
    WHERE d.academic_year=? ORDER BY u.name, d.criterion_no, d.sub_criterion
  `).all(academicYear);
  allDocs.forEach((d, i) => {
    const r = docSheet.addRow([d.teacher_name, d.department || 'N/A', d.original_name, `Criterion ${d.criterion_no}`, d.sub_criterion, d.upload_date?.substring(0, 10), d.status]);
    r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? 'FFE8F0FE' : 'FFFFFFFF' } };
  });
  docSheet.columns = [{ width: 28 }, { width: 22 }, { width: 38 }, { width: 15 }, { width: 18 }, { width: 15 }, { width: 15 }];

  return workbook;
}

module.exports = { generateTeacherExcel, generateConsolidatedExcel };
