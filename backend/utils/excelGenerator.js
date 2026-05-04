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

    const summary = workbook.addWorksheet('Summary');
    summary.mergeCells('A1:F1');
    summary.getCell('A1').value = `NAAC Self-Study Report — ${user?.name || 'Unknown'} — ${academicYear}`;
    summary.getCell('A1').font = { bold: true, size: 14 };
    summary.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    
    const headerRow = summary.getRow(2);
    headerRow.values = ['Criterion', 'Title', 'Max Marks', 'Fields Filled', 'Progress %', 'HOD Status'];
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    headerRow.alignment = { horizontal: 'center' };
    headerRow.eachCell(cell => cell.border = borderStyle);

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
      
      const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
      const status = verification?.status || 'Pending';
      const row = summary.addRow([`Criterion ${c.no}`, c.title || '', CRITERION_MARKS[c.no] || 100, `${filled}/${total}`, `${pct}%`, status]);
      row.eachCell((cell, colNumber) => {
        cell.border = borderStyle;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? 'FFE8F0FE' : 'FFFFFFFF' } };
        if (colNumber === 6) {
          cell.font = { bold: true, color: { argb: status === 'Verified' ? 'FF008000' : status === 'Needs Revision' ? 'FFFF0000' : 'FF666666' } };
        }
      });
    });
    summary.columns = [{ width: 16 }, { width: 50 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 20 }];
    summary.views = [{ state: 'frozen', ySplit: 2 }];

    for (const criterion of NAAC_CRITERIA) {
      const ws = workbook.addWorksheet(`Criterion ${criterion.no}`);
      ws.mergeCells('A1:D1');
      const titleCell = ws.getCell('A1');
      titleCell.value = `Criterion ${criterion.no}: ${criterion.title} (${CRITERION_MARKS[criterion.no] || 100} marks)`;
      titleCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      const subHeader = ws.getRow(2);
      subHeader.values = ['Field Description', 'Data Value', 'Supporting Documents', 'Verification Status'];
      subHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      subHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E5090' } };
      subHeader.eachCell(cell => cell.border = borderStyle);

      let rowIdx = 3;
      for (const sub of criterion.subCriteria) {
        const subTitleRow = ws.getRow(rowIdx++);
        subTitleRow.values = [`${sub.code}: ${sub.title}`, '', '', ''];
        subTitleRow.font = { bold: true, italic: true };
        subTitleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCFD8DC' } };
        ws.mergeCells(`A${rowIdx - 1}:D${rowIdx - 1}`);
        subTitleRow.eachCell(cell => cell.border = borderStyle);

        const subData = allData[criterion.no]?.[sub.code] || {};
        const subDocs = docs.filter(d => d.criterion_no === criterion.no && d.sub_criterion === sub.code);

        for (const field of sub.fields) {
          const val = subData[field.name] || 'Not Entered';
          const docNames = subDocs.map(d => d.original_name).join(', ') || 'No Documents';
          const status = subDocs[0]?.status || 'Pending';
          const dataRow = ws.addRow([field.label || field.name, val, docNames, status]);
          dataRow.eachCell(cell => {
            cell.border = borderStyle;
            cell.alignment = { wrapText: true, vertical: 'top' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowIdx % 2 === 0 ? 'FFF9FBFF' : 'FFFFFFFF' } };
          });
          rowIdx++;
        }
      }
      ws.columns = [{ width: 45 }, { width: 40 }, { width: 40 }, { width: 18 }];

      if (verification?.status === 'Verified') {
        rowIdx += 2;
        const sigRow = ws.getRow(rowIdx);
        sigRow.getCell(3).value = 'VERIFIED BY HOD';
        sigRow.getCell(3).font = { bold: true, color: { argb: 'FF1E3A5F' } };
        sigRow.getCell(3).alignment = { horizontal: 'right' };
        
        const dateRow = ws.getRow(rowIdx + 1);
        const revDate = verification.reviewed_at ? new Date(verification.reviewed_at).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
        dateRow.getCell(3).value = `Date: ${revDate}`;
        dateRow.getCell(3).font = { italic: true, size: 10 };
        dateRow.getCell(3).alignment = { horizontal: 'right' };

        // Add Teacher Signature if available
        if (user.signature_url) {
          try {
            const response = await axios.get(user.signature_url, { responseType: 'arraybuffer' });
            const imageId = workbook.addImage({
              buffer: Buffer.from(response.data),
              extension: 'png',
            });
            ws.addImage(imageId, {
              tl: { col: 0, row: rowIdx - 1 },
              ext: { width: 150, height: 60 }
            });
            ws.getCell(`A${rowIdx}`).value = 'Teacher Signature:';
            ws.getCell(`A${rowIdx}`).font = { italic: true };
          } catch (e) {
            console.error('Failed to add signature image to Excel:', e.message);
          }
        }

        ws.getCell(`C${rowIdx}:D${rowIdx}`).border = { bottom: { style: 'medium', color: { argb: 'FF1E3A5F' } } };
      }
      ws.views = [{ state: 'frozen', ySplit: 2 }];
    }

    const docSheet = workbook.addWorksheet('Document Inventory');
    docSheet.getRow(1).values = ['File Name', 'Criterion Ref', 'Sub-Criterion', 'Upload Date', 'Status'];
    docSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    docSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    docSheet.getRow(1).eachCell(cell => cell.border = borderStyle);
    
    docs.sort((a,b) => new Date(a.upload_date) - new Date(b.upload_date)).forEach((d, i) => {
      let formattedDate = 'N/A';
      if (d.upload_date) {
        const dateObj = new Date(d.upload_date);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toISOString().substring(0, 10);
        }
      }
      const r = docSheet.addRow([d.original_name, `Criterion ${d.criterion_no}`, d.sub_criterion, formattedDate, d.status]);
      r.eachCell(cell => {
        cell.border = borderStyle;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? 'FFE8F0FE' : 'FFFFFFFF' } };
      });
    });
    docSheet.columns = [{ width: 40 }, { width: 15 }, { width: 20 }, { width: 15 }, { width: 15 }];

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

  // Summary sheet
  const summary = workbook.addWorksheet('Consolidated Summary');
  summary.mergeCells('A1:F1');
  summary.getCell('A1').value = `NAAC Consolidated Report — Academic Year: ${academicYear}`;
  summary.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  summary.getCell('A1').fill = headerFill;
  summary.getCell('A1').alignment = { horizontal: 'center' };

  const summaryHeader = summary.getRow(2);
  summaryHeader.values = ['Teacher Name', 'Department', 'Email Address', 'Metrics Filled', 'Total Files', 'Overall Status'];
  summaryHeader.fill = headerFill;
  summaryHeader.font = headerFont;
  summaryHeader.eachCell(cell => cell.border = borderStyle);

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

    const r = summary.addRow([t.name, t.department || 'N/A', t.email, filledCount, docCount, status]);
    r.eachCell(cell => {
      cell.border = borderStyle;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? 'FFE8F0FE' : 'FFFFFFFF' } };
    });
  });
  summary.columns = [{ width: 30 }, { width: 25 }, { width: 35 }, { width: 15 }, { width: 15 }, { width: 15 }];
  summary.views = [{ state: 'frozen', ySplit: 2 }];

  // One sheet per criterion with all teachers
  for (const criterion of NAAC_CRITERIA) {
    const ws = workbook.addWorksheet(`C${criterion.no} - Combined`);
    ws.mergeCells('A1:E1');
    const wsTitle = ws.getCell('A1');
    wsTitle.value = `Criterion ${criterion.no}: ${criterion.title} — All Staff — ${academicYear}`;
    wsTitle.fill = headerFill;
    wsTitle.font = { ...headerFont, size: 12 };
    wsTitle.alignment = { horizontal: 'center' };

    const headers = ['Staff Member', 'Department', 'Metric Code', 'Metric Description', 'Data Response'];
    const row2 = ws.getRow(2);
    row2.values = headers;
    row2.fill = headerFill;
    row2.font = headerFont;
    row2.eachCell(cell => cell.border = borderStyle);

    let rowIdx = 3;
    for (const t of teachers) {
      for (const sub of criterion.subCriteria) {
        const subData = criteriaByTeacher[t._id]?.[criterion.no]?.[sub.code];
        if (!subData) continue;
        
        Object.keys(subData).forEach(fieldName => {
            const r = ws.addRow([t.name, t.department || 'N/A', sub.code, fieldName, subData[fieldName]]);
            r.eachCell(cell => {
              cell.border = borderStyle;
              cell.alignment = { wrapText: true, vertical: 'top' };
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowIdx % 2 === 0 ? 'FFF9FBFF' : 'FFFFFFFF' } };
            });
            rowIdx++;
        });
      }
    }
    ws.columns = [
      { width: 30 }, 
      { width: 25 }, 
      { width: 15 }, 
      { width: 45 }, 
      { width: 45 }
    ];
    ws.views = [{ state: 'frozen', ySplit: 2 }];
  }

  return workbook.xlsx.writeBuffer();
}

module.exports = { generateTeacherExcel, generateConsolidatedExcel };
