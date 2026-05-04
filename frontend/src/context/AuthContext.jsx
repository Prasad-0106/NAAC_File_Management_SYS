import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('naac_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('naac_token');
    if (token) {
      api.get('/auth/me').then(r => { setUser(r.data); localStorage.setItem('naac_user', JSON.stringify(r.data)); })
        .catch(() => { localStorage.removeItem('naac_token'); localStorage.removeItem('naac_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password });
    localStorage.setItem('naac_token', r.data.token);
    localStorage.setItem('naac_user', JSON.stringify(r.data.user));
    setUser(r.data.user);
    return r.data.user;
  };

  const register = async (data) => {
    const r = await api.post('/auth/register', data);
    localStorage.setItem('naac_token', r.data.token);
    localStorage.setItem('naac_user', JSON.stringify(r.data.user));
    setUser(r.data.user);
    return r.data.user;
  };

  const updateProfile = async (data) => {
    const r = await api.put('/auth/profile', data);
    setUser(r.data);
    localStorage.setItem('naac_user', JSON.stringify(r.data));
    return r.data;
  };

  const logout = () => {
    localStorage.removeItem('naac_token');
    localStorage.removeItem('naac_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
