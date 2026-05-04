import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../utils/api';

const teacherLinks = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/criteria', icon: '📋', label: 'NAAC Criteria' },
  { to: '/documents', icon: '📁', label: 'My Documents' },
  { to: '/export', icon: '📤', label: 'Export Report' },
  { to: '/notifications', icon: '🔔', label: 'Notifications' },
];

const hodLinks = [
  { to: '/hod/dashboard', icon: '📊', label: 'HOD Dashboard' },
  { to: '/hod/teachers', icon: '👥', label: 'All Teachers' },
  { to: '/hod/audit', icon: '📜', label: 'Audit Log' },
  { to: '/hod/export', icon: '📤', label: 'Consolidated Export' },
  { to: '/hod/notifications', icon: '🔔', label: 'Send Notifications' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const links = user?.role === 'hod' ? hodLinks : teacherLinks;

  useEffect(() => {
    if (user) {
      api.get('/notifications/unread-count').then(r => setUnread(r.data.count)).catch(() => {});
      const interval = setInterval(() => {
        api.get('/notifications/unread-count').then(r => setUnread(r.data.count)).catch(() => {});
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>🎓 NAAC Portal</h2>
        <p>{user?.role === 'hod' ? 'HOD Control Panel' : 'Teacher Portal'}</p>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Navigation</div>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <span className="icon">{link.icon}</span>
            <span>{link.label}</span>
            {link.label === 'Notifications' && unread > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--danger)', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700 }}>{unread}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.department || user?.role}</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm btn-full" onClick={handleLogout}>🚪 Logout</button>
      </div>
    </aside>
  );
}
