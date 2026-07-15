import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, CircularProgress, Alert, Button, Box, Chip,
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { fetchReports, resolveReport, fetchPendingContent, reviewContent, clearModeratorMessages } from '../../store/slices/moderatorSlice';

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

  useEffect(() => {
    dispatch(fetchReports());
    dispatch(fetchPendingContent());
  }, [dispatch]);

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
                <TableCell sx={{ color: 'var(--text-muted)' }}>ID</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)' }}>Title</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)' }}>Artist</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingContent.songs.map((song) => (
                <TableRow key={`song-${song.id}`} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)' } }}>
                  <TableCell sx={{ color: 'var(--text-main)' }}>#{song.id}</TableCell>
                  <TableCell sx={{ color: 'var(--text-main)' }}>{song.title}</TableCell>
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
                  <TableCell colSpan={4} sx={{ textAlign: 'center', color: 'var(--text-muted)', py: 3 }}>
                    No songs pending review.
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
                  <TableCell sx={{ color: 'var(--text-main)' }}>{album.title}</TableCell>
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
                    No albums pending review.
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
                <TableCell sx={{ color: 'var(--text-muted)' }}>ID</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)' }}>Type</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)' }}>Title/Content</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)' }}>Reported At</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)' }}>Status</TableCell>
                <TableCell sx={{ color: 'var(--text-muted)', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)' } }}>
                  <TableCell sx={{ color: 'var(--text-main)' }}>#{report.id}</TableCell>
                  <TableCell sx={{ color: 'var(--text-main)', textTransform: 'capitalize' }}>{report.type}</TableCell>
                  <TableCell sx={{ color: 'var(--text-main)' }}>{report.title}</TableCell>
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
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button size="small" variant="contained" color="success" onClick={() => handleResolveReport(report.id, 'approve')}>
                          Approve
                        </Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => handleResolveReport(report.id, 'reject')}>
                          Reject
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', color: 'var(--text-muted)', py: 3 }}>
                    No reports found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Reject Dialog */}
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
    </div>
  );
};

export default ModeratorPanel;
