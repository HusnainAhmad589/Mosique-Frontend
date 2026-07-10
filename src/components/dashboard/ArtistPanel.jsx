import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Tabs, Tab, Box, Typography, Button, TextField, CircularProgress, Alert, 
  Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Select, MenuItem, InputLabel, FormControl, 
  Avatar, Snackbar 
} from '@mui/material';
import { Music, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { 
  fetchProfile, updateProfile, fetchAlbums, createAlbum, 
  fetchSongs, publishSong, fetchCategories, clearMessages 
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
  const [songForm, setSongForm] = useState({ title: '', category_id: '', album_id: '', audioFile: null });

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
    });
  };

  const handleSongSubmit = (e) => {
    e.preventDefault();
    if (!songForm.audioFile) return alert("Please select an audio file.");
    if (!songForm.category_id) return alert("Please select a category.");

    const formData = new FormData();
    formData.append('title', songForm.title);
    formData.append('category_id', songForm.category_id);
    if (songForm.album_id) formData.append('album_id', songForm.album_id);
    formData.append('audio', songForm.audioFile);
    
    dispatch(publishSong(formData)).then(() => {
      setSongForm({ title: '', category_id: '', album_id: '', audioFile: null });
    });
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
          <Box sx={{ mb: 4, p: 3, bgcolor: 'var(--bg-elevated)', borderRadius: '8px' }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'var(--text-main)' }}>Create New Album</Typography>
            <Box component="form" onSubmit={handleAlbumSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: 'var(--primary)', alignSelf: 'flex-start' }}>Create Album</Button>
            </Box>
          </Box>

          <Typography variant="h6" sx={{ mb: 2, color: 'var(--text-main)' }}>Your Albums</Typography>
          <Grid container spacing={2}>
            {albums.map(album => (
              <Grid item xs={12} sm={6} md={4} key={album.id}>
                <Card sx={{ bgcolor: 'var(--bg-elevated)', color: 'var(--text-main)' }}>
                  {album.cover_url && (
                    <img src={`http://localhost:3001${album.cover_url}`} alt={album.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  )}
                  <CardContent>
                    <Typography variant="h6">{album.title}</Typography>
                    <Typography variant="body2" color="var(--text-muted)">{new Date(album.release_date).toLocaleDateString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* --- TRACKS TAB --- */}
        <TabPanel value={tabIndex} index={3}>
           <Box sx={{ mb: 4, p: 3, bgcolor: 'var(--bg-elevated)', borderRadius: '8px' }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'var(--text-main)' }}>Upload New Track</Typography>
            <Box component="form" onSubmit={handleSongSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <TextField fullWidth required label="Track Title" value={songForm.title} onChange={e => setSongForm({ ...songForm, title: e.target.value })} sx={{ flex: 1 }} />
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
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                  <Button variant="outlined" component="label" startIcon={<UploadCloud />} sx={{ height: '56px', width: '100%' }}>
                    Select Audio File (.mp3, .wav)
                    <input type="file" hidden accept="audio/mpeg, audio/wav" onChange={e => setSongForm({ ...songForm, audioFile: e.target.files[0] })} />
                  </Button>
                  {songForm.audioFile && <Typography variant="caption" sx={{ mt: 1 }}>{songForm.audioFile.name}</Typography>}
                </Box>
                <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: 'var(--primary)', height: '56px', flex: 1 }}>Publish Track</Button>
              </Box>
            </Box>
          </Box>

          <Typography variant="h6" sx={{ mb: 2, color: 'var(--text-main)' }}>Your Tracks</Typography>
          <TableContainer component={Paper} sx={{ bgcolor: 'var(--bg-elevated)' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'var(--text-muted)' }}>Title</TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)' }}>Category</TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)' }}>Album</TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)' }}>Preview</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {songs.map(song => (
                  <TableRow key={song.id}>
                    <TableCell sx={{ color: 'var(--text-main)', fontWeight: 500 }}>{song.title}</TableCell>
                    <TableCell sx={{ color: 'var(--text-main)' }}>{song.Category?.name}</TableCell>
                    <TableCell sx={{ color: 'var(--text-main)' }}>{song.Album?.title || 'Single'}</TableCell>
                    <TableCell>
                      {song.audio_url && (
                        <audio controls src={`http://localhost:3001${song.audio_url}`} style={{ height: '32px' }} />
                      )}
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
