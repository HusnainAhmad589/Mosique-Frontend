import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProfileInfo from './pages/ProfileInfo';
import {
  LOGIN_URL,
  ROLE_SELECTION_URL,
  REGISTER_URL,
  FORGOT_PASSWORD_URL,
  RESET_PASSWORD_URL,
  DASHBOARD_URL,
  CHANGE_PASSWORD_URL,
  PROFILE_URL
} from './routes/route_constants';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null; // Or a spinner
  return user ? children : <Navigate to={LOGIN_URL} />;
};

// Public Route Wrapper (Redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (user) {
    if (user.must_change_password) return <Navigate to={CHANGE_PASSWORD_URL} />;
    return <Navigate to={DASHBOARD_URL} />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path={LOGIN_URL} element={<PublicRoute><Login /></PublicRoute>} />
        <Route path={ROLE_SELECTION_URL} element={<PublicRoute><RoleSelection /></PublicRoute>} />
        <Route path={REGISTER_URL} element={<PublicRoute><Register /></PublicRoute>} />
        <Route path={FORGOT_PASSWORD_URL} element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path={`${RESET_PASSWORD_URL}/:token`} element={<PublicRoute><ResetPassword /></PublicRoute>} />
        
        <Route path={DASHBOARD_URL} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path={CHANGE_PASSWORD_URL} element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        <Route path={PROFILE_URL} element={<ProtectedRoute><ProfileInfo /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to={DASHBOARD_URL} />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
