import React, { useState, useMemo } from 'react';
import { 
  Typography, Grid, Card, CardContent, Box, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow 
} from '@mui/material';
import { User, Music, ArrowLeft, Play } from 'lucide-react';

const ArtistsPanel = ({ homeFeed, onPlayTrack, currentTrack }) => {
  const [selectedArtist, setSelectedArtist] = useState(null);

  const artists = useMemo(() => {
    const artistMap = new Map();
    homeFeed.forEach(song => {
      if (song.artist_name) {
        if (!artistMap.has(song.artist_name)) {
          artistMap.set(song.artist_name, {
            id: song.artist_id || song.artist_name,
            name: song.artist_name,
            profilePicture: song.artist_profile_picture,
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

  // --- Artist Detail View ---
  if (selectedArtist) {
    return (
      <div className="section-container">
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => setSelectedArtist(null)}
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
              width: 56, height: 56, borderRadius: '50%', 
              bgcolor: 'var(--bg-elevated)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {selectedArtist.profilePicture ? (
                <img src={selectedArtist.profilePicture.startsWith('http') ? selectedArtist.profilePicture : `http://localhost:3001${selectedArtist.profilePicture}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={28} color="var(--text-muted)" />
              )}
            </Box>
            <Box>
              <Typography variant="h4" sx={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
                {selectedArtist.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                {selectedArtist.trackCount} {selectedArtist.trackCount === 1 ? 'track' : 'tracks'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {selectedArtist.songs.length === 0 ? (
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
                  <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)', width: '50px' }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedArtist.songs.map((track, index) => {
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
      </div>
    );
  }

  // --- Main Artists Grid View ---
  return (
    <div className="section-container">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h2 className="section-title">Artists on Mosique</h2>
      </div>

      {artists.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
          No artists found. Check back later for new music!
        </div>
      ) : (
        <Grid container spacing={3}>
          {artists.map(artist => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={artist.id}>
              <Card 
                onClick={() => setSelectedArtist(artist)}
                sx={{ 
                  bgcolor: 'var(--bg-elevated)', 
                  color: 'var(--text-main)',
                  cursor: 'pointer',
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
                <Typography variant="h6" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>
                  {artist.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)', mt: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  <Music size={14} /> {artist.trackCount} {artist.trackCount === 1 ? 'track' : 'tracks'}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
};

export default ArtistsPanel;
