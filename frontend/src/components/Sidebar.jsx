import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { LayoutDashboard, ClipboardList, Folder, Download, Bell, Users, History, GraduationCap, LogOut, Sun, Moon } from 'lucide-react';

const teacherLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/criteria', icon: ClipboardList, label: 'NAAC Criteria' },
  { to: '/documents', icon: Folder, label: 'My Documents' },
  { to: '/export', icon: Download, label: 'Export Report' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

const hodLinks = [
  { to: '/hod/dashboard', icon: LayoutDashboard, label: 'HOD Dashboard' },
  { to: '/hod/teachers', icon: Users, label: 'All Teachers' },
  { to: '/hod/audit', icon: History, label: 'Audit Log' },
  { to: '/hod/export', icon: Download, label: 'Consolidated Export' },
  { to: '/hod/notifications', icon: Bell, label: 'Send Notifications' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <GraduationCap size={28} color="var(--primary)" />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', lineHeight: 1.1 }}>DBATU</h2>
          <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.7 }}>NAAC {user?.role === 'hod' ? 'Control Panel' : 'Portal'}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Navigation</div>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <span className="icon" style={{ display: 'flex' }}><link.icon size={18} /></span>
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={toggleTheme} title="Toggle Theme" style={{ padding: '0.5rem' }}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button className="btn btn-ghost btn-sm btn-full" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flex: 1 }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
