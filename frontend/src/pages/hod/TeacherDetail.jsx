import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { NAAC_CRITERIA, ACADEMIC_YEARS, CRITERION_COLORS } from '../../data/naacCriteria';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function TeacherDetail() {
  const { teacherId } = useParams();
  const [qp] = useSearchParams();
  const navigate = useNavigate();
  const { user: hod } = useAuth();
  const [year, setYear] = useState(qp.get('year') || ACADEMIC_YEARS[ACADEMIC_YEARS.length - 2]);
  const [teacher, setTeacher] = useState(null);
  const [allData, setAllData] = useState({});
  const [docs, setDocs] = useState([]);
  const [verifs, setVerifs] = useState([]);
  const [reviewForm, setReviewForm] = useState({ criterion_no: '', status: 'Verified', comment: '' });
  const [reviewing, setReviewing] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');
  const [expandedCriterion, setExpandedCriterion] = useState(null);
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/export/teachers`).then(r => { const t = r.data.find(t => t.id === teacherId); setTeacher(t); }),
      api.get(`/criteria/${year}?teacher_id=${teacherId}`).then(r => setAllData(r.data)),
      api.get(`/documents/list?academic_year=${year}&teacher_id=${teacherId}`).then(r => setDocs(r.data)),
      api.get(`/verifications/teacher/${teacherId}`).then(r => setVerifs(r.data)),
    ]).catch(() => {});
  }, [teacherId, year]);

  const handleReview = async () => {
    setReviewing(true); setReviewMsg('');
    try {
      await api.post('/verifications/review', { teacher_id: teacherId, academic_year: year, criterion_no: reviewForm.criterion_no || null, status: reviewForm.status, comment: reviewForm.comment });
      setReviewMsg('Review submitted successfully!');
      api.get(`/verifications/teacher/${teacherId}`).then(r => setVerifs(r.data));
    } catch (e) { setReviewMsg('Error: ' + (e.response?.data?.error || e.message)); }
    finally { setReviewing(false); }
  };

  const exportPDF = async () => {
    setExportingPDF(true);
    try {
      const r = await api.get(`/export/pdf-data/${year}?teacher_id=${teacherId}`);
      const data = r.data;
      const win = window.open('', '_blank');
      
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
        <h1>🎓 NAAC Self-Study Report</h1>
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
          html += `<div class="watermark"><img src="/signature.png" alt="HOD Signature" /><p>Verified by HOD: ${today}</p></div>`;
        }
        
        html += `</div>`;
      });

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

      win.document.write(html);
      win.document.close();
      win.onload = () => { win.focus(); win.print(); };
    } catch (e) { alert('PDF export failed: ' + e.message); }
    finally { setExportingPDF(false); }
  };

  if (!teacher) return <div className="loader"><div className="loader-dot"/><div className="loader-dot"/><div className="loader-dot"/></div>;

  return (
    <div className="fade-in">
      <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/hod/teachers')}>← Back</button>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:'1.4rem' }}>{teacher.name}</h1>
          <p style={{ fontSize:'0.85rem' }}>{teacher.designation} · {teacher.department}</p>
        </div>
        <select className="select" style={{ width:'auto' }} value={year} onChange={e=>setYear(e.target.value)}>
          {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" onClick={exportPDF} disabled={exportingPDF}>
          {exportingPDF ? '⏳ Generating PDF...' : '🖨️ Export PDF'}
        </button>
      </div>

      {/* Verification panel */}
      <div className="card" style={{ marginBottom:'1.5rem', borderLeft:'4px solid var(--purple)' }}>
        <h3 style={{ marginBottom:'1rem' }}>Submit Review</h3>
        {reviewMsg && <div className={`alert ${reviewMsg.startsWith('Error') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom:'1rem' }}>{reviewMsg}</div>}
        <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'flex-end' }}>
          <div className="form-group" style={{ flex:1, minWidth:160 }}>
            <label className="form-label">Criterion (optional)</label>
            <select className="select" value={reviewForm.criterion_no} onChange={e=>setReviewForm(p=>({...p,criterion_no:e.target.value}))}>
              <option value="">All Criteria</option>
              {NAAC_CRITERIA.map(c => <option key={c.no} value={c.no}>Criterion {c.no}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex:1, minWidth:160 }}>
            <label className="form-label">Status</label>
            <select className="select" value={reviewForm.status} onChange={e=>setReviewForm(p=>({...p,status:e.target.value}))}>
              <option>Verified</option>
              <option>Needs Revision</option>
              <option>Pending</option>
            </select>
          </div>
          <div className="form-group" style={{ flex:2, minWidth:200 }}>
            <label className="form-label">Comment</label>
            <input className="input" placeholder="Optional feedback for teacher..." value={reviewForm.comment} onChange={e=>setReviewForm(p=>({...p,comment:e.target.value}))} />
          </div>
          <button className="btn btn-primary" onClick={handleReview} disabled={reviewing}>
            {reviewing ? 'Saving...' : 'Submit Review'}
          </button>
        </div>

        {/* Recent reviews */}
        {verifs.length > 0 && (
          <div style={{ marginTop:'1rem' }}>
            <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'0.5rem' }}>Recent Reviews:</p>
            {verifs.slice(0,3).map(v => (
              <div key={v.id} style={{ fontSize:'0.8rem', padding:'0.375rem 0', borderBottom:'1px solid var(--border)', display:'flex', gap:'0.75rem' }}>
                <span className={`badge badge-${v.status==='Verified'?'verified':v.status==='Needs Revision'?'revision':'pending'}`}>{v.status}</span>
                <span style={{ color:'var(--text-muted)' }}>{v.criterion_no ? `Criterion ${v.criterion_no}` : 'All'}</span>
                <span style={{ flex:1 }}>{v.comment || '—'}</span>
                <span style={{ color:'var(--text-muted)' }}>{v.reviewed_at?.substring(0,10)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Criteria accordion */}
      <h2 style={{ marginBottom:'1rem' }}>Submitted Data</h2>
      {NAAC_CRITERIA.map(c => {
        const color = CRITERION_COLORS[c.no];
        const hasData = Object.keys(allData[c.no] || {}).length > 0;
        return (
          <div key={c.no} className="card" style={{ marginBottom:'0.75rem', borderTop:`3px solid ${color}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', cursor:'pointer' }} onClick={() => setExpandedCriterion(expandedCriterion===c.no ? null : c.no)}>
              <div style={{ flex:1 }}>
                <strong>Criterion {c.no}: {c.title}</strong>
                <span style={{ marginLeft:'0.75rem', fontSize:'0.78rem', color: hasData?'var(--success)':'var(--text-muted)' }}>
                  {hasData ? 'Data present' : 'No data'}
                </span>
              </div>
              <span style={{ color:'var(--text-muted)' }}>{expandedCriterion===c.no ? '▲' : '▼'}</span>
            </div>
            {expandedCriterion===c.no && (
              <div style={{ marginTop:'1rem' }}>
                {c.subCriteria.map(sub => {
                  const subData = allData[c.no]?.[sub.code] || {};
                  const subDocs = docs.filter(d => d.criterion_no===c.no && d.sub_criterion===sub.code);
                  return (
                    <div key={sub.code} style={{ marginBottom:'1rem', paddingBottom:'1rem', borderBottom:'1px solid var(--border)' }}>
                      <h4 style={{ marginBottom:'0.75rem', color }}>{sub.code}: {sub.title}</h4>
                      {sub.fields.filter(f=>f.type!=='file').map(field => (
                        <div key={field.name} style={{ display:'flex', gap:'1rem', padding:'0.375rem 0', fontSize:'0.85rem' }}>
                          <span style={{ color:'var(--text-muted)', width:240, flexShrink:0 }}>{field.label}:</span>
                          <span style={{ fontWeight:subData[field.name]?500:400, color:subData[field.name]?'var(--text-primary)':'var(--text-muted)' }}>
                            {subData[field.name] || '—'}
                          </span>
                        </div>
                      ))}
                      {subDocs.length > 0 && (
                        <div style={{ marginTop:'0.5rem' }}>
                          <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>Documents: </span>
                          {subDocs.map(d => (
                            <span key={d.id} style={{ fontSize:'0.78rem', marginLeft:'0.5rem', color:'var(--accent)', cursor:'pointer' }}
                              onClick={() => {
                                const token = localStorage.getItem('naac_token');
                                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                                window.open(`${baseUrl}/documents/view/${d.id}?token=${token}`, '_blank');
                              }}>
                              📄 {d.original_name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
