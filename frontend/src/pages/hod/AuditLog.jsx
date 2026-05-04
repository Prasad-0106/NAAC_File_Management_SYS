import { useState, useEffect } from 'react';
import api from '../../utils/api';

const ACTION_COLORS = { LOGIN:'var(--accent)', REGISTER:'var(--success)', UPLOAD_DOC:'var(--purple)', DELETE_DOC:'var(--danger)', SAVE_CRITERIA:'var(--warning)', REVIEW:'var(--cyan)', SEND_NOTIFICATION:'var(--pink)', DELETE_CRITERIA:'var(--danger)', UPDATE_PROFILE:'var(--text-muted)', BROADCAST:'var(--purple)' };

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const LIMIT = 30;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: LIMIT });
    if (actionFilter) params.set('action', actionFilter);
    api.get(`/audit?${params}`).then(r => { setLogs(r.data.rows); setTotal(r.data.total); }).finally(() => setLoading(false));
  }, [page, actionFilter]);

  const totalPages = Math.ceil(total / LIMIT);
  const actions = ['LOGIN','REGISTER','UPLOAD_DOC','DELETE_DOC','SAVE_CRITERIA','DELETE_CRITERIA','UPDATE_PROFILE','REVIEW','SEND_NOTIFICATION','BROADCAST'];

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div><h1>📜 Audit Log</h1><p>Complete activity trail of all user actions</p></div>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <select className="select" style={{ width:'auto' }} value={actionFilter} onChange={e=>{setActionFilter(e.target.value);setPage(1);}}>
            <option value="">All Actions</option>
            {actions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loader"><div className="loader-dot"/><div className="loader-dot"/><div className="loader-dot"/></div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Timestamp</th><th>User</th><th>Role</th><th>Action</th><th>Details</th><th>IP</th></tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize:'0.78rem', whiteSpace:'nowrap' }}>{log.timestamp?.substring(0,19).replace('T',' ')}</td>
                    <td style={{ fontWeight:500 }}>{log.user_name}</td>
                    <td><span className={`badge badge-${log.user_role==='hod'?'verified':'progress'}`}>{log.user_role}</span></td>
                    <td><span style={{ color: ACTION_COLORS[log.action]||'var(--text-primary)', fontWeight:600, fontSize:'0.8rem' }}>{log.action}</span></td>
                    <td style={{ fontSize:'0.8rem', maxWidth:300, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.detail}</td>
                    <td style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'1rem' }}>
            <span style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>{total} total entries</span>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}>← Prev</button>
              <span style={{ fontSize:'0.85rem', padding:'0.375rem 0.5rem' }}>Page {page}/{totalPages}</span>
              <button className="btn btn-ghost btn-sm" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}>Next →</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
