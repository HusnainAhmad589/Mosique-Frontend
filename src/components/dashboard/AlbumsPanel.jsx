import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton 
} from '@mui/material';
import { Play, Music, ArrowLeft, Disc3 } from 'lucide-react';

const AlbumsPanel = ({ onPlayTrack, currentTrack }) => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumTracks, setAlbumTracks] = useState([]);
  const [tracksLoading, setTracksLoading] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/listener/albums', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('mosique_token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setAlbums(data.albums || []);
      }
    } catch (err) {
      console.error('Failed to fetch albums', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbumTracks = async (albumId) => {
    setTracksLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/listener/feed?albumId=${albumId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('mosique_token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setAlbumTracks(data.feed || []);
      }
    } catch (err) {
      console.error('Failed to fetch album tracks', err);
    } finally {
      setTracksLoading(false);
    }
  };

  const handleAlbumClick = (album) => {
    setSelectedAlbum(album);
    fetchAlbumTracks(album.id);
  };

  const handleBack = () => {
    setSelectedAlbum(null);
    setAlbumTracks([]);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--text-muted)' }}>
        Loading albums...
      </div>
    );
  }

  // --- Album Details View ---
  if (selectedAlbum) {
    return (
      <div className="album-details">
        <button 
          onClick={handleBack} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-muted)', 
            cursor: 'pointer',
            padding: '0 0 24px 0',
            fontSize: '0.9rem',
            fontWeight: 500
          }}
        >
          <ArrowLeft size={16} /> Back to Albums
        </button>

        <div style={{ display: 'flex', gap: '32px', marginBottom: '40px', alignItems: 'flex-end' }}>
          <div style={{ 
            width: '200px', 
            height: '200px', 
            borderRadius: '12px', 
            backgroundColor: 'var(--bg-elevated)', 
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {selectedAlbum.cover_url ? (
              <img 
                src={`http://localhost:3001${selectedAlbum.cover_url}`} 
                alt={selectedAlbum.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <Disc3 size={64} color="var(--text-muted)" opacity={0.3} />
            )}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              Album
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 12px 0', lineHeight: 1.1 }}>
              {selectedAlbum.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{selectedAlbum.artist_name}</span>
              <span>•</span>
              <span>{albumTracks.length} {albumTracks.length === 1 ? 'song' : 'songs'}</span>
            </div>
          </div>
        </div>

        {tracksLoading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading tracks...</div>
        ) : albumTracks.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
            No tracks found for this album.
          </div>
        ) : (
          <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: 'var(--bg-elevated)' }}>
                  <TableRow>
                    <TableCell sx={{ width: '50px', fontWeight: 600, color: '#666', borderBottom: '1px solid var(--border-color)' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '1px solid var(--border-color)' }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '1px solid var(--border-color)' }}>Genre</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#666', borderBottom: '1px solid var(--border-color)' }}>Plays</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {albumTracks.map((track, idx) => (
                    <TableRow 
                      key={track.id} 
                      hover
                      sx={{ 
                        '&:hover': { backgroundColor: 'var(--bg-hover)' },
                        cursor: track.audio_url ? 'pointer' : 'default',
                        backgroundColor: currentTrack?.id === track.id ? 'var(--bg-hover)' : 'transparent'
                      }}
                      onClick={() => track.audio_url && onPlayTrack(track)}
                    >
                      <TableCell sx={{ borderBottom: '1px solid var(--border-color)', color: currentTrack?.id === track.id ? 'var(--primary)' : 'var(--text-secondary)' }}>
                        {currentTrack?.id === track.id ? (
                          <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="playing-bars" style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '12px' }}>
                              <div style={{ width: '3px', background: 'var(--primary)', height: '60%', animation: 'bounce 1s infinite alternate' }} />
                              <div style={{ width: '3px', background: 'var(--primary)', height: '100%', animation: 'bounce 1s infinite alternate 0.2s' }} />
                              <div style={{ width: '3px', background: 'var(--primary)', height: '40%', animation: 'bounce 1s infinite alternate 0.4s' }} />
                            </div>
                          </div>
                        ) : (
                          <span className="track-number">{idx + 1}</span>
                        )}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ fontWeight: 500, color: currentTrack?.id === track.id ? 'var(--primary)' : 'var(--text-main)' }}>
                            {track.title}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          backgroundColor: '#f3e8ff',
                          color: '#7e22ce'
                        }}>
                          {track.category_name || 'Uncategorized'}
                        </span>
                      </TableCell>
                      <TableCell align="right" sx={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        {track.play_count || 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </div>
    );
  }

  // --- Albums Grid View ---
  return (
    <div className="albums-panel">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h2 className="section-title">All Albums</h2>
      </div>

      {albums.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
          No albums available.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '24px'
        }}>
          {albums.map((album) => (
            <div 
              key={album.id}
              onClick={() => handleAlbumClick(album)}
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-hover)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px'
              }}>
                {album.cover_url ? (
                  <img src={`http://localhost:3001${album.cover_url}`} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Disc3 size={48} color="var(--text-muted)" opacity={0.5} />
                )}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {album.title}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {album.artist_name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlbumsPanel;
