import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Headphones, Mic2, Moon, Sun } from 'lucide-react';
import { REGISTER_URL } from '../routes/route_constants';
import { IconButton } from '@mui/material';

const RoleSelection = () => {
  const navigate = useNavigate();
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

  const handleSelectRole = (role) => {
    navigate(`${REGISTER_URL}?role=${role}`);
  };

  return (
    <div className="role-selection-container" style={{ position: 'relative' }}>
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
      <div style={{ width: '100%', maxWidth: '700px' }}>
        <h1 className="role-selection-title">How will you use Mosique?</h1>
        <div className="role-cards-grid">
          
          <div className="role-card" onClick={() => handleSelectRole('listener')}>
            <div className="role-card-icon" style={{ background: 'var(--primary-bg)' }}>
              <Headphones size={32} color="var(--primary)" />
            </div>
            <h3>Listener</h3>
            <p>Discover new music, create playlists, and follow your favorite artists.</p>
            <span className="role-btn" style={{ background: 'var(--primary)', color: 'white' }}>
              Join as Listener
            </span>
          </div>

          <div className="role-card" onClick={() => handleSelectRole('artist')}>
            <div className="role-card-icon" style={{ background: 'rgba(232, 160, 191, 0.15)' }}>
              <Mic2 size={32} color="var(--accent-pink)" />
            </div>
            <h3>Artist</h3>
            <p>Share your music with the world, connect with fans, and grow your audience.</p>
            <span className="role-btn" style={{ background: 'var(--accent-pink)', color: 'white' }}>
              Join as Artist
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
