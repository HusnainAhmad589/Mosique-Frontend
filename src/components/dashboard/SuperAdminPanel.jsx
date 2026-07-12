import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, CircularProgress, Switch, TablePagination, Checkbox, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, IconButton, Avatar, Alert } from '@mui/material';
import { Trash2, Eye, X, Search } from 'lucide-react';
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

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  useEffect(() => {
    dispatch(fetchSuperAdminData());
  }, [dispatch]);

  useEffect(() => {
    setUsers((rawUsers || []).filter(u => 
      u.id !== user.id && 
      u.Role?.slug !== 'superadmin' && 
      u.Role?.slug !== 'admin'
    ));
    setRoles((rawRoles || []).filter(r => 
      r.slug !== 'superadmin' && 
      r.slug !== 'superAdmin' && 
      r.slug !== 'admin' && 
      r.name !== 'Admin'
    ));
  }, [rawUsers, rawRoles, user.id]);

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
      <div className="panel-stat-grid">
        <div className="panel-stat-card">
          <div className="panel-stat-label">Total Active Users</div>
          <div className="panel-stat-value" style={{ color: 'var(--success, #10B981)' }}>
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
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((u) => {
                const isItemSelected = selectedUsers.indexOf(u.id) !== -1;
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
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.Role?.name}</TableCell>
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
