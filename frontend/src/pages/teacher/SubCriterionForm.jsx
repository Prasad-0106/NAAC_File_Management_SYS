import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { NAAC_CRITERIA, ACADEMIC_YEARS } from '../../data/naacCriteria';
import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';

function FormField({ field, value, onChange }) {
  if (field.type === 'text') return (
    <input className="input" value={value||''} onChange={e=>onChange(e.target.value)} placeholder={`Enter ${field.label}`} />
  );
  if (field.type === 'textarea') return (
    <textarea className="textarea" value={value||''} onChange={e=>onChange(e.target.value)} placeholder={`Enter ${field.label}`} />
  );
  if (field.type === 'number') return (
    <input className="input" type="number" value={value||''} onChange={e=>onChange(e.target.value)} placeholder="0" min="0" />
  );
  if (field.type === 'radio') return (
    <div className="radio-group">
      {field.options.map(opt => (
        <label key={opt} className={`radio-option${value===opt?' selected':''}`}>
          <input type="radio" checked={value===opt} onChange={()=>onChange(opt)} />{opt}
        </label>
      ))}
    </div>
  );
  if (field.type === 'dropdown') return (
    <select className="select" value={value||''} onChange={e=>onChange(e.target.value)}>
      <option value="">Select...</option>
      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );
  if (field.type === 'multiselect') {
    const selected = value ? value.split(',').filter(Boolean) : [];
    const toggle = opt => {
      const next = selected.includes(opt) ? selected.filter(s=>s!==opt) : [...selected, opt];
      onChange(next.join(','));
    };
    return (
      <div className="multiselect">
        {field.options.map(opt => (
          <button key={opt} type="button" className={`multi-option${selected.includes(opt)?' selected':''}`} onClick={()=>toggle(opt)}>{opt}</button>
        ))}
      </div>
    );
  }
  return null;
}

export default function SubCriterionForm() {
  const { criterionNo, subCode } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [year, setYear] = useState(() => params.get('year') || localStorage.getItem('naac_academic_year') || ACADEMIC_YEARS[ACADEMIC_YEARS.length - 1]);
  const [formData, setFormData] = useState({});
  const [docs, setDocs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const criterion = NAAC_CRITERIA.find(c => c.no === criterionNo);
  const sub = criterion?.subCriteria.find(s => s.code === subCode);

  useEffect(() => {
    if (!criterion || !sub) return;
    Promise.all([
      api.get(`/criteria/${year}/${criterionNo}/${subCode}`).then(r => setFormData(r.data.data || {})),
      api.get(`/documents/list?academic_year=${year}&criterion_no=${criterionNo}&sub_criterion=${subCode}`).then(r => setDocs(r.data)),
    ]).catch(() => {});
  }, [year, criterionNo, subCode]);

  if (!criterion || !sub) return <div className="alert alert-error">Sub-criterion not found</div>;

  const nonFileFields = sub.fields.filter(f => f.type !== 'file');

  const handleSave = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    const required = nonFileFields.filter(f => f.required);
    const missing = required.filter(f => !formData[f.name] || formData[f.name] === '');
    if (missing.length > 0) { setError(`Please fill required fields: ${missing.map(f=>f.label).join(', ')}`); setSaving(false); return; }
    try {
      await api.post('/criteria/save', { academic_year: year, criterion_no: criterionNo, sub_criterion: subCode, fields: formData });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (err) { setError(err.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Clear all data for this sub-criterion?')) return;
    await api.delete(`/criteria/${year}/${criterionNo}/${subCode}`);
    setFormData({});
  };

  const handleUpload = async e => {
    const file = e.target.files[0]; if (!file) return;
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    formDataObj.append('academic_year', year);
    formDataObj.append('criterion_no', criterionNo);
    formDataObj.append('sub_criterion', subCode);
    setUploading(true);
    try {
      const r = await api.post('/documents/upload', formDataObj, { headers: { 'Content-Type': 'multipart/form-data' } });
      setDocs(prev => [r.data, ...prev]);
    } catch (err) { setError(err.response?.data?.error || 'Upload failed'); }
    finally { setUploading(false); if(fileRef.current) fileRef.current.value=''; }
  };

  const handleDeleteDoc = async (id) => {
    if (!window.confirm('Delete this file?')) return;
    setDeleting(id);
    await api.delete(`/documents/${id}`);
    setDocs(prev => prev.filter(d => d.id !== id));
    setDeleting(null);
  };

  const viewDoc = (id) => {
    const token = localStorage.getItem('naac_token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.open(`${baseUrl}/documents/view/${id}?token=${token}`, '_blank');
  };

  return (
    <div className="fade-in" style={{ maxWidth: 800 }}>
      <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/criteria/${criterionNo}?year=${year}`)}>← Back</button>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:'1.25rem' }}>{sub.code}: {sub.title}</h1>
          <p style={{ fontSize:'0.8rem' }}>Criterion {criterionNo}: {criterion.title}</p>
        </div>
        <select className="select" style={{ width:'auto' }} value={year} onChange={e => { setYear(e.target.value); localStorage.setItem('naac_academic_year', e.target.value); }}>
          {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {saved && <div className="alert alert-success">Data saved successfully!</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSave}>
        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <h3 style={{ marginBottom:'1.25rem' }}>Form Fields</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            {nonFileFields.map(field => (
              <div key={field.name} className="form-group">
                <label className="form-label">
                  {field.label} {field.required && <span className="required">*</span>}
                </label>
                <FormField field={field} value={formData[field.name]} onChange={v => setFormData(p => ({ ...p, [field.name]: v }))} />
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem', justifyContent:'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={handleDelete}>🗑️ Clear All</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ Saving...' : '💾 Save Data'}
            </button>
          </div>
        </div>
      </form>

      {/* Document upload section */}
      <div className="card">
        <h3 style={{ marginBottom:'1rem' }}>📎 Supporting Documents</h3>
        <div className="file-upload-zone" onClick={() => fileRef.current?.click()}>
          <div style={{ fontSize:'2rem' }}>📁</div>
          <p style={{ fontWeight:500, color:'var(--text-primary)', marginTop:'0.25rem' }}>
            {uploading ? '⏳ Uploading...' : 'Click to upload supporting document'}
          </p>
          <p>PDF, DOCX, JPG, PNG · Max 50MB</p>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.jpg,.jpeg,.png" style={{ display:'none' }} onChange={handleUpload} />
        </div>

        {docs.length > 0 && (
          <div className="file-list" style={{ marginTop:'1rem' }}>
            {docs.map(doc => (
              <div key={doc.id} className="file-item">
                <div>
                  <div className="file-item-name">📄 {doc.original_name}</div>
                  <div className="file-item-meta">{doc.upload_date?.substring(0,10)} · {(doc.file_size/1024).toFixed(1)} KB</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <span className={`badge badge-${doc.status?.toLowerCase().replace(' ','-')}`}>{doc.status}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => viewDoc(doc.id)}>👁️</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteDoc(doc.id)} disabled={deleting===doc.id}>
                    {deleting===doc.id ? '...' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
