import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Switch, TablePagination, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar, Alert } from '@mui/material';
import { Search, Eye, X, CheckCircle } from 'lucide-react';
import { fetchAdminData, toggleUserStatus, toggleUserVerification } from '../../store/slices/adminSlice';
import api from '../../api';

const AdminPanel = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.admin);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
    dispatch(fetchAdminData());
  },[dispatch]);

  const handleStatusChange = (userId, isActive) => {
    dispatch(toggleUserStatus({ userId, isActive, isAdminPanel: true }));
  };

  if (loading) return <div className="loading-container"><CircularProgress /></div>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <h2 className="panel-title" style={{ margin: 0 }}>Admin Controls</h2>
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
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Verified</TableCell>
                <TableCell>View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(user => {
                const userRole = user.role_name || user.Role?.name || user.Role?.slug;
                const isArtist = userRole === 'artist';
                return (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{userRole}</TableCell>
                    <TableCell>
                      <Switch 
                        checked={user.is_active !== false} 
                        onChange={(e) => handleStatusChange(user.id, e.target.checked)} 
                        color="primary" 
                      />
                    </TableCell>
                    <TableCell>
                      {isArtist ? (
                        <Switch 
                          checked={user.is_verified === true} 
                          onChange={(e) => dispatch(toggleUserVerification({ userId: user.id, isVerified: e.target.checked }))} 
                          color="secondary" 
                        />
                      ) : (
                        <span style={{ color: '#aaa', fontSize: '0.85rem' }}>N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => setViewUser(user)} sx={{ color: 'var(--primary, #7c3aed)' }}>
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
                  <div style={{ fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {viewUser.display_name || viewUser.username}
                    {viewUser.is_verified && <CheckCircle size={18} color="#10B981" />}
                  </div>
                  <div style={{ color: '#888', fontSize: '0.9rem' }}>@{viewUser.username}</div>
                </div>
              </div>
              {[
                ['Email', viewUser.email],
                ['Role', viewUser.role_name || viewUser.Role?.name || 'N/A'],
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

export default AdminPanel;
