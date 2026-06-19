import { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock, Mail, Building2, GraduationCap, Phone, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function PendingApprovals() {
  const { user: hod } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [messages, setMessages] = useState({});

  const fetchPending = () => {
    setLoading(true);
    api.get('/auth/hod/pending-teachers')
      .then(r => setPending(r.data))
      .catch(() => setPending([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (teacherId, action) => {
    setActionLoading(p => ({ ...p, [teacherId]: action }));
    setMessages(p => ({ ...p, [teacherId]: '' }));
    try {
      const endpoint = action === 'approve' ? '/auth/hod/approve-teacher' : '/auth/hod/reject-teacher';
      const res = await api.post(endpoint, { teacherId });
      setMessages(p => ({ ...p, [teacherId]: res.data.message }));
      // Remove from list after short delay
      setTimeout(() => {
        setPending(prev => prev.filter(t => t.id !== teacherId));
      }, 2000);
    } catch (err) {
      setMessages(p => ({ ...p, [teacherId]: err.response?.data?.error || 'Action failed' }));
    } finally {
      setActionLoading(p => ({ ...p, [teacherId]: null }));
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={24} color="var(--accent)" /> Pending Approvals
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Teachers from <strong>{hod?.department}</strong> department awaiting your approval
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchPending} disabled={loading}>
          ↻ Refresh
        </button>
      </div>

      <div className="alert alert-info" style={{ marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Mail size={16} style={{ flexShrink: 0 }} />
        <span><strong>Note:</strong> Automated approval emails containing login credentials may be routed to the teacher's <strong>Spam/Junk folder</strong>. Please inform them to check their spam folder after you approve them.</span>
      </div>

      {loading ? (
        <div className="loader"><div className="loader-dot"/><div className="loader-dot"/><div className="loader-dot"/></div>
      ) : pending.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <UserCheck size={56} color="var(--success)" style={{ marginBottom: '1rem', opacity: 0.7 }} />
          <h3 style={{ color: 'var(--success)' }}>All Clear!</h3>
          <p style={{ color: 'var(--text-muted)' }}>No pending teacher registration requests for your department.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pending.map(teacher => (
            <div key={teacher.id} className="card fade-in" style={{ borderLeft: '4px solid var(--accent)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Avatar */}
                <div className="sidebar-avatar" style={{ width: 52, height: 52, fontSize: '1.1rem', flexShrink: 0 }}>
                  {teacher.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>{teacher.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Mail size={13} /> {teacher.email}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Building2 size={13} /> {teacher.department}
                    </span>
                    {teacher.designation && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Briefcase size={13} /> {teacher.designation}
                      </span>
                    )}
                    {teacher.qualification && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <GraduationCap size={13} /> {teacher.qualification}
                      </span>
                    )}
                    {teacher.phone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Phone size={13} /> {teacher.phone}
                      </span>
                    )}
                    {teacher.experience && (
                      <span>⏱ {teacher.experience} yrs experience</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                    Requested on: {new Date(teacher.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', flexShrink: 0 }}>
                  {messages[teacher.id] ? (
                    <div className={`badge ${messages[teacher.id].toLowerCase().includes('error') || messages[teacher.id].toLowerCase().includes('fail') ? 'badge-revision' : 'badge-verified'}`}
                      style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem', maxWidth: 220, textAlign: 'right' }}>
                      {messages[teacher.id]}
                    </div>
                  ) : (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleAction(teacher.id, 'approve')}
                        disabled={!!actionLoading[teacher.id]}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 130 }}
                      >
                        {actionLoading[teacher.id] === 'approve'
                          ? '⏳ Approving...'
                          : <><UserCheck size={15} /> Approve & Email</>}
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleAction(teacher.id, 'reject')}
                        disabled={!!actionLoading[teacher.id]}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 130, background: 'var(--danger)', color: '#fff', border: 'none' }}
                      >
                        {actionLoading[teacher.id] === 'reject'
                          ? '⏳ Rejecting...'
                          : <><UserX size={15} /> Reject</>}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
