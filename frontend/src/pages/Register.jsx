import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { GraduationCap, User, Loader2, Sun, Moon, CheckCircle2, ClipboardList } from 'lucide-react';

const DEPARTMENTS = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Electrical','Mathematics','Physics','Chemistry','English','Commerce','Management','BBA','BCA','MBA','MCA','Other'];

export default function Register() {
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({ name: '', email: '', department: '', designation: '', qualification: '', experience: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.phone && !/^\d{10}$/.test(form.phone)) return setError('Phone number must be exactly 10 digits');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card card-lg fade-in" style={{ maxWidth: 560 }}>
        {/* Theme toggle inside card — top right corner */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={toggleTheme} style={{ borderRadius: '50%', padding: '0.4rem' }} title="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
        <div className="auth-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <GraduationCap size={44} color="var(--accent)" />
          <h1 style={{ margin: 0, fontSize: '1.4rem', lineHeight: 1.2 }}>Dr. Babasaheb Ambedkar Technological University</h1>
          <p style={{ margin: 0, color: 'var(--accent)', fontWeight: 600, marginTop: '0.25rem' }}>(DBATU) NAAC Portal</p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <CheckCircle2 size={64} color="var(--success)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ color: 'var(--success)', marginBottom: '0.75rem' }}>Request Submitted!</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Your registration request has been submitted to your <strong>{form.department}</strong> department HOD.
              <br /><br />
              Once your HOD approves your request, you will receive an email at <strong>{form.email}</strong> with your login credentials.
            </p>
            <div className="alert" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.875rem 1rem', textAlign: 'left', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <ClipboardList size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>What happens next?</strong><br />
                  1. HOD reviews your request in their dashboard<br />
                  2. HOD approves your account<br />
                  3. You receive an email with a temporary password<br />
                  4. You log in and set your permanent password
                </div>
              </div>
            </div>
            <Link to="/login" className="btn btn-primary btn-full">Back to Login</Link>
          </div>
        ) : (
          <>
            <h2 style={{ marginBottom: '0.25rem' }}>Teacher Registration</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Submit your access request. Your HOD will approve and email your login credentials.
            </p>
            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name <span className="required">*</span></label>
                  <input className="input" placeholder="Dr. John Doe" value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address <span className="required">*</span></label>
                  <input className="input" type="email" placeholder="your@college.edu" value={form.email} onChange={e => set('email', e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department <span className="required">*</span></label>
                <select className="select" value={form.department} onChange={e => set('department', e.target.value)} required>
                  <option value="">Select Department...</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input className="input" placeholder="e.g. Assistant Professor" value={form.designation} onChange={e => set('designation', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Qualification</label>
                  <input className="input" placeholder="e.g. M.Tech, Ph.D" value={form.qualification} onChange={e => set('qualification', e.target.value)} />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input className="input" type="number" placeholder="e.g. 5" value={form.experience} onChange={e => set('experience', e.target.value)} min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="input" placeholder="10-digit number" value={form.phone} onChange={e => set('phone', e.target.value)} maxLength={10} />
                </div>
              </div>

              <div className="divider" style={{ margin: '0' }} />
              <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {loading ? <><Loader2 className="spin" size={20} /> Submitting Request...</> : <><User size={20} /> Submit Registration Request</>}
              </button>
            </form>
          </>
        )}

        {!submitted && (
          <>
            <div className="divider" />
            <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign In</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
