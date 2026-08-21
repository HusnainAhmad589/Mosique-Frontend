import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, CircularProgress, Alert, Box, Chip, Avatar,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Divider, TextField, MenuItem
} from '@mui/material';
import { CheckCircle, Music, Disc3, Users, Globe, Info, Play, Pause, Edit3, Trash2 } from 'lucide-react';
import { fetchArtistsDashboard, updateSong, removeSong, clearModeratorMessages } from '../../store/slices/moderatorSlice';
import { getMediaUrl } from '../../api';

const ArtistDashboardPanel = () => {
  const dispatch = useDispatch();
  const { artists, loading, error, successMessage } = useSelector(state => state.moderator);
  const [selectedArtist, setSelectedArtist] = useState(null);

  // Active audio player state
  const [playingSongId, setPlayingSongId] = useState(null);
  const [audioObj, setAudioObj] = useState(null);

  // Edit/Remove song dialog state
  const [editDialog, setEditDialog] = useState({ open: false, songId: null, title: '', status: '' });
  const [removeDialog, setRemoveDialog] = useState({ open: false, songId: null, songTitle: '' });

  useEffect(() => {
    dispatch(fetchArtistsDashboard());
  }, [dispatch]);

  // Keep selectedArtist up to date if artists state changes
  useEffect(() => {
    if (selectedArtist) {
      const updated = artists.find(a => a.id === selectedArtist.id);
      if (updated) setSelectedArtist(updated);
    }
  }, [artists]);

  const handlePlayToggle = (song) => {
    if (!song.audio_url) return;
    const fullUrl = getMediaUrl(song.audio_url);

    if (playingSongId === song.id && audioObj) {
      if (audioObj.paused) {
        audioObj.play();
      } else {
        audioObj.pause();
        setPlayingSongId(null);
      }
    } else {
      if (audioObj) {
        audioObj.pause();
      }
      const newAudio = new Audio(fullUrl);
      newAudio.play();
      newAudio.onended = () => setPlayingSongId(null);
      setAudioObj(newAudio);
      setPlayingSongId(song.id);
    }
  };

  const handleOpenEdit = (song) => {
    setEditDialog({
      open: true,
      songId: song.id,
      title: song.title || '',
      status: song.status || 'published'
    });
  };

  const submitEditSong = async () => {
    await dispatch(updateSong({
      songId: editDialog.songId,
      title: editDialog.title,
      status: editDialog.status
    }));
    setEditDialog({ open: false, songId: null, title: '', status: '' });
    dispatch(fetchArtistsDashboard());
  };

  const handleOpenRemove = (song) => {
    setRemoveDialog({
      open: true,
      songId: song.id,
      songTitle: song.title
    });
  };

  const confirmRemoveSong = async () => {
    await dispatch(removeSong(removeDialog.songId));
    setRemoveDialog({ open: false, songId: null, songTitle: '' });
    dispatch(fetchArtistsDashboard());
  };

  if (loading && artists.length === 0) {
    return (
      <div className="section-container" style={{ textAlign: 'center', padding: '40px' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="section-container">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h2 className="section-title">Assigned Artists Dashboard</h2>
      </div>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearModeratorMessages())}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => dispatch(clearModeratorMessages())}>{successMessage}</Alert>}

      <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 3 }}>
        Overview of your assigned artists, their real uploaded songs, statistics, profiles, and management options.
      </Typography>

      <TableContainer component={Paper} sx={{ bgcolor: 'var(--bg-elevated)', backgroundImage: 'none' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'var(--text-muted)' }}>Artist</TableCell>
              <TableCell sx={{ color: 'var(--text-muted)' }}>Email</TableCell>
              <TableCell sx={{ color: 'var(--text-muted)' }}>Status</TableCell>
              <TableCell sx={{ color: 'var(--text-muted)' }}>Songs</TableCell>
              <TableCell sx={{ color: 'var(--text-muted)' }}>Albums</TableCell>
              <TableCell sx={{ color: 'var(--text-muted)' }}>Followers</TableCell>
              <TableCell sx={{ color: 'var(--text-muted)' }}>Joined Date</TableCell>
              <TableCell sx={{ color: 'var(--text-muted)', textAlign: 'right' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {artists.map((artist) => (
              <TableRow key={artist.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)' } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar 
                      src={artist.avatar_url ? getMediaUrl(artist.avatar_url) : undefined}
                      sx={{ bgcolor: 'var(--primary)', width: 36, height: 36 }}
                    >
                      {artist.display_name?.[0] || artist.username?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
                        {artist.display_name || artist.username}
                        {artist.is_verified && <CheckCircle size={14} color="#10B981" />}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                        @{artist.username}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: 'var(--text-main)' }}>{artist.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={artist.is_active ? 'Active' : 'Inactive'} 
                    size="small"
                    color={artist.is_active ? 'success' : 'error'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell sx={{ color: 'var(--text-main)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Music size={14} color="var(--primary)" />
                    {artist.stats?.total_songs || 0}
                  </Box>
                </TableCell>
                <TableCell sx={{ color: 'var(--text-main)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Disc3 size={14} color="var(--primary)" />
                    {artist.stats?.total_albums || 0}
                  </Box>
                </TableCell>
                <TableCell sx={{ color: 'var(--text-main)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Users size={14} color="var(--primary)" />
                    {artist.stats?.total_followers || 0}
                  </Box>
                </TableCell>
                <TableCell sx={{ color: 'var(--text-muted)' }}>
                  {new Date(artist.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  <Button 
                    size="small" 
                    variant="contained"
                    startIcon={<Info size={16} />}
                    onClick={() => setSelectedArtist(artist)} 
                    sx={{ bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--primary-hover)' }, fontSize: '0.8rem' }}
                  >
                    View Songs & Profile
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {artists.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', color: 'var(--text-muted)', py: 4 }}>
                  <Typography variant="subtitle1" sx={{ color: 'var(--text-main)', mb: 1, fontWeight: 600 }}>No Assigned Artists Found</Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                    You are not assigned to moderate any artist yet. An artist can add you as their personal moderator from their Artist Studio.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Artist Profile & Real Songs Dialog */}
      <Dialog 
        open={Boolean(selectedArtist)} 
        onClose={() => setSelectedArtist(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ style: { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)', borderRadius: '12px' } }}
      >
        {selectedArtist && (
          <>
            <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Assigned Artist: {selectedArtist.display_name || selectedArtist.username}
              </Typography>
              <Chip label="Assigned Artist" color="primary" size="small" />
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              {/* Profile Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar 
                  src={selectedArtist.avatar_url ? getMediaUrl(selectedArtist.avatar_url) : undefined}
                  sx={{ bgcolor: 'var(--primary)', width: 64, height: 64 }}
                >
                  {selectedArtist.display_name?.[0] || selectedArtist.username?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {selectedArtist.display_name || selectedArtist.username}
                    {selectedArtist.is_verified && <CheckCircle size={16} color="#10B981" />}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                    @{selectedArtist.username} • {selectedArtist.email}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 3 }}>
                <Box sx={{ bgcolor: 'var(--bg-main)', p: 1.5, borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>Total Songs</Typography>
                  <Typography variant="h6" sx={{ color: 'var(--text-main)' }}>{selectedArtist.stats?.total_songs || 0}</Typography>
                </Box>
                <Box sx={{ bgcolor: 'var(--bg-main)', p: 1.5, borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>Total Albums</Typography>
                  <Typography variant="h6" sx={{ color: 'var(--text-main)' }}>{selectedArtist.stats?.total_albums || 0}</Typography>
                </Box>
                <Box sx={{ bgcolor: 'var(--bg-main)', p: 1.5, borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>Followers</Typography>
                  <Typography variant="h6" sx={{ color: 'var(--text-main)' }}>{selectedArtist.stats?.total_followers || 0}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.08)' }} />

              {/* REAL SONGS TABLE */}
              <Typography variant="h6" sx={{ color: 'var(--text-main)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Music size={20} color="var(--primary)" /> Real Songs Uploaded by {selectedArtist.display_name || selectedArtist.username} ({selectedArtist.songs?.length || 0})
              </Typography>

              <TableContainer component={Paper} sx={{ bgcolor: 'var(--bg-main)', backgroundImage: 'none', mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'var(--text-muted)' }}>Listen</TableCell>
                      <TableCell sx={{ color: 'var(--text-muted)' }}>Title</TableCell>
                      <TableCell sx={{ color: 'var(--text-muted)' }}>Genre</TableCell>
                      <TableCell sx={{ color: 'var(--text-muted)' }}>Album</TableCell>
                      <TableCell sx={{ color: 'var(--text-muted)' }}>Status</TableCell>
                      <TableCell sx={{ color: 'var(--text-muted)' }}>Plays</TableCell>
                      <TableCell sx={{ color: 'var(--text-muted)', textAlign: 'right' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedArtist.songs || []).map((song) => (
                      <TableRow key={song.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)' } }}>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => handlePlayToggle(song)}
                            sx={{ color: 'var(--primary)', bgcolor: 'rgba(124,92,252,0.1)', '&:hover': { bgcolor: 'rgba(124,92,252,0.2)' } }}
                          >
                            {playingSongId === song.id ? <Pause size={16} /> : <Play size={16} />}
                          </IconButton>
                        </TableCell>
                        <TableCell sx={{ color: 'var(--text-main)', fontWeight: 600 }}>{song.title}</TableCell>
                        <TableCell sx={{ color: 'var(--text-muted)' }}>{song.category || 'Uncategorized'}</TableCell>
                        <TableCell sx={{ color: 'var(--text-muted)' }}>{song.album || 'Single'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={song.status} 
                            size="small" 
                            color={song.status === 'published' ? 'success' : song.status === 'pending_review' ? 'warning' : 'default'} 
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'var(--text-main)' }}>{song.play_count || 0}</TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="info"
                              startIcon={<Edit3 size={14} />}
                              onClick={() => handleOpenEdit(song)}
                              sx={{ fontSize: '0.75rem', py: 0.2 }}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="error"
                              startIcon={<Trash2 size={14} />}
                              onClick={() => handleOpenRemove(song)}
                              sx={{ fontSize: '0.75rem', py: 0.2 }}
                            >
                              Remove
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!selectedArtist.songs || selectedArtist.songs.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', color: 'var(--text-muted)', py: 3 }}>
                          This artist has not uploaded any songs yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setSelectedArtist(null)} variant="outlined" sx={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Song Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, songId: null, title: '', status: '' })} PaperProps={{ style: { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)', minWidth: '400px' } }}>
        <DialogTitle>Edit Song</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Song Title"
            value={editDialog.title}
            onChange={(e) => setEditDialog(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
            InputProps={{ style: { color: 'var(--text-main)' } }}
          />
          <TextField
            fullWidth
            select
            label="Status"
            value={editDialog.status}
            onChange={(e) => setEditDialog(prev => ({ ...prev, status: e.target.value }))}
            InputProps={{ style: { color: 'var(--text-main)' } }}
          >
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="pending_review">Pending Review</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialog({ open: false, songId: null, title: '', status: '' })}>Cancel</Button>
          <Button onClick={submitEditSong} variant="contained" color="primary">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Remove Song Dialog */}
      <Dialog open={removeDialog.open} onClose={() => setRemoveDialog({ open: false, songId: null, songTitle: '' })} PaperProps={{ style: { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)' } }}>
        <DialogTitle>Archive Song</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to archive <strong>"{removeDialog.songTitle}"</strong>?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRemoveDialog({ open: false, songId: null, songTitle: '' })}>Cancel</Button>
          <Button onClick={confirmRemoveSong} variant="contained" color="error">Archive Song</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ArtistDashboardPanel;

