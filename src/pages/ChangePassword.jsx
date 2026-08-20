import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, ArrowLeft, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import api from '../api';
import { DASHBOARD_URL } from '../routes/route_constants';
import { IconButton } from '@mui/material';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ old_password: '', new_password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.put('/auth/change-password', formData);
      setSuccess('Password updated successfully! You can now use your new password.');
      setFormData({ old_password: '', new_password: '' });
      setTimeout(() => navigate(DASHBOARD_URL), 2500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map(e => e.message).join(' '));
      } else {
        setError(err.response?.data?.message || 'Failed to update password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to={DASHBOARD_URL} className="link" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: 'var(--text-muted)' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <IconButton 
            onClick={() => setDarkMode(!darkMode)} 
            sx={{ color: 'var(--text-secondary)' }}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
        </div>

        <div className="auth-header">
          <h1><KeyRound size={32} color="var(--primary)" /> Change Password</h1>
          <p>Secure your Mosique account.</p>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <div className="password-wrapper">
              <input
                type={showOldPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter current password"
                required
                value={formData.old_password}
                onChange={(e) => setFormData({ ...formData, old_password: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>New Password</label>
            <div className="password-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                className="form-control"
                placeholder="min 4 characters"
                required
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
