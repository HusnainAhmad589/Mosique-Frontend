import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Typography, Box, Card, CardContent, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert
} from '@mui/material';
import { Play, Music, ArrowLeft, ListMusic, Trash2 } from 'lucide-react';

const PlaylistsPanel = ({ onPlayTrack, currentTrack }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, playlistId: null, playlistName: '' });

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/listener/playlists', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('mosique_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setPlaylists(data.playlists || []);
      }
    } catch (err) {
      console.error('Failed to fetch playlists', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistClick = (playlist) => {
    setSelectedPlaylist(playlist);
  };

  const confirmDeletePlaylist = (playlist) => {
    setConfirmDialog({ open: true, playlistId: playlist.id, playlistName: playlist.name });
  };

  const handleDeletePlaylist = async () => {
    setConfirmDialog({ open: false, playlistId: null, playlistName: '' });
    try {
      const res = await fetch(`http://localhost:3001/api/listener/playlists/${confirmDialog.playlistId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('mosique_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        if (selectedPlaylist?.id === confirmDialog.playlistId) setSelectedPlaylist(null);
        fetchPlaylists();
        setToast({ open: true, message: 'Playlist deleted successfully', severity: 'success' });
      } else {
        setToast({ open: true, message: data.message || 'Failed to delete playlist', severity: 'error' });
      }
    } catch (err) {
      console.error(err);
      setToast({ open: true, message: 'Error deleting playlist', severity: 'error' });
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading playlists...</div>;
  }

  const renderFeedback = () => (
    <>
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })} PaperProps={{ style: { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)', minWidth: '300px' } }}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete the playlist "{confirmDialog.playlistName}"?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })} sx={{ color: 'var(--text-muted)' }}>Cancel</Button>
          <Button onClick={handleDeletePlaylist} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );

  // --- Playlist Details View (Songs List) ---
  if (selectedPlaylist) {
    return (
      <div className="section-container">
        {renderFeedback()}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => setSelectedPlaylist(null)}
            sx={{ 
              color: 'var(--text-main)', 
              bgcolor: 'var(--bg-elevated)',
              '&:hover': { bgcolor: 'var(--bg-hover)' }
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
              {selectedPlaylist.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
              {selectedPlaylist.songs.length} {selectedPlaylist.songs.length === 1 ? 'track' : 'tracks'}
            </Typography>
          </Box>
          <IconButton 
            onClick={() => confirmDeletePlaylist(selectedPlaylist)}
            title="Delete Playlist"
            sx={{ 
              color: 'var(--error, #ef4444)',
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
            }}
          >
            <Trash2 size={20} />
          </IconButton>
        </Box>

        {selectedPlaylist.songs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
            No tracks in this playlist yet. Add some tracks from the Home page!
          </div>
        ) : (
          <TableContainer sx={{ bgcolor: 'transparent', backgroundImage: 'none', boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>#</TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Title</TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Artist</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedPlaylist.songs.map((track, index) => {
                  const isPlaying = currentTrack?.id === track.id;
                  return (
                    <TableRow 
                      key={track.id}
                      hover
                      onClick={() => onPlayTrack(track)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'var(--bg-hover)' },
                        '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)' }
                      }}
                    >
                      <TableCell sx={{ color: isPlaying ? 'var(--primary)' : 'var(--text-muted)', width: '50px' }}>
                        {isPlaying ? <Music size={16} /> : index + 1}
                      </TableCell>
                      <TableCell sx={{ color: isPlaying ? 'var(--primary)' : 'var(--text-main)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {track.cover_url ? (
                            <img src={`http://localhost:3001${track.cover_url}`} alt="" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                          ) : (
                            <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Music size={20} color="var(--text-muted)" />
                            </Box>
                          )}
                          {track.title}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'var(--text-muted)' }}>{track.artist_name}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    );
  }

  // --- Main Playlists View (Grid of Playlists) ---
  return (
    <div className="section-container">
      {renderFeedback()}
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h2 className="section-title">Your Playlists</h2>
      </div>

      {playlists.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
          You haven't created any playlists yet. Click "Add to Playlist" on a track to create one!
        </div>
      ) : (
        <Grid container spacing={3}>
          {playlists.map(playlist => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={playlist.id}>
              <Card 
                onClick={() => handlePlaylistClick(playlist)}
                sx={{ 
                  bgcolor: 'var(--bg-elevated)', 
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, background-color 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    bgcolor: 'var(--bg-hover)'
                  }
                }}
              >
                <Box sx={{ 
                  width: '100%', 
                  aspectRatio: '1', 
                  bgcolor: 'rgba(255,255,255,0.05)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  {playlist.songs && playlist.songs.length > 0 && playlist.songs[0].cover_url ? (
                    <img 
                      src={`http://localhost:3001${playlist.songs[0].cover_url}`} 
                      alt="" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <ListMusic size={64} color="var(--text-muted)" opacity={0.5} />
                  )}
                </Box>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {playlist.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                    {playlist.songs.length} tracks
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
};

export default PlaylistsPanel;
