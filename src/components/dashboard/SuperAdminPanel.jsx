import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Snackbar, Alert, CircularProgress, Switch, TablePagination, Checkbox, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Avatar } from '@mui/material';
import { Trash2, Eye, X } from 'lucide-react';
import api from '../../api';
import { Search } from 'lucide-react';

const SuperAdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [viewUser, setViewUser] = useState(null);

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          api.get('/super-admin/users'),
          api.get('/super-admin/roles')
        ]);
        setUsers((usersRes.data.users || []).filter(u => 
          u.id !== user.id && 
          u.Role?.slug !== 'superadmin' && 
          u.Role?.slug !== 'admin'
        ));
        setRoles((rolesRes.data.roles || []).filter(r => 
          r.slug !== 'superadmin' && 
          r.slug !== 'superAdmin' && 
          r.slug !== 'admin' && 
          r.name !== 'Admin'
        ));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const handleRoleChange = async (userId, newRoleId) => {
    try {
      await api.put(`/super-admin/users/${userId}/role`, { role_id: newRoleId });
      setSuccessMsg('User role updated successfully');
      setUsers(users.map(u => u.id === userId ? { ...u, Role: roles.find(r => r.id === newRoleId) } : u));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleStatusChange = async (userId, isActive) => {
    try {
      await api.put(`/super-admin/users/${userId}/status`, { is_active: isActive });
      setSuccessMsg(`User status updated to ${isActive ? 'Active' : 'Inactive'}`);
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: isActive } : u));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
    }
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

  const handleBatchDelete = async () => {
    if (!window.confirm('Are you sure you want to delete selected users?')) return;
    try {
      await api.delete('/super-admin/users/batch', { data: { userIds: selectedUsers } });
      setSuccessMsg('Selected users deleted successfully');
      setUsers(users.filter(u => !selectedUsers.includes(u.id)));
      setSelectedUsers([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete users');
    }
  };

  if (loading) return <div className="loading-container"><CircularProgress /></div>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div>
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
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
      <Snackbar open={!!successMsg} autoHideDuration={6000} onClose={() => setSuccessMsg('')}>
        <Alert onClose={() => setSuccessMsg('')} severity="success">{successMsg}</Alert>
      </Snackbar>

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
