import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Typography, Button, TextField, CircularProgress, Alert, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, 
  IconButton, Tooltip 
} from '@mui/material';
import { UserPlus, ShieldCheck, UserX, Mail, Search, CheckCircle } from 'lucide-react';
import { fetchModerators, addModerator, removeModerator, clearMessages } from '../../store/slices/artistSlice';

const AddModeratorPanel = () => {
  const dispatch = useDispatch();
  const { moderators, loading, error, successMessage } = useSelector(state => state.artist);
  const [email, setEmail] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, moderator: null });

  useEffect(() => {
    dispatch(fetchModerators());
  }, [dispatch]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    dispatch(clearMessages());
    dispatch(addModerator(email.trim())).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        setEmail('');
      }
    });
  };

  const handleConfirmRemove = () => {
    if (confirmDialog.moderator) {
      dispatch(clearMessages());
      dispatch(removeModerator(confirmDialog.moderator.id));
      setConfirmDialog({ open: false, moderator: null });
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.15) 0%, rgba(124, 92, 252, 0.05) 100%)',
        borderRadius: '16px',
        padding: '24px 32px',
        marginBottom: '28px',
        border: '1px solid rgba(124, 92, 252, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(124, 92, 252, 0.3)',
          flexShrink: 0
        }}>
          <ShieldCheck size={28} color="white" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Personal Moderators
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Assign any listener as your personal moderator by entering their email address.
          </p>
        </div>
      </div>

      {/* Global Notifications */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => dispatch(clearMessages())}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => dispatch(clearMessages())}>
          {successMessage}
        </Alert>
      )}

      {/* Add Moderator Form Card */}
      <div className="panel-card" style={{ marginBottom: '32px', padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={20} color="var(--primary)" /> Add New Moderator
        </h3>

        <form onSubmit={handleAddSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="email" 
              placeholder="Enter listener's email address (e.g. listener@example.com)..." 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '12px 14px 12px 42px', 
                borderRadius: '10px', 
                border: '1px solid var(--border)', 
                background: 'var(--bg-elevated)', 
                color: 'var(--text-main)', 
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !email.trim()}
            className="btn btn-primary" 
            style={{ width: 'auto', padding: '12px 28px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : <UserPlus size={18} />}
            Add Moderator
          </button>
        </form>
      </div>

      {/* Personal Moderators List */}
      <div className="panel-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Your Moderators ({moderators.length})
          </h3>
        </div>

        {moderators.length === 0 ? (
          <div className="panel-empty" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <ShieldCheck size={48} style={{ opacity: 0.2, marginBottom: '12px' }} />
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              No personal moderators added yet. Enter a listener's email above to assign your first moderator.
            </p>
          </div>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
            <Table>
              <TableHead sx={{ backgroundColor: 'var(--bg-elevated)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: 'var(--text-muted)' }}>Moderator</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'var(--text-muted)' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'var(--text-muted)' }}>Date Added</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'var(--text-muted)' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {moderators.map((mod) => (
                  <TableRow key={mod.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Avatar 
                          src={mod.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(mod.display_name || mod.username)}&background=7C5CFC&color=fff`}
                          alt={mod.display_name || mod.username}
                          sx={{ width: 40, height: 40 }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {mod.display_name || mod.username}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            @{mod.username}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell sx={{ color: 'var(--text-main)' }}>
                      {mod.email}
                    </TableCell>

                    <TableCell sx={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {mod.created_at ? new Date(mod.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<UserX size={16} />}
                        onClick={() => setConfirmDialog({ open: true, moderator: mod })}
                        sx={{ 
                          borderRadius: '8px', 
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}
                      >
                        Remove Moderator
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      {/* Confirm Removal Dialog */}
      <Dialog 
        open={confirmDialog.open} 
        onClose={() => setConfirmDialog({ open: false, moderator: null })}
        PaperProps={{ style: { borderRadius: '16px', padding: '8px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#111827' }}>
          Remove Personal Moderator
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#4B5563', fontSize: '0.95rem' }}>
            Are you sure you want to remove <strong>{confirmDialog.moderator?.display_name || confirmDialog.moderator?.username}</strong> ({confirmDialog.moderator?.email}) as your moderator?
          </Typography>
          <Typography sx={{ color: '#6B7280', fontSize: '0.85rem', mt: 1.5, fontStyle: 'italic' }}>
            They will be removed from your moderators list and return to standard listener status.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px 24px 24px', gap: '12px' }}>
          <Button 
            onClick={() => setConfirmDialog({ open: false, moderator: null })}
            variant="outlined"
            sx={{ borderRadius: '20px', textTransform: 'none', color: '#374151', borderColor: '#D1D5DB' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmRemove}
            variant="contained"
            color="error"
            disabled={loading}
            sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : 'Yes, Remove Moderator'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddModeratorPanel;
