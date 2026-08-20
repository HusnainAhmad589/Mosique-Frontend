import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Select, MenuItem, CircularProgress, Switch, TablePagination, 
  Checkbox, Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  Typography, IconButton, Avatar, Alert, Box, Chip 
} from '@mui/material';
import { Trash2, Eye, X, Search, Activity, Users, CheckCircle } from 'lucide-react';
import { fetchSuperAdminData, updateUserRole, toggleUserStatus, batchDeleteUsers } from '../../store/slices/adminSlice';
import api from '../../api';

const SuperAdminPanel = () => {
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch();
  const { users: rawUsers, roles: rawRoles, loading, error } = useSelector((state) => state.admin);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [viewUser, setViewUser] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);

  const [onlineData, setOnlineData] = useState({ totalOnline: 0, users: [] });
  const [onlineModalOpen, setOnlineModalOpen] = useState(false);

  const onlineUserIds = new Set(onlineData.users.map(u => u.id));

  // Live polling for online presence
  useEffect(() => {
    const fetchOnlinePresence = async () => {
      try {
        const res = await api.get('/admin/online-users');
        if (res.data && res.data.success) {
          setOnlineData({
            totalOnline: res.data.totalOnline || 0,
            users: res.data.users || []
          });
        }
      } catch (err) {
        console.warn('Failed to fetch online users in SuperAdmin:', err);
      }
    };

    fetchOnlinePresence();
    const interval = setInterval(fetchOnlinePresence, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  useEffect(() => {
    dispatch(fetchSuperAdminData());
  }, [dispatch]);

  useEffect(() => {
    setUsers((rawUsers || []).filter(u => 
      u.id !== user?.id && 
      u.Role?.slug !== 'superadmin' && 
      u.Role?.slug !== 'admin'
    ));
    setRoles((rawRoles || []).filter(r => 
      r.slug !== 'superadmin' && 
      r.slug !== 'superAdmin' && 
      r.slug !== 'admin' && 
      r.name !== 'Admin'
    ));
  }, [rawUsers, rawRoles, user?.id]);

  const handleRoleChange = (userId, newRoleId) => {
    dispatch(updateUserRole({ userId, newRoleId }));
  };

  const handleStatusChange = (userId, isActive) => {
    dispatch(toggleUserStatus({ userId, isActive, isAdminPanel: false }));
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredUsers.map((n) => n.id);
      setSelectedUsers(newSelecteds);
      return;
    }
    setSelectedUsers([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selectedUsers.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedUsers, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedUsers.slice(1));
    } else if (selectedIndex === selectedUsers.length - 1) {
      newSelected = newSelected.concat(selectedUsers.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedUsers.slice(0, selectedIndex),
        selectedUsers.slice(selectedIndex + 1),
      );
    }

    setSelectedUsers(newSelected);
  };

  const handleBatchDelete = () => {
    setConfirmDialog(true);
  };

  const executeBatchDelete = () => {
    dispatch(batchDeleteUsers(selectedUsers));
    setSelectedUsers([]);
    setConfirmDialog(false);
  };

  if (loading) return <div className="loading-container"><CircularProgress /></div>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div>
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} PaperProps={{ style: { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)', minWidth: '300px' } }}>
        <DialogTitle>Confirm Batch Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete {selectedUsers.length} selected users?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setConfirmDialog(false)} sx={{ color: 'var(--text-muted)' }}>Cancel</Button>
          <Button onClick={executeBatchDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <h2 className="panel-title" style={{ margin: 0 }}>Super Admin Controls</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {selectedUsers.length > 0 && (
            <Button 
              variant="contained" 
              color="error" 
              startIcon={<Trash2 size={16} />}
              onClick={handleBatchDelete}
              style={{ borderRadius: '10px', textTransform: 'none' }}
            >
              Delete Selected ({selectedUsers.length})
            </Button>
          )}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              style={{ padding: '9px 14px 9px 36px', borderRadius: '10px', border: '1px solid #e0d4f5', fontSize: '0.9rem', outline: 'none', background: '#faf8ff', width: '220px' }}
            />
          </div>
        </div>
      </div>

      <div className="panel-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {/* Live Online Users Card */}
        <div 
          className="panel-stat-card" 
          onClick={() => setOnlineModalOpen(true)}
          style={{ 
            cursor: 'pointer', 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.18) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            transition: 'transform 0.2s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="panel-stat-label" style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 10px #10B981' }} />
              Live Online Users
            </div>
            <Activity size={18} color="#10B981" />
          </div>
          <div className="panel-stat-value" style={{ color: '#10B981', fontSize: '2rem', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            {onlineData.totalOnline}
            <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 500 }}>(Click to view list)</span>
          </div>
        </div>

        <div className="panel-stat-card">
          <div className="panel-stat-label">Total Active Users</div>
          <div className="panel-stat-value" style={{ color: 'var(--primary, #7c3aed)' }}>
            {users.filter(u => u.is_active !== false).length}
          </div>
        </div>
        <div className="panel-stat-card">
          <div className="panel-stat-label">Total Inactive Users</div>
          <div className="panel-stat-value" style={{ color: 'var(--danger)' }}>
            {users.filter(u => u.is_active === false).length}
          </div>
        </div>
      </div>

      <div className="panel-card">
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                    checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Presence</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((u) => {
                const isItemSelected = selectedUsers.indexOf(u.id) !== -1;
                const isOnline = onlineUserIds.has(u.id);
                return (
                  <TableRow key={u.id} selected={isItemSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onChange={(event) => handleClick(event, u.id)}
                      />
                    </TableCell>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar src={u.avatar_url} sx={{ width: 28, height: 28, fontSize: '0.8rem', bgcolor: '#7c3aed' }}>
                          {u.username?.[0]?.toUpperCase()}
                        </Avatar>
                        <div>
                          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {u.display_name || u.username}
                            {u.is_verified && <CheckCircle size={14} color="#10B981" />}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{u.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip label={u.Role?.name || 'User'} size="small" sx={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '0.75rem' }} />
                    </TableCell>
                    <TableCell>
                      {isOnline ? (
                        <Chip 
                          label="Online" 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(16, 185, 129, 0.15)', 
                            color: '#10B981', 
                            fontWeight: 700, 
                            fontSize: '0.75rem',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                          }} 
                        />
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Offline</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={u.is_active !== false} 
                        onChange={(e) => handleStatusChange(u.id, e.target.checked)} 
                        color="primary" 
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.Role?.id || ''}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        size="small"
                        sx={{ minWidth: 120, fontSize: '0.85rem' }}
                      >
                        {roles.map((role) => (
                          <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => setViewUser(u)} sx={{ color: 'var(--primary, #7c3aed)' }}>
                        <Eye size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </div>

      {/* Online Users List Modal */}
      <Dialog 
        open={onlineModalOpen} 
        onClose={() => setOnlineModalOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { bgcolor: 'var(--bg-elevated)', color: 'var(--text-main)', borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 10px #10B981' }} />
            <span style={{ fontWeight: 700 }}>Currently Online Users ({onlineData.totalOnline})</span>
          </Box>
          <IconButton onClick={() => setOnlineModalOpen(false)} sx={{ color: 'var(--text-muted)' }}><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
          {onlineData.users.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Users size={40} style={{ opacity: 0.4, marginBottom: 8 }} />
              <div>No other users are currently active.</div>
            </Box>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {onlineData.users.map(u => (
                <div 
                  key={u.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '10px 14px', 
                    borderRadius: '10px', 
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar src={u.avatar_url} sx={{ width: 36, height: 36, bgcolor: '#7c3aed' }}>
                      {u.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <div>
                      <div style={{ fontWeight: 600 }}>{u.display_name || u.username}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{u.username}</div>
                    </div>
                  </div>
                  <Chip 
                    label={u.role || 'listener'} 
                    size="small" 
                    sx={{ textTransform: 'capitalize', fontWeight: 600, bgcolor: 'rgba(124, 92, 252, 0.15)', color: '#A78BFA' }} 
                  />
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View User Details Modal */}
      <Dialog open={!!viewUser} onClose={() => setViewUser(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', color: '#fff', fontWeight: 600 }}>
          User Details
          <IconButton onClick={() => setViewUser(null)} sx={{ color: '#fff' }}><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {viewUser && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <Avatar src={viewUser.avatar_url} sx={{ width: 64, height: 64, bgcolor: '#7c3aed', fontSize: '1.5rem' }}>
                  {viewUser.username?.[0]?.toUpperCase()}
                </Avatar>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{viewUser.display_name || viewUser.username}</div>
                  <div style={{ color: '#888', fontSize: '0.9rem' }}>@{viewUser.username}</div>
                </div>
              </div>
              {[
                ['Email', viewUser.email],
                ['Role', viewUser.Role?.name || 'N/A'],
                ['Presence', onlineUserIds.has(viewUser.id) ? '🟢 Currently Online' : '⚪ Offline'],
                ['Status', viewUser.is_active !== false ? 'Active' : 'Inactive'],
                ['Gender', viewUser.gender || 'N/A'],
                ['Date of Birth', viewUser.dob || 'N/A'],
                ['Phone', viewUser.phone_number || 'N/A'],
                ['Address', viewUser.address || 'N/A'],
                ['Postal Code', viewUser.postal_code || 'N/A'],
                ['Joined', viewUser.created_at ? new Date(viewUser.created_at).toLocaleDateString() : 'N/A'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', borderBottom: '1px solid #f0e8ff', paddingBottom: '10px' }}>
                  <span style={{ fontWeight: 600, color: '#555', width: '130px', flexShrink: 0 }}>{label}</span>
                  <span style={{ color: '#333' }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminPanel;
