import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Electrical','Mathematics','Physics','Chemistry','English','Commerce','Management','BBA','BCA','MBA','MCA','Other'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'teacher', department: '', designation: '', qualification: '', experience: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password, role: form.role, department: form.department, designation: form.designation, qualification: form.qualification, experience: form.experience, phone: form.phone });
      navigate(user.role === 'hod' ? '/hod/dashboard' : (user.profile_complete ? '/dashboard' : '/profile-setup'));
    } catch (err) { setError(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: '2rem' }}>
      <div className="auth-card card card-lg fade-in" style={{ maxWidth: 560 }}>
        <div className="auth-logo">
          <h1>🎓 NAAC Portal</h1>
          <p>Create your account</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Role selection */}
          <div className="form-group">
            <label className="form-label">Register As <span className="required">*</span></label>
            <div className="radio-group">
              {['teacher','hod'].map(r => (
                <label key={r} className={`radio-option${form.role===r?' selected':''}`}>
                  <input type="radio" value={r} checked={form.role===r} onChange={() => set('role', r)} />
                  {r === 'teacher' ? '👩‍🏫 Teacher' : '🏫 HOD'}
                </label>
              ))}
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <input className="input" placeholder="Dr. John Doe" value={form.name} onChange={e=>set('name',e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email <span className="required">*</span></label>
              <input className="input" type="email" placeholder="email@college.edu" value={form.email} onChange={e=>set('email',e.target.value)} required />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Password <span className="required">*</span></label>
              <input className="input" type="password" placeholder="Min 6 characters" value={form.password} onChange={e=>set('password',e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password <span className="required">*</span></label>
              <input className="input" type="password" placeholder="Repeat password" value={form.confirm} onChange={e=>set('confirm',e.target.value)} required />
            </div>
          </div>
          <div className="divider" style={{ margin: '0' }} />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Profile Details (complete now or later)</p>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="select" value={form.department} onChange={e=>set('department',e.target.value)}>
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <select className="select" value={form.designation} onChange={e=>set('designation',e.target.value)}>
                <option value="">Select Designation</option>
                {['Assistant Professor','Associate Professor','Professor','HOD','Principal','Lecturer'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Qualification</label>
              <input className="input" placeholder="e.g. Ph.D, M.Tech" value={form.qualification} onChange={e=>set('qualification',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Experience (Years)</label>
              <input className="input" type="number" placeholder="10" value={form.experience} onChange={e=>set('experience',e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="input" placeholder="+91 9876543210" value={form.phone} onChange={e=>set('phone',e.target.value)} />
          </div>
          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading}>
            {loading ? '⏳ Creating Account...' : '✅ Create Account'}
          </button>
        </form>
        <div className="divider" />
        <p style={{ textAlign:'center', fontSize:'0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
