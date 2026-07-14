import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addToHistory } from '../store/slices/librarySlice';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Music, LogOut, KeyRound, User as UserIcon, Home, Compass, Library, Disc3, 
  Users, ListMusic, Plus, Search, Bell, ChevronDown, Play, Heart,
  Shuffle, SkipBack, SkipForward, Repeat, Pause, Volume2, SlidersHorizontal, Edit3, Moon, Sun, CheckCircle
} from 'lucide-react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Snackbar, Alert, CircularProgress, Box, Button, Grid, Card, CardContent, Divider, Switch, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, ThemeProvider, createTheme, Menu, Tooltip } from '@mui/material';
import api from '../api';
import { LOGIN_URL, DASHBOARD_URL, PROFILE_URL, CHANGE_PASSWORD_URL } from '../routes/route_constants';

import SuperAdminPanel from '../components/dashboard/SuperAdminPanel';
import AdminPanel from '../components/dashboard/AdminPanel';
import ArtistPanel from '../components/dashboard/ArtistPanel';
import AlbumsPanel from '../components/dashboard/AlbumsPanel';
import PlaylistsPanel from '../components/dashboard/PlaylistsPanel';
import ArtistsPanel from '../components/dashboard/ArtistsPanel';
import ModeratorPanel from '../components/dashboard/ModeratorPanel';
import LibraryPanel from '../components/dashboard/LibraryPanel';
import CatalogPanel from '../components/dashboard/CatalogPanel';
import NotificationBell from '../components/common/NotificationBell';

// --- Listener Panel ---
const ListenerPanel = ({ onPlayTrack, currentTrack }) => {
  const [feed, setFeed] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const fetchFeed = async (search = '') => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await api.get(`/listener/feed${params}`);
      setFeed(res.data.feed || []);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFeed(searchQuery);
  };

  return (
    <div>
      <h2 className="panel-title">Discover Music</h2>
      
      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input 
          type="text" 
          placeholder="Search songs by title..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-main)', fontSize: '0.95rem' }}
        />
        <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
          <Search size={16} style={{ marginRight: '6px' }} /> Search
        </button>
      </form>

      {loading ? (
        <div className="loading-container"><CircularProgress /></div>
      ) : feed.length === 0 ? (
        <div className="panel-card">
          <div className="panel-empty">
            <Music size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p>No songs found. Artists haven't uploaded any tracks yet!</p>
          </div>
        </div>
      ) : (
        <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: 'var(--bg-elevated)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: 'var(--text-muted)', width: '40px' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'var(--text-muted)' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'var(--text-muted)' }}>Artist</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'var(--text-muted)' }}>Genre</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'var(--text-muted)' }}>Album</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'var(--text-muted)', width: '60px' }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feed.map((song, idx) => {
                  const isActive = currentTrack?.id === song.id;
                  return (
                    <TableRow 
                      key={song.id} 
                      hover 
                      sx={{ cursor: 'pointer', backgroundColor: isActive ? 'rgba(124, 92, 252, 0.08)' : 'transparent' }}
                      onClick={() => onPlayTrack(song)}
                    >
                      <TableCell sx={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>{idx + 1}</TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: song.cover_url ? 'transparent' : `hsl(${(song.id * 47) % 360}, 60%, 70%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                            {song.cover_url ? (
                              <img src={`http://localhost:3001${song.cover_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <Music size={16} color="white" />
                            )}
                          </div>
                          <span style={{ fontWeight: 500, color: isActive ? 'var(--primary)' : 'var(--text-main)' }}>{song.title}</span>
                        </div>
                      </TableCell>
                      <TableCell sx={{ color: 'var(--text-main)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {song.artist_name}
                          {song.is_verified && <CheckCircle size={14} color="#10B981" />}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(124, 92, 252, 0.1)', color: 'var(--primary)' }}>
                          {song.category_name || 'Uncategorized'}
                        </span>
                      </TableCell>
                      <TableCell sx={{ color: 'var(--text-muted)' }}>{song.album_title || '—'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              api.post('/listener/favorites', { trackId: song.id })
                                .then(() => setToast({ open: true, message: 'Added to Liked Songs!', severity: 'success' }))
                                .catch(err => setToast({ open: true, message: err.response?.data?.message || 'Error adding to favorites', severity: 'error' }));
                            }}
                            title="Add to Liked Songs"
                            sx={{ color: 'var(--text-muted)', '&:hover': { color: 'var(--primary)' } }}
                          >
                            <Heart size={20} />
                          </IconButton>
                          <button 
                            className="track-card-play" 
                            onClick={(e) => { e.stopPropagation(); onPlayTrack(song); }}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Play size={14} fill="white" />
                          </button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
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

// --- Under Construction Panel ---
const UnderConstruction = ({ title }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
    <Compass size={64} style={{ marginBottom: '20px', opacity: 0.3 }} />
    <h2 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>{title}</h2>
    <p>We're still building this section. Check back soon!</p>
  </div>
);

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

// --- Main Dashboard Container ---
const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeView, setActiveView] = useState(() => sessionStorage.getItem('mosique_active_view') || 'home');
  
  useEffect(() => {
    sessionStorage.setItem('mosique_active_view', activeView);
  }, [activeView]);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  // --- Audio Player State ---
  const audioRef = useRef(new Audio());
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [playlist, setPlaylist] = useState([]); // all songs for skip next/prev
  const [homeFeed, setHomeFeed] = useState([]); // for home view
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  
  // Playlist Dialog & Menu State
  const [playlistDialog, setPlaylistDialog] = useState({ open: false, track: null, name: '' });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuTrack, setMenuTrack] = useState(null);

  // Hero Banner Carousel State
  const [bannerIndex, setBannerIndex] = useState(0);

  const handleCloseToast = () => setToast(prev => ({ ...prev, open: false }));

  // Fetch songs & playlists for the Home view
  useEffect(() => {
    const role = user?.role?.toLowerCase();
    if (role === 'listener' || role === 'artist' || role === 'admin' || role === 'superadmin') {
      api.get('/listener/feed')
        .then(res => {
          const songs = res.data.feed || [];
          setHomeFeed(songs);
          setPlaylist(songs);
        })
        .catch(err => console.error(err));
        
      fetch('http://localhost:3001/api/listener/playlists', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('mosique_token')}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) setUserPlaylists(data.playlists || []);
      })
      .catch(console.error);
    }
  }, [user?.role]);

  // Auto-rotate hero banner
  useEffect(() => {
    if (homeFeed.length > 0) {
      const maxItems = Math.min(homeFeed.length, 3);
      const timer = setInterval(() => {
        setBannerIndex(prev => (prev + 1) % maxItems);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [homeFeed]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => handleSkipForward();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentTrack]);

  const handlePlayTrack = useCallback((song) => {
    const audio = audioRef.current;
    if (currentTrack?.id === song.id) {
      // Toggle play/pause if same track
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
      return;
    }
    // New track
    audio.src = `http://localhost:3001${song.audio_url}`;
    audio.volume = volume;
    audio.play();
    setCurrentTrack(song);
    setIsPlaying(true);
    // Record to listening history
    dispatch(addToHistory(song.id));
  }, [currentTrack, isPlaying, volume, dispatch]);

  const handleAddToPlaylistClick = (track, e) => {
    e.stopPropagation();
    setMenuTrack(track);
    setMenuAnchor(e.currentTarget);
  };

  const handleCreateNewPlaylistClick = () => {
    setPlaylistDialog({ open: true, track: menuTrack, name: '' });
    setMenuAnchor(null);
  };

  const submitAddToPlaylist = async (track, name) => {
    if (!name || !name.trim() || !track) return;
    
    try {
      const res = await fetch('http://localhost:3001/api/listener/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('mosique_token')}`
        },
        body: JSON.stringify({ name: name.trim(), songId: track.id })
      });
      const data = await res.json();
      if (data.success) {
        setToast({ open: true, message: data.message, severity: 'success' });
        // Refresh playlists in background
        fetch('http://localhost:3001/api/listener/playlists', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('mosique_token')}` }
        })
        .then(r => r.json())
        .then(d => { if (d.success) setUserPlaylists(d.playlists || []) })
        .catch(console.error);
      } else {
        setToast({ open: true, message: data.message || 'Failed to add to playlist.', severity: 'error' });
      }
    } catch (err) {
      console.error(err);
      setToast({ open: true, message: 'Failed to add to playlist.', severity: 'error' });
    }
  };

  const handleExistingPlaylistClick = (playlistName) => {
    submitAddToPlaylist(menuTrack, playlistName);
    setMenuAnchor(null);
  };

  const handlePlaylistSubmit = async () => {
    const { track, name } = playlistDialog;
    setPlaylistDialog({ open: false, track: null, name: '' });
    await submitAddToPlaylist(track, name);
  };

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!currentTrack) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSkipForward = () => {
    if (playlist.length === 0) return;
    const currentIdx = playlist.findIndex(s => s.id === currentTrack?.id);
    const nextIdx = (currentIdx + 1) % playlist.length;
    handlePlayTrack(playlist[nextIdx]);
  };

  const handleSkipBack = () => {
    if (playlist.length === 0) return;
    const currentIdx = playlist.findIndex(s => s.id === currentTrack?.id);
    const prevIdx = (currentIdx - 1 + playlist.length) % playlist.length;
    handlePlayTrack(playlist[prevIdx]);
  };

  const handleSeek = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const handleVolumeChange = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(pct);
    audioRef.current.volume = pct;
  };

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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
      const searchLower = globalSearch.toLowerCase().trim();
      const filteredFeed = searchLower
        ? homeFeed.filter(s =>
            s.title?.toLowerCase().includes(searchLower) ||
            s.artist_name?.toLowerCase().includes(searchLower) ||
            s.album_title?.toLowerCase().includes(searchLower) ||
            s.category_name?.toLowerCase().includes(searchLower)
          )
        : homeFeed;
      const bannerItems = homeFeed.slice(0, 3);
      const bannerItem = bannerItems[bannerIndex] || bannerItems[0];

      return (
        <>
          {/* Welcome */}
          <div className="welcome-section">
            <h1 className="welcome-greeting">Welcome back, {user.display_name}!</h1>
            <p className="welcome-subtitle">Your personal music streaming experience.</p>
          </div>

          {/* Hero Banner */}
          {bannerItem ? (
            <div className="hero-banner" style={{
              backgroundImage: bannerItem.cover_url ? `linear-gradient(to right, rgba(124, 92, 252, 0.9), rgba(124, 92, 252, 0.6)), url(http://localhost:3001${bannerItem.cover_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'background-image 0.5s ease-in-out'
            }}>
              <div className="hero-content">
                <span className="hero-tag">{bannerItem.album_title ? 'New Album Track' : 'New Track'}</span>
                <h2 className="hero-title">{bannerItem.album_title || bannerItem.title}</h2>
                <p className="hero-subtitle">By {bannerItem.artist_name || 'Unknown Artist'}. Out now.</p>
                <button className="hero-btn" onClick={() => handlePlayTrack(bannerItem)}>
                  Listen Now <Play size={16} fill="white" />
                </button>
              </div>
              <div className="hero-decoration">
                {bannerItem.cover_url ? (
                  <img src={`http://localhost:3001${bannerItem.cover_url}`} alt="Cover" style={{ width: '120px', height: '120px', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.3)', borderRadius: '20px', transform: 'rotate(15deg)' }} />
                )}
              </div>
            </div>
          ) : (
            <div className="hero-banner">
              <div className="hero-content">
                <span className="hero-tag">Welcome</span>
                <h2 className="hero-title">Discover<br/>New Music</h2>
                <p className="hero-subtitle">Artists are currently uploading their tracks.</p>
              </div>
              <div className="hero-decoration">
                <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.3)', borderRadius: '20px', transform: 'rotate(15deg)' }} />
              </div>
            </div>
          )}

          {/* Carousel Dots */}
          {bannerItems.length > 0 && (
            <div className="carousel-dots">
              {bannerItems.map((_, i) => (
                <button 
                  key={i} 
                  className={`carousel-dot ${i === bannerIndex ? 'active' : ''}`}
                  onClick={() => setBannerIndex(i)}
                />
              ))}
            </div>
          )}

          {/* Popular Tracks */}
          <div className="section-header">
            <h2 className="section-title">Recent Uploads</h2>
            <button className="section-see-all" onClick={() => setActiveView(user.role?.toLowerCase() || 'listener')}>See All</button>
          </div>
          <div className="tracks-grid">
            {(filteredFeed.length > 0 ? filteredFeed.slice(0, 6) : (!searchLower ? PLACEHOLDER_TRACKS : [])).map((track, i) => (
              <div key={track.id || i} className="track-card" onClick={() => track.audio_url && handlePlayTrack(track)} style={{ cursor: track.audio_url ? 'pointer' : 'default' }}>
                <div className="track-card-art" style={{ background: track.cover_url ? 'transparent' : (track.color || `hsl(${(i * 67) % 360}, 60%, 70%)`), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {track.cover_url ? (
                    <img src={`http://localhost:3001${track.cover_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Music size={20} color="white" />
                  )}
                </div>
                <div className="track-card-info">
                  <div className="track-card-title">{track.title}</div>
                  <div className="track-card-artist" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    {track.artist_name || track.artist || 'Unknown'}
                    {track.is_verified && <CheckCircle size={12} color="#10B981" />}
                  </div>
                  <div className="track-card-duration">{track.category_name || track.duration || ''}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="track-card-play" title="Add to Playlist" onClick={(e) => handleAddToPlaylistClick(track, e)}>
                    <Plus size={14} fill="var(--text-main)" stroke="var(--text-main)" />
                  </button>
                  <button className="track-card-play" title="Play" onClick={(e) => { e.stopPropagation(); if (track.audio_url) handlePlayTrack(track); }}>
                    <Play size={14} fill="var(--primary)" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Made for You (Original Song Cards) */}
          <div className="section-header">
            <h2 className="section-title">Made for You</h2>
            <button className="section-see-all">See All</button>
          </div>
          <div className="mix-grid">
            {filteredFeed.slice(0, 4).map((track, i) => (
              <div key={track.id || i} className="mix-card" onClick={() => track.audio_url && handlePlayTrack(track)} style={{ cursor: track.audio_url ? 'pointer' : 'default' }}>
                <div className="mix-card-gradient" style={{ background: track.cover_url ? `url(http://localhost:3001${track.cover_url}) center/cover` : `hsl(${(i * 87) % 360}, 60%, 70%)` }}>
                  {!track.cover_url && <Music size={40} color="rgba(255,255,255,0.6)" />}
                </div>
                <div className="mix-card-body">
                  <div>
                    <div className="mix-card-title">{track.title}</div>
                    <div className="mix-card-desc" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      By {track.artist_name || 'Unknown Artist'}
                      {track.is_verified && <CheckCircle size={12} color="#10B981" />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="mix-card-play" style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.1)' }} title="Add to Playlist" onClick={(e) => handleAddToPlaylistClick(track, e)}>
                      <Plus size={16} color="var(--text-main)" />
                    </button>
                    <button className="mix-card-play" title="Play" onClick={(e) => { e.stopPropagation(); if (track.audio_url) handlePlayTrack(track); }}>
                      <Play size={16} fill="white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {homeFeed.length === 0 && (
              <div style={{ color: 'var(--text-muted)', padding: '20px' }}>
                More tracks will appear here once artists upload them!
              </div>
            )}
          </div>
        </>
      );
    }

    if (activeView === 'manage_admins' && role === 'superadmin') {
      return <ManageAdminsPanel />;
    }

    if (activeView === 'library') return <LibraryPanel onPlayTrack={handlePlayTrack} currentTrack={currentTrack} />;
    if (activeView === 'albums') return <AlbumsPanel onPlayTrack={handlePlayTrack} currentTrack={currentTrack} />;
    if (activeView === 'artists') return <ArtistsPanel homeFeed={homeFeed} onPlayTrack={handlePlayTrack} currentTrack={currentTrack} />;
    if (activeView === 'playlists') return <PlaylistsPanel onPlayTrack={handlePlayTrack} currentTrack={currentTrack} />;
    if (activeView === 'catalog' && (role === 'admin' || role === 'superadmin')) return <CatalogPanel />;

    switch(role) {
      case 'superadmin':
        return <SuperAdminPanel />;
      case 'admin':
        return <AdminPanel />;
      case 'artist':
        return <ArtistPanel />;
      case 'listener':
        return <ListenerPanel onPlayTrack={handlePlayTrack} currentTrack={currentTrack} />;
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

          <li className={`sidebar-nav-item ${activeView === 'library' ? 'active' : ''}`}>
            <button onClick={() => setActiveView('library')}>
              <Library size={20} /> Library
            </button>
          </li>
          <li className={`sidebar-nav-item ${activeView === 'albums' ? 'active' : ''}`}>
            <button onClick={() => setActiveView('albums')}>
              <Disc3 size={20} /> Albums
            </button>
          </li>
          <li className={`sidebar-nav-item ${activeView === 'artists' ? 'active' : ''}`}>
            <button onClick={() => setActiveView('artists')}>
              <Users size={20} /> Artists
            </button>
          </li>
          <li className={`sidebar-nav-item ${activeView === 'playlists' ? 'active' : ''}`}>
            <button onClick={() => setActiveView('playlists')}>
              <ListMusic size={20} /> Playlists
            </button>
          </li>
          {roleNavLabel && (
            <li className={`sidebar-nav-item ${(activeView !== 'home' && activeView !== 'manage_admins' && activeView !== 'catalog') ? 'active' : ''}`}>
              <button onClick={() => setActiveView(user.role?.toLowerCase() || 'home')}>
                <SlidersHorizontal size={20} /> {roleNavLabel}
              </button>
            </li>
          )}
          {(roleLower === 'admin' || roleLower === 'superadmin') && (
            <li className={`sidebar-nav-item ${activeView === 'catalog' ? 'active' : ''}`}>
              <button onClick={() => setActiveView('catalog')}>
                <Disc3 size={20} /> Catalog
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

      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search for songs, artists, albums..." 
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                if (e.target.value.trim()) {
                  setActiveView('home');
                }
              }}
            />
          </div>
          <div className="top-bar-actions">
            <IconButton onClick={() => setDarkMode(!darkMode)} sx={{ color: 'var(--text-secondary)' }}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>
            {(user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'superadmin') && (
              <NotificationBell />
            )}
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
            <div className="player-track-art" style={{ background: currentTrack?.cover_url ? 'transparent' : '#E8A0BF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {currentTrack?.cover_url ? (
                <img src={`http://localhost:3001${currentTrack.cover_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Music size={20} color="white" />
              )}
            </div>
            <div>
              <div className="player-track-name">{currentTrack?.title || 'No track selected'}</div>
              <div className="player-track-artist">{currentTrack?.artist_name || 'Select a song to play'}</div>
            </div>
            <Tooltip title="Save to Liked Songs" placement="top">
              <button 
                className="player-like-btn"
                onClick={() => {
                  if (currentTrack) {
                    api.post('/listener/favorites', { trackId: currentTrack.id })
                      .then(() => setToast({ open: true, message: 'Added to Liked Songs!', severity: 'success' }))
                      .catch(err => setToast({ open: true, message: err.response?.data?.message || 'Error adding to favorites', severity: 'error' }));
                  }
                }}
              >
                <Heart size={18} />
              </button>
            </Tooltip>
          </div>

          <div className="player-controls">
            <div className="player-buttons">
              <Tooltip title="Enable Shuffle" placement="top">
                <button className="player-btn"><Shuffle size={16} /></button>
              </Tooltip>
              <Tooltip title="Previous track" placement="top">
                <button className="player-btn" onClick={handleSkipBack}><SkipBack size={18} /></button>
              </Tooltip>
              <Tooltip title={isPlaying ? "Pause" : "Play"} placement="top">
                <button className="player-btn-main" onClick={handleTogglePlay}>
                  {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" style={{ marginLeft: '2px' }} />}
                </button>
              </Tooltip>
              <Tooltip title="Next track" placement="top">
                <button className="player-btn" onClick={handleSkipForward}><SkipForward size={18} /></button>
              </Tooltip>
              <Tooltip title="Enable Repeat" placement="top">
                <button className="player-btn"><Repeat size={16} /></button>
              </Tooltip>
            </div>
            <div className="player-progress">
              <span className="player-time">{formatTime(currentTime)}</span>
              <div className="player-progress-bar" onClick={handleSeek} style={{ cursor: 'pointer' }}>
                <div className="player-progress-fill" style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
              </div>
              <span className="player-time">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="player-extra">
            <div className="player-volume">
              <Tooltip title="Mute" placement="top">
                <button className="player-btn"><Volume2 size={16} /></button>
              </Tooltip>
              <div className="player-volume-bar" onClick={handleVolumeChange} style={{ cursor: 'pointer' }}>
                <div className="player-volume-fill" style={{ width: `${volume * 100}%` }} />
              </div>
            </div>
            <Tooltip title="Audio Settings" placement="top">
              <button className="player-btn"><SlidersHorizontal size={16} /></button>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Playlist Selection Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{
          style: {
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-main)',
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: '200px'
          }
        }}
      >
        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'var(--text-muted)' }}>
          Add "{menuTrack?.title}" to...
        </Typography>
        {userPlaylists.map(pl => (
          <MenuItem 
            key={pl.id} 
            onClick={() => handleExistingPlaylistClick(pl.name)}
            sx={{ '&:hover': { bgcolor: 'var(--bg-hover)' } }}
          >
            {pl.name}
          </MenuItem>
        ))}
        {userPlaylists.length > 0 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
        <MenuItem 
          onClick={handleCreateNewPlaylistClick}
          sx={{ color: 'var(--primary)', '&:hover': { bgcolor: 'var(--bg-hover)' } }}
        >
          <Plus size={16} style={{ marginRight: '8px' }} /> Create New Playlist
        </MenuItem>
      </Menu>

      {/* Playlist Creation Dialog */}
      <Dialog 
        open={playlistDialog.open} 
        onClose={() => setPlaylistDialog({ open: false, track: null, name: '' })}
        PaperProps={{ style: { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)', minWidth: '300px' } }}
      >
        <DialogTitle>Add to Playlist</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'var(--text-muted)' }}>
            Enter a playlist name to add "{playlistDialog.track?.title}":
          </Typography>
          <input 
            type="text" 
            autoFocus
            value={playlistDialog.name}
            onChange={(e) => setPlaylistDialog(prev => ({ ...prev, name: e.target.value }))}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid rgba(255,255,255,0.1)', 
              backgroundColor: 'var(--bg-main)', 
              color: 'var(--text-main)',
              outline: 'none'
            }}
            placeholder="Playlist name..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handlePlaylistSubmit();
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setPlaylistDialog({ open: false, track: null, name: '' })} sx={{ color: 'var(--text-muted)' }}>
            Cancel
          </Button>
          <Button onClick={handlePlaylistSubmit} variant="contained" sx={{ bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--primary-hover)' } }}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar 
        open={toast.open} 
        autoHideDuration={4000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>

    </div>
    </ThemeProvider>
  );
};

export default Dashboard;
