import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { NAAC_CRITERIA, ACADEMIC_YEARS, CRITERION_COLORS, calcProgress } from '../../data/naacCriteria';
import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function CriterionPage() {
  const { criterionNo } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [year, setYear] = useState(params.get('year') || ACADEMIC_YEARS[ACADEMIC_YEARS.length - 2]);
  const [criterionData, setCriterionData] = useState({});

  const criterion = NAAC_CRITERIA.find(c => c.no === criterionNo);
  const color = CRITERION_COLORS[criterionNo] || 'var(--accent)';

  useEffect(() => {
    api.get(`/criteria/${year}/${criterionNo}`).then(r => setCriterionData(r.data)).catch(() => {});
  }, [year, criterionNo]);

  if (!criterion) return <div className="alert alert-error">Criterion not found</div>;

  return (
    <div className="fade-in">
      <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/criteria')}>← Back</button>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:'1.5rem' }}>Criterion {criterion.no}: {criterion.title}</h1>
          <p style={{ fontSize:'0.85rem' }}>{criterion.marks} Marks — Select a sub-criterion to fill the form</p>
        </div>
        <select className="select" style={{ width:'auto' }} value={year} onChange={e=>setYear(e.target.value)}>
          {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        {criterion.subCriteria.map(sub => {
          const subData = criterionData[sub.code] || {};
          const progress = calcProgress(criterionNo, sub.code, subData);
          return (
            <div key={sub.code} className="card" style={{ cursor:'pointer', borderLeft:`4px solid ${color}` }}
              onClick={() => navigate(`/criteria/${criterionNo}/${sub.code}?year=${year}`)}>
              <div style={{ display:'flex', alignItems:'center', gap:'1.25rem', flexWrap:'wrap' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:`color-mix(in srgb, ${color} 15%, transparent)`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color, fontSize:'0.9rem', flexShrink:0 }}>
                  {sub.code}
                </div>
                <div style={{ flex:1 }}>
                  <h4 style={{ marginBottom:'0.25rem' }}>{sub.title}</h4>
                  <p style={{ fontSize:'0.8rem', marginBottom:'0.5rem' }}>{sub.fields.filter(f=>f.type!=='file').length} fields • {sub.fields.filter(f=>f.required).length} required</p>
                  <div className="progress-bar-wrap" style={{ height:'6px' }}>
                    <div className="progress-bar-fill" style={{ width:`${progress}%`, background:color }} />
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontWeight:800, color, fontSize:'1.1rem' }}>{progress}%</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{progress===100?'✅ Complete':progress>0?'🔄 In Progress':'⭕ Not Started'}</div>
                </div>
                <span style={{ color:'var(--text-muted)', fontSize:'1.2rem' }}>›</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
