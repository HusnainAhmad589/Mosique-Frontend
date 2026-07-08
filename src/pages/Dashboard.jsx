import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Music, LogOut, KeyRound, User as UserIcon, Home, Compass, Library, Disc3, 
  Users, ListMusic, Plus, Search, Bell, ChevronDown, Play, Heart,
  Shuffle, SkipBack, SkipForward, Repeat, Pause, Volume2, SlidersHorizontal, Edit3, Moon, Sun
} from 'lucide-react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Snackbar, Alert, CircularProgress, Box, Button, Grid, Card, CardContent, Divider, Switch, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, ThemeProvider, createTheme } from '@mui/material';
import api from '../api';
import { LOGIN_URL, DASHBOARD_URL, PROFILE_URL, CHANGE_PASSWORD_URL } from '../routes/route_constants';

import SuperAdminPanel from '../components/dashboard/SuperAdminPanel';
import AdminPanel from '../components/dashboard/AdminPanel';

// --- Artist Panel ---
const ArtistPanel = () => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    api.get('/artist/stats')
       .then(res => setStats(res.data))
       .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2 className="panel-title">Artist Studio</h2>
      <div className="panel-stat-grid">
        <div className="panel-stat-card">
          <div className="panel-stat-label">Total Tracks</div>
          <div className="panel-stat-value">{stats?.totalTracks || 0}</div>
        </div>
        <div className="panel-stat-card">
          <div className="panel-stat-label">Total Plays</div>
          <div className="panel-stat-value">{stats?.totalPlays || 0}</div>
        </div>
      </div>
      <div className="panel-card">
        <button className="btn btn-primary" style={{ maxWidth: '240px' }} onClick={() => alert('Upload functionality coming soon!')}>
          <Plus size={18} /> Upload New Track
        </button>
      </div>
    </div>
  );
};

// --- Listener Panel ---
const ListenerPanel = () => {
  const [feed, setFeed] = useState([]);
  
  useEffect(() => {
    api.get('/listener/feed')
       .then(res => setFeed(res.data.feed || []))
       .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2 className="panel-title">Your Music Feed</h2>
      <div className="panel-card">
        {feed.length === 0 ? (
          <div className="panel-empty">
            <Music size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p>Your feed is currently empty. Start discovering music!</p>
          </div>
        ) : (
          feed.map((item, i) => (
            <div key={i} className="panel-feed-item">
              <span style={{ fontWeight: 600 }}>{item.title || 'Unknown Track'}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Moderator Panel ---
const ModeratorPanel = () => {
  const [reports, setReports] = useState([]);
  
  useEffect(() => {
    const fetchReports = () => {
      api.get('/moderator/reports')
         .then(res => setReports(res.data.reports || []))
         .catch(err => console.error(err));
    };
    fetchReports();
  }, []);

  const handleResolve = async (id) => {
    try {
      await api.put(`/moderator/reports/${id}/resolve`);
      setReports(reports.filter(r => r.id !== id));
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="panel-title">Moderation Queue</h2>
      <div className="panel-card">
        {reports.length === 0 ? (
          <div className="panel-empty">
            <p>No pending reports. All clear!</p>
          </div>
        ) : (
          reports.map((report, i) => (
            <div key={i} className="panel-report-item">
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Report #{report.id}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{report.description || 'No description provided'}</div>
              </div>
              <button className="btn btn-outline" style={{ width: 'auto', padding: '8px 20px' }} onClick={() => handleResolve(report.id)}>
                Resolve
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
// --- Dashboard Stats Panel ---
const DashboardStatsPanel = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endpoint = user.role.toLowerCase() === 'superadmin' ? '/super-admin/stats' : '/admin/stats';
        const res = await api.get(endpoint);
        setStats(res.data.stats);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.role]);

  if (loading) return <div className="loading-container"><CircularProgress /></div>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!stats) return null;

  return (
    <div>
      <h2 className="panel-title">Dashboard Overview</h2>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {[
          { label: 'TOTAL USERS', value: stats.totalUsers, color: 'var(--text-main)', glowColor: '#9B82FD' },
          { label: 'ARTISTS REGISTERED', value: stats.artists, color: '#832591', glowColor: '#832591' },
          { label: 'LISTENERS REGISTERED', value: stats.listeners, color: '#e403f4', glowColor: '#e403f4' },
          { label: 'ACTIVE STATUSES', value: stats.activeUsers, color: '#4caf50', glowColor: '#4caf50' },
          { label: 'INACTIVE STATUSES', value: stats.totalUsers - stats.activeUsers, color: '#f44336', glowColor: '#f44336' },
        ].map((item, idx) => (
          <div key={idx} className="dashboard-stat-card" style={{ '--card-glow-color': item.glowColor, flex: '1 1 0', minWidth: '150px', background: 'var(--bg-card)', borderRadius: '12px', padding: '24px 20px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.5px' }}>{item.label}</div>
            <div style={{ fontSize: '3rem', fontWeight: '700', color: item.color, lineHeight: '1' }}>{item.value}</div>
          </div>
        ))}
      </div>

      {stats.recentUsers && stats.recentUsers.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px' }}>Recently Registered Users</h3>
          <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: 'var(--bg-elevated)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Joined</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentUsers.map(u => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {u.username?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: '#333' }}>{u.username}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{u.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          backgroundColor: '#f3e8ff',
                          color: '#7e22ce'
                        }}>
                          {u.Role?.name || 'Unknown'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {u.is_active ? (
                          <span style={{ color: '#10B981', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></div> Active
                          </span>
                        ) : (
                          <span style={{ color: '#EF4444', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }}></div> Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: '#666' }}>
                        {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Manage Admins Panel ---
const ManageAdminsPanel = () => {
  const { user } = useContext(AuthContext);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '' });

  const [isCreating, setIsCreating] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get('/super-admin/users');
      // Filter the returned users to only show admins (excluding superadmins)
      const adminUsers = (res.data.users || []).filter(u => u.Role?.slug === 'admin');
      setAdmins(adminUsers);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setGeneratedPassword('');
    try {
      const res = await api.post('/super-admin/admins', newAdmin);
      setSuccessMsg('Admin created successfully.');
      setGeneratedPassword(res.data.password || newAdmin.password);
      setNewAdmin({ username: '', email: '', password: '' });
      setIsCreating(false);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleStatusChange = async (userId, isActive) => {
    try {
      await api.put(`/super-admin/users/${userId}/status`, { is_active: isActive });
      setSuccessMsg(`Admin status updated successfully.`);
      setAdmins(admins.map(a => a.id === userId ? { ...a, is_active: isActive } : a));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update admin status');
    }
  };

  if (loading && admins.length === 0) return <div className="loading-container"><CircularProgress /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="panel-title" style={{ margin: 0 }}>Manage Admins</h2>
        <button 
          className="btn btn-primary" 
          style={{ width: 'auto', padding: '8px 16px' }}
          onClick={() => {
            setIsCreating(true);
            setError('');
            setSuccessMsg('');
            setGeneratedPassword('');
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
            let pass = '';
            for(let i=0; i<12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
            setNewAdmin({ username: '', email: '', password: pass });
          }}
        >
          Create Admin
        </button>
      </div>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMsg}
          {generatedPassword && (
            <div style={{ marginTop: '8px', fontWeight: 'bold' }}>
              Generated Password: <span style={{ background: '#eee', padding: '2px 6px', borderRadius: '4px', color: '#333' }}>{generatedPassword}</span>
              <br/><small>(Please copy this and share securely with the new admin. It will not be shown again.)</small>
            </div>
          )}
        </Alert>
      )}

      <Dialog open={isCreating} onClose={() => setIsCreating(false)} maxWidth="sm" fullWidth PaperProps={{ style: { borderRadius: '16px', padding: '10px' } }}>
        <DialogTitle style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>Register New Admin</DialogTitle>
        <DialogContent>
          <form id="createAdminForm" onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', marginTop: '10px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>Username</label>
              <input 
                type="text" 
                placeholder="admin_username" 
                value={newAdmin.username} 
                onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>Email</label>
              <input 
                type="email" 
                placeholder="admin@example.com" 
                value={newAdmin.email} 
                onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>Password</label>
              <input 
                type="text" 
                value={newAdmin.password} 
                readOnly
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', boxSizing: 'border-box', background: '#f5f5f5', color: '#666', cursor: 'not-allowed' }}
              />
            </div>
          </form>
        </DialogContent>
        <DialogActions style={{ padding: '0 24px 24px 24px', display: 'flex', gap: '16px' }}>
          <button type="submit" form="createAdminForm" style={{ flex: 1, background: '#6f42c1', color: 'white', padding: '14px', borderRadius: '30px', border: 'none', fontSize: '1.05rem', cursor: 'pointer', fontWeight: '600' }}>
            Register Admin
          </button>
          <button type="button" onClick={() => setIsCreating(false)} style={{ flex: 1, padding: '14px', borderRadius: '30px', border: '1px solid #ddd', background: 'transparent', fontSize: '1.05rem', cursor: 'pointer', fontWeight: '600', color: '#333' }}>
            Cancel
          </button>
        </DialogActions>
      </Dialog>

      <div className="panel-card">
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.id}</TableCell>
                  <TableCell>{admin.username}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Switch
                      checked={admin.is_active}
                      onChange={(e) => handleStatusChange(admin.id, e.target.checked)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {admins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">No admins found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

// --- Static Data for UI ---
const PLACEHOLDER_TRACKS = [
  { title: 'Sunset Dreams', artist: 'Oceans', duration: '3:45', color: '#E8A0BF' },
  { title: 'Midnight City', artist: 'Neon Lights', duration: '4:12', color: '#7C5CFC' },
  { title: 'Bloom', artist: 'Paper Planes', duration: '3:28', color: '#F5B971' },
  { title: 'Weightless', artist: 'Arlo Parks', duration: '3:59', color: '#C4B0FF' },
];

const PLACEHOLDER_MIXES = [
  { title: 'Daily Mix 1', desc: 'Your daily music mix', gradient: 'linear-gradient(135deg, #E8A0BF 0%, #F4A896 100%)' },
  { title: 'Chill Vibes', desc: 'Relax and unwind', gradient: 'linear-gradient(135deg, #C4B0FF 0%, #7C5CFC 100%)' },
  { title: 'Focus Flow', desc: 'Deep focus music', gradient: 'linear-gradient(135deg, #7EBAFF 0%, #C4B0FF 100%)' },
  { title: 'Feel Good', desc: 'Uplifting songs to boost you', gradient: 'linear-gradient(135deg, #F5B971 0%, #F4A896 100%)' },
];

const PLACEHOLDER_PLAYLISTS = [
  { name: 'Chill Vibes', color: '#7C5CFC' },
  { name: 'Focus Flow', color: '#7EBAFF' },
  { name: 'Night Drive', color: '#E8A0BF' },
  { name: 'All Time Hits', color: '#F5B971' },
];

// --- Main Dashboard Container ---
const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('home');
  const [isPlaying, setIsPlaying] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownOpen && !e.target.closest('.profile-dropdown-wrapper')) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  const handleLogout = async () => {
    await logout();
    navigate(LOGIN_URL);
  };

  if (!user) return null;

  const renderContent = () => {
    const role = user.role?.toLowerCase() || '';

    if (activeView === 'home' && (role === 'admin' || role === 'superadmin')) {
      return (
        <>
          {/* Welcome */}
          <div className="welcome-section">
            <h1 className="welcome-greeting">Welcome back, {user.display_name}!</h1>
            <p className="welcome-subtitle">Your administrative dashboard.</p>
          </div>
          <DashboardStatsPanel />
        </>
      );
    }

    if (activeView === 'home') {
      return (
        <>
          {/* Welcome */}
          <div className="welcome-section">
            <h1 className="welcome-greeting">Welcome back, {user.display_name}!</h1>
            <p className="welcome-subtitle">Your personal music streaming experience.</p>
          </div>

          {/* Hero Banner */}
          <div className="hero-banner">
            <div className="hero-content">
              <span className="hero-tag">New Album</span>
              <h2 className="hero-title">Echoes In<br/>The Distance</h2>
              <p className="hero-subtitle">The new album from Aurora. Out now.</p>
              <button className="hero-btn">
                Listen Now <Play size={16} fill="white" />
              </button>
            </div>
            <div className="hero-decoration">
              <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.3)', borderRadius: '20px', transform: 'rotate(15deg)' }} />
            </div>
          </div>

          {/* Carousel Dots */}
          <div className="carousel-dots">
            <button className="carousel-dot active" />
            <button className="carousel-dot" />
            <button className="carousel-dot" />
          </div>

          {/* Popular Tracks */}
          <div className="section-header">
            <h2 className="section-title">Popular Tracks</h2>
            <button className="section-see-all">See All</button>
          </div>
          <div className="tracks-grid">
            {PLACEHOLDER_TRACKS.map((track, i) => (
              <div key={i} className="track-card">
                <div className="track-card-art" style={{ background: track.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Music size={20} color="white" />
                </div>
                <div className="track-card-info">
                  <div className="track-card-title">{track.title}</div>
                  <div className="track-card-artist">{track.artist}</div>
                  <div className="track-card-duration">{track.duration}</div>
                </div>
                <button className="track-card-play">
                  <Play size={14} fill="var(--primary)" />
                </button>
              </div>
            ))}
          </div>

          {/* Made for You */}
          <div className="section-header">
            <h2 className="section-title">Made for You</h2>
            <button className="section-see-all">See All</button>
          </div>
          <div className="mix-grid">
            {PLACEHOLDER_MIXES.map((mix, i) => (
              <div key={i} className="mix-card">
                <div className="mix-card-gradient" style={{ background: mix.gradient }}>
                  <Music size={40} color="rgba(255,255,255,0.6)" />
                </div>
                <div className="mix-card-body">
                  <div>
                    <div className="mix-card-title">{mix.title}</div>
                    <div className="mix-card-desc">{mix.desc}</div>
                  </div>
                  <button className="mix-card-play">
                    <Play size={16} fill="white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }

    if (activeView === 'manage_admins' && role === 'superadmin') {
      return <ManageAdminsPanel />;
    }

    switch(role) {
      case 'superadmin':
        return <SuperAdminPanel />;
      case 'admin':
        return <AdminPanel />;
      case 'artist':
        return <ArtistPanel />;
      case 'listener':
        return <ListenerPanel />;
      case 'moderator':
        return <ModeratorPanel />;
      default:
        return <div className="panel-empty"><p>Welcome! Please contact an admin if your role is missing permissions.</p></div>;
    }
  };

  const getRoleNavLabel = () => {
    const role = user.role?.toLowerCase();
    if (role === 'superadmin') return 'Manage Users';
    if (role === 'admin') return 'Admin Panel';
    if (role === 'artist') return 'Artist Studio';
    if (role === 'listener') return 'My Feed';
    if (role === 'moderator') return 'Moderate';
    return null;
  };

  const roleNavLabel = getRoleNavLabel();
  const roleLower = user.role?.toLowerCase() || '';


  const muiTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#7C5CFC', // our var(--primary)
      },
      background: {
        default: darkMode ? '#12101A' : '#F8F5FF',
        paper: darkMode ? '#1C1929' : '#FFFFFF',
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none', // to remove MUI dark mode elevation overlay if needed
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottomColor: darkMode ? '#2A253D' : '#E8E2F4',
          },
          head: {
            backgroundColor: darkMode ? '#252236' : '#faf8ff',
            color: darkMode ? '#B4AED2' : '#666',
          }
        }
      }
    }
  });

  return (
    <ThemeProvider theme={muiTheme}>
      <div className="dashboard-layout">
      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar">
        <Link to={DASHBOARD_URL} className="sidebar-logo" onClick={() => setActiveView('home')}>
          <div className="sidebar-logo-icon">
            <Music size={20} />
          </div>
          <span>Mosique</span>
        </Link>

        <ul className="sidebar-nav">
          <li className={`sidebar-nav-item ${activeView === 'home' ? 'active' : ''}`}>
            <button onClick={() => setActiveView('home')}>
              <Home size={20} /> Home
            </button>
          </li>
          <li className="sidebar-nav-item">
            <a href="#">
              <Compass size={20} /> Explore
            </a>
          </li>
          <li className="sidebar-nav-item">
            <a href="#">
              <Library size={20} /> Library
            </a>
          </li>
          <li className="sidebar-nav-item">
            <a href="#">
              <Disc3 size={20} /> Albums
            </a>
          </li>
          <li className="sidebar-nav-item">
            <a href="#">
              <Users size={20} /> Artists
            </a>
          </li>
          <li className="sidebar-nav-item">
            <a href="#">
              <ListMusic size={20} /> Playlists
            </a>
          </li>
          {roleNavLabel && (
            <li className={`sidebar-nav-item ${(activeView !== 'home' && activeView !== 'manage_admins') ? 'active' : ''}`}>
              <button onClick={() => setActiveView(user.role?.toLowerCase() || 'home')}>
                <SlidersHorizontal size={20} /> {roleNavLabel}
              </button>
            </li>
          )}
          {roleLower === 'superadmin' && (
            <li className={`sidebar-nav-item ${activeView === 'manage_admins' ? 'active' : ''}`}>
              <button onClick={() => setActiveView('manage_admins')}>
                <KeyRound size={20} /> Manage Admins
              </button>
            </li>
          )}
        </ul>

        <div className="sidebar-section-title">
          Your Playlists
          <button><Plus size={14} /></button>
        </div>
        <ul className="sidebar-playlists">
          {PLACEHOLDER_PLAYLISTS.map((pl, i) => (
            <li key={i}>
              <a href="#">
                <span className="playlist-dot" style={{ background: pl.color }} />
                {pl.name}
              </a>
            </li>
          ))}
        </ul>

        
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="search-bar">
            <Search size={18} />
            <input type="text" placeholder="Search for songs, artists, albums..." />
          </div>
          <div className="top-bar-actions">
            <IconButton onClick={() => setDarkMode(!darkMode)} sx={{ color: 'var(--text-secondary)' }}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>
            <button className="top-bar-btn">
              <Bell size={18} />
              <span className="notification-dot" />
            </button>
            <div className="profile-dropdown-wrapper">
              <div className="top-bar-user" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
                <img
                  className="top-bar-avatar"
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name)}&background=7C5CFC&color=fff&size=40`}
                  alt="Avatar"
                />
                <ChevronDown size={14} className={`top-bar-user-dropdown ${profileDropdownOpen ? 'rotated' : ''}`} />
              </div>
              {profileDropdownOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <strong>{user.display_name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <div className="profile-dropdown-divider" />
                  <button className="profile-dropdown-item" onClick={() => { setProfileDropdownOpen(false); navigate(PROFILE_URL); }}>
                    <UserIcon size={16} /> View Profile
                  </button>
                  <button className="profile-dropdown-item" onClick={() => { setProfileDropdownOpen(false); navigate(CHANGE_PASSWORD_URL); }}>
                    <KeyRound size={16} /> Change Password
                  </button>
                  <div className="profile-dropdown-divider" />
                  <button className="profile-dropdown-item profile-dropdown-danger" onClick={() => { setProfileDropdownOpen(false); handleLogout(); }}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="content-area">
          <div style={{ marginBottom: '8px' }}>
            <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
              {user.role} Dashboard
            </span>
          </div>
          {renderContent()}
        </div>
      </main>

      {/* ===== BOTTOM PLAYER BAR ===== */}
      {user?.role?.toLowerCase() !== 'admin' && user?.role?.toLowerCase() !== 'super admin' && user?.role?.toLowerCase() !== 'superadmin' && (
        <div className="player-bar">
          <div className="player-track-info">
            <div className="player-track-art" style={{ background: '#E8A0BF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Music size={20} color="white" />
            </div>
            <div>
              <div className="player-track-name">Sunset Dreams</div>
              <div className="player-track-artist">Oceans</div>
            </div>
            <button className="player-like-btn">
              <Heart size={18} />
            </button>
          </div>

          <div className="player-controls">
            <div className="player-buttons">
              <button className="player-btn"><Shuffle size={16} /></button>
              <button className="player-btn"><SkipBack size={18} /></button>
              <button className="player-btn-main" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" style={{ marginLeft: '2px' }} />}
              </button>
              <button className="player-btn"><SkipForward size={18} /></button>
              <button className="player-btn"><Repeat size={16} /></button>
            </div>
            <div className="player-progress">
              <span className="player-time">1:45</span>
              <div className="player-progress-bar">
                <div className="player-progress-fill" style={{ width: '47%' }} />
              </div>
              <span className="player-time">3:45</span>
            </div>
          </div>

          <div className="player-extra">
            <div className="player-volume">
              <button className="player-btn"><Volume2 size={16} /></button>
              <div className="player-volume-bar">
                <div className="player-volume-fill" />
              </div>
            </div>
            <button className="player-btn"><SlidersHorizontal size={16} /></button>
          </div>
        </div>
      )}
    </div>
    </ThemeProvider>
  );
};

export default Dashboard;
