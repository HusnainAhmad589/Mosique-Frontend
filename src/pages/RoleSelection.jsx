import { useNavigate } from 'react-router-dom';
import { Headphones, Mic2 } from 'lucide-react';
import { REGISTER_URL } from '../routes/route_constants';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    navigate(`${REGISTER_URL}?role=${role}`);
  };

  return (
    <div className="role-selection-container">
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
