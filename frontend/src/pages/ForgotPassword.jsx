import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { GraduationCap, Mail, Loader2, Sun, Moon } from 'lucide-react';

export default function ForgotPassword() {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatus('');
    
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setStatus(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

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
        <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Reset Password</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Enter your registered email address and we'll send you a link to reset your password.
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {status && <div className="alert alert-success">{status}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="input" type="email" placeholder="your@email.com" value={email}
              onChange={e => setEmail(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {loading ? <><Loader2 className="spin" size={20} /> Sending...</> : <><Mail size={20} /> Send Reset Link</>}
          </button>
        </form>
        <div className="divider" />
        <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
          Remember your password? <Link to="/login" style={{ color: 'var(--accent)' }}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
