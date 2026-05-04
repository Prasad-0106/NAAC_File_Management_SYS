import { useState } from 'react';
import { ACADEMIC_YEARS } from '../../data/naacCriteria';

export default function HodExport() {
  const [year, setYear] = useState(ACADEMIC_YEARS[ACADEMIC_YEARS.length - 2]);
  const [loading, setLoading] = useState(false);

  const exportConsolidated = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('naac_token');
      const res = await fetch(`http://localhost:5000/api/export/consolidated/${year}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `NAAC_Consolidated_${year}.xlsx`;
      a.click(); URL.revokeObjectURL(url);
    } catch (e) { alert('Export failed: ' + e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fade-in" style={{ maxWidth:700 }}>
      <div className="page-header">
        <h1>📤 Consolidated Export</h1>
        <p>Generate a NAAC-ready workbook combining all teachers' data</p>
      </div>

      <div className="form-group" style={{ marginBottom:'1.5rem' }}>
        <label className="form-label">Academic Year</label>
        <select className="select" style={{ width:'auto' }} value={year} onChange={e=>setYear(e.target.value)}>
          {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="card" style={{ textAlign:'center', marginBottom:'1.5rem' }}>
        <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>📊</div>
        <h2 style={{ marginBottom:'0.5rem' }}>Consolidated Excel Workbook</h2>
        <p style={{ marginBottom:'1.5rem' }}>
          Combines all teachers' NAAC data into a single NAAC-submission-ready workbook
        </p>
        <button className="btn btn-success btn-lg" onClick={exportConsolidated} disabled={loading}>
          {loading ? '⏳ Generating Workbook...' : '⬇️ Download Consolidated Excel (.xlsx)'}
        </button>
      </div>

      <div className="card">
        <h3 style={{ marginBottom:'1rem' }}>📋 Workbook Structure</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
          {[
            { sheet:'Summary', desc:'All teachers with completion status, document count, and verification status' },
            { sheet:'C1 - All', desc:'Criterion 1 data from all teachers in tabular format' },
            { sheet:'C2 - All', desc:'Criterion 2 data from all teachers' },
            { sheet:'C3 - All', desc:'Criterion 3 data from all teachers' },
            { sheet:'C4 - All', desc:'Criterion 4 data from all teachers' },
            { sheet:'C5 - All', desc:'Criterion 5 data from all teachers' },
            { sheet:'C6 - All', desc:'Criterion 6 data from all teachers' },
            { sheet:'C7 - All', desc:'Criterion 7 data from all teachers' },
            { sheet:'All Documents', desc:'Complete document index with file names, dates, and status across all teachers' },
          ].map(s => (
            <div key={s.sheet} style={{ display:'flex', gap:'1rem', padding:'0.5rem 0', borderBottom:'1px solid var(--border)' }}>
              <code style={{ background:'var(--accent-light)', color:'var(--accent)', padding:'0.2rem 0.5rem', borderRadius:'4px', fontSize:'0.8rem', whiteSpace:'nowrap' }}>{s.sheet}</code>
              <span style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
