import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GoogleLogin } from '@react-oauth/google';
import api from '../utils/api';
import { GraduationCap, LogIn, Loader2, Eye, EyeOff, Sun, Moon } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'hod' ? '/hod/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/google', { token: credentialResponse.credential });
      localStorage.setItem('token', res.data.token);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.error || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button className="btn btn-ghost" onClick={toggleTheme} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', borderRadius: '50%', padding: '0.5rem' }}>
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
      <div className="auth-card card card-lg fade-in">
        <div className="auth-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <GraduationCap size={48} color="var(--primary)" />
          <h1 style={{ margin: 0, fontSize: '1.5rem', lineHeight: 1.2 }}>Dr. Babasaheb Ambedkar Technological University</h1>
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
              <input className="input" type={showPassword ? "text" : "password"} placeholder="••••••••" value={form.password}
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
          
          <div className="divider" style={{ margin: '1rem 0', position: 'relative', textAlign: 'center' }}>
            <span style={{ background: 'var(--bg-card)', padding: '0 10px', color: 'var(--text-muted)', fontSize: '0.8rem', position: 'relative', top: '-0.7em' }}>OR</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              onError={() => setError('Google Login Failed')}
              theme={theme === 'dark' ? 'filled_black' : 'outline'}
              shape="rectangular"
            />
          </div>
        </form>
        <div className="divider" />
        <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}
