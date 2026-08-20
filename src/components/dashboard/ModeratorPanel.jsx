import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, CircularProgress, Alert, Button, Box, Chip,
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, IconButton
} from '@mui/material';
import { Trash2, Edit3, CheckCircle, XCircle, AlertTriangle, Play, Pause } from 'lucide-react';
import { fetchReports, resolveReport, fetchPendingContent, reviewContent, removeSong, updateSong, clearModeratorMessages } from '../../store/slices/moderatorSlice';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ModeratorPanel = () => {
  const dispatch = useDispatch();
  const { reports, pendingContent, loading, error, successMessage } = useSelector(state => state.moderator);
  const [tabIndex, setTabIndex] = useState(0);
  const [rejectDialog, setRejectDialog] = useState({ open: false, type: null, id: null });
  const [rejectReason, setRejectReason] = useState('');
  
  // Audio preview state
  const [playingSongId, setPlayingSongId] = useState(null);
  const [audioObj, setAudioObj] = useState(null);

  // Song management dialogs
  const [editDialog, setEditDialog] = useState({ open: false, songId: null, title: '', status: '' });
  const [removeDialog, setRemoveDialog] = useState({ open: false, songId: null, songTitle: '' });

  useEffect(() => {
    dispatch(fetchReports());
    dispatch(fetchPendingContent());
  }, [dispatch]);

  // Refresh reports after actions
  useEffect(() => {
    if (successMessage) {
      dispatch(fetchReports());
    }
  }, [successMessage, dispatch]);

  const handlePlayToggle = (audioUrl, songId) => {
    if (!audioUrl) return;
    const fullUrl = audioUrl.startsWith('http') ? audioUrl : `http://localhost:3001${audioUrl}`;

    if (playingSongId === songId && audioObj) {
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
      setPlayingSongId(songId);
    }
  };

  const handleResolveReport = (reportId, action) => {
    dispatch(resolveReport({ reportId, action }));
  };

  const handleApproveContent = (type, id) => {
    dispatch(reviewContent({ type, id, action: 'approve' }));
  };

  const handleRejectClick = (type, id) => {
    setRejectDialog({ open: true, type, id });
    setRejectReason('');
  };

  const submitRejectContent = () => {
    dispatch(reviewContent({ 
      type: rejectDialog.type, 
      id: rejectDialog.id, 
      action: 'reject', 
      reason: rejectReason 
    }));
    setRejectDialog({ open: false, type: null, id: null });
  };

  // Song management handlers
  const handleRemoveSong = (songId, songTitle) => {
    setRemoveDialog({ open: true, songId, songTitle });
  };

  const confirmRemoveSong = () => {
    dispatch(removeSong(removeDialog.songId));
    setRemoveDialog({ open: false, songId: null, songTitle: '' });
  };

  const handleEditSong = (report) => {
    setEditDialog({ 
      open: true, 
      songId: report.song_id, 
      title: report.title || '', 
      status: report.song_status || 'published' 
    });
  };

  const submitEditSong = () => {
    dispatch(updateSong({ 
      songId: editDialog.songId, 
      title: editDialog.title, 
      status: editDialog.status 
    }));
    setEditDialog({ open: false, songId: null, title: '', status: '' });
  };

  if (loading && reports.length === 0 && pendingContent.songs.length === 0 && pendingContent.albums.length === 0) {
    return (
      <div className="section-container" style={{ textAlign: 'center', padding: '40px' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="section-container">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h2 className="section-title">Moderator Dashboard</h2>
      </div>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearModeratorMessages())}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => dispatch(clearModeratorMessages())}>{successMessage}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={(e, v) => { setTabIndex(v); dispatch(clearModeratorMessages()); }} sx={{
          '& .MuiTab-root': { color: 'var(--text-secondary)' },
          '& .Mui-selected': { color: 'var(--primary) !important' },
          '& .MuiTabs-indicator': { backgroundColor: 'var(--primary)' }
        }}>
          <Tab label={`Pending Content (${pendingContent.songs.length + pendingContent.albums.length})`} />
          <Tab label={`Reports (${reports.filter(r => r.status === 'pending').length})`} />
        </Tabs>
      </Box>

      {/* PENDING CONTENT TAB */}
      <TabPanel value={tabIndex} index={0}>
        <Typography variant="h6" sx={{ color: 'var(--text-main)', mb: 2 }}>Songs Pending Review</Typography>
        <TableContainer component={Paper} sx={{ bgcolor: 'var(--bg-elevated)', backgroundImage: 'none', mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'var(--text-muted)' }}>Preview</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)' }}>ID</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)' }}>Title</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)' }}>Artist</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingContent.songs.map((song) => (
                <TableRow key={`song-${song.id}`} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)' } }}>
                  <TableCell>
                    <IconButton 
                      size="small"
                      disabled={!song.audio_url}
                      onClick={() => handlePlayToggle(song.audio_url, `pending-${song.id}`)}
                      sx={{ color: 'var(--primary)', bgcolor: 'rgba(124,92,252,0.1)' }}
                    >
                      {playingSongId === `pending-${song.id}` ? <Pause size={16} /> : <Play size={16} />}
                    </IconButton>
                  </TableCell>
                  <TableCell sx={{ color: 'var(--text-main)' }}>#{song.id}</TableCell>
                  <TableCell sx={{ color: 'var(--text-main)', fontWeight: 600 }}>{song.title}</TableCell>
                  <TableCell sx={{ color: 'var(--text-main)' }}>{song.Artist?.display_name || song.Artist?.username}</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button size="small" variant="contained" color="success" onClick={() => handleApproveContent('song', song.id)}>
                        Approve
                      </Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => handleRejectClick('song', song.id)}>
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {pendingContent.songs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', color: 'var(--text-muted)', py: 3 }}>
                    No songs pending review for your assigned artists.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" sx={{ color: 'var(--text-main)', mb: 2 }}>Albums Pending Review</Typography>
        <TableContainer component={Paper} sx={{ bgcolor: 'var(--bg-elevated)', backgroundImage: 'none' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'var(--text-muted)' }}>ID</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)' }}>Title</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)' }}>Artist</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingContent.albums.map((album) => (
                <TableRow key={`album-${album.id}`} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)' } }}>
                  <TableCell sx={{ color: 'var(--text-main)' }}>#{album.id}</TableCell>
                  <TableCell sx={{ color: 'var(--text-main)', fontWeight: 600 }}>{album.title}</TableCell>
                  <TableCell sx={{ color: 'var(--text-main)' }}>{album.Artist?.display_name || album.Artist?.username}</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button size="small" variant="contained" color="success" onClick={() => handleApproveContent('album', album.id)}>
                        Approve
                      </Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => handleRejectClick('album', album.id)}>
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {pendingContent.albums.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', color: 'var(--text-muted)', py: 3 }}>
                    No albums pending review for your assigned artists.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* REPORTS TAB */}
      <TabPanel value={tabIndex} index={1}>
        <TableContainer component={Paper} sx={{ bgcolor: 'var(--bg-elevated)', backgroundImage: 'none' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'var(--text-muted)' }}>Audio</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)' }}>ID</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)' }}>Song</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)' }}>Artist</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)' }}>Reported By</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)' }}>Reason</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)' }}>Date</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)' }}>Status</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)' } }}>
                  <TableCell>
                    <IconButton 
                      size="small"
                      disabled={!report.audio_url}
                      onClick={() => handlePlayToggle(report.audio_url, `report-${report.id}`)}
                      sx={{ color: 'var(--primary)', bgcolor: 'rgba(124,92,252,0.1)' }}
                    >
                      {playingSongId === `report-${report.id}` ? <Pause size={16} /> : <Play size={16} />}
                    </IconButton>
                  </TableCell>
                  <TableCell sx={{ color: 'var(--text-main)' }}>#{report.id}</TableCell>
                  <TableCell sx={{ color: 'var(--text-main)', fontWeight: 500 }}>
                    {report.title}
                    {report.song_status === 'archived' && (
                      <Chip label="Removed" size="small" color="error" sx={{ ml: 1, height: '20px', fontSize: '0.65rem' }} />
                    )}
                  </TableCell>
                  <TableCell sx={{ color: 'var(--text-main)' }}>{report.artist_name}</TableCell>
                  <TableCell>
                    <div style={{ color: 'var(--text-main)' }}>{report.reporter_name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{report.reporter_email}</div>
                  </TableCell>
                  <TableCell sx={{ color: 'var(--text-main)', maxWidth: '200px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={report.reason}>
                      {report.reason}
                    </div>
                  </TableCell>
                  <TableCell sx={{ color: 'var(--text-muted)' }}>{new Date(report.reported_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={report.status} 
                      size="small"
                      color={report.status === 'pending' ? 'warning' : report.status === 'resolved' ? 'success' : 'default'}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    {report.status === 'pending' && (
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="error"
                          startIcon={<Trash2 size={14} />}
                          onClick={() => handleRemoveSong(report.song_id, report.title)}
                          sx={{ fontSize: '0.7rem', py: 0.5, minWidth: 'auto' }}
                        >
                          Remove
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="info"
                          startIcon={<Edit3 size={14} />}
                          onClick={() => handleEditSong(report)}
                          sx={{ fontSize: '0.7rem', py: 0.5, minWidth: 'auto' }}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="success"
                          onClick={() => handleResolveReport(report.id, 'resolve')}
                          sx={{ fontSize: '0.7rem', py: 0.5, minWidth: 'auto' }}
                        >
                          Resolve
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          sx={{ fontSize: '0.7rem', py: 0.5, minWidth: 'auto', color: 'var(--text-muted)', borderColor: 'var(--text-muted)' }}
                          onClick={() => handleResolveReport(report.id, 'dismiss')}
                        >
                          Dismiss
                        </Button>
                      </Box>
                    )}
                    {report.status !== 'pending' && (
                      <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {report.resolved_by ? `By ${report.resolved_by}` : 'Handled'}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', color: 'var(--text-muted)', py: 3 }}>
                    No reports found for your assigned artists.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Reject Content Dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, type: null, id: null })} PaperProps={{ style: { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)', minWidth: '400px' } }}>
        <DialogTitle>Reject Content</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>Please provide a reason for rejecting this {rejectDialog.type}:</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="E.g., Inappropriate content, copyright violation, etc."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            InputProps={{ style: { color: 'var(--text-main)', backgroundColor: 'var(--bg-card)' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setRejectDialog({ open: false, type: null, id: null })} sx={{ color: 'var(--text-muted)' }}>Cancel</Button>
          <Button onClick={submitRejectContent} variant="contained" color="error" disabled={!rejectReason.trim()}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Song Confirmation Dialog */}
      <Dialog open={removeDialog.open} onClose={() => setRemoveDialog({ open: false, songId: null, songTitle: '' })} PaperProps={{ style: { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)', minWidth: '400px' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertTriangle size={20} color="#f44336" />
          Remove Song
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>"{removeDialog.songTitle}"</strong>? 
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-muted)', mt: 1 }}>
            This will archive the song and it will no longer be visible to listeners. All pending reports for this song will be automatically resolved.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setRemoveDialog({ open: false, songId: null, songTitle: '' })} sx={{ color: 'var(--text-muted)' }}>Cancel</Button>
          <Button onClick={confirmRemoveSong} variant="contained" color="error">
            Remove Song
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Song Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, songId: null, title: '', status: '' })} PaperProps={{ style: { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)', minWidth: '450px' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Edit3 size={20} color="var(--primary)" />
          Edit Song
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'var(--text-muted)' }}>
            Update the song title or change its status.
          </Typography>
          <TextField
            fullWidth
            label="Song Title"
            variant="outlined"
            value={editDialog.title}
            onChange={(e) => setEditDialog(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
            InputProps={{ style: { color: 'var(--text-main)', backgroundColor: 'var(--bg-card)' } }}
            InputLabelProps={{ style: { color: 'var(--text-muted)' } }}
          />
          <TextField
            fullWidth
            select
            label="Status"
            variant="outlined"
            value={editDialog.status}
            onChange={(e) => setEditDialog(prev => ({ ...prev, status: e.target.value }))}
            InputProps={{ style: { color: 'var(--text-main)', backgroundColor: 'var(--bg-card)' } }}
            InputLabelProps={{ style: { color: 'var(--text-muted)' } }}
          >
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="pending_review">Pending Review</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setEditDialog({ open: false, songId: null, title: '', status: '' })} sx={{ color: 'var(--text-muted)' }}>Cancel</Button>
          <Button onClick={submitEditSong} variant="contained" sx={{ bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--primary-hover)' } }} disabled={!editDialog.title.trim()}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ModeratorPanel;

