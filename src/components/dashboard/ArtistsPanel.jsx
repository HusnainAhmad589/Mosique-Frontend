import React, { useState, useMemo, useEffect } from 'react';
import { 
  Typography, Grid, Card, CardContent, Box, IconButton, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Snackbar, Alert, CircularProgress, Chip, Divider
} from '@mui/material';
import { User, Music, ArrowLeft, Play, UserPlus, UserMinus, CheckCircle, Calendar, Users, Disc3, ExternalLink } from 'lucide-react';
import api from '../../api';

// A simple TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ArtistsPanel = ({ homeFeed, onPlayTrack, currentTrack }) => {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistDetails, setArtistDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailTabValue, setDetailTabValue] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [following, setFollowing] = useState([]);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Compute artists from the feed
  const artists = useMemo(() => {
    const artistMap = new Map();
    homeFeed.forEach(song => {
      if (song.artist_name) {
        if (!artistMap.has(song.artist_name)) {
          artistMap.set(song.artist_name, {
            id: song.artist_id || song.artist_name,
            name: song.artist_name,
            profilePicture: song.artist_profile_picture,
            is_verified: song.is_verified || false,
            trackCount: 1,
            songs: [song],
          });
        } else {
          const artist = artistMap.get(song.artist_name);
          artist.trackCount += 1;
          artist.songs.push(song);
        }
      }
    });
    return Array.from(artistMap.values());
  }, [homeFeed]);

  const fetchFollowing = async () => {
    try {
      const res = await api.get('/listener/following');
      if (res.data.success) {
        setFollowing(res.data.following);
      }
    } catch (err) {
      console.error('Failed to fetch following artists:', err);
    }
  };

  useEffect(() => {
    fetchFollowing();
  }, []);

  const handleFollow = async (artistId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.post(`/listener/following/${artistId}`);
      if (res.data.success) {
        setToast({ open: true, message: 'Successfully followed artist!', severity: 'success' });
        fetchFollowing();
      }
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.message || 'Error following artist.', severity: 'error' });
    }
  };

  const handleUnfollow = async (artistId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.delete(`/listener/following/${artistId}`);
      if (res.data.success) {
        setToast({ open: true, message: 'Successfully unfollowed artist.', severity: 'success' });
        fetchFollowing();
      }
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.message || 'Error unfollowing artist.', severity: 'error' });
    }
  };

  const isFollowing = (artistId) => following.some(f => f.id === artistId);

  const handleViewDetails = async (artistId) => {
    setDetailsLoading(true);
    setDetailTabValue(0);
    try {
      const res = await api.get(`/listener/artist/${artistId}`);
      if (res.data.success) {
        setArtistDetails(res.data.artist);
        setSelectedArtist({ id: artistId }); // mark as selected
      }
    } catch (err) {
      setToast({ open: true, message: 'Failed to load artist profile.', severity: 'error' });
    } finally {
      setDetailsLoading(false);
    }
  };

  const renderFeedback = () => (
    <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }}>
        {toast.message}
      </Alert>
    </Snackbar>
  );

  // --- Artist Detail View ---
  if (selectedArtist && artistDetails) {
    const artistIsFollowed = isFollowing(artistDetails.id);
    return (
      <div className="section-container">
        {renderFeedback()}

        {/* Banner */}
        {artistDetails.banner_url && (
          <Box sx={{ 
            width: '100%', height: '200px', borderRadius: '16px', overflow: 'hidden', mb: 3,
            background: `url(http://localhost:3001${artistDetails.banner_url}) center/cover no-repeat`
          }} />
        )}

        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => { setSelectedArtist(null); setArtistDetails(null); }}
            sx={{ 
              color: 'var(--text-main)', 
              bgcolor: 'var(--bg-elevated)',
              '&:hover': { bgcolor: 'var(--bg-hover)' }
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <Box sx={{ 
              width: 90, height: 90, borderRadius: '50%', 
              bgcolor: 'var(--bg-elevated)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', border: '3px solid var(--primary)',
              boxShadow: '0 4px 20px rgba(124, 92, 252, 0.3)'
            }}>
              {artistDetails.avatar_url ? (
                <img src={artistDetails.avatar_url.startsWith('http') ? artistDetails.avatar_url : `http://localhost:3001${artistDetails.avatar_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={40} color="var(--text-muted)" />
              )}
            </Box>
            <Box>
              <Typography variant="h4" sx={{ color: 'var(--text-main)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                {artistDetails.display_name || artistDetails.username}
                {artistDetails.is_verified && <CheckCircle size={22} color="#10B981" />}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-muted)', mt: 0.5 }}>
                @{artistDetails.username}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {artistIsFollowed ? (
              <Button 
                variant="outlined" 
                startIcon={<UserMinus size={18} />} 
                onClick={(e) => handleUnfollow(artistDetails.id, e)}
                sx={{ 
                  color: 'var(--text-main)', borderColor: 'var(--border)',
                  '&:hover': { borderColor: 'var(--text-muted)', bgcolor: 'rgba(255,255,255,0.05)' }
                }}
              >
                Unfollow
              </Button>
            ) : (
              <Button 
                variant="contained" 
                startIcon={<UserPlus size={18} />} 
                onClick={(e) => handleFollow(artistDetails.id, e)}
                sx={{ bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--primary-dark)' } }}
              >
                Follow
              </Button>
            )}
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: 'var(--bg-elevated)', color: 'var(--text-main)', boxShadow: 'none', borderRadius: '12px', textAlign: 'center', p: 2 }}>
              <Users size={20} color="var(--primary)" style={{ marginBottom: '4px' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{artistDetails.follower_count}</Typography>
              <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>Followers</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: 'var(--bg-elevated)', color: 'var(--text-main)', boxShadow: 'none', borderRadius: '12px', textAlign: 'center', p: 2 }}>
              <Music size={20} color="var(--primary)" style={{ marginBottom: '4px' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{artistDetails.song_count}</Typography>
              <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>Tracks</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: 'var(--bg-elevated)', color: 'var(--text-main)', boxShadow: 'none', borderRadius: '12px', textAlign: 'center', p: 2 }}>
              <Disc3 size={20} color="var(--primary)" style={{ marginBottom: '4px' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{artistDetails.album_count}</Typography>
              <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>Albums</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: 'var(--bg-elevated)', color: 'var(--text-main)', boxShadow: 'none', borderRadius: '12px', textAlign: 'center', p: 2 }}>
              <Calendar size={20} color="var(--primary)" style={{ marginBottom: '4px' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{artistDetails.joined ? new Date(artistDetails.joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</Typography>
              <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>Joined</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Bio */}
        {artistDetails.bio && (
          <Box sx={{ bgcolor: 'var(--bg-elevated)', borderRadius: '12px', p: 3, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--text-main)', mb: 1 }}>About</Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {artistDetails.bio}
            </Typography>
          </Box>
        )}

        {/* Social Links */}
        {(artistDetails.twitter_url || artistDetails.instagram_url || artistDetails.spotify_url) && (
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            {artistDetails.twitter_url && (
              <Chip 
                icon={<ExternalLink size={14} />}
                label="Twitter" 
                component="a" href={artistDetails.twitter_url} target="_blank" rel="noopener"
                clickable
                sx={{ bgcolor: 'var(--bg-elevated)', color: 'var(--text-main)', '&:hover': { bgcolor: 'var(--bg-hover)' } }}
              />
            )}
            {artistDetails.instagram_url && (
              <Chip 
                icon={<ExternalLink size={14} />}
                label="Instagram" 
                component="a" href={artistDetails.instagram_url} target="_blank" rel="noopener"
                clickable
                sx={{ bgcolor: 'var(--bg-elevated)', color: 'var(--text-main)', '&:hover': { bgcolor: 'var(--bg-hover)' } }}
              />
            )}
            {artistDetails.spotify_url && (
              <Chip 
                icon={<ExternalLink size={14} />}
                label="Spotify" 
                component="a" href={artistDetails.spotify_url} target="_blank" rel="noopener"
                clickable
                sx={{ bgcolor: 'var(--bg-elevated)', color: 'var(--text-main)', '&:hover': { bgcolor: 'var(--bg-hover)' } }}
              />
            )}
          </Box>
        )}

        {/* Tabs: Tracks & Albums */}
        <Box sx={{ borderBottom: 1, borderColor: 'var(--border)' }}>
          <Tabs 
            value={detailTabValue} 
            onChange={(e, val) => setDetailTabValue(val)}
            sx={{
              '& .MuiTab-root': { color: 'var(--text-muted)', textTransform: 'none', fontWeight: 600, fontSize: '1rem' },
              '& .Mui-selected': { color: 'var(--primary) !important' },
              '& .MuiTabs-indicator': { backgroundColor: 'var(--primary)' }
            }}
          >
            <Tab label={`Tracks (${artistDetails.songs?.length || 0})`} />
            <Tab label={`Albums (${artistDetails.albums?.length || 0})`} />
          </Tabs>
        </Box>

        {/* Tracks Tab */}
        <TabPanel value={detailTabValue} index={0}>
          {(!artistDetails.songs || artistDetails.songs.length === 0) ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
              No tracks from this artist yet.
            </div>
          ) : (
            <TableContainer sx={{ bgcolor: 'transparent', backgroundImage: 'none', boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>#</TableCell>
                    <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Title</TableCell>
                    <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Genre</TableCell>
                    <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Album</TableCell>
                    <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)', width: '50px' }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {artistDetails.songs.map((track, index) => {
                    const isPlaying = currentTrack?.id === track.id;
                    return (
                      <TableRow 
                        key={track.id}
                        hover
                        onClick={() => onPlayTrack && track.audio_url && onPlayTrack(track)}
                        sx={{ 
                          cursor: track.audio_url ? 'pointer' : 'default',
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
                        <TableCell sx={{ color: 'var(--text-muted)' }}>{track.category_name || ''}</TableCell>
                        <TableCell sx={{ color: 'var(--text-muted)' }}>{track.album_title || '—'}</TableCell>
                        <TableCell>
                          {track.audio_url && (
                            <IconButton size="small" sx={{ color: 'var(--primary)' }} onClick={(e) => { e.stopPropagation(); onPlayTrack && onPlayTrack(track); }}>
                              <Play size={16} fill="var(--primary)" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Albums Tab */}
        <TabPanel value={detailTabValue} index={1}>
          {(!artistDetails.albums || artistDetails.albums.length === 0) ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
              No albums from this artist yet.
            </div>
          ) : (
            <Grid container spacing={2}>
              {artistDetails.albums.map(album => (
                <Grid item xs={6} sm={4} md={3} key={album.id}>
                  <Card sx={{ bgcolor: 'var(--bg-elevated)', color: 'var(--text-main)', boxShadow: 'none', borderRadius: '12px', overflow: 'hidden' }}>
                    <Box sx={{ width: '100%', paddingTop: '100%', position: 'relative', bgcolor: 'rgba(255,255,255,0.05)' }}>
                      {album.cover_url ? (
                        <img src={`http://localhost:3001${album.cover_url}`} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Disc3 size={40} color="var(--text-muted)" />
                        </Box>
                      )}
                    </Box>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{album.title}</Typography>
                      <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                        {album.release_date ? new Date(album.release_date).toLocaleDateString() : ''}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </div>
    );
  }

  // Loading state for detail view
  if (selectedArtist && detailsLoading) {
    return (
      <div className="section-container" style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <CircularProgress />
      </div>
    );
  }

  // --- Main Artists Grid View ---
  return (
    <div className="section-container">
      {renderFeedback()}
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <h2 className="section-title">Artists on Mosique</h2>
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
          <Tab label="All Artists" />
          <Tab label="Following" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {artists.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
            No artists found. Check back later for new music!
          </div>
        ) : (
          <Grid container spacing={3}>
            {artists.map(artist => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={artist.id}>
                <Card 
                  sx={{ 
                    bgcolor: 'var(--bg-elevated)', 
                    color: 'var(--text-main)',
                    transition: 'transform 0.2s ease, background-color 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 3,
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      bgcolor: 'var(--bg-hover)'
                    }
                  }}
                >
                  <Box sx={{ 
                    width: '140px', 
                    height: '140px',
                    borderRadius: '50%', 
                    bgcolor: 'rgba(255,255,255,0.05)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    overflow: 'hidden',
                    mb: 2,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }}>
                    {artist.profilePicture ? (
                      <img src={artist.profilePicture.startsWith('http') ? artist.profilePicture : `http://localhost:3001${artist.profilePicture}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={56} color="var(--text-muted)" opacity={0.5} />
                    )}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    {artist.name}
                    {artist.is_verified && <CheckCircle size={16} color="#10B981" />}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-muted)', mt: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <Music size={14} /> {artist.trackCount} {artist.trackCount === 1 ? 'track' : 'tracks'}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleViewDetails(artist.id)}
                      sx={{ 
                        color: 'var(--primary)', borderColor: 'var(--primary)',
                        '&:hover': { bgcolor: 'rgba(124, 92, 252, 0.1)' }
                      }}
                    >
                      View Profile
                    </Button>
                    {isFollowing(artist.id) ? (
                      <Button 
                        variant="outlined" 
                        size="small"
                        startIcon={<UserMinus size={14} />}
                        onClick={(e) => handleUnfollow(artist.id, e)}
                        sx={{ 
                          color: 'var(--text-muted)', borderColor: 'var(--border)',
                          '&:hover': { borderColor: 'var(--error, #ef4444)', color: 'var(--error, #ef4444)' }
                        }}
                      >
                        Unfollow
                      </Button>
                    ) : (
                      <Button 
                        variant="contained" 
                        size="small"
                        startIcon={<UserPlus size={14} />}
                        onClick={(e) => handleFollow(artist.id, e)}
                        sx={{ 
                          bgcolor: 'var(--primary)',
                          '&:hover': { bgcolor: 'var(--primary-dark)' }
                        }}
                      >
                        Follow
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {following.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
            You aren't following any artists yet.
          </div>
        ) : (
          <Grid container spacing={3}>
            {following.map(artist => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={artist.id}>
                <Card 
                  sx={{ 
                    bgcolor: 'var(--bg-elevated)', 
                    color: 'var(--text-main)',
                    transition: 'transform 0.2s ease, background-color 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 3,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      bgcolor: 'var(--bg-hover)'
                    }
                  }}
                >
                  <Box sx={{ 
                    width: '140px', 
                    height: '140px',
                    borderRadius: '50%', 
                    bgcolor: 'rgba(255,255,255,0.05)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    overflow: 'hidden',
                    mb: 2,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }}>
                    {artist.profilePicture ? (
                      <img src={artist.profilePicture.startsWith('http') ? artist.profilePicture : `http://localhost:3001${artist.profilePicture}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={56} color="var(--text-muted)" opacity={0.5} />
                    )}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    {artist.name}
                    {artist.is_verified && <CheckCircle size={16} color="#10B981" />}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleViewDetails(artist.id)}
                      sx={{ 
                        color: 'var(--primary)', borderColor: 'var(--primary)',
                        '&:hover': { bgcolor: 'rgba(124, 92, 252, 0.1)' }
                      }}
                    >
                      View Profile
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={<UserMinus size={14} />}
                      onClick={(e) => handleUnfollow(artist.id, e)}
                      sx={{ 
                        color: 'var(--text-muted)', borderColor: 'var(--border)',
                        '&:hover': { borderColor: 'var(--error, #ef4444)', color: 'var(--error, #ef4444)' }
                      }}
                    >
                      Unfollow
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
    </div>
  );
};

export default ArtistsPanel;
