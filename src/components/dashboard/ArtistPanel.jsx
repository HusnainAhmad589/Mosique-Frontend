import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Tabs, Tab, Box, Typography, Button, TextField, CircularProgress, Alert, 
  Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Select, MenuItem, InputLabel, FormControl, 
  Avatar, Snackbar, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import { Music, Image as ImageIcon, UploadCloud, Trash2, Eye, EyeOff, X, Heart, Play } from 'lucide-react';
import { 
  fetchProfile, updateProfile, fetchAlbums, createAlbum, 
  fetchSongs, publishSong, deleteSong, fetchCategories, clearMessages,
  updateAlbumStatus, deleteAlbum, updateSongStatus
} from '../../store/slices/artistSlice';

// A simple TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ArtistPanel = () => {
  const dispatch = useDispatch();
  const { profile, albums, songs, categories, loading, error, successMessage } = useSelector(state => state.artist);
  const [tabIndex, setTabIndex] = useState(0);

  // Forms state
  const [profileForm, setProfileForm] = useState({ bio: '', twitter_url: '', instagram_url: '', spotify_url: '', bannerFile: null });
  const [albumForm, setAlbumForm] = useState({ title: '', description: '', release_date: '', coverFile: null });
  const [songForm, setSongForm] = useState({ category_id: '', album_id: '', tracks: [] });

  const [toast, setToast] = useState({ open: false, message: '', severity: 'error' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, id: null, title: '' });
  // tracks: [{ title: '', audioFile: File }]
  
  const [createAlbumOpen, setCreateAlbumOpen] = useState(false);
  const [createTrackOpen, setCreateTrackOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchAlbums());
    dispatch(fetchSongs());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Sync profile data to form when loaded
  useEffect(() => {
    if (profile) {
      setProfileForm({
        bio: profile.bio || '',
        twitter_url: profile.twitter_url || '',
        instagram_url: profile.instagram_url || '',
        spotify_url: profile.spotify_url || '',
        bannerFile: null,
      });
    }
  }, [profile]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    dispatch(clearMessages());
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('bio', profileForm.bio);
    formData.append('twitter_url', profileForm.twitter_url);
    formData.append('instagram_url', profileForm.instagram_url);
    formData.append('spotify_url', profileForm.spotify_url);
    if (profileForm.bannerFile) {
      formData.append('banner', profileForm.bannerFile);
    }
    dispatch(updateProfile(formData));
  };

  const handleAlbumSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', albumForm.title);
    formData.append('description', albumForm.description);
    formData.append('release_date', albumForm.release_date);
    if (albumForm.coverFile) {
      formData.append('artwork', albumForm.coverFile);
    }
    dispatch(createAlbum(formData)).then(() => {
      setAlbumForm({ title: '', description: '', release_date: '', coverFile: null });
      setCreateAlbumOpen(false);
    });
  };

  const handleSongSubmit = async (e) => {
    e.preventDefault();
    if (songForm.tracks.length === 0) return setToast({ open: true, message: "Please select at least one audio file.", severity: 'error' });
    if (!songForm.category_id) return setToast({ open: true, message: "Please select a category.", severity: 'error' });

    for (const track of songForm.tracks) {
      if (!track.title.trim()) {
        setToast({ open: true, message: `Please enter a title for "${track.audioFile.name}".`, severity: 'error' });
        return;
      }
    }

    for (const track of songForm.tracks) {
      const formData = new FormData();
      formData.append('title', track.title);
      formData.append('category_id', songForm.category_id);
      if (songForm.album_id) formData.append('album_id', songForm.album_id);
      formData.append('audio', track.audioFile);
      await dispatch(publishSong(formData));
    }

    setSongForm({ category_id: '', album_id: '', tracks: [] });
    setCreateTrackOpen(false);
  };

  const handleAudioFilesSelected = (e) => {
    const files = Array.from(e.target.files);
    const newTracks = files.map(file => ({
      title: file.name.replace(/\.(mp3|wav|m4a|flac|ogg)$/i, ''),
      audioFile: file
    }));
    setSongForm(prev => ({ ...prev, tracks: [...prev.tracks, ...newTracks] }));
    e.target.value = ''; // reset so same files can be re-selected
  };

  const handleRemoveTrack = (index) => {
    setSongForm(prev => ({
      ...prev,
      tracks: prev.tracks.filter((_, i) => i !== index)
    }));
  };

  const handleTrackTitleChange = (index, newTitle) => {
    setSongForm(prev => ({
      ...prev,
      tracks: prev.tracks.map((t, i) => i === index ? { ...t, title: newTitle } : t)
    }));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="panel-title" style={{ margin: 0 }}>Artist Studio</h2>
      </div>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={() => dispatch(clearMessages())}>
        <Alert onClose={() => dispatch(clearMessages())} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>

      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })} PaperProps={{ style: { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)', minWidth: '300px' } }}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.type === 'album' 
              ? `Are you sure you want to delete "${confirmDialog.title}"? Songs in this album will become singles.` 
              : `Are you sure you want to delete "${confirmDialog.title}"?`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })} sx={{ color: 'var(--text-muted)' }}>Cancel</Button>
          <Button onClick={() => {
            if (confirmDialog.type === 'album') dispatch(deleteAlbum(confirmDialog.id));
            if (confirmDialog.type === 'song') dispatch(deleteSong(confirmDialog.id));
            setConfirmDialog({ ...confirmDialog, open: false });
          }} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ width: '100%', bgcolor: 'var(--bg-card)', borderRadius: '12px', boxShadow: 'var(--shadow-card)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleTabChange} sx={{
            '& .MuiTab-root': { color: 'var(--text-secondary)' },
            '& .Mui-selected': { color: 'var(--primary) !important' },
            '& .MuiTabs-indicator': { backgroundColor: 'var(--primary)' }
          }}>
            <Tab label="Overview" />
            <Tab label="Profile" />
            <Tab label="Albums" />
            <Tab label="Tracks" />
          </Tabs>
        </Box>

        {/* --- OVERVIEW TAB --- */}
        <TabPanel value={tabIndex} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'var(--bg-elevated)', color: 'var(--text-main)', boxShadow: 'none' }}>
                <CardContent>
                  <Typography color="var(--text-muted)" gutterBottom>Total Albums</Typography>
                  <Typography variant="h3">{albums.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'var(--bg-elevated)', color: 'var(--text-main)', boxShadow: 'none' }}>
                <CardContent>
                  <Typography color="var(--text-muted)" gutterBottom>Total Tracks</Typography>
                  <Typography variant="h3">{songs.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* --- PROFILE TAB --- */}
        <TabPanel value={tabIndex} index={1}>
          <Box component="form" onSubmit={handleProfileSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField fullWidth label="Biography" multiline rows={4} value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} />
                <TextField fullWidth label="Twitter URL" value={profileForm.twitter_url} onChange={e => setProfileForm({ ...profileForm, twitter_url: e.target.value })} />
                <TextField fullWidth label="Instagram URL" value={profileForm.instagram_url} onChange={e => setProfileForm({ ...profileForm, instagram_url: e.target.value })} />
                <TextField fullWidth label="Spotify URL" value={profileForm.spotify_url} onChange={e => setProfileForm({ ...profileForm, spotify_url: e.target.value })} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ border: '2px dashed var(--border)', borderRadius: '8px', p: 3, textAlign: 'center' }}>
                  {profile?.banner_url ? (
                    <img src={`http://localhost:3001${profile.banner_url}`} alt="Banner" style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }} />
                  ) : (
                    <ImageIcon size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                  )}
                  <Button variant="contained" component="label" fullWidth sx={{ bgcolor: 'var(--primary)' }}>
                    Upload Banner
                    <input type="file" hidden accept="image/*" onChange={e => setProfileForm({ ...profileForm, bannerFile: e.target.files[0] })} />
                  </Button>
                  {profileForm.bannerFile && <Typography variant="caption" display="block" sx={{ mt: 1 }}>{profileForm.bannerFile.name}</Typography>}
                </Box>
              </Box>
            </Box>
            <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--primary-hover)' }, alignSelf: 'flex-start' }}>
              {loading ? <CircularProgress size={24} /> : 'Save Profile'}
            </Button>
          </Box>
        </TabPanel>

        {/* --- ALBUMS TAB --- */}
        <TabPanel value={tabIndex} index={2}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: 'var(--text-main)' }}>Your Albums</Typography>
            <Button variant="contained" sx={{ bgcolor: 'var(--primary)' }} onClick={() => setCreateAlbumOpen(true)}>
              + Create New Album
            </Button>
          </Box>

          <Dialog open={createAlbumOpen} onClose={() => setCreateAlbumOpen(false)} maxWidth="sm" fullWidth PaperProps={{ style: { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)' } }}>
            <DialogTitle>Create New Album</DialogTitle>
            <DialogContent>
              <Box component="form" id="album-form" onSubmit={handleAlbumSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField fullWidth required label="Album Title" value={albumForm.title} onChange={e => setAlbumForm({ ...albumForm, title: e.target.value })} sx={{ flex: 1 }} />
                  <TextField 
                    fullWidth 
                    label="Release Date" 
                    type="text"
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => (e.target.value === '' ? (e.target.type = 'text') : (e.target.type = 'date'))}
                    InputLabelProps={{ shrink: true }} 
                    value={albumForm.release_date} 
                    onChange={e => setAlbumForm({ ...albumForm, release_date: e.target.value })} 
                    sx={{ flex: 1 }}
                  />
                </Box>
                <TextField fullWidth multiline rows={3} label="Description" value={albumForm.description} onChange={e => setAlbumForm({ ...albumForm, description: e.target.value })} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button variant="outlined" component="label">
                    Select Cover Art
                    <input type="file" hidden accept="image/*" onChange={e => setAlbumForm({ ...albumForm, coverFile: e.target.files[0] })} />
                  </Button>
                  {albumForm.coverFile && <Typography variant="caption">{albumForm.coverFile.name}</Typography>}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button onClick={() => setCreateAlbumOpen(false)} sx={{ color: 'var(--text-muted)' }}>Cancel</Button>
              <Button type="submit" form="album-form" variant="contained" disabled={loading} sx={{ bgcolor: 'var(--primary)' }}>Create Album</Button>
            </DialogActions>
          </Dialog>
          <Grid container spacing={2}>
            {albums.map(album => (
              <Grid item xs={12} sm={6} md={4} key={album.id}>
                <Card sx={{ bgcolor: 'var(--bg-elevated)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ position: 'relative' }}>
                    {album.cover_url ? (
                      <img src={`http://localhost:3001${album.cover_url}`} alt={album.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                    ) : (
                      <Box sx={{ width: '100%', height: '200px', bgcolor: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="var(--text-muted)">No Cover</Typography>
                      </Box>
                    )}
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.7rem', 
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: album.status === 'published' ? '#10B981' : 
                                         album.status === 'pending_review' ? '#3B82F6' : 
                                         album.status === 'scheduled' ? '#8B5CF6' :
                                         album.status === 'archived' ? '#6B7280' : '#F59E0B',
                        color: '#fff'
                      }}>
                        {album.status?.replace('_', ' ') || 'draft'}
                      </span>
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{album.title}</Typography>
                    <Typography variant="body2" color="var(--text-muted)">{new Date(album.release_date).toLocaleDateString()}</Typography>
                    {album.rejection_reason && (
                      <Alert severity="error" sx={{ mt: 1, p: 0.5, fontSize: '0.75rem' }}>
                        Rejected: {album.rejection_reason}
                      </Alert>
                    )}
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {album.status === 'draft' && (
                      <Button 
                        size="small" variant="contained" color="primary" fullWidth
                        onClick={() => dispatch(updateAlbumStatus({ albumId: album.id, status: 'pending_review' }))}
                      >
                        Submit for Review
                      </Button>
                    )}
                    {album.status === 'published' && (
                      <Button 
                        size="small" variant="outlined" color="warning" fullWidth
                        onClick={() => dispatch(updateAlbumStatus({ albumId: album.id, status: 'archived' }))}
                      >
                        Archive
                      </Button>
                    )}
                    {album.status === 'archived' && (
                      <Button 
                        size="small" variant="outlined" color="primary" fullWidth
                        onClick={() => dispatch(updateAlbumStatus({ albumId: album.id, status: 'draft' }))}
                      >
                        Unarchive
                      </Button>
                    )}
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="error"
                      fullWidth
                      onClick={() => setConfirmDialog({ open: true, type: 'album', id: album.id, title: album.title })}
                    >
                      Delete
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* --- TRACKS TAB --- */}
        <TabPanel value={tabIndex} index={3}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: 'var(--text-main)' }}>Your Tracks</Typography>
            <Button variant="contained" sx={{ bgcolor: 'var(--primary)' }} onClick={() => setCreateTrackOpen(true)}>
              + Upload New Track
            </Button>
          </Box>

          <Dialog open={createTrackOpen} onClose={() => setCreateTrackOpen(false)} maxWidth="sm" fullWidth PaperProps={{ style: { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)' } }}>
            <DialogTitle>Upload Tracks</DialogTitle>
            <DialogContent>
              <Box component="form" id="track-form" onSubmit={handleSongSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                  <FormControl fullWidth required sx={{ flex: 1 }}>
                    <InputLabel id="category-label">Category / Genre</InputLabel>
                    <Select labelId="category-label" value={songForm.category_id} label="Category / Genre" onChange={e => setSongForm({ ...songForm, category_id: e.target.value })}>
                      {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth sx={{ flex: 1 }}>
                    <InputLabel id="album-label">Assign to Album (Optional)</InputLabel>
                    <Select labelId="album-label" value={songForm.album_id} label="Assign to Album (Optional)" onChange={e => setSongForm({ ...songForm, album_id: e.target.value })}>
                      <MenuItem value=""><em>Single (No Album)</em></MenuItem>
                      {albums.map(al => <MenuItem key={al.id} value={al.id}>{al.title}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>

                <Button variant="outlined" component="label" startIcon={<UploadCloud />} sx={{ height: '56px', width: '100%' }}>
                  Select Audio Files (.mp3, .wav)
                  <input type="file" hidden accept="audio/mpeg, audio/wav" multiple onChange={handleAudioFilesSelected} />
                </Button>

                {songForm.tracks.length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: '300px', overflowY: 'auto', p: 1 }}>
                    {songForm.tracks.map((track, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '8px', p: 1.5 }}>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', minWidth: '24px', textAlign: 'center' }}>{index + 1}</Typography>
                        <TextField 
                          size="small" 
                          fullWidth 
                          label="Track Title" 
                          value={track.title} 
                          onChange={e => handleTrackTitleChange(index, e.target.value)}
                          required
                        />
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {track.audioFile.name}
                        </Typography>
                        <IconButton size="small" onClick={() => handleRemoveTrack(index)} sx={{ color: 'var(--text-muted)', '&:hover': { color: '#ef4444' } }}>
                          <X size={16} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}

                {songForm.tracks.length > 0 && (
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                    {songForm.tracks.length} {songForm.tracks.length === 1 ? 'track' : 'tracks'} selected
                  </Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button onClick={() => setCreateTrackOpen(false)} sx={{ color: 'var(--text-muted)' }}>Cancel</Button>
              <Button type="submit" form="track-form" variant="contained" disabled={loading || songForm.tracks.length === 0} sx={{ bgcolor: 'var(--primary)' }}>
                {loading ? <CircularProgress size={20} /> : `Publish ${songForm.tracks.length || ''} Track${songForm.tracks.length !== 1 ? 's' : ''}`}
              </Button>
            </DialogActions>
          </Dialog>
          <TableContainer component={Paper} sx={{ bgcolor: 'var(--bg-elevated)' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'var(--text-muted)' }}>Title</TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)' }}>Category</TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)' }}>Album</TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)' }}>Likes</TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)' }}>Plays</TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)' }}>Preview</TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)' }}>Status</TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {songs.map(song => (
                  <TableRow key={song.id}>
                    <TableCell sx={{ color: 'var(--text-main)', fontWeight: 500 }}>
                      {song.title}
                      {song.rejection_reason && (
                        <Typography variant="caption" display="block" color="error">Rejected: {song.rejection_reason}</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: 'var(--text-main)' }}>{song.Category?.name}</TableCell>
                    <TableCell sx={{ color: 'var(--text-main)' }}>{song.Album?.title || 'Single'}</TableCell>
                    <TableCell sx={{ color: 'var(--text-main)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Heart size={14} fill="var(--text-muted)" color="var(--text-muted)" />
                        {song.likes_count || 0}
                      </span>
                    </TableCell>
                    <TableCell sx={{ color: 'var(--text-main)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Play size={14} fill="var(--text-muted)" color="var(--text-muted)" />
                        {song.play_count || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      {song.audio_url && (
                        <audio controls src={`http://localhost:3001${song.audio_url}`} style={{ height: '32px' }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={song.status?.replace('_', ' ') || 'draft'} 
                        size="small"
                        sx={{ 
                          bgcolor: song.status === 'published' ? '#10B981' : 
                                   song.status === 'pending_review' ? '#3B82F6' : 
                                   song.status === 'scheduled' ? '#8B5CF6' :
                                   song.status === 'archived' ? '#6B7280' : '#F59E0B',
                          color: '#fff',
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {song.status === 'draft' && (
                          <Button size="small" variant="contained" color="primary" sx={{ textTransform: 'none' }} onClick={() => dispatch(updateSongStatus({ songId: song.id, status: 'pending_review' }))}>
                            Submit
                          </Button>
                        )}
                        {song.status === 'published' && (
                          <Button size="small" variant="outlined" color="warning" sx={{ textTransform: 'none' }} onClick={() => dispatch(updateSongStatus({ songId: song.id, status: 'archived' }))}>
                            Archive
                          </Button>
                        )}
                        {song.status === 'archived' && (
                          <Button size="small" variant="outlined" color="primary" sx={{ textTransform: 'none' }} onClick={() => dispatch(updateSongStatus({ songId: song.id, status: 'draft' }))}>
                            Unarchive
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => setConfirmDialog({ open: true, type: 'song', id: song.id, title: song.title })}
                          sx={{ minWidth: '40px', padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

      </Box>
    </div>
  );
};

export default ArtistPanel;
