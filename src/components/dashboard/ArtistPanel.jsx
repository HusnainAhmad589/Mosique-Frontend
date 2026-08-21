import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Tabs, Tab, Box, Typography, Button, TextField, CircularProgress, Alert, 
  Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Select, MenuItem, InputLabel, FormControl, 
  Avatar, Snackbar, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControlLabel, Switch, Tooltip
} from '@mui/material';
import { Music, Image as ImageIcon, UploadCloud, Trash2, Eye, EyeOff, X, Heart, Play, Calendar, Clock, Sparkles, Plus, FileText, List, Mic, ShieldAlert, AlertTriangle } from 'lucide-react';
import { 
  fetchProfile, updateProfile, fetchAlbums, createAlbum, 
  fetchSongs, publishSong, deleteSong, fetchCategories, clearMessages,
  updateAlbumStatus, deleteAlbum, updateSongStatus, generateLyrics, updateSongLyrics
} from '../../store/slices/artistSlice';
import api, { getMediaUrl } from '../../api';

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
  const [songForm, setSongForm] = useState({ category_id: '', album_id: '', is_scheduled: false, scheduled_at: '', tracks: [] });

  const [toast, setToast] = useState({ open: false, message: '', severity: 'error' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, id: null, title: '' });
  
  const [createAlbumOpen, setCreateAlbumOpen] = useState(false);
  const [createTrackOpen, setCreateTrackOpen] = useState(false);

  // Lyrics Editor State
  const [lyricsEditorOpen, setLyricsEditorOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [lyricsList, setLyricsList] = useState([]);
  const [rawLyricsText, setRawLyricsText] = useState('');
  const [editorMode, setEditorMode] = useState('list'); // 'list' or 'raw'
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const pollIntervalRef = useRef(null);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

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

    if (songForm.is_scheduled) {
      if (!songForm.scheduled_at) {
        return setToast({ open: true, message: "Please select a date and time for scheduled release.", severity: 'error' });
      }
      if (new Date(songForm.scheduled_at) <= new Date()) {
        return setToast({ open: true, message: "Schedule release date & time must be in the future.", severity: 'error' });
      }
    }

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

      if (songForm.is_scheduled && songForm.scheduled_at) {
        formData.append('scheduled_at', songForm.scheduled_at);
        formData.append('status', 'scheduled');
      }

      await dispatch(publishSong(formData));
    }

    setSongForm({ category_id: '', album_id: '', is_scheduled: false, scheduled_at: '', tracks: [] });
    setCreateTrackOpen(false);
    dispatch(fetchSongs());
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

  // Lyrics Handlers
  const handleCloseLyricsEditor = () => {
    stopPolling();
    setIsGeneratingLyrics(false);
    setLyricsEditorOpen(false);
    setEditingSong(null);
  };

  const handleOpenLyricsEditor = (song) => {
    stopPolling();
    setEditingSong(song);
    setEditorMode('list');

    // If this specific song is currently processing, show loading and resume polling
    if (song?.lyrics_status === 'processing') {
      setIsGeneratingLyrics(true);
      const songId = song.id;
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await api.get(`/artist/songs/${songId}/lyrics-status`);
          if (res.data && res.data.lyrics_status === 'completed' && res.data.lyrics) {
            stopPolling();
            setIsGeneratingLyrics(false);
            const parsed = res.data.lyrics;
            if (Array.isArray(parsed)) {
              const normalized = parsed.map((item, idx) => ({
                time: typeof item?.time === 'number' ? item.time : idx * 5,
                text: typeof item?.text === 'string' ? item.text : (typeof item === 'string' ? item : '')
              }));
              setLyricsList(normalized);
              setRawLyricsText(normalized.map(l => `[${l.time}s] ${l.text}`).join('\n'));
            }
            setToast({ open: true, message: 'AI Lyrics generated and synchronized successfully!', severity: 'success' });
            dispatch(fetchSongs());
          } else if (res.data && res.data.lyrics_status === 'failed') {
            stopPolling();
            setIsGeneratingLyrics(false);
            setToast({ open: true, message: res.data.lyrics_error || 'Lyrics generation failed', severity: 'error' });
          }
        } catch (pollErr) {
          stopPolling();
          setIsGeneratingLyrics(false);
        }
      }, 3000);
    } else {
      setIsGeneratingLyrics(false);
    }

    if (song?.lyrics) {
      try {
        let parsed = song.lyrics;
        if (typeof song.lyrics === 'string') {
          const trimmed = song.lyrics.trim();
          if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            parsed = JSON.parse(trimmed);
          } else {
            const lines = trimmed.split('\n').filter(Boolean);
            parsed = lines.map((line, i) => ({ time: i * 5, text: line }));
          }
        }
        
        if (Array.isArray(parsed)) {
          const normalized = parsed.map((item, idx) => ({
            time: typeof item?.time === 'number' ? item.time : idx * 5,
            text: typeof item?.text === 'string' ? item.text : (typeof item === 'string' ? item : '')
          }));
          setLyricsList(normalized);
          setRawLyricsText(normalized.map(l => `[${l.time}s] ${l.text}`).join('\n'));
        } else {
          setLyricsList([]);
          setRawLyricsText('');
        }
      } catch (err) {
        setLyricsList([]);
        setRawLyricsText('');
      }
    } else {
      setLyricsList([
        { time: 2.0, text: 'First verse starts here...' },
        { time: 8.0, text: 'Second line of lyrics...' }
      ]);
      setRawLyricsText('');
    }

    setLyricsEditorOpen(true);
  };

  const handleTriggerAIGenerate = async () => {
    if (!editingSong) return;
    stopPolling();
    setIsGeneratingLyrics(true);
    try {
      await dispatch(generateLyrics(editingSong.id)).unwrap();
      setToast({ open: true, message: 'AI transcription queued in background. Transcribing vocals...', severity: 'info' });

      // Poll background status every 3s until ready
      const currentSongId = editingSong.id;
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await api.get(`/artist/songs/${currentSongId}/lyrics-status`);
          if (res.data && res.data.lyrics_status === 'completed' && res.data.lyrics) {
            stopPolling();
            setIsGeneratingLyrics(false);
            const parsed = res.data.lyrics;
            if (Array.isArray(parsed)) {
              const normalized = parsed.map((item, idx) => ({
                time: typeof item?.time === 'number' ? item.time : idx * 5,
                text: typeof item?.text === 'string' ? item.text : (typeof item === 'string' ? item : '')
              }));
              setLyricsList(normalized);
              setRawLyricsText(normalized.map(l => `[${l.time}s] ${l.text}`).join('\n'));
            }
            setToast({ open: true, message: 'AI Lyrics generated and synchronized successfully!', severity: 'success' });
            dispatch(fetchSongs());
          } else if (res.data && res.data.lyrics_status === 'failed') {
            stopPolling();
            setIsGeneratingLyrics(false);
            setToast({ open: true, message: res.data.lyrics_error || 'Lyrics generation failed', severity: 'error' });
          }
        } catch (pollErr) {
          stopPolling();
          setIsGeneratingLyrics(false);
        }
      }, 3000);
    } catch (err) {
      setToast({ open: true, message: err || 'Failed to generate AI lyrics', severity: 'error' });
      setIsGeneratingLyrics(false);
    }
  };

  const handleAddLyricLine = () => {
    const lastTime = lyricsList.length > 0 ? lyricsList[lyricsList.length - 1].time + 4 : 0;
    setLyricsList(prev => [...prev, { time: Math.round(lastTime * 10) / 10, text: '' }]);
  };

  const handleLyricLineChange = (index, field, value) => {
    setLyricsList(prev => prev.map((item, idx) => {
      if (idx === index) {
        return {
          ...item,
          [field]: field === 'time' ? (parseFloat(value) || 0) : value
        };
      }
      return item;
    }));
  };

  const handleRemoveLyricLine = (index) => {
    setLyricsList(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveLyricsSubmit = async () => {
    if (!editingSong) return;

    let payload = lyricsList;
    if (editorMode === 'raw') {
      const lines = rawLyricsText.split('\n').filter(Boolean);
      payload = lines.map((l, i) => ({ time: i * 5, text: l.replace(/^\[\d+(\.\d+)?s?\]\s*/, '') }));
    }

    await dispatch(updateSongLyrics({ songId: editingSong.id, lyrics: payload }));
    setLyricsEditorOpen(false);
    dispatch(fetchSongs());
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
            <Grid xs={12} md={4}>
              <Card sx={{ bgcolor: 'var(--bg-elevated)', color: 'var(--text-main)', boxShadow: 'none' }}>
                <CardContent>
                  <Typography color="var(--text-muted)" gutterBottom>Total Albums</Typography>
                  <Typography variant="h3">{albums.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={4}>
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
                    <img src={getMediaUrl(profile.banner_url)} alt="Banner" style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }} />
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
              <Grid xs={12} sm={6} md={4} key={album.id}>
                <Card sx={{ bgcolor: 'var(--bg-elevated)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ position: 'relative' }}>
                    {album.cover_url ? (
                      <img src={getMediaUrl(album.cover_url)} alt={album.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
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

          <Dialog open={createTrackOpen} onClose={() => setCreateTrackOpen(false)} maxWidth="sm" fullWidth PaperProps={{ style: { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)', borderRadius: '12px' } }}>
            <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 600 }}>Upload Tracks</DialogTitle>
            <DialogContent>
              <Box component="form" id="track-form" onSubmit={handleSongSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
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

                {/* SCHEDULED UPLOAD SECTION */}
                <Box sx={{ border: '1px solid rgba(124, 92, 252, 0.25)', borderRadius: '8px', p: 2, bgcolor: 'rgba(124, 92, 252, 0.05)' }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={songForm.is_scheduled} 
                        onChange={(e) => setSongForm({ ...songForm, is_scheduled: e.target.checked })} 
                        color="primary" 
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Clock size={18} color="var(--primary)" />
                        <Typography variant="subtitle2" sx={{ color: 'var(--text-main)', fontWeight: 600 }}>
                          Schedule Automatic Release
                        </Typography>
                      </Box>
                    }
                  />
                  {songForm.is_scheduled && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Scheduled Release Date & Time"
                        type="datetime-local"
                        value={songForm.scheduled_at}
                        onChange={(e) => setSongForm({ ...songForm, scheduled_at: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{ style: { color: 'var(--text-main)', backgroundColor: 'var(--bg-card)' } }}
                        helperText="The track will automatically upload & go live for listeners at this exact date and time."
                        FormHelperTextProps={{ style: { color: 'var(--text-muted)', fontSize: '0.75rem' } }}
                      />
                    </Box>
                  )}
                </Box>

                <Button variant="outlined" component="label" startIcon={<UploadCloud />} sx={{ height: '56px', width: '100%', borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                  Select Audio Files (.mp3, .wav)
                  <input type="file" hidden accept="audio/mpeg, audio/wav" multiple onChange={handleAudioFilesSelected} />
                </Button>

                {songForm.tracks.length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: '250px', overflowY: 'auto', p: 1 }}>
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
            <DialogActions sx={{ p: 2, pt: 1 }}>
              <Button onClick={() => setCreateTrackOpen(false)} sx={{ color: 'var(--text-muted)' }}>Cancel</Button>
              <Button type="submit" form="track-form" variant="contained" disabled={loading || songForm.tracks.length === 0} sx={{ bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--primary-hover)' } }}>
                {loading ? <CircularProgress size={20} /> : songForm.is_scheduled ? `Schedule ${songForm.tracks.length || ''} Track${songForm.tracks.length !== 1 ? 's' : ''}` : `Publish ${songForm.tracks.length || ''} Track${songForm.tracks.length !== 1 ? 's' : ''}`}
              </Button>
            </DialogActions>
          </Dialog>

          {/* LYRICS EDITOR DIALOG */}
          <Dialog open={lyricsEditorOpen} onClose={handleCloseLyricsEditor} maxWidth="md" fullWidth PaperProps={{ style: { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)', borderRadius: '16px' } }}>
            <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Mic size={20} color="var(--primary)" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Lyrics Editor: {editingSong?.title}</Typography>
              </Box>
              <Button
                variant="contained"
                disabled={isGeneratingLyrics}
                onClick={handleTriggerAIGenerate}
                startIcon={isGeneratingLyrics ? <CircularProgress size={16} color="inherit" /> : <Sparkles size={16} />}
                sx={{ bgcolor: '#8B5CF6', '&:hover': { bgcolor: '#7C3AED' }, textTransform: 'none' }}
              >
                {isGeneratingLyrics ? 'Transcribing with AI...' : 'AI Auto-Generate Lyrics'}
              </Button>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, borderBottom: '1px solid rgba(255,255,255,0.08)', pb: 1 }}>
                <Button variant={editorMode === 'list' ? 'contained' : 'text'} size="small" onClick={() => setEditorMode('list')} startIcon={<List size={16} />} sx={{ textTransform: 'none', bgcolor: editorMode === 'list' ? 'var(--primary)' : 'transparent' }}>
                  Timestamped Line Editor
                </Button>
                <Button variant={editorMode === 'raw' ? 'contained' : 'text'} size="small" onClick={() => setEditorMode('raw')} startIcon={<FileText size={16} />} sx={{ textTransform: 'none', bgcolor: editorMode === 'raw' ? 'var(--primary)' : 'transparent' }}>
                  Raw Text Mode
                </Button>
              </Box>

              {editorMode === 'list' ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: '400px', overflowY: 'auto', p: 1 }}>
                  {lyricsList.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '8px', p: 1.5 }}>
                      <TextField
                        size="small"
                        label="Time (s)"
                        type="number"
                        inputProps={{ step: '0.1' }}
                        value={item.time}
                        onChange={e => handleLyricLineChange(index, 'time', e.target.value)}
                        sx={{ width: '110px' }}
                      />
                      <TextField
                        size="small"
                        fullWidth
                        label={`Line ${index + 1}`}
                        value={item.text}
                        onChange={e => handleLyricLineChange(index, 'text', e.target.value)}
                      />
                      <IconButton size="small" onClick={() => handleRemoveLyricLine(index)} sx={{ color: 'var(--text-muted)', '&:hover': { color: '#ef4444' } }}>
                        <X size={16} />
                      </IconButton>
                    </Box>
                  ))}
                  <Button variant="outlined" startIcon={<Plus size={16} />} onClick={handleAddLyricLine} sx={{ alignSelf: 'flex-start', mt: 1, textTransform: 'none' }}>
                    Add Lyric Line
                  </Button>
                </Box>
              ) : (
                <TextField
                  fullWidth
                  multiline
                  rows={12}
                  label="Lyrics (Plain Text or [sec] Format)"
                  value={rawLyricsText}
                  onChange={e => setRawLyricsText(e.target.value)}
                  placeholder="Paste lyrics here..."
                />
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 1, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Button onClick={handleCloseLyricsEditor} sx={{ color: 'var(--text-muted)' }}>Cancel</Button>
              <Button variant="contained" onClick={handleSaveLyricsSubmit} disabled={loading} sx={{ bgcolor: 'var(--primary)' }}>
                {loading ? <CircularProgress size={20} /> : 'Save Lyrics'}
              </Button>
            </DialogActions>
          </Dialog>

          <TableContainer component={Paper} sx={{ bgcolor: 'var(--bg-elevated)', backgroundImage: 'none' }}>
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
                  <TableRow key={song.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)' } }}>
                    <TableCell sx={{ color: 'var(--text-main)', fontWeight: 500 }}>
                      {song.title}
                      {song.rejection_reason && (
                        <Typography variant="caption" display="block" color="error">Rejected: {song.rejection_reason}</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: 'var(--text-main)' }}>{song.Category?.name || 'Uncategorized'}</TableCell>
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
                        <audio controls src={getMediaUrl(song.audio_url)} style={{ height: '32px' }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {song.rejection_reason && song.rejection_reason.startsWith('Removed by Authority') ? (
                          <Tooltip title={song.rejection_reason} arrow>
                            <Chip 
                              icon={<ShieldAlert size={14} color="#EF4444" />}
                              label="Removed by Authority" 
                              size="small"
                              sx={{ 
                                bgcolor: 'rgba(239, 68, 68, 0.2)', 
                                color: '#EF4444',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                fontWeight: 700,
                                width: 'fit-content'
                              }}
                            />
                          </Tooltip>
                        ) : (
                          <Chip 
                            label={song.status?.replace('_', ' ') || 'draft'} 
                            size="small"
                            sx={{ 
                              bgcolor: song.status === 'published' ? '#10B981' : 
                                       song.status === 'pending_review' ? '#3B82F6' : 
                                       song.status === 'scheduled' ? '#8B5CF6' :
                                       song.status === 'archived' ? '#6B7280' : '#F59E0B',
                              color: '#fff',
                              textTransform: 'capitalize',
                              fontWeight: 600,
                              width: 'fit-content'
                            }}
                          />
                        )}
                        {song.rejection_reason && (
                          <Typography variant="caption" sx={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.7rem' }}>
                            <AlertTriangle size={12} /> {song.rejection_reason}
                          </Typography>
                        )}
                        {song.status === 'scheduled' && song.scheduled_at && (
                          <Typography variant="caption" sx={{ color: '#A78BFA', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.7rem' }}>
                            <Clock size={12} /> Auto-release: {new Date(song.scheduled_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Sparkles size={14} />}
                          sx={{ borderColor: '#A78BFA', color: '#A78BFA', textTransform: 'none', fontSize: '0.75rem' }}
                          onClick={() => handleOpenLyricsEditor(song)}
                        >
                          Lyrics
                        </Button>
                        {song.rejection_reason && song.rejection_reason.startsWith('Removed by Authority') ? (
                          <Button 
                            size="small" 
                            variant="contained" 
                            color="warning" 
                            sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }} 
                            onClick={() => dispatch(updateSongStatus({ songId: song.id, status: 'pending_review' })).then(() => dispatch(fetchSongs()))}
                          >
                            Re-submit for Review
                          </Button>
                        ) : (
                          <>
                            {song.status === 'draft' && (
                              <Button size="small" variant="contained" color="primary" sx={{ textTransform: 'none' }} onClick={() => dispatch(updateSongStatus({ songId: song.id, status: 'pending_review' }))}>
                                Submit
                              </Button>
                            )}
                            {song.status === 'scheduled' && (
                              <Button 
                                size="small" 
                                variant="contained" 
                                color="success" 
                                sx={{ textTransform: 'none', fontSize: '0.75rem' }} 
                                onClick={() => dispatch(updateSongStatus({ songId: song.id, status: 'published' })).then(() => dispatch(fetchSongs()))}
                              >
                                Publish Now
                              </Button>
                            )}
                            {song.status === 'published' && (
                              <Button size="small" variant="outlined" color="warning" sx={{ textTransform: 'none' }} onClick={() => dispatch(updateSongStatus({ songId: song.id, status: 'archived' })).then(() => dispatch(fetchSongs()))}>
                                Archive
                              </Button>
                            )}
                            {song.status === 'archived' && (
                              <Button size="small" variant="outlined" color="primary" sx={{ textTransform: 'none' }} onClick={() => dispatch(updateSongStatus({ songId: song.id, status: 'draft' })).then(() => dispatch(fetchSongs()))}>
                                Unarchive
                              </Button>
                            )}
                          </>
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
                {songs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', color: 'var(--text-muted)', py: 3 }}>
                      No tracks uploaded yet. Click "+ Upload New Track" to add a song.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

      </Box>
    </div>
  );
};

export default ArtistPanel;


