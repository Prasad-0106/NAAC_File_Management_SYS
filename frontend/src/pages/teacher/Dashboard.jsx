import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NAAC_CRITERIA, ACADEMIC_YEARS, CRITERION_COLORS, calcCriterionProgress } from '../../data/naacCriteria';
import { BookOpen, GraduationCap, Microscope, Building, Target, Settings, Star } from 'lucide-react';
import api from '../../utils/api';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [year, setYear] = useState(() => localStorage.getItem('naac_academic_year') || ACADEMIC_YEARS[ACADEMIC_YEARS.length - 1]);
  const [allData, setAllData] = useState({});
  const [docs, setDocs] = useState([]);
  const [verifs, setVerifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/criteria/${year}`).then(r => setAllData(r.data)),
      api.get(`/documents/list?academic_year=${year}`).then(r => setDocs(r.data)),
      api.get(`/verifications/teacher/${user.id}?academic_year=${year}`).then(r => setVerifs(r.data)),
    ]).finally(() => setLoading(false));
  }, [year]);

  const totalProgress = NAAC_CRITERIA.reduce((sum, c) => sum + calcCriterionProgress(c.no, allData[c.no] || {}), 0) / 7;
  const latestVerif = verifs[0];

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1>Welcome, {user?.name?.split(' ')[0]}!</h1>
          <p>Track and manage your NAAC documentation progress</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <label className="form-label" style={{ margin:0, whiteSpace:'nowrap' }}>Academic Year:</label>
          <select className="select" style={{ width:'auto' }} value={year} onChange={e => { setYear(e.target.value); localStorage.setItem('naac_academic_year', e.target.value); }}>
            {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom:'1.5rem' }}>
        <div className="card stat-card">
          <div className="stat-value" style={{ color:'var(--accent)' }}>{Math.round(totalProgress)}%</div>
          <div className="stat-label">Overall Progress</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value" style={{ color:'var(--success)' }}>{docs.length}</div>
          <div className="stat-label">Documents Uploaded</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value" style={{ color:'var(--warning)' }}>{NAAC_CRITERIA.filter(c => calcCriterionProgress(c.no, allData[c.no]||{}) < 100).length}</div>
          <div className="stat-label">Pending Criteria</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value" style={{ color: latestVerif?.status==='Verified' ? 'var(--success)' : latestVerif?.status==='Needs Revision' ? 'var(--danger)' : 'var(--text-muted)' }}>
            {latestVerif?.status || 'Pending'}
          </div>
          <div className="stat-label">HOD Verification</div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="card" style={{ marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.75rem' }}>
          <h3>Overall NAAC Completion</h3>
          <span style={{ color:'var(--accent)', fontWeight:700 }}>{Math.round(totalProgress)}%</span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width:`${totalProgress}%`, background:'linear-gradient(90deg, var(--accent), #818cf8)' }} />
        </div>
      </div>

      {/* Latest HOD comment */}
      {latestVerif?.comment && (
        <div className={`alert ${latestVerif.status==='Needs Revision' ? 'alert-warning' : 'alert-success'}`} style={{ marginBottom:'1.5rem' }}>
          <strong>HOD Feedback:</strong> {latestVerif.comment} <span style={{ float:'right', fontSize:'0.75rem' }}>{latestVerif.reviewed_at?.substring(0,10)}</span>
        </div>
      )}

      {/* Criteria grid */}
      <h2 style={{ marginBottom:'1rem' }}>NAAC Criteria Progress</h2>
      {loading ? (
        <div className="loader"><div className="loader-dot"/><div className="loader-dot"/><div className="loader-dot"/></div>
      ) : (
        <div className="grid-auto">
          {NAAC_CRITERIA.map(c => {
            const progress = calcCriterionProgress(c.no, allData[c.no] || {});
            const color = CRITERION_COLORS[c.no];
            return (
              <div key={c.no} className={`card criterion-card c${c.no}`} style={{ cursor:'pointer' }} onClick={() => navigate(`/criteria/${c.no}?year=${year}`)}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
                  <div className={`criterion-icon c${c.no}`}>
                    {c.no === '1' && <BookOpen size={20} />}
                    {c.no === '2' && <GraduationCap size={20} />}
                    {c.no === '3' && <Microscope size={20} />}
                    {c.no === '4' && <Building size={20} />}
                    {c.no === '5' && <Target size={20} />}
                    {c.no === '6' && <Settings size={20} />}
                    {c.no === '7' && <Star size={20} />}
                  </div>
                  <span style={{ fontWeight:700, color, fontSize:'1.1rem' }}>{progress}%</span>
                </div>
                <h4 style={{ marginBottom:'0.25rem', fontSize:'0.9rem' }}>Criterion {c.no}</h4>
                <p style={{ fontSize:'0.8rem', marginBottom:'0.875rem', color:'var(--text-muted)' }}>{c.title}</p>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width:`${progress}%`, background:color }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:'0.5rem', fontSize:'0.75rem', color:'var(--text-muted)' }}>
                  <span>{c.subCriteria.length} sub-criteria</span>
                  <span>{c.marks} marks</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
