import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ACADEMIC_YEARS, NAAC_CRITERIA } from '../../data/naacCriteria';
import api from '../../utils/api';
import { Users, LayoutDashboard } from 'lucide-react';

const STATUS_BADGE = { Pending: 'badge-pending', Verified: 'badge-verified', 'Needs Revision': 'badge-revision' };

export default function HodDashboard() {
  const navigate = useNavigate();
  const [year, setYear] = useState(ACADEMIC_YEARS[ACADEMIC_YEARS.length - 2]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/criteria/hod/summary/${year}`).then(r => {
      const data = r.data;
      setTeachers(Array.isArray(data) ? data : []);
    }).finally(() => setLoading(false));
  }, [year]);

  const totalTeachers = teachers.length;
  const started = teachers.filter(t => t.filledSubCriteria > 0).length;
  const verified = teachers.filter(t => t.verificationStatus === 'Verified').length;
  const needsRevision = teachers.filter(t => t.verificationStatus === 'Needs Revision').length;
  const totalSubCriteria = NAAC_CRITERIA.reduce((s, c) => s + c.subCriteria.length, 0);

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <LayoutDashboard size={28} color="var(--primary)" />
          <div>
            <h1 style={{ margin: 0 }}>HOD Dashboard</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Monitor NAAC documentation progress for your department</p>
          </div>
        </div>
        <select className="select" style={{ width:'auto' }} value={year} onChange={e=>setYear(e.target.value)}>
          {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid-4" style={{ marginBottom:'1.5rem' }}>
        <div className="card stat-card">
          <div className="stat-value" style={{ color:'var(--accent)' }}>{totalTeachers}</div>
          <div className="stat-label">Total Teachers</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value" style={{ color:'var(--purple)' }}>{started}</div>
          <div className="stat-label">Started Submissions</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value" style={{ color:'var(--success)' }}>{verified}</div>
          <div className="stat-label">Verified</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value" style={{ color:'var(--danger)' }}>{needsRevision}</div>
          <div className="stat-label">Needs Revision</div>
        </div>
      </div>

      <h2 style={{ marginBottom:'1rem' }}>Teacher-wise Progress ({year})</h2>
      {loading ? (
        <div className="loader"><div className="loader-dot"/><div className="loader-dot"/><div className="loader-dot"/></div>
      ) : teachers.length === 0 ? (
        <div className="empty-state card">
          <div className="icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Users size={48} color="var(--text-muted)" opacity={0.5} />
          </div>
          <h3>No Teachers Registered</h3>
          <p>Teachers will appear here once they register</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Department</th>
                <th>Sub-Criteria Filled</th>
                <th>Progress</th>
                <th>Last Activity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(t => {
                const pct = Math.round((t.filledSubCriteria / totalSubCriteria) * 100);
                return (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight:600 }}>{t.name}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{t.designation}</div>
                    </td>
                    <td>{t.department || '—'}</td>
                    <td>{t.filledSubCriteria}/{totalSubCriteria}</td>
                    <td style={{ minWidth:120 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <div className="progress-bar-wrap" style={{ flex:1 }}>
                          <div className="progress-bar-fill" style={{ width:`${pct}%`, background:'var(--accent)' }} />
                        </div>
                        <span style={{ fontSize:'0.8rem', fontWeight:600 }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize:'0.8rem' }}>{t.lastActivity?.substring(0,10) || 'Never'}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[t.verificationStatus]||'badge-pending'}`}>
                        {t.verificationStatus || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate(`/hod/teachers/${t.id}?year=${year}`)} style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
