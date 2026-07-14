import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, Alert, Tabs, Tab, Box, Chip
} from '@mui/material';
import { Trash2 } from 'lucide-react';
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
                <TableCell sx={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {songs.map(song => (
                <TableRow key={song.id}>
                  <TableCell sx={{ color: 'var(--text-main)', borderColor: 'var(--border)' }}>{song.id}</TableCell>
                  <TableCell sx={{ color: 'var(--text-main)', borderColor: 'var(--border)', fontWeight: 600 }}>{song.title}</TableCell>
                  <TableCell sx={{ color: 'var(--text-main)', borderColor: 'var(--border)' }}>{song.Artist?.username || 'Unknown'}</TableCell>
                  <TableCell sx={{ color: 'var(--text-main)', borderColor: 'var(--border)' }}>{song.Album?.title || '-'}</TableCell>
                  <TableCell sx={{ borderColor: 'var(--border)' }}>
                    <IconButton size="small" onClick={() => setConfirmDialog({ open: true, type: 'song', id: song.id, title: song.title })} sx={{ color: 'var(--danger)' }}>
                      <Trash2 size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
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

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialog.open} 
        onClose={() => setConfirmDialog({ open: false, type: null, id: null, title: '' })}
        PaperProps={{ sx: { bgcolor: 'var(--bg-elevated)', color: 'var(--text-main)', borderRadius: 2 } }}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the {confirmDialog.type} <strong>{confirmDialog.title}</strong>? This action cannot be undone and will remove the file from the platform.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, type: null, id: null, title: '' })} sx={{ color: 'var(--text-muted)' }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" sx={{ bgcolor: 'var(--danger)', '&:hover': { bgcolor: '#b91c1c' } }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CatalogPanel;
