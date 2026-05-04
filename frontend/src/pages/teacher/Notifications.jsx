import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Bell, Check, Mail } from 'lucide-react';

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/notifications/inbox').then(r => setNotifs(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
  };

  const markAll = async () => {
    await api.put('/notifications/read-all');
    setNotifs(prev => prev.map(n => ({ ...n, is_read: 1 })));
  };

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1><Bell size={24} style={{ verticalAlign:'middle', marginRight:'0.5rem' }} /> Notifications</h1>
          <p>{unread > 0 ? `${unread} unread message${unread>1?'s':''}` : 'All caught up!'}</p>
        </div>
        {unread > 0 && <button className="btn btn-ghost" onClick={markAll} style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}><Check size={18} /> Mark All Read</button>}
      </div>

      {loading ? (
        <div className="loader"><div className="loader-dot"/><div className="loader-dot"/><div className="loader-dot"/></div>
      ) : notifs.length === 0 ? (
        <div className="empty-state card">
          <div className="icon">
            <Mail size={48} color="var(--text-muted)" opacity={0.5} />
          </div>
          <h3>No Notifications</h3>
          <p>You'll be notified when the HOD sends updates or reminders</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {notifs.map(n => (
            <div key={n.id} className="card" style={{ borderLeft:`3px solid ${n.is_read ? 'var(--border)' : 'var(--accent)'}`, opacity: n.is_read ? 0.75 : 1 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.25rem' }}>
                    {!n.is_read && <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent)', display:'inline-block' }} />}
                    <strong style={{ fontSize:'0.9rem' }}>{n.subject}</strong>
                  </div>
                  <p style={{ fontSize:'0.875rem', margin:'0 0 0.5rem' }}>{n.message}</p>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                    From: {n.sender_name} • {n.created_at?.substring(0,16).replace('T',' ')}
                  </div>
                </div>
                {!n.is_read && (
                  <button className="btn btn-ghost btn-sm" onClick={() => markRead(n.id)}>Mark Read</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
