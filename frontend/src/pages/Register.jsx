import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GoogleLogin } from '@react-oauth/google';
import api from '../utils/api';
import { GraduationCap, User, ShieldCheck, Loader2, Eye, EyeOff, Sun, Moon } from 'lucide-react';

const DEPARTMENTS = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Electrical','Mathematics','Physics','Chemistry','English','Commerce','Management','BBA','BCA','MBA','MCA','Other'];

export default function Register() {
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'teacher', department: '', designation: '', qualification: '', experience: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.phone && !/^\d{10}$/.test(form.phone)) return setError('Phone number must be exactly 10 digits');
    
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.role === 'hod') payload.designation = 'HOD';

      const user = await register(payload);
      navigate(user.role === 'hod' ? '/hod/dashboard' : (user.profile_complete ? '/dashboard' : '/profile-setup'));
    } catch (err) { setError(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');
      // If the user uses Google Sign In here, we pass the current selected role
      const res = await api.post('/auth/google', { token: credentialResponse.credential, role: form.role });
      localStorage.setItem('token', res.data.token);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.error || 'Google registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: '2rem' }}>
      <button className="btn btn-ghost" onClick={toggleTheme} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', borderRadius: '50%', padding: '0.5rem' }}>
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
      <div className="auth-card card card-lg fade-in" style={{ maxWidth: 560 }}>
        <div className="auth-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <GraduationCap size={48} color="var(--primary)" />
          <h1 style={{ margin: 0, fontSize: '1.5rem', lineHeight: 1.2 }}>Dr. Babasaheb Ambedkar Technological University</h1>
          <p style={{ margin: 0, color: 'var(--accent)', fontWeight: 600, marginTop: '0.25rem' }}>(DBATU) NAAC Portal</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Role selection */}
          <div className="form-group">
            <label className="form-label">Register As <span className="required">*</span></label>
            <div className="radio-group">
              {['teacher','hod'].map(r => (
                <label key={r} className={`radio-option${form.role===r?' selected':''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <input type="radio" value={r} checked={form.role===r} onChange={() => set('role', r)} />
                  {r === 'teacher' ? <User size={18} /> : <ShieldCheck size={18} />}
                  {r === 'teacher' ? 'Teacher' : 'HOD'}
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
          {form.role === 'teacher' && (
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Password <span className="required">*</span></label>
                <div className="password-wrapper">
                  <input className="input" type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={form.password} onChange={e=>set('password',e.target.value)} required={form.role === 'teacher'} style={{ paddingRight: '2.5rem' }} />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password <span className="required">*</span></label>
                <div className="password-wrapper">
                  <input className="input" type={showConfirm ? "text" : "password"} placeholder="Repeat password" value={form.confirm} onChange={e=>set('confirm',e.target.value)} required={form.role === 'teacher'} style={{ paddingRight: '2.5rem' }} />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {form.role === 'hod' && (
            <div className="alert alert-info">
              <strong>Note:</strong> HODs do not need to set a password during registration. A global password has been set by the college management.
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="input" placeholder="+91 9876543210" value={form.phone} onChange={e=>set('phone',e.target.value)} />
          </div>
          
          <div className="divider" style={{ margin: '0' }} />
          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {loading ? <><Loader2 className="spin" size={20} /> Registering...</> : <><User size={20} /> Create Account</>}
          </button>

          <div className="divider" style={{ margin: '1rem 0', position: 'relative', textAlign: 'center' }}>
            <span style={{ background: 'var(--bg-card)', padding: '0 10px', color: 'var(--text-muted)', fontSize: '0.8rem', position: 'relative', top: '-0.7em' }}>OR</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              onError={() => setError('Google Login Failed')}
              theme={theme === 'dark' ? 'filled_black' : 'outline'}
              shape="rectangular"
              text="signup_with"
            />
          </div>
        </form>
        <div className="divider" />
        <p style={{ textAlign:'center', fontSize:'0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
