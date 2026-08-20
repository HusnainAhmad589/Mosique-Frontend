import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, Alert, Tabs, Tab, Box, Chip, Tooltip, TextField, Typography
} from '@mui/material';
import { Trash2, EyeOff, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../../api';
import { showToast } from '../../store/slices/notificationSlice';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const CatalogPanel = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, id: null, title: '' });
  const [unpublishDialog, setUnpublishDialog] = useState({ open: false, song: null, reason: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [songsRes, albumsRes] = await Promise.all([
        api.get('/admin/catalog/songs'),
        api.get('/admin/catalog/albums')
      ]);
      if (songsRes.data.success) setSongs(songsRes.data.songs);
      if (albumsRes.data.success) setAlbums(albumsRes.data.albums);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    const { type, id } = confirmDialog;
    try {
      if (type === 'song') {
        await api.delete(`/admin/catalog/songs/${id}`);
        setSongs(songs.filter(s => s.id !== id));
      } else if (type === 'album') {
        await api.delete(`/admin/catalog/albums/${id}`);
        setAlbums(albums.filter(a => a.id !== id));
      }
      dispatch(showToast({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`, severity: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: `Failed to delete ${type}.`, severity: 'error' }));
    } finally {
      setConfirmDialog({ open: false, type: null, id: null, title: '' });
    }
  };

  const handleUnpublishSong = async () => {
    const { song, reason } = unpublishDialog;
    if (!song) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/admin/catalog/songs/${song.id}/unpublish`, {
        reason: reason.trim() || 'Violates platform guidelines'
      });
      if (res.data.success) {
        setSongs(prev => prev.map(s => s.id === song.id ? {
          ...s,
          status: 'archived',
          rejection_reason: `Removed by Authority: ${reason.trim() || 'Violates platform guidelines'}`
        } : s));
        dispatch(showToast({ message: `Song "${song.title}" unpublished by authority.`, severity: 'warning' }));
        setUnpublishDialog({ open: false, song: null, reason: '' });
      }
    } catch (err) {
      console.error(err);
      dispatch(showToast({ message: err.response?.data?.message || 'Failed to unpublish song.', severity: 'error' }));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><CircularProgress /></div>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div className="section-container">
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <h2 className="section-title">Music Catalog Management</h2>
      </div>

      <Box sx={{ borderBottom: 1, borderColor: 'var(--border)' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, val) => setTabValue(val)}
          sx={{
            '& .MuiTab-root': { color: 'var(--text-muted)', textTransform: 'none', fontWeight: 600, fontSize: '1rem' },
            '& .Mui-selected': { color: 'var(--primary) !important' },
            '& .MuiTabs-indicator': { backgroundColor: 'var(--primary)' }
          }}
        >
          <Tab label={`Songs (${songs.length})`} />
          <Tab label={`Albums (${albums.length})`} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'var(--bg-elevated)', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>ID</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>Title</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>Artist</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>Album</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>Status</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {songs.map(song => {
                const isRemovedByAuthority = song.rejection_reason && song.rejection_reason.startsWith('Removed by Authority');
                return (
                  <TableRow key={song.id}>
                    <TableCell sx={{ color: 'var(--text-main)', borderColor: 'var(--border)' }}>{song.id}</TableCell>
                    <TableCell sx={{ color: 'var(--text-main)', borderColor: 'var(--border)', fontWeight: 600 }}>
                      <div>{song.title}</div>
                      {isRemovedByAuthority && (
                        <Typography variant="caption" sx={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <AlertTriangle size={12} /> {song.rejection_reason}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: 'var(--text-main)', borderColor: 'var(--border)' }}>
                      {song.Artist?.display_name || song.Artist?.username || 'Unknown'}
                    </TableCell>
                    <TableCell sx={{ color: 'var(--text-main)', borderColor: 'var(--border)' }}>{song.Album?.title || '-'}</TableCell>
                    <TableCell sx={{ color: 'var(--text-main)', borderColor: 'var(--border)' }}>
                      {isRemovedByAuthority ? (
                        <Tooltip title={song.rejection_reason} arrow>
                          <Chip 
                            icon={<ShieldAlert size={14} color="#EF4444" />}
                            label="Removed by Authority" 
                            size="small" 
                            sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.3)' }} 
                          />
                        </Tooltip>
                      ) : (
                        <Chip 
                          label={song.status?.replace('_', ' ') || 'draft'} 
                          size="small" 
                          sx={{ 
                            bgcolor: song.status === 'published' ? 'rgba(16, 185, 129, 0.15)' : 
                                     song.status === 'pending_review' ? 'rgba(59, 130, 246, 0.15)' : 
                                     song.status === 'scheduled' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
                            color: song.status === 'published' ? '#10B981' : 
                                   song.status === 'pending_review' ? '#3B82F6' : 
                                   song.status === 'scheduled' ? '#8B5CF6' : '#F59E0B', 
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }} 
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ borderColor: 'var(--border)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {song.status === 'published' && (
                          <Tooltip title="Unpublish from platform (Authority Action)" arrow>
                            <IconButton 
                              size="small" 
                              onClick={() => setUnpublishDialog({ open: true, song, reason: '' })} 
                              sx={{ color: '#F59E0B', '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.1)' } }}
                            >
                              <EyeOff size={18} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Permanently Delete Song" arrow>
                          <IconButton 
                            size="small" 
                            onClick={() => setConfirmDialog({ open: true, type: 'song', id: song.id, title: song.title })} 
                            sx={{ color: 'var(--danger)' }}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'var(--bg-elevated)', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>ID</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>Title</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>Artist</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>Release Date</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>Status</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {albums.map(album => (
                <TableRow key={album.id}>
                  <TableCell sx={{ color: 'var(--text-main)', borderColor: 'var(--border)' }}>{album.id}</TableCell>
                  <TableCell sx={{ color: 'var(--text-main)', borderColor: 'var(--border)', fontWeight: 600 }}>{album.title}</TableCell>
                  <TableCell sx={{ color: 'var(--text-main)', borderColor: 'var(--border)' }}>{album.Artist?.username || 'Unknown'}</TableCell>
                  <TableCell sx={{ color: 'var(--text-main)', borderColor: 'var(--border)' }}>{album.release_date || '-'}</TableCell>
                  <TableCell sx={{ color: 'var(--text-main)', borderColor: 'var(--border)' }}>
                    <Chip label={album.status} size="small" sx={{ bgcolor: album.status === 'published' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: album.status === 'published' ? '#10B981' : '#F59E0B', fontWeight: 600 }} />
                  </TableCell>
                  <TableCell sx={{ borderColor: 'var(--border)' }}>
                    <IconButton size="small" onClick={() => setConfirmDialog({ open: true, type: 'album', id: album.id, title: album.title })} sx={{ color: 'var(--danger)' }}>
                      <Trash2 size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Unpublish by Authority Dialog */}
      <Dialog
        open={unpublishDialog.open}
        onClose={() => !actionLoading && setUnpublishDialog({ open: false, song: null, reason: '' })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: 'var(--bg-elevated)', color: 'var(--text-main)', borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, color: '#F59E0B' }}>
          <ShieldAlert size={24} /> Unpublish Song (Authority Action)
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are about to remove <strong>"{unpublishDialog.song?.title}"</strong> from public listener discovery. The artist will be notified that this song was removed by platform authority.
          </Typography>
          <TextField
            fullWidth
            label="Reason for Removal / Unpublishing"
            placeholder="e.g., Copyright violation, explicit content violation, community guideline breach..."
            value={unpublishDialog.reason}
            onChange={(e) => setUnpublishDialog(prev => ({ ...prev, reason: e.target.value }))}
            multiline
            rows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'var(--text-main)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                '& fieldset': { borderColor: 'var(--border)' },
                '&:hover fieldset': { borderColor: 'var(--primary)' }
              },
              '& .MuiInputLabel-root': { color: 'var(--text-muted)' }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button 
            disabled={actionLoading} 
            onClick={() => setUnpublishDialog({ open: false, song: null, reason: '' })} 
            sx={{ color: 'var(--text-muted)' }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            disabled={actionLoading}
            onClick={handleUnpublishSong}
            sx={{ bgcolor: '#F59E0B', '&:hover': { bgcolor: '#D97706' }, color: '#000', fontWeight: 700 }}
          >
            {actionLoading ? 'Unpublishing...' : 'Unpublish Song'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Deletion Dialog */}
      <Dialog 
        open={confirmDialog.open} 
        onClose={() => setConfirmDialog({ open: false, type: null, id: null, title: '' })}
        PaperProps={{ sx: { bgcolor: 'var(--bg-elevated)', color: 'var(--text-main)', borderRadius: 2 } }}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to permanently delete the {confirmDialog.type} <strong>{confirmDialog.title}</strong>? This action cannot be undone.
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setConfirmDialog({ open: false, type: null, id: null, title: '' })} sx={{ color: 'var(--text-muted)' }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" sx={{ bgcolor: 'var(--danger)', '&:hover': { bgcolor: '#b91c1c' } }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CatalogPanel;
