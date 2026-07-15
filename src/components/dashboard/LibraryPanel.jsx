import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Tabs, Tab, Box, Typography, Card, CardContent, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, 
  Alert, IconButton, Grid, Chip 
} from '@mui/material';
import { Play, Heart, Trash2, Disc, Clock } from 'lucide-react';
import { fetchFavorites, removeFavorite, fetchSavedAlbums, removeSavedAlbum, fetchHistory, clearLibraryMessages } from '../../store/slices/librarySlice';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const LibraryPanel = ({ onPlayTrack, currentTrack }) => {
  const dispatch = useDispatch();
  const { favorites, savedAlbums, history, loading, error, successMessage } = useSelector(state => state.library);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchFavorites());
    dispatch(fetchSavedAlbums());
    dispatch(fetchHistory());
  }, [dispatch]);

  const handleUnlike = (trackId) => {
    dispatch(removeFavorite(trackId));
  };

  const handleUnsaveAlbum = (albumId) => {
    dispatch(removeSavedAlbum(albumId));
  };

  const formatTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading && favorites.length === 0 && savedAlbums.length === 0 && history.length === 0) {
    return <div className="loading-container"><CircularProgress /></div>;
  }

  return (
    <div className="section-container">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h2 className="section-title">Your Library</h2>
      </div>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearLibraryMessages())}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => dispatch(clearLibraryMessages())}>{successMessage}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
        <Tabs 
          value={tabIndex} 
          onChange={(e, val) => setTabIndex(val)} 
          textColor="inherit"
          sx={{
            '& .MuiTabs-indicator': { backgroundColor: 'var(--primary)' }
          }}
        >
          <Tab label="Liked Songs" />
          <Tab label="Saved Albums" />
          <Tab label="Recently Played" />
        </Tabs>
      </Box>

      {/* Liked Songs Tab */}
      <TabPanel value={tabIndex} index={0}>
        {favorites.length === 0 ? (
          <Typography color="var(--text-muted)">You haven't liked any songs yet.</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: 'var(--bg-elevated)', backgroundImage: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>#</TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Title</TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Artist</TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {favorites.map((song, index) => {
                  const isPlaying = currentTrack?.id === song.id;
                  return (
                    <TableRow key={song.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)' } }}>
                      <TableCell sx={{ color: 'var(--text-main)' }}>{index + 1}</TableCell>
                      <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <div className="table-cover">
                          {song.cover_url ? (
                            <img src={`http://localhost:3001${song.cover_url}`} alt={song.title} />
                          ) : (
                            <div className="table-cover-fallback"><Disc size={20} /></div>
                          )}
                        </div>
                        <Typography sx={{ color: isPlaying ? 'var(--primary)' : 'var(--text-main)', fontWeight: 'bold' }}>
                          {song.title}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: 'var(--text-muted)' }}>{song.artist_name}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <IconButton onClick={() => handleUnlike(song.id)} title="Remove from Liked Songs" sx={{ color: 'var(--primary)', mr: 1 }}>
                          <Heart size={20} fill="currentColor" />
                        </IconButton>
                        <IconButton 
                          className="table-play-btn"
                          onClick={() => onPlayTrack(song)}
                        >
                          <Play size={20} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Saved Albums Tab */}
      <TabPanel value={tabIndex} index={1}>
        {savedAlbums.length === 0 ? (
          <Typography color="var(--text-muted)">You haven't saved any albums yet.</Typography>
        ) : (
          <Grid container spacing={3}>
            {savedAlbums.map((album) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={album.id}>
                <Card sx={{ bgcolor: 'var(--bg-elevated)', backgroundImage: 'none', height: '100%' }}>
                  <Box sx={{ 
                    width: '100%', 
                    aspectRatio: '1', 
                    bgcolor: 'rgba(255,255,255,0.05)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    position: 'relative'
                  }}>
                    {album.cover_url ? (
                      <img src={`http://localhost:3001${album.cover_url}`} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Disc size={64} color="var(--text-muted)" opacity={0.5} />
                    )}
                    <IconButton 
                      onClick={() => handleUnsaveAlbum(album.id)}
                      sx={{
                        position: 'absolute',
                        top: 8, right: 8,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'var(--primary)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                      }}
                      size="small"
                      title="Remove from Saved Albums"
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'var(--text-main)', fontWeight: 'bold', mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {album.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {album.artist_name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Recently Played Tab */}
      <TabPanel value={tabIndex} index={2}>
        {history.length === 0 ? (
          <Typography color="var(--text-muted)">You haven't played any songs yet.</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: 'var(--bg-elevated)', backgroundImage: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>#</TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Title</TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Artist</TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Played</TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((song, index) => {
                  const isPlaying = currentTrack?.id === song.id;
                  return (
                    <TableRow key={`${song.id}-${index}`} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)' } }}>
                      <TableCell sx={{ color: 'var(--text-main)' }}>{index + 1}</TableCell>
                      <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}> 
                        <div className="table-cover">
                          {song.cover_url ? (
                            <img src={`http://localhost:3001${song.cover_url}`} alt={song.title} />
                          ) : (
                            <div className="table-cover-fallback"><Disc size={20} /></div>
                          )}
                        </div>
                        <Typography sx={{ color: isPlaying ? 'var(--primary)' : 'var(--text-main)', fontWeight: 'bold' }}>
                          {song.title}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: 'var(--text-muted)' }}>{song.artist_name}</TableCell>
                      <TableCell sx={{ color: 'var(--text-muted)' }}>
                        <Chip 
                          icon={<Clock size={12} />} 
                          label={formatTimeAgo(song.played_at)} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            color: 'var(--text-muted)', 
                            borderColor: 'rgba(255,255,255,0.1)',
                            '& .MuiChip-icon': { color: 'var(--text-muted)' }
                          }} 
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <IconButton 
                          className="table-play-btn"
                          onClick={() => onPlayTrack(song)}
                        >
                          <Play size={20} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>
    </div>
  );
};

export default LibraryPanel;
