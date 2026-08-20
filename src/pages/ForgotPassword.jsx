import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Moon, Sun } from 'lucide-react';
import api from '../api';
import { LOGIN_URL } from '../routes/route_constants';
import { IconButton } from '@mui/material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
          <h1><KeyRound size={32} color="var(--primary)" /> Forgot Password</h1>
          <p>Enter your email and we'll send you a link to reset your password.</p>
        </div>

        {message && <div className="success-msg">{message}</div>}
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer">
          Remember your password? <Link to={LOGIN_URL}>Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
