import { useState, useEffect } from 'react';
import { GraduationCap, ShieldCheck, Plus, Users, Loader2, CheckCircle2, Building2, Mail, X, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const DEPARTMENTS = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Electrical','Mathematics','Physics','Chemistry','English','Commerce','Management','BBA','BCA','MBA','MCA','Other'];

export default function SuperAdminDashboard() {
  const [hods, setHods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', department: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchHods = () => {
    setLoading(true);
    api.get('/auth/superadmin/hods').then(r => setHods(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchHods(); }, []);

  const handleInvite = async e => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.post('/auth/superadmin/invite-hod', form);
      setMessage({ type: 'success', text: res.data.message });
      setForm({ name: '', email: '', department: '' });
      setShowForm(false);
      fetchHods();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to invite HOD' });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete HOD ${name}? This action cannot be undone.`)) return;
    
    try {
      await api.delete(`/auth/superadmin/hods/${id}`);
      setMessage({ type: 'success', text: `HOD ${name} deleted successfully.` });
      fetchHods();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to delete HOD' });
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={32} color="var(--primary)" />
          <div>
            <h1 style={{ margin: 0 }}>Super Admin Panel</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Provision and manage HOD accounts</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(p => !p); setMessage({ type: '', text: '' }); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {showForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Invite New HOD</>}
        </button>
      </div>

      {/* Flash message */}
      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '1.5rem' }}>
          {message.type === 'success' && <CheckCircle2 size={16} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />}
          {message.text}
        </div>
      )}

      {/* Invite Form */}
      {showForm && (
        <div className="card fade-in" style={{ marginBottom: '2rem', borderTop: '3px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} color="var(--primary)" /> Invite a New HOD
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            A temporary password will be auto-generated and emailed to the HOD. They will set a permanent password on first login.
          </p>
          <form onSubmit={handleInvite}>
            <div className="grid-2" style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <input className="input" placeholder="Dr. Ramesh Sharma" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Official Email <span className="required">*</span></label>
                <input className="input" type="email" placeholder="hod@dbatu.ac.in" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Department <span className="required">*</span></label>
              <select className="select" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} required>
                <option value="">Select Department...</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {submitting ? <><Loader2 className="spin" size={18} /> Creating Account & Sending Email...</> : <><Mail size={18} /> Create HOD & Send Credentials</>}
            </button>
          </form>
        </div>
      )}

      {/* HOD List */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={18} color="var(--accent)" /> Registered HODs ({hods.length})
        </h3>
        {loading ? (
          <div className="loader"><div className="loader-dot"/><div className="loader-dot"/><div className="loader-dot"/></div>
        ) : hods.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <GraduationCap size={48} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p>No HOD accounts yet. Invite your first HOD above.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>HOD</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hods.map(hod => (
                  <tr key={hod.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div className="sidebar-avatar" style={{ width: 34, height: 34, fontSize: '0.8rem', flexShrink: 0 }}>
                          {hod.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{hod.name}</div>
                          {hod.designation && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hod.designation}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{hod.email}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                        <Building2 size={13} color="var(--text-muted)" /> {hod.department || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${hod.status === 'Active' ? 'badge-verified' : 'badge-pending'}`}>
                        {hod.forcePasswordReset ? 'Awaiting First Login' : (hod.status || 'Active')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {hod.created_at ? new Date(hod.created_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.35rem 0.5rem', color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
                        title="Delete HOD"
                        onClick={() => handleDelete(hod.id, hod.name)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
