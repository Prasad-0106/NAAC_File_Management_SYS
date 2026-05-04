import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProfileSetup from './pages/ProfileSetup';
import TeacherDashboard from './pages/teacher/Dashboard';
import CriteriaOverview from './pages/teacher/CriteriaOverview';
import CriterionPage from './pages/teacher/CriterionPage';
import SubCriterionForm from './pages/teacher/SubCriterionForm';
import Documents from './pages/teacher/Documents';
import ExportPage from './pages/teacher/ExportPage';
import Notifications from './pages/teacher/Notifications';
import HodDashboard from './pages/hod/HodDashboard';
import TeacherList from './pages/hod/TeacherList';
import TeacherDetail from './pages/hod/TeacherDetail';
import AuditLog from './pages/hod/AuditLog';
import HodExport from './pages/hod/HodExport';
import HodNotifications from './pages/hod/HodNotifications';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader"><div className="loader-dot"/><div className="loader-dot"/><div className="loader-dot"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'hod' ? '/hod/dashboard' : '/dashboard'} replace />;
  if (user.role === 'teacher' && !user.profile_complete && window.location.pathname !== '/profile-setup') return <Navigate to="/profile-setup" replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />

      {/* Teacher routes */}
      <Route path="/dashboard" element={<ProtectedRoute role="teacher"><AppLayout><TeacherDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/criteria" element={<ProtectedRoute role="teacher"><AppLayout><CriteriaOverview /></AppLayout></ProtectedRoute>} />
      <Route path="/criteria/:criterionNo" element={<ProtectedRoute role="teacher"><AppLayout><CriterionPage /></AppLayout></ProtectedRoute>} />
      <Route path="/criteria/:criterionNo/:subCode" element={<ProtectedRoute role="teacher"><AppLayout><SubCriterionForm /></AppLayout></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute role="teacher"><AppLayout><Documents /></AppLayout></ProtectedRoute>} />
      <Route path="/export" element={<ProtectedRoute role="teacher"><AppLayout><ExportPage /></AppLayout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute role="teacher"><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />

      {/* HOD routes */}
      <Route path="/hod/dashboard" element={<ProtectedRoute role="hod"><AppLayout><HodDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/hod/teachers" element={<ProtectedRoute role="hod"><AppLayout><TeacherList /></AppLayout></ProtectedRoute>} />
      <Route path="/hod/teachers/:teacherId" element={<ProtectedRoute role="hod"><AppLayout><TeacherDetail /></AppLayout></ProtectedRoute>} />
      <Route path="/hod/audit" element={<ProtectedRoute role="hod"><AppLayout><AuditLog /></AppLayout></ProtectedRoute>} />
      <Route path="/hod/export" element={<ProtectedRoute role="hod"><AppLayout><HodExport /></AppLayout></ProtectedRoute>} />
      <Route path="/hod/notifications" element={<ProtectedRoute role="hod"><AppLayout><HodNotifications /></AppLayout></ProtectedRoute>} />

      <Route path="/" element={user ? <Navigate to={user.role === 'hod' ? '/hod/dashboard' : '/dashboard'} replace /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder_client_id';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
