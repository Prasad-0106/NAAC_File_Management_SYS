import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ACADEMIC_YEARS } from '../../data/naacCriteria';
import { Users, Building2 } from 'lucide-react';
import api from '../../utils/api';

export default function TeacherList() {
  const navigate = useNavigate();
  const [year, setYear] = useState(ACADEMIC_YEARS[ACADEMIC_YEARS.length - 2]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/criteria/hod/summary/${year}`).then(r => {
      setTeachers(Array.isArray(r.data) ? r.data : []);
    }).finally(() => setLoading(false));
  }, [year]);

  const departments = [...new Set(teachers.map(t => t.department).filter(Boolean))].sort();
  const filtered = teachers.filter(t =>
    (!search || t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase())) &&
    (!deptFilter || t.department === deptFilter)
  );

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div><h1><Users size={24} style={{ verticalAlign:'middle', marginRight:'0.5rem' }} /> All Teachers</h1><p>Browse and manage all registered teachers</p></div>
        <select className="select" style={{ width:'auto' }} value={year} onChange={e=>setYear(e.target.value)}>
          {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
        <input className="input" style={{ maxWidth:280 }} placeholder="Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="select" style={{ width:'auto' }} value={deptFilter} onChange={e=>setDeptFilter(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loader"><div className="loader-dot"/><div className="loader-dot"/><div className="loader-dot"/></div>
      ) : (
        <div className="grid-auto">
          {filtered.map(t => {
            const pct = Math.round(Math.min((t.filledSubCriteria / 30) * 100, 100));
            return (
              <div key={t.id} className="card" style={{ cursor:'pointer' }} onClick={() => navigate(`/hod/teachers/${t.id}?year=${year}`)}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.875rem', marginBottom:'1rem' }}>
                  <div className="sidebar-avatar" style={{ width:44, height:44, fontSize:'1rem' }}>
                    {t.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
                  </div>
                  <div>
                    <div style={{ fontWeight:700 }}>{t.name}</div>
                    <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{t.email}</div>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'0.5rem' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}><Building2 size={12} /> {t.department || 'N/A'}</span>
                  <span>{t.designation || ''}</span>
                </div>
                <div className="progress-bar-wrap" style={{ marginBottom:'0.5rem' }}>
                  <div className="progress-bar-fill" style={{ width:`${pct}%`, background:'var(--accent)' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.78rem' }}>
                  <span style={{ color:'var(--text-muted)' }}>Progress: {pct}%</span>
                  <span className={`badge badge-${t.verificationStatus==='Verified'?'verified':t.verificationStatus==='Needs Revision'?'revision':'pending'}`} style={{ fontSize:'0.7rem' }}>
                    {t.verificationStatus || 'Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
