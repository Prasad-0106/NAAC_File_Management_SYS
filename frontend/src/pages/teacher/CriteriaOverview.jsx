import { useNavigate } from 'react-router-dom';
import { NAAC_CRITERIA, ACADEMIC_YEARS, CRITERION_COLORS, calcCriterionProgress } from '../../data/naacCriteria';
import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function CriteriaOverview() {
  const navigate = useNavigate();
  const [year, setYear] = useState(() => localStorage.getItem('naac_academic_year') || ACADEMIC_YEARS[ACADEMIC_YEARS.length - 1]);
  const [allData, setAllData] = useState({});

  useEffect(() => {
    api.get(`/criteria/${year}`).then(r => setAllData(r.data)).catch(() => {});
  }, [year]);

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1>📋 NAAC Criteria</h1>
          <p>Select a criterion to view and fill its sub-criteria forms</p>
        </div>
        <select className="select" style={{ width:'auto' }} value={year} onChange={e => { setYear(e.target.value); localStorage.setItem('naac_academic_year', e.target.value); }}>
          {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="grid-auto">
        {NAAC_CRITERIA.map(c => {
          const progress = calcCriterionProgress(c.no, allData[c.no] || {});
          const color = CRITERION_COLORS[c.no];
          return (
            <div key={c.no} className={`card criterion-card c${c.no}`} style={{ cursor:'pointer' }} onClick={() => navigate(`/criteria/${c.no}?year=${year}`)}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:'1rem', marginBottom:'1rem' }}>
                <div className={`criterion-icon c${c.no}`} style={{ fontSize:'1.3rem' }}>
                  {['📚','🎓','🔬','🏛️','🎯','⚙️','🌟'][parseInt(c.no)-1]}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Criterion {c.no} • {c.marks} Marks</div>
                  <h3 style={{ fontSize:'1rem', marginTop:'0.2rem' }}>{c.title}</h3>
                </div>
                <span style={{ fontWeight:800, color, fontSize:'1.25rem' }}>{progress}%</span>
              </div>
              <div className="progress-bar-wrap" style={{ marginBottom:'0.75rem' }}>
                <div className="progress-bar-fill" style={{ width:`${progress}%`, background:color }} />
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.375rem' }}>
                {c.subCriteria.map(sub => {
                  const subData = allData[c.no]?.[sub.code] || {};
                  const hasData = Object.keys(subData).some(k => subData[k]);
                  return (
                    <span key={sub.code} style={{ fontSize:'0.72rem', padding:'0.2rem 0.5rem', borderRadius:'4px', background: hasData ? 'var(--success-light)' : 'var(--bg-secondary)', color: hasData ? 'var(--success)' : 'var(--text-muted)', border:`1px solid ${hasData ? 'rgba(16,185,129,0.3)' : 'var(--border)'}` }}>
                      {sub.code}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
