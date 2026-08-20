import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { DASHBOARD_URL, FORGOT_PASSWORD_URL, ROLE_SELECTION_URL, CHANGE_PASSWORD_URL } from '../routes/route_constants';
import { IconButton } from '@mui/material';
import { useDispatch } from 'react-redux';
import { showToast } from '../store/slices/notificationSlice';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    setLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      dispatch(showToast({ message: 'Login successful!', type: 'success' }));
      if (data.user?.must_change_password) {
        navigate(CHANGE_PASSWORD_URL);
      } else {
        navigate(DASHBOARD_URL);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errMsg);
      dispatch(showToast({ message: errMsg, type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        <IconButton 
          onClick={() => setDarkMode(!darkMode)} 
          sx={{ 
            color: 'var(--text-main)', 
            bgcolor: 'var(--bg-card)', 
            boxShadow: 'var(--shadow-md)',
            '&:hover': { bgcolor: 'var(--bg-elevated)' } 
          }}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </IconButton>
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <h1><LogIn size={32} color="var(--primary)" /> Log in to Mosique</h1>
          <p>Welcome back to the music.</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Email address"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1rem', marginTop: '-0.5rem' }}>
            <Link to={FORGOT_PASSWORD_URL} style={{ fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot your password?</Link>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to={ROLE_SELECTION_URL}>Sign up for Mosique</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
