import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { GraduationCap, Lock, Loader2, Eye, EyeOff, Sun, Moon } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (password !== confirm) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      setStatus(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link might be expired.');
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
        <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Create New Password</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        {status && <div className="alert alert-success">{status} Redirecting to login...</div>}

        {!status && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="password-wrapper">
                <input className="input" type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={password}
                  onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '2.5rem' }} />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="password-wrapper">
                <input className="input" type={showConfirm ? "text" : "password"} placeholder="Repeat password" value={confirm}
                  onChange={e => setConfirm(e.target.value)} required style={{ paddingRight: '2.5rem' }} />
                <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {loading ? <><Loader2 className="spin" size={20} /> Resetting...</> : <><Lock size={20} /> Reset Password</>}
            </button>
          </form>
        )}
        <div className="divider" />
        <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
          Back to <Link to="/login" style={{ color: 'var(--accent)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
