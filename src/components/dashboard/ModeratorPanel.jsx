import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, CircularProgress, Alert, Button, Box, Chip
} from '@mui/material';
import { fetchReports, resolveReport, clearModeratorMessages } from '../../store/slices/moderatorSlice';

const ModeratorPanel = () => {
  const dispatch = useDispatch();
  const { reports, loading, error, successMessage } = useSelector(state => state.moderator);

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  const handleResolve = (reportId, action) => {
    dispatch(resolveReport({ reportId, action }));
  };

  if (loading && reports.length === 0) {
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

      <TableContainer component={Paper} sx={{ bgcolor: 'var(--bg-elevated)', backgroundImage: 'none' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>ID</TableCell>
              <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Type</TableCell>
              <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Title/Content</TableCell>
              <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Reported At</TableCell>
              <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Status</TableCell>
              <TableCell sx={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>Actions</TableCell>
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
                      <Button size="small" variant="contained" color="success" onClick={() => handleResolve(report.id, 'approve')}>
                        Approve
                      </Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => handleResolve(report.id, 'reject')}>
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
    </div>
  );
};

export default ModeratorPanel;
