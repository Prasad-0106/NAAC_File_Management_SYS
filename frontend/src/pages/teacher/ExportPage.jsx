import { useState } from 'react';
import { ACADEMIC_YEARS } from '../../data/naacCriteria';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Download, Printer, FileText, BarChart3, CheckCircle2, Info } from 'lucide-react';

export default function ExportPage() {
  const { user } = useAuth();
  const [year, setYear] = useState(() => localStorage.getItem('naac_academic_year') || ACADEMIC_YEARS[ACADEMIC_YEARS.length - 1]);
  const [loading, setLoading] = useState({ excel: false, pdf: false });

  const exportExcel = async () => {
    setLoading(p => ({ ...p, excel: true }));
    try {
      const res = await api.get(`/export/excel/${year}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = user.name.replace(/[^a-zA-Z0-9]/g, '_');
      link.setAttribute('download', `NAAC_Report_${safeName}_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) { alert('Export failed: ' + e.message); }
    finally { setLoading(p => ({ ...p, excel: false })); }
  };

  const exportPDF = async () => {
    setLoading(p => ({ ...p, pdf: true }));
    try {
      const r = await api.get(`/export/pdf-data/${year}`);
      const data = r.data;
      // Use browser print for PDF
      const win = window.open('', '_blank');
      const html = buildPDFHtml(data);
      win.document.write(html);
      win.document.close();
      win.onload = () => { win.focus(); win.print(); };
    } catch (e) { alert('PDF export failed: ' + e.message); }
    finally { setLoading(p => ({ ...p, pdf: false })); }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <h1><Download size={24} style={{ verticalAlign:'middle', marginRight:'0.5rem' }} /> Export Report</h1>
        <p>Generate your NAAC data as Excel or PDF for submission</p>
      </div>

      <div className="form-group" style={{ marginBottom:'1.5rem' }}>
        <label className="form-label">Academic Year</label>
        <select className="select" style={{ width:'auto' }} value={year} onChange={e => { setYear(e.target.value); localStorage.setItem('naac_academic_year', e.target.value); }}>
          {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid-2">
        <div className="card" style={{ textAlign:'center' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'0.75rem' }}>
            <BarChart3 size={48} color="var(--success)" />
          </div>
          <h3>Excel Export</h3>
          <p style={{ fontSize:'0.85rem', margin:'0.5rem 0 1.25rem' }}>
            Generates a structured workbook with summary sheet + 7 criteria sheets + document index, ready for NAAC submission
          </p>
          <button className="btn btn-success btn-full" onClick={exportExcel} disabled={loading.excel}>
            {loading.excel ? '⏳ Generating...' : '⬇️ Download Excel (.xlsx)'}
          </button>
        </div>
        <div className="card" style={{ textAlign:'center' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'0.75rem' }}>
            <FileText size={48} color="var(--primary)" />
          </div>
          <h3>PDF Export</h3>
          <p style={{ fontSize:'0.85rem', margin:'0.5rem 0 1.25rem' }}>
            Generates a printable PDF report with cover page, all criteria data, document list, and summary table
          </p>
          <button className="btn btn-primary btn-full" onClick={exportPDF} disabled={loading.pdf}>
            {loading.pdf ? '⏳ Generating...' : '🖨️ Export as PDF'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop:'1.5rem' }}>
        <h3 style={{ marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <Info size={20} color="var(--accent)" /> Export Includes
        </h3>
        <ul style={{ color:'var(--text-secondary)', fontSize:'0.875rem', paddingLeft:'1.25rem', display:'flex', flexDirection:'column', gap:'0.375rem', listStyle:'none' }}>
          <li style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}><CheckCircle2 size={14} color="var(--success)" /> Cover page with teacher & department details</li>
          <li style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}><CheckCircle2 size={14} color="var(--success)" /> All 7 NAAC criteria with field-by-field data</li>
          <li style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}><CheckCircle2 size={14} color="var(--success)" /> Uploaded documents list with dates and status</li>
          <li style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}><CheckCircle2 size={14} color="var(--success)" /> Summary table with completion % per criterion</li>
          <li style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}><CheckCircle2 size={14} color="var(--success)" /> Export date, academic year, and page numbers</li>
        </ul>
      </div>
    </div>
  );
}

function buildPDFHtml(data) {
  const { user, criteria, academicYear, documents, verificationStatus } = data;
  const today = new Date().toLocaleDateString('en-IN');
  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>NAAC Report</title>
  <style>
    .watermark { margin-top: 20px; text-align: right; page-break-inside: avoid; }
    .watermark img { max-width: 150px; height: auto; border-bottom: 1px solid #1e3a5f; }
    .watermark p { font-size: 11px; color: #1e3a5f; margin: 4px 0 0 0; font-weight: bold; }
    .cover { text-align: center; padding: 60px 40px; border-bottom: 3px solid #1e3a5f; }
    .cover h1 { font-size: 24px; color: #1e3a5f; margin-bottom: 8px; }
    .cover h2 { font-size: 18px; color: #333; }
    .cover p { color: #555; margin: 4px 0; }
    .section { padding: 20px 40px; page-break-before: always; }
    .section h2 { color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 6px; }
    .section h3 { color: #2e5090; margin-top: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background: #1e3a5f; color: #fff; padding: 6px 8px; text-align: left; font-size: 11px; }
    td { border: 1px solid #ccc; padding: 5px 8px; font-size: 11px; }
    tr:nth-child(even) td { background: #f0f4ff; }
    .footer { text-align: center; color: #999; font-size: 10px; padding: 8px; border-top: 1px solid #ccc; }
    @media print { .footer { position: fixed; bottom: 0; width: 100%; } }
  </style></head><body>
  <div class="cover">
    <h1>NAAC Self-Study Report</h1>
    <h2>${user.name || ''}</h2>
    <p>${user.designation || ''} — ${user.department || ''}</p>
    <p>Qualification: ${user.qualification || '—'} | Experience: ${user.experience || '—'} years</p>
    <p style="margin-top:16px; font-size:14px; font-weight:bold;">Academic Year: ${academicYear}</p>
    <p>Generated: ${today}</p>
    <p style="margin-top:10px; font-weight:bold; color: ${verificationStatus === 'Verified' ? 'green' : 'orange'}">
      Status: ${verificationStatus}
    </p>
  </div>`;

    criteria.forEach(c => {
    html += `<div class="section"><h2>Criterion ${c.no}: ${c.title} (${c.marks} Marks)</h2>`;
    c.subCriteria.forEach(sub => {
      html += `<h3>${sub.code}: ${sub.title}</h3><table><tr><th>Field</th><th>Value</th><th>Documents</th></tr>`;
      sub.fields.filter(f => f.type !== 'file').forEach(field => {
        const val = data.data[c.no]?.[sub.code]?.[field.name] || '—';
        const subDocs = documents.filter(d => d.criterion_no === c.no && d.sub_criterion === sub.code).map(d => d.original_name).join(', ') || '—';
        html += `<tr><td>${field.label}</td><td>${val}</td><td style="font-size:10px;color:#555">${subDocs}</td></tr>`;
      });
      html += `</table>`;
    });
    
    if (verificationStatus === 'Verified') {
      html += `<div class="watermark" style="display:flex; justify-content:space-between; align-items:flex-end;">
        <div style="text-align:left;">
          ${user.signature_url ? `<img src="${user.signature_url}" alt="Teacher Signature" style="max-width:120px; border-bottom: 1px solid #1e3a5f;" />` : '<div style="height:40px; border-bottom: 1px solid #ccc; width:120px;"></div>'}
          <p>${user.name}</p>
          <p style="font-size: 10px; color: #555;">Teacher</p>
        </div>
        <div style="text-align:right;">
          ${data.hodSignature ? `<img src="${data.hodSignature}" alt="HOD Signature" style="max-width:120px; border-bottom: 1px solid #1e3a5f;" />` : '<div style="height:40px; border-bottom: 1px solid #ccc; width:120px;"></div>'}
          <p>${data.hodName || 'HOD'}</p>
          <p style="font-size: 10px; color: green;">VERIFIED BY HOD: ${today}</p>
        </div>
      </div>`;
    }
    
    html += `</div>`;
  });

  // Summary
  html += `<div class="section"><h2>Summary</h2><table><tr><th>Criterion</th><th>Title</th><th>Marks</th><th>Fields Filled</th></tr>`;
  criteria.forEach(c => {
    let filled = 0, total = 0;
    c.subCriteria.forEach(sub => {
      sub.fields.filter(f=>f.required&&f.type!=='file').forEach(f => { total++; if(data.data[c.no]?.[sub.code]?.[f.name]) filled++; });
    });
    html += `<tr><td>Criterion ${c.no}</td><td>${c.title}</td><td>${c.marks}</td><td>${filled}/${total}</td></tr>`;
  });
  html += `</table></div>
  <div class="footer">NAAC Self-Study Report | ${user.name} | ${user.department} | Academic Year: ${academicYear} | Generated: ${today}</div>
  </body></html>`;
  return html;
}
