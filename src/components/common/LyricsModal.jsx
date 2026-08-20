import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Box, IconButton, CircularProgress } from '@mui/material';
import { X, Mic, Music } from 'lucide-react';
import api from '../../api';

const LyricsModal = ({ open, onClose, currentTrack, currentTime = 0 }) => {
  const activeLineRef = useRef(null);
  const [trackLyrics, setTrackLyrics] = useState(currentTrack?.lyrics || null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  // Fetch the artist's saved lyrics whenever the modal opens or track changes
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
          const totalDuration = currentTrack?.duration || 180;
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
  }, [trackLyrics, currentTrack]);

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

  // Smoothly auto-scroll active lyric line into center
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  if (!currentTrack) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#161324 !important',
          color: '#ffffff !important',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5, pb: 1.5, borderBottom: '1px solid rgba(255, 255, 255, 0.1)', bgcolor: '#1C1830' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(124, 92, 252, 0.25)', color: '#A78BFA', display: 'flex' }}>
            <Mic size={20} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2, color: '#ffffff' }}>
              {currentTrack.title}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              {currentTrack.Artist?.display_name || currentTrack.Artist?.username || currentTrack.artist_name || 'Synchronized Karaoke Lyrics'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#ffffff' } }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', overflowY: 'auto', textAlign: 'center', scrollbarWidth: 'thin', bgcolor: '#161324' }}>
        {loadingLyrics ? (
          <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <CircularProgress size={36} sx={{ color: '#A78BFA' }} />
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Loading synchronized lyrics...
            </Typography>
          </Box>
        ) : parsedLyrics.length > 0 ? (
          <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {parsedLyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;

              return (
                <Typography
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  sx={{
                    fontSize: isActive ? '1.5rem' : '1.1rem',
                    fontWeight: isActive ? 800 : 500,
                    color: isActive 
                      ? '#A78BFA !important' 
                      : isPast 
                        ? 'rgba(255, 255, 255, 0.35) !important' 
                        : 'rgba(255, 255, 255, 0.75) !important',
                    textShadow: isActive ? '0 0 20px rgba(167, 139, 250, 0.6)' : 'none',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'default',
                    lineHeight: 1.4,
                    px: 2
                  }}
                >
                  {line.text}
                </Typography>
              );
            })}
          </Box>
        ) : (
          <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, color: '#ffffff' }}>
            <Box sx={{ p: 2.5, borderRadius: '50%', bgcolor: 'rgba(124, 92, 252, 0.15)', color: '#A78BFA', display: 'flex' }}>
              <Music size={40} strokeWidth={1.5} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, mb: 0.5 }}>
                No Lyrics Available
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: '340px', margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.5 }}>
                The artist has not added synchronized lyrics for "{currentTrack.title}" yet.
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LyricsModal;
