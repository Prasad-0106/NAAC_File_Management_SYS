import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Electrical','Mathematics','Physics','Chemistry','English','Commerce','Management','BBA','BCA','MBA','MCA','Other'];

export default function ProfileSetup() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name||'', department: user?.department||'', designation: user?.designation||'', qualification: user?.qualification||'', experience: user?.experience||'', phone: user?.phone||'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    if (!form.department || !form.designation) return setError('Department and Designation are required');
    setLoading(true);
    try {
      await updateProfile(form);
      navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.error || 'Failed to update profile'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card card-lg fade-in" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <h1>👤 Complete Profile</h1>
          <p>Please fill in your academic details to continue</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="alert alert-info">Welcome, {user?.name}! Please complete your profile before accessing the portal.</div>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem', marginTop:'1rem' }}>
          <div className="form-group">
            <label className="form-label">Full Name <span className="required">*</span></label>
            <input className="input" value={form.name} onChange={e=>set('name',e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Department <span className="required">*</span></label>
            <select className="select" value={form.department} onChange={e=>set('department',e.target.value)} required>
              <option value="">Select your department</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Designation <span className="required">*</span></label>
            <select className="select" value={form.designation} onChange={e=>set('designation',e.target.value)} required>
              <option value="">Select designation</option>
              {['Assistant Professor','Associate Professor','Professor','HOD','Principal','Lecturer'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Qualification</label>
              <input className="input" placeholder="Ph.D, M.Tech..." value={form.qualification} onChange={e=>set('qualification',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Experience (Years)</label>
              <input className="input" type="number" value={form.experience} onChange={e=>set('experience',e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="input" placeholder="+91 9876543210" value={form.phone} onChange={e=>set('phone',e.target.value)} />
          </div>
          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading}>
            {loading ? '⏳ Saving...' : '✅ Save Profile & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
