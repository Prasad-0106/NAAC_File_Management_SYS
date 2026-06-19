const ExcelJS = require('exceljs');
const axios = require('axios'); // For downloading signature images

const CRITERION_MARKS = { '1': 100, '2': 350, '3': 120, '4': 100, '5': 130, '6': 100, '7': 100 };

const borderStyle = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' }
};

async function generateTeacherExcel(user, academicYear, allData, docs, NAAC_CRITERIA, verification) {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'NAAC File Management System';
    workbook.created = new Date();

    const today = new Date().toLocaleDateString('en-IN');
    const status = verification?.status || 'Pending';

    // Single Worksheet
    const ws = workbook.addWorksheet('NAAC Report');
    ws.columns = [{ width: 45 }, { width: 40 }, { width: 40 }, { width: 15 }];

    // 1. Cover Page Details
    ws.mergeCells('A2:C2');
    ws.getCell('A2').value = 'NAAC Self-Study Report';
    ws.getCell('A2').font = { bold: true, size: 20, color: { argb: 'FF1E3A5F' } };
    ws.getCell('A2').alignment = { horizontal: 'center' };

    ws.mergeCells('A4:C4');
    ws.getCell('A4').value = user?.name || 'Unknown';
    ws.getCell('A4').font = { bold: true, size: 16 };
    ws.getCell('A4').alignment = { horizontal: 'center' };

    ws.mergeCells('A5:C5');
    ws.getCell('A5').value = `${user?.designation || 'Lecturer'} — ${user?.department || 'Information Technology'}`;
    ws.getCell('A5').font = { size: 12 };
    ws.getCell('A5').alignment = { horizontal: 'center' };

    ws.mergeCells('A6:C6');
    ws.getCell('A6').value = `Qualification: ${user?.qualification || '—'} | Experience: ${user?.experience || '0'} years`;
    ws.getCell('A6').font = { size: 12 };
    ws.getCell('A6').alignment = { horizontal: 'center' };

    ws.mergeCells('A8:C8');
    ws.getCell('A8').value = `Academic Year: ${academicYear}`;
    ws.getCell('A8').font = { bold: true, size: 12 };
    ws.getCell('A8').alignment = { horizontal: 'center' };

    ws.mergeCells('A9:C9');
    ws.getCell('A9').value = `Generated: ${today}`;
    ws.getCell('A9').font = { size: 12 };
    ws.getCell('A9').alignment = { horizontal: 'center' };

    ws.mergeCells('A11:C11');
    ws.getCell('A11').value = `Status: ${status}`;
    ws.getCell('A11').font = { bold: true, size: 12, color: { argb: status === 'Verified' ? 'FF008000' : status === 'Needs Revision' ? 'FFFFA500' : 'FF666666' } };
    ws.getCell('A11').alignment = { horizontal: 'center' };

    let rowIdx = 13;

    // 2. Criteria Data
    for (const criterion of NAAC_CRITERIA) {
      ws.mergeCells(`A${rowIdx}:C${rowIdx}`);
      const titleCell = ws.getCell(`A${rowIdx}`);
      titleCell.value = `Criterion ${criterion.no}: ${criterion.title} (${CRITERION_MARKS[criterion.no] || 100} Marks)`;
      titleCell.font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
      titleCell.border = { bottom: { style: 'medium', color: { argb: 'FF1E3A5F' } } };
      rowIdx++;
      
      for (const sub of criterion.subCriteria) {
        const subTitleRow = ws.getRow(rowIdx++);
        subTitleRow.values = [`${sub.code}: ${sub.title}`];
        subTitleRow.font = { bold: true, size: 12, color: { argb: 'FF2E5090' } };
        ws.mergeCells(`A${rowIdx - 1}:C${rowIdx - 1}`);

        const headerRow = ws.getRow(rowIdx++);
        headerRow.values = ['Field', 'Value', 'Documents'];
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
        for (let i = 1; i <= 3; i++) {
          headerRow.getCell(i).border = borderStyle;
        }

        const subData = allData[criterion.no]?.[sub.code] || {};
        const subDocs = docs.filter(d => d.criterion_no === criterion.no && d.sub_criterion === sub.code);

        sub.fields.filter(f => f.type !== 'file').forEach((field, fIdx) => {
          const val = subData[field.name] || '—';
          const docNames = subDocs.map(d => d.original_name).join(', ') || '—';
          const dataRow = ws.getRow(rowIdx++);
          dataRow.values = [field.label || field.name, val, docNames];
          for (let i = 1; i <= 3; i++) {
            const cell = dataRow.getCell(i);
            cell.border = borderStyle;
            cell.alignment = { wrapText: true, vertical: 'top' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fIdx % 2 === 0 ? 'FFF9FBFF' : 'FFFFFFFF' } };
          }
        });
        
        rowIdx++; // empty row between subcriteria
      }
      rowIdx++; // empty row between criteria
    }

    // 3. Signature
    if (verification?.status === 'Verified') {
      const sigRow = ws.getRow(rowIdx);
      sigRow.getCell(3).value = 'VERIFIED BY HOD';
      sigRow.getCell(3).font = { bold: true, color: { argb: 'FF1E3A5F' } };
      sigRow.getCell(3).alignment = { horizontal: 'right' };
      
      const dateRow = ws.getRow(rowIdx + 1);
      const revDate = verification.reviewed_at ? new Date(verification.reviewed_at).toLocaleDateString('en-IN') : today;
      dateRow.getCell(3).value = `Date: ${revDate}`;
      dateRow.getCell(3).font = { italic: true, size: 10 };
      dateRow.getCell(3).alignment = { horizontal: 'right' };

      if (user.signature_url) {
        try {
          const response = await axios.get(user.signature_url, { responseType: 'arraybuffer' });
          const imageId = workbook.addImage({ buffer: Buffer.from(response.data), extension: 'png' });
          ws.addImage(imageId, { tl: { col: 0, row: rowIdx - 1 }, ext: { width: 150, height: 60 } });
          ws.getCell(`A${rowIdx}`).value = 'Teacher Signature:';
          ws.getCell(`A${rowIdx}`).font = { italic: true };
        } catch (e) { console.error('Failed to add teacher signature image:', e.message); }
      }

      if (verification?.hod_id?.signature_url) {
        try {
          const response = await axios.get(verification.hod_id.signature_url, { responseType: 'arraybuffer' });
          const imageId = workbook.addImage({ buffer: Buffer.from(response.data), extension: 'png' });
          ws.addImage(imageId, { tl: { col: 2, row: rowIdx - 1 }, ext: { width: 150, height: 60 } });
        } catch (e) { console.error('Failed to add HOD signature image:', e.message); }
      }

      ws.getCell(`C${rowIdx}:C${rowIdx}`).border = { bottom: { style: 'medium', color: { argb: 'FF1E3A5F' } } };
      rowIdx += 3;
    }

    // 4. Summary Table
    rowIdx += 2;
    ws.mergeCells(`A${rowIdx}:D${rowIdx}`);
    ws.getCell(`A${rowIdx}`).value = 'Summary';
    ws.getCell(`A${rowIdx}`).font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
    ws.getCell(`A${rowIdx}`).border = { bottom: { style: 'medium', color: { argb: 'FF1E3A5F' } } };
    rowIdx++;

    const summaryHeaderRow = ws.getRow(rowIdx++);
    summaryHeaderRow.values = ['Criterion', 'Title', 'Marks', 'Fields Filled'];
    summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summaryHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    for(let i=1; i<=4; i++) {
        summaryHeaderRow.getCell(i).border = borderStyle;
    }

    NAAC_CRITERIA.forEach((c, i) => {
      let filled = 0, total = 0;
      if (c.subCriteria) {
        c.subCriteria.forEach(sub => {
          if (sub.fields) {
            sub.fields.filter(f => f.required && f.type !== 'file').forEach(f => {
              total++;
              if (allData[c.no]?.[sub.code]?.[f.name]) filled++;
            });
          }
        });
      }
      
      const row = ws.getRow(rowIdx++);
      row.values = [`Criterion ${c.no}`, c.title || '', CRITERION_MARKS[c.no] || 100, `${filled}/${total}`];
      for(let j=1; j<=4; j++) {
        const cell = row.getCell(j);
        cell.border = borderStyle;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? 'FFF9FBFF' : 'FFFFFFFF' } };
      }
    });

    return await workbook.xlsx.writeBuffer();
  } catch (err) {
    throw new Error(`Excel Generation Error: ${err.message}`);
  }
}

async function generateConsolidatedExcel(teachers, academicYear, criteriaByTeacher, allDocs, NAAC_CRITERIA, allVerifications) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'NAAC File Management System';
  workbook.created = new Date();

  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
  const headerFont = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Single sheet
  const summary = workbook.addWorksheet('Consolidated Report');
  
  // Set columns that compromise between summary and criteria tables
  summary.columns = [
    { width: 30 }, // A: Teacher Name / Staff Member
    { width: 25 }, // B: Department
    { width: 35 }, // C: Email Address / Metric Code
    { width: 45 }, // D: Metrics Filled / Metric Description
    { width: 45 }, // E: Total Files / Data Response
    { width: 15 }  // F: Overall Status
  ];

  summary.mergeCells('A1:F1');
  summary.getCell('A1').value = `NAAC Consolidated Report — Academic Year: ${academicYear}`;
  summary.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  summary.getCell('A1').fill = headerFill;
  summary.getCell('A1').alignment = { horizontal: 'center' };

  const summaryHeader = summary.getRow(2);
  summaryHeader.values = ['Teacher Name', 'Department', 'Email Address', 'Metrics Filled', 'Total Files', 'Overall Status'];
  summaryHeader.fill = headerFill;
  summaryHeader.font = headerFont;
  for (let i = 1; i <= 6; i++) {
    summaryHeader.getCell(i).border = borderStyle;
  }

  let rowIdx = 3;
  teachers.forEach((t, i) => {
    let filledCount = 0;
    if (criteriaByTeacher[t._id]) {
        Object.keys(criteriaByTeacher[t._id]).forEach(crit => {
            filledCount += Object.keys(criteriaByTeacher[t._id][crit]).length;
        });
    }
    const docCount = allDocs.filter(d => d.user_id && d.user_id._id.toString() === t._id.toString()).length;
    
    // Get latest verification status for this teacher
    const verif = allVerifications
        .filter(v => v.teacher_id.toString() === t._id.toString())
        .sort((a,b) => new Date(b.reviewed_at) - new Date(a.reviewed_at))[0];
    const status = verif ? verif.status : 'Pending';

    const r = summary.getRow(rowIdx++);
    r.values = [t.name, t.department || 'N/A', t.email, filledCount, docCount, status];
    for (let j = 1; j <= 6; j++) {
      const cell = r.getCell(j);
      cell.border = borderStyle;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? 'FFE8F0FE' : 'FFFFFFFF' } };
    }
  });

  rowIdx += 2; // Leave some space between summary and criteria details

  // Combine all criteria in the same sheet
  for (const criterion of NAAC_CRITERIA) {
    // 1. Check if ANY teacher has data for this criterion
    let criterionHasData = false;
    for (const t of teachers) {
       if (criteriaByTeacher[t._id]?.[criterion.no] && Object.keys(criteriaByTeacher[t._id][criterion.no]).length > 0) {
           criterionHasData = true;
           break;
       }
    }

    if (!criterionHasData) continue; // Skip empty criteria sections

    summary.mergeCells(`A${rowIdx}:E${rowIdx}`);
    const wsTitle = summary.getCell(`A${rowIdx}`);
    wsTitle.value = `Criterion ${criterion.no}: ${criterion.title} — All Staff — ${academicYear}`;
    wsTitle.fill = headerFill;
    wsTitle.font = { ...headerFont, size: 12 };
    wsTitle.alignment = { horizontal: 'center' };
    rowIdx++;

    const headers = ['Staff Member', 'Department', 'Metric Code', 'Metric Description', 'Data Response'];
    const row2 = summary.getRow(rowIdx++);
    row2.values = headers;
    row2.fill = headerFill;
    row2.font = headerFont;
    for (let i = 1; i <= 5; i++) {
      row2.getCell(i).border = borderStyle;
    }

    let bgToggle = 0; // Group background color by teacher

    for (const t of teachers) {
      const tCritData = criteriaByTeacher[t._id]?.[criterion.no];
      if (!tCritData || Object.keys(tCritData).length === 0) continue;

      bgToggle++;
      const rowColor = bgToggle % 2 === 0 ? 'FFF9FBFF' : 'FFFFFFFF';
      
      let isFirstRowForTeacher = true;

      for (const sub of criterion.subCriteria) {
        const subData = tCritData[sub.code];
        if (!subData) continue;
        
        // Lookup proper labels for fields
        const fieldsLookup = {};
        if (sub.fields) {
           sub.fields.forEach(f => fieldsLookup[f.name] = f.label || f.name);
        }

        Object.keys(subData).forEach(fieldName => {
            const r = summary.getRow(rowIdx++);
            
            // Print Name & Dept only once per teacher block
            const nameToPrint = isFirstRowForTeacher ? t.name : '';
            const deptToPrint = isFirstRowForTeacher ? (t.department || 'N/A') : '';
            isFirstRowForTeacher = false;

            // Use human-readable field name
            const niceFieldName = fieldsLookup[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            r.values = [nameToPrint, deptToPrint, sub.code, niceFieldName, subData[fieldName]];
            for (let i = 1; i <= 5; i++) {
              const cell = r.getCell(i);
              cell.border = borderStyle;
              cell.alignment = { wrapText: true, vertical: 'top' };
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowColor } };
            }
        });
      }
    }
    rowIdx++; // Space between criteria
  }

  return workbook.xlsx.writeBuffer();
}

module.exports = { generateTeacherExcel, generateConsolidatedExcel };
