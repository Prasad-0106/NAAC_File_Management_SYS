import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function HodNotifications() {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ recipient_id: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');
  const [mode, setMode] = useState('individual'); // individual | broadcast

  useEffect(() => {
    api.get('/export/teachers').then(r => setTeachers(r.data)).catch(() => {});
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSend = async () => {
    if (!form.message.trim()) return setMsg('Message is required');
    if (mode === 'individual' && !form.recipient_id) return setMsg('Please select a teacher');
    setSending(true); setMsg('');
    try {
      if (mode === 'broadcast') {
        const r = await api.post('/notifications/broadcast', { subject: form.subject, message: form.message });
        setMsg(`✅ Broadcast sent to ${r.data.sent} teachers`);
      } else {
        await api.post('/notifications/send', { recipient_id: form.recipient_id, subject: form.subject, message: form.message });
        setMsg('✅ Notification sent successfully!');
      }
      setForm(p => ({ ...p, message: '', subject: '' }));
    } catch (e) { setMsg('❌ Error: ' + (e.response?.data?.error || e.message)); }
    finally { setSending(false); }
  };

  return (
    <div className="fade-in" style={{ maxWidth:700 }}>
      <div className="page-header">
        <h1>🔔 Send Notifications</h1>
        <p>Send reminders or updates to teachers about NAAC submissions</p>
      </div>

      <div className="tabs" style={{ marginBottom:'1.5rem' }}>
        <button className={`tab${mode==='individual'?' active':''}`} onClick={()=>setMode('individual')}>👤 Individual</button>
        <button className={`tab${mode==='broadcast'?' active':''}`} onClick={()=>setMode('broadcast')}>📢 Broadcast to All</button>
      </div>

      <div className="card">
        {msg && <div className={`alert ${msg.startsWith('❌')?'alert-error':'alert-success'}`} style={{ marginBottom:'1rem' }}>{msg}</div>}

        {mode === 'individual' && (
          <div className="form-group" style={{ marginBottom:'1rem' }}>
            <label className="form-label">Select Teacher <span className="required">*</span></label>
            <select className="select" value={form.recipient_id} onChange={e=>set('recipient_id',e.target.value)}>
              <option value="">Choose a teacher...</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name} — {t.department || 'N/A'}</option>)}
            </select>
          </div>
        )}

        {mode === 'broadcast' && (
          <div className="alert alert-info" style={{ marginBottom:'1rem' }}>
            📢 This message will be sent to all {teachers.length} registered teachers
          </div>
        )}

        <div className="form-group" style={{ marginBottom:'1rem' }}>
          <label className="form-label">Subject</label>
          <input className="input" placeholder="e.g. Reminder: NAAC Submission Deadline" value={form.subject} onChange={e=>set('subject',e.target.value)} />
        </div>

        <div className="form-group" style={{ marginBottom:'1.25rem' }}>
          <label className="form-label">Message <span className="required">*</span></label>
          <textarea className="textarea" rows={5} placeholder="Type your message here..." value={form.message} onChange={e=>set('message',e.target.value)} />
        </div>

        {/* Quick templates */}
        <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'0.5rem' }}>Quick Templates:</p>
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.25rem' }}>
          {[
            { label:'Deadline Reminder', msg:'Please complete your NAAC documentation before the deadline. Pending criteria require immediate attention.' },
            { label:'Verification Done', msg:'Your NAAC submission has been reviewed. Please check your notification for feedback.' },
            { label:'Upload Documents', msg:'Please upload the required supporting documents for all completed criteria.' },
          ].map(t => (
            <button key={t.label} className="btn btn-ghost btn-sm" onClick={()=>set('message',t.msg)}>{t.label}</button>
          ))}
        </div>

        <button className="btn btn-primary btn-full" onClick={handleSend} disabled={sending}>
          {sending ? '⏳ Sending...' : mode==='broadcast' ? '📢 Send to All Teachers' : '📨 Send Notification'}
        </button>
      </div>
    </div>
  );
}
