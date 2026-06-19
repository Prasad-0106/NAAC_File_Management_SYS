import { useState, useEffect } from 'react';
import { ACADEMIC_YEARS } from '../../data/naacCriteria';
import api from '../../utils/api';

export default function Documents() {
  const [year, setYear] = useState(() => localStorage.getItem('naac_academic_year') || ACADEMIC_YEARS[ACADEMIC_YEARS.length - 1]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renaming, setRenaming] = useState(null);
  const [newName, setNewName] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/documents/list?academic_year=${year}`).then(r => setDocs(r.data)).finally(() => setLoading(false));
  }, [year]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this file permanently?')) return;
    await api.delete(`/documents/${id}`);
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  const handleRename = async (id) => {
    if (!newName.trim()) return;
    await api.put(`/documents/${id}/rename`, { original_name: newName.trim() });
    setDocs(prev => prev.map(d => d.id === id ? { ...d, original_name: newName.trim() } : d));
    setRenaming(null); setNewName('');
  };

  const viewDoc = (id) => {
    const token = localStorage.getItem('naac_token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.open(`${baseUrl}/documents/view/${id}?token=${token}`, '_blank');
  };

  const filtered = docs.filter(d =>
    !filter || d.original_name.toLowerCase().includes(filter.toLowerCase()) ||
    `criterion ${d.criterion_no}`.toLowerCase().includes(filter.toLowerCase()) ||
    d.sub_criterion.toLowerCase().includes(filter.toLowerCase())
  );

  const statusColor = { Uploaded: 'badge-uploaded', Verified: 'badge-verified', Pending: 'badge-pending' };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1>📁 My Documents</h1>
          <p>All uploaded supporting files for your NAAC submission</p>
        </div>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <input className="input" style={{ width:220 }} placeholder="Search files..." value={filter} onChange={e=>setFilter(e.target.value)} />
          <select className="select" style={{ width:'auto' }} value={year} onChange={e => { setYear(e.target.value); localStorage.setItem('naac_academic_year', e.target.value); }}>
            {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loader"><div className="loader-dot"/><div className="loader-dot"/><div className="loader-dot"/></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="icon">📂</div>
          <h3>No Documents Found</h3>
          <p>Upload supporting documents from each sub-criterion form</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Criterion</th>
                <th>Sub-Criterion</th>
                <th>Upload Date</th>
                <th>Size</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.id}>
                  <td>
                    {renaming === doc.id ? (
                      <div style={{ display:'flex', gap:'0.5rem' }}>
                        <input className="input" style={{ fontSize:'0.8rem', padding:'0.3rem 0.6rem' }} value={newName} onChange={e=>setNewName(e.target.value)} autoFocus />
                        <button className="btn btn-success btn-sm" onClick={()=>handleRename(doc.id)}>✓</button>
                        <button className="btn btn-ghost btn-sm" onClick={()=>{setRenaming(null);setNewName('');}}>✗</button>
                      </div>
                    ) : (
                      <span style={{ fontSize:'0.875rem' }}>📄 {doc.original_name}</span>
                    )}
                  </td>
                  <td>Criterion {doc.criterion_no}</td>
                  <td>{doc.sub_criterion}</td>
                  <td>{doc.upload_date?.substring(0,10)}</td>
                  <td>{doc.file_size ? `${(doc.file_size/1024).toFixed(1)} KB` : '—'}</td>
                  <td><span className={`badge ${statusColor[doc.status]||'badge-pending'}`}>{doc.status}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:'0.375rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => viewDoc(doc.id)} data-tooltip="View">👁️</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setRenaming(doc.id); setNewName(doc.original_name); }} data-tooltip="Rename">✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(doc.id)} data-tooltip="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ marginTop:'1rem', color:'var(--text-muted)', fontSize:'0.8rem' }}>
        {filtered.length} document{filtered.length!==1?'s':''} shown
      </div>
    </div>
  );
}
