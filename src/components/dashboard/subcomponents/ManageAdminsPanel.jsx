import React, { useState, useEffect } from 'react';
import api from '../../../api';
import {
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Switch
} from '@mui/material';

const ManageAdminsPanel = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '' });
  const [generatedPassword, setGeneratedPassword] = useState('');

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/super-admin/admins');
      setAdmins(res.data.admins || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/super-admin/admins', newAdmin);
      setSuccessMsg('Admin created successfully.');
      setGeneratedPassword(res.data.password || newAdmin.password);
      setNewAdmin({ username: '', email: '', password: '' });
      setIsCreating(false);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleStatusChange = async (userId, isActive) => {
    try {
      await api.put(`/super-admin/users/${userId}/status`, { is_active: isActive });
      setSuccessMsg(`Admin status updated successfully.`);
      setAdmins(admins.map(a => a.id === userId ? { ...a, is_active: isActive } : a));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update admin status');
    }
  };

  if (loading && admins.length === 0) return <div className="loading-container"><CircularProgress /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="panel-title" style={{ margin: 0 }}>Manage Admins</h2>
        <button 
          className="btn btn-primary" 
          style={{ width: 'auto', padding: '8px 16px' }}
          onClick={() => {
            setIsCreating(true);
            setError('');
            setSuccessMsg('');
            setGeneratedPassword('');
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
            let pass = '';
            for(let i=0; i<12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
            setNewAdmin({ username: '', email: '', password: pass });
          }}
        >
          Create Admin
        </button>
      </div>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMsg}
          {generatedPassword && (
            <div style={{ marginTop: '8px', fontWeight: 'bold' }}>
              Generated Password: <span style={{ background: '#eee', padding: '2px 6px', borderRadius: '4px', color: '#333' }}>{generatedPassword}</span>
              <br/><small>(Please copy this and share securely with the new admin. It will not be shown again.)</small>
            </div>
          )}
        </Alert>
      )}

      <Dialog open={isCreating} onClose={() => setIsCreating(false)} maxWidth="sm" fullWidth PaperProps={{ style: { borderRadius: '16px', padding: '10px' } }}>
        <DialogTitle style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>Register New Admin</DialogTitle>
        <DialogContent>
          <form id="createAdminForm" onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', marginTop: '10px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>Username</label>
              <input 
                type="text" 
                placeholder="admin_username" 
                value={newAdmin.username} 
                onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>Email</label>
              <input 
                type="email" 
                placeholder="admin@example.com" 
                value={newAdmin.email} 
                onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>Password</label>
              <input 
                type="text" 
                value={newAdmin.password} 
                readOnly
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', boxSizing: 'border-box', background: '#f5f5f5', color: '#666', cursor: 'not-allowed' }}
              />
            </div>
          </form>
        </DialogContent>
        <DialogActions style={{ padding: '0 24px 24px 24px', display: 'flex', gap: '16px' }}>
          <button type="submit" form="createAdminForm" style={{ flex: 1, background: '#6f42c1', color: 'white', padding: '14px', borderRadius: '30px', border: 'none', fontSize: '1.05rem', cursor: 'pointer', fontWeight: '600' }}>
            Register Admin
          </button>
          <button type="button" onClick={() => setIsCreating(false)} style={{ flex: 1, padding: '14px', borderRadius: '30px', border: '1px solid #ddd', background: 'transparent', fontSize: '1.05rem', cursor: 'pointer', fontWeight: '600', color: '#333' }}>
            Cancel
          </button>
        </DialogActions>
      </Dialog>

      <div className="panel-card">
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.id}</TableCell>
                  <TableCell>{admin.username}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Switch
                      checked={admin.is_active}
                      onChange={(e) => handleStatusChange(admin.id, e.target.checked)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {admins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">No admins found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default ManageAdminsPanel;
