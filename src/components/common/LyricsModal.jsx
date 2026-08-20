import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Dialog, DialogContent, Typography, Box, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { 
  X, Mic, Music, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, 
  Volume2, VolumeX, Heart, ChevronDown, Sparkles 
} from 'lucide-react';
import api from '../../api';

const LyricsModal = ({ 
  open, 
  onClose, 
  currentTrack, 
  currentTime = 0,
  duration = 0,
  isPlaying = false,
  onTogglePlay,
  onSkipBack,
  onSkipForward,
  onSeek,
  volume = 0.7,
  onVolumeChange,
  onLike,
  isLiked = false
}) => {
  const activeLineRef = useRef(null);
  const lyricsContainerRef = useRef(null);
  const [trackLyrics, setTrackLyrics] = useState(currentTrack?.lyrics || null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [userScrolled, setUserScrolled] = useState(false);
  const scrollTimeoutRef = useRef(null);

  // Fetch song lyrics whenever the modal opens or track changes
  useEffect(() => {
    if (!open || !currentTrack?.id) return;

    if (currentTrack.lyrics) {
      setTrackLyrics(currentTrack.lyrics);
    }

    const fetchSongLyrics = async () => {
      try {
        setLoadingLyrics(!currentTrack.lyrics);
        const res = await api.get(`/listener/songs/${currentTrack.id}/lyrics`);
        if (res.data && res.data.lyrics) {
          setTrackLyrics(res.data.lyrics);
          currentTrack.lyrics = res.data.lyrics;
        }
      } catch (err) {
        console.warn('Failed to fetch song lyrics:', err);
      } finally {
        setLoadingLyrics(false);
      }
    };

    fetchSongLyrics();
  }, [open, currentTrack?.id]);

  // Parse lyrics into timestamped array [{ time: number, text: string }]
  const parsedLyrics = useMemo(() => {
    const raw = trackLyrics || currentTrack?.lyrics;
    if (!raw) return [];
    
    try {
      if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (trimmed.startsWith('[')) {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed;
        } else {
          const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
          const totalDuration = duration || currentTrack?.duration || 180;
          const interval = totalDuration > 0 ? totalDuration / lines.length : 5;
          return lines.map((text, idx) => ({
            time: Math.round(idx * interval * 10) / 10,
            text
          }));
        }
      } else if (Array.isArray(raw)) {
        return raw;
      }
    } catch (e) {
      console.warn('Failed to parse track lyrics:', e);
    }
    return [];
  }, [trackLyrics, currentTrack, duration]);

  // Determine active lyric line index based on player currentTime
  const activeIndex = useMemo(() => {
    if (parsedLyrics.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (currentTime >= parsedLyrics[i].time) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [parsedLyrics, currentTime]);

  // Auto-scroll ONLY the lyrics container (NEVER scroll the outer page/window)
  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current && !userScrolled) {
      const container = lyricsContainerRef.current;
      const line = activeLineRef.current;
      
      const targetScroll = (line.offsetTop - container.offsetTop) - (container.clientHeight / 2) + (line.clientHeight / 2);
      
      container.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth'
      });
    }
  }, [activeIndex, userScrolled]);

  const handleUserScroll = () => {
    setUserScrolled(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setUserScrolled(false);
    }, 4500);
  };

  const handleLineClick = (time) => {
    if (typeof onSeek === 'function') {
      onSeek(time);
    }
    setUserScrolled(false);
  };

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (isMuted) {
      if (typeof onVolumeChange === 'function') onVolumeChange(prevVolume || 0.7);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      if (typeof onVolumeChange === 'function') onVolumeChange(0);
      setIsMuted(true);
    }
  };

  if (!currentTrack) return null;

  const artistName = currentTrack.Artist?.display_name || currentTrack.Artist?.username || currentTrack.artist_name || 'Unknown Artist';
  const coverUrl = currentTrack.cover_url ? (currentTrack.cover_url.startsWith('http') ? currentTrack.cover_url : `http://localhost:3001${currentTrack.cover_url}`) : null;
  const albumTitle = currentTrack.Album?.title || currentTrack.album_title || null;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#110E1E !important',
          color: '#FFFFFF !important',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.95), 0 0 80px rgba(124, 92, 252, 0.2)',
          maxHeight: '90vh',
          height: '780px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }
      }}
    >
      {/* Top Header Bar */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          px: 3.5, 
          py: 2, 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          bgcolor: '#171329',
          flexShrink: 0
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 0.8, borderRadius: '8px', bgcolor: 'rgba(124, 92, 252, 0.25)', color: '#C4B5FD', display: 'flex' }}>
            <Sparkles size={18} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, fontSize: '0.7rem' }}>
              NOW PLAYING
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
              {albumTitle ? `Album: ${albumTitle}` : 'Mosique Player'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Collapse Player" placement="bottom">
            <IconButton 
              onClick={onClose} 
              sx={{ 
                color: '#CBD5E1', 
                bgcolor: 'rgba(255,255,255,0.08)',
                '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.18)' } 
              }}
            >
              <ChevronDown size={22} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close" placement="bottom">
            <IconButton 
              onClick={onClose} 
              sx={{ 
                color: '#CBD5E1', 
                bgcolor: 'rgba(255,255,255,0.08)',
                '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.18)' } 
              }}
            >
              <X size={20} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Split Content */}
      <DialogContent 
        sx={{ 
          p: 0, 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          flex: 1, 
          overflow: 'hidden',
          bgcolor: '#110E1E'
        }}
      >
        {/* ── LEFT PANEL: Cover, Track Info & Controls ── */}
        <Box 
          sx={{ 
            flex: { xs: 'none', md: '0 0 45%' }, 
            p: { xs: 3, md: 4 }, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            borderRight: { xs: 'none', md: '1px solid rgba(255, 255, 255, 0.1)' },
            borderBottom: { xs: '1px solid rgba(255, 255, 255, 0.1)', md: 'none' },
            bgcolor: '#161327',
            overflowY: 'auto'
          }}
        >
          {/* Cover Art */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box 
              sx={{ 
                width: { xs: '200px', sm: '240px', md: '280px' }, 
                height: { xs: '200px', sm: '240px', md: '280px' }, 
                borderRadius: '20px', 
                overflow: 'hidden', 
                boxShadow: isPlaying 
                  ? '0 20px 50px rgba(124, 92, 252, 0.4), 0 0 30px rgba(167, 139, 250, 0.25)' 
                  : '0 15px 35px rgba(0, 0, 0, 0.7)',
                bgcolor: '#201A38',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'all 0.4s ease',
                transform: isPlaying ? 'scale(1.02)' : 'scale(1)',
                mb: 2.5
              }}
            >
              {coverUrl ? (
                <img 
                  src={coverUrl} 
                  alt={currentTrack.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Music size={64} color="#A78BFA" opacity={0.7} />
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: '1px' }}>MOSIQUE</Typography>
                </Box>
              )}
            </Box>

            {/* Track Info (Crisp Solid High Contrast Colors) */}
            <Box sx={{ width: '100%', textAlign: 'center', px: 1 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 800, 
                  fontSize: { xs: '1.25rem', md: '1.5rem' }, 
                  color: '#FFFFFF !important', 
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {currentTrack.title}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#C4B5FD !important', 
                  fontWeight: 600, 
                  fontSize: '1rem',
                  mb: 1
                }}
              >
                {artistName}
              </Typography>
            </Box>
          </Box>

          {/* Progress Scrubber & Controls */}
          <Box sx={{ width: '100%', mt: 1 }}>
            {/* Progress Bar */}
            <Box sx={{ mb: 2 }}>
              <Box 
                onClick={(e) => {
                  if (typeof onSeek === 'function') {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    onSeek(pct * duration);
                  }
                }}
                sx={{ 
                  width: '100%', 
                  height: '7px', 
                  bgcolor: '#2D264A', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    height: '9px',
                    '& .progress-fill': { bgcolor: '#C4B5FD' }
                  }
                }}
              >
                <Box 
                  className="progress-fill"
                  sx={{ 
                    width: `${progressPercent}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #7C5CFC, #C084FC)',
                    borderRadius: '8px',
                    transition: 'width 0.1s linear'
                  }} 
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" sx={{ color: '#94A3B8 !important', fontFamily: 'monospace', fontWeight: 600 }}>
                  {formatTime(currentTime)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8 !important', fontFamily: 'monospace', fontWeight: 600 }}>
                  {formatTime(duration)}
                </Typography>
              </Box>
            </Box>

            {/* Playback Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
              <Tooltip title="Shuffle" placement="top">
                <IconButton sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
                  <Shuffle size={18} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Previous" placement="top">
                <IconButton onClick={onSkipBack} sx={{ color: '#E2E8F0', '&:hover': { color: '#FFFFFF', transform: 'scale(1.1)' } }}>
                  <SkipBack size={24} />
                </IconButton>
              </Tooltip>

              <Tooltip title={isPlaying ? "Pause" : "Play"} placement="top">
                <IconButton 
                  onClick={onTogglePlay}
                  sx={{ 
                    width: '58px', 
                    height: '58px', 
                    background: 'linear-gradient(135deg, #7C5CFC, #906ffa)',
                    color: '#FFFFFF',
                    boxShadow: '0 8px 24px rgba(124, 92, 252, 0.5)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #6b4be0, #7C5CFC)',
                      transform: 'scale(1.06)'
                    },
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {isPlaying ? <Pause size={26} fill="white" /> : <Play size={26} fill="white" style={{ marginLeft: '3px' }} />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Next" placement="top">
                <IconButton onClick={onSkipForward} sx={{ color: '#E2E8F0', '&:hover': { color: '#FFFFFF', transform: 'scale(1.1)' } }}>
                  <SkipForward size={24} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Repeat" placement="top">
                <IconButton sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
                  <Repeat size={18} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Bottom Actions: Volume & Like */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, pt: 0.5 }}>
              <Tooltip title={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"} placement="top">
                <IconButton 
                  onClick={() => { if (typeof onLike === 'function') onLike(currentTrack); }}
                  sx={{ color: isLiked ? '#EF4444' : '#94A3B8', '&:hover': { color: '#EF4444' } }}
                >
                  <Heart size={20} fill={isLiked ? '#EF4444' : 'none'} />
                </IconButton>
              </Tooltip>

              {/* Volume Slider */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '140px' }}>
                <IconButton onClick={toggleMute} sx={{ color: '#94A3B8', p: 0.5, '&:hover': { color: '#FFFFFF' } }}>
                  {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </IconButton>
                <Box 
                  onClick={(e) => {
                    if (typeof onVolumeChange === 'function') {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      onVolumeChange(pct);
                      setIsMuted(false);
                    }
                  }}
                  sx={{ 
                    flex: 1, 
                    height: '5px', 
                    bgcolor: '#2D264A', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    position: 'relative',
                    '&:hover': { height: '7px' }
                  }}
                >
                  <Box 
                    sx={{ 
                      width: `${(isMuted ? 0 : volume) * 100}%`, 
                      height: '100%', 
                      bgcolor: '#A78BFA', 
                      borderRadius: '4px' 
                    }} 
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── RIGHT PANEL: Synchronized Live Karaoke Lyrics ── */}
        <Box 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            overflow: 'hidden',
            bgcolor: '#0E0C18'
          }}
        >
          {/* Lyrics Header */}
          <Box 
            sx={{ 
              px: 4, 
              py: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              bgcolor: '#131021',
              flexShrink: 0
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Mic size={18} color="#C4B5FD" />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF !important', letterSpacing: '0.5px' }}>
                SYNCHRONIZED LYRICS
              </Typography>
            </Box>
            {parsedLyrics.length > 0 && (
              <Typography variant="caption" sx={{ color: '#94A3B8 !important', fontSize: '0.75rem' }}>
                Click line to jump
              </Typography>
            )}
          </Box>

          {/* Lyrics Container (Isolated Scroll Container) */}
          <Box 
            ref={lyricsContainerRef}
            onScroll={handleUserScroll}
            sx={{ 
              flex: 1, 
              overflowY: 'auto', 
              px: { xs: 3, md: 5 }, 
              py: 5,
              display: 'flex', 
              flexDirection: 'column',
              gap: 3,
              position: 'relative',
              scrollbarWidth: 'thin',
              scrollbarColor: '#2D264A #0E0C18',
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#2D264A', borderRadius: '6px' },
              '&::-webkit-scrollbar-track': { bgcolor: '#0E0C18' }
            }}
          >
            {loadingLyrics ? (
              <Box sx={{ my: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <CircularProgress size={36} sx={{ color: '#A78BFA' }} />
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                  Loading synchronized lyrics...
                </Typography>
              </Box>
            ) : parsedLyrics.length > 0 ? (
              parsedLyrics.map((line, idx) => {
                const isActive = idx === activeIndex;
                const isPast = idx < activeIndex;

                return (
                  <Typography
                    key={idx}
                    ref={isActive ? activeLineRef : null}
                    onClick={() => handleLineClick(line.time)}
                    sx={{
                      fontSize: isActive ? { xs: '1.4rem', md: '1.75rem' } : { xs: '1.05rem', md: '1.25rem' },
                      fontWeight: isActive ? 800 : 500,
                      color: isActive 
                        ? '#FFFFFF !important' 
                        : isPast 
                          ? '#475569 !important' 
                          : '#94A3B8 !important',
                      background: isActive 
                        ? 'linear-gradient(90deg, #FFFFFF 0%, #E9D5FF 50%, #C084FC 100%)' 
                        : 'none',
                      WebkitBackgroundClip: isActive ? 'text' : 'unset',
                      WebkitTextFillColor: isActive ? 'transparent' : 'unset',
                      textShadow: isActive ? '0 0 25px rgba(167, 139, 250, 0.7)' : 'none',
                      transform: isActive ? 'scale(1.03) translateX(6px)' : 'scale(1)',
                      transformOrigin: 'left center',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      cursor: 'pointer',
                      lineHeight: 1.45,
                      py: 0.5,
                      borderRadius: '8px',
                      '&:hover': {
                        color: '#FFFFFF !important',
                        WebkitTextFillColor: '#FFFFFF',
                        opacity: 1
                      }
                    }}
                  >
                    {line.text}
                  </Typography>
                );
              })
            ) : (
              <Box sx={{ my: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, textAlign: 'center', py: 8 }}>
                <Box sx={{ p: 2.5, borderRadius: '50%', bgcolor: 'rgba(124, 92, 252, 0.2)', color: '#C4B5FD', display: 'flex' }}>
                  <Music size={40} strokeWidth={1.5} />
                </Box>
                <Box sx={{ maxWidth: '340px' }}>
                  <Typography variant="h6" sx={{ color: '#FFFFFF !important', fontWeight: 700, mb: 0.5 }}>
                    No Lyrics Available
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8 !important', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    The artist has not added synchronized lyrics for "{currentTrack.title}" yet.
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LyricsModal;
