import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { GraduationCap, LogIn, Loader2, Eye, EyeOff, Sun, Moon, KeyRound, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Force-reset state: when backend says the user must set a new password
  const [forceReset, setForceReset] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: form.email, password: form.password });
      if (res.data.requirePasswordReset) {
        setResetToken(res.data.resetToken);
        setResetEmail(res.data.email);
        setForceReset(true);
      } else {
        const { token, user } = res.data;
        localStorage.setItem('naac_token', token);
        localStorage.setItem('naac_user', JSON.stringify(user));
        if (user.role === 'superadmin') window.location.href = '/superadmin/dashboard';
        else window.location.href = user.role === 'hod' ? '/hod/dashboard' : '/dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  const handleForceReset = async e => {
    e.preventDefault();
    if (newPassword.length < 8) return setError('Password must be at least 8 characters');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    setError(''); setResetLoading(true);
    try {
      const res = await api.post('/auth/set-permanent-password', { resetToken, newPassword });
      const { token, user } = res.data;
      // Manually store token and trigger auth context login
      localStorage.setItem('naac_token', token);
      localStorage.setItem('naac_user', JSON.stringify(user));
      // Re-use the login flow via a fresh credential attempt or just redirect
      window.location.href = user.role === 'hod' ? '/hod/dashboard' : '/dashboard';
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to set password. Please try logging in again.');
    } finally { setResetLoading(false); }
  };

  // ── Force Password Reset Screen ─────────────────────────────────────────
  if (forceReset) {
    return (
      <div className="auth-page">
        <div className="auth-card card card-lg fade-in">
          <div className="auth-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <KeyRound size={48} color="var(--accent)" />
            <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Set Your Permanent Password</h1>
          </div>
          <div className="alert" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--accent)', borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <ShieldCheck size={20} color="var(--accent)" />
              <div style={{ fontSize: '0.875rem' }}>
                Welcome! You're logging in for the first time as <strong>{resetEmail}</strong>.<br />
                Please create a strong permanent password to continue.
              </div>
            </div>
          </div>
          {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
          <form onSubmit={handleForceReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">New Password <span className="required">*</span></label>
              <div className="password-wrapper">
                <input className="input" type={showNew ? 'text' : 'password'} placeholder="Min 8 characters" value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} required style={{ paddingRight: '2.5rem' }} />
                <button type="button" className="password-toggle" onClick={() => setShowNew(p => !p)}>
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password <span className="required">*</span></label>
              <div className="password-wrapper">
                <input className="input" type={showConfirm ? 'text' : 'password'} placeholder="Repeat password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} required style={{ paddingRight: '2.5rem' }} />
                <button type="button" className="password-toggle" onClick={() => setShowConfirm(p => !p)}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={resetLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {resetLoading ? <><Loader2 className="spin" size={20} /> Saving...</> : <><KeyRound size={20} /> Set Password & Continue</>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Normal Login Screen ──────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card card card-lg fade-in">
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
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Welcome Back</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="input" type="email" placeholder="your@email.com" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="form-group" style={{ marginBottom: '0.5rem' }}>
            <label className="form-label">Password</label>
            <div className="password-wrapper">
              <input className="input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required style={{ paddingRight: '2.5rem' }} />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div style={{ textAlign: 'right', marginTop: '0.25rem' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none' }}>Forgot Password?</Link>
            </div>
          </div>
          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {loading ? <><Loader2 className="spin" size={20} /> Signing in...</> : <><LogIn size={20} /> Sign In</>}
          </button>
        </form>
        <div className="divider" />
        <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
          New teacher? <Link to="/register" style={{ color: 'var(--accent)' }}>Request Access</Link>
        </p>
      </div>
    </div>
  );
}
