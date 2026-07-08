import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, ArrowLeft, Edit3, X, Check, AlertTriangle, Trash2 } from 'lucide-react';
import api from '../api';
import { DASHBOARD_URL, LOGIN_URL } from '../routes/route_constants';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const ProfileInfo = () => {
  const { user, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  
  const [formData, setFormData] = useState({
    display_name: '',
    avatar_url: '',
    address: '',
    dob: '',
    postal_code: '',
    phone_number: '',
    gender: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        avatar_url: user.avatar_url || '',
        address: user.address || '',
        dob: user.dob || '',
        postal_code: user.postal_code || '',
        phone_number: user.phone_number || '',
        gender: user.gender || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await api.put('/auth/me', formData);
      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        avatar_url: user.avatar_url || '',
        address: user.address || '',
        dob: user.dob || '',
        postal_code: user.postal_code || '',
        phone_number: user.phone_number || '',
        gender: user.gender || ''
      });
    }
    setError('');
    setIsEditing(false);
  };

  const handleDeactivateAccount = async () => {
    setDeactivating(true);
    try {
      await api.delete('/auth/deactivate-account');
      await logout();
      navigate(LOGIN_URL);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate account.');
      setShowDeactivateDialog(false);
    } finally {
      setDeactivating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError('Password is required to delete your account.');
      setShowDeleteDialog(false);
      return;
    }
    setDeleting(true);
    try {
      await api.delete('/auth/delete-account', { data: { password: deletePassword } });
      await logout();
      navigate(LOGIN_URL);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account.');
      setShowDeleteDialog(false);
      setDeletePassword('');
    } finally {
      setDeleting(false);
    }
  };

  const isDeactivatable = user?.role === 'listener' || user?.role === 'artist';

  if (!user) return null;

  return (
    <div className="auth-container" style={{ padding: '40px 20px', minHeight: '100vh', display: 'flex', alignItems: 'flex-start' }}>
      <div className="auth-card" style={{ maxWidth: '700px', width: '100%' }}>
        <div style={{marginBottom: '20px', display: 'flex', justifyContent: 'space-between'}}>
          <Link to={DASHBOARD_URL} className="link" style={{display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: 'var(--text-muted)'}}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          {!isEditing && (
            <button className="btn btn-outline" onClick={() => setIsEditing(true)} style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', gap: '5px', alignItems: 'center', width: 'auto' }}>
              <Edit3 size={14} /> Edit Profile
            </button>
          )}
        </div>

        <div className="auth-header">
          <h1><UserIcon size={32} color="var(--primary)" /> Profile Information</h1>
          <p>Manage your personal data.</p>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <div style={{ display: 'flex', gap: '30px', flexDirection: 'column' }}>
          {/* Avatar Section */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <img 
              src={formData.avatar_url || user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name)}&background=7C5CFC&color=fff&size=100`} 
              alt="Profile Avatar" 
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border)' }}
            />
            <div>
              <h2 style={{ margin: '0 0 5px 0', color: 'var(--text-main)' }}>{user.display_name}</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>@{user.username} &bull; {user.role}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              <div className="form-group">
                <label>Display Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  />
                ) : (
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', border: '1.5px solid var(--border)' }}>
                    {user.display_name}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', border: '1.5px solid var(--border)' }}>
                  {user.email}
                </div>
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    className="form-control"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                ) : (
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', border: '1.5px solid var(--border)' }}>
                    {user.dob ? new Date(user.dob).toLocaleDateString() : 'Not provided'}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Gender</label>
                {isEditing ? (
                  <select 
                    className="form-control"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                ) : (
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', border: '1.5px solid var(--border)' }}>
                    {user.gender || 'Not provided'}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+1 234 567 8900"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  />
                ) : (
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', border: '1.5px solid var(--border)' }}>
                    {user.phone_number || 'Not provided'}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Postal Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 90210"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  />
                ) : (
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', border: '1.5px solid var(--border)' }}>
                    {user.postal_code || 'Not provided'}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Address</label>
                {isEditing ? (
                  <textarea
                    className="form-control"
                    placeholder="Your physical address"
                    rows="2"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                ) : (
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', border: '1.5px solid var(--border)' }}>
                    {user.address || 'Not provided'}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Avatar URL (Base64 or Image Link)</label>
                  <textarea
                    className="form-control"
                    placeholder="Paste a link to an image or a Base64 string..."
                    rows="2"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              )}

            </div>

            {isEditing && (
              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Check size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-outline" onClick={handleCancel} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <X size={16} /> Cancel
                </button>
              </div>
            )}
          </form>

          {isDeactivatable && !isEditing && (
            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              <h3 style={{ color: 'var(--danger, #E54D6B)', fontSize: '1rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} /> Danger Zone
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                Manage your account status. These actions cannot be easily undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowDeactivateDialog(true)}
                  style={{
                    background: 'transparent',
                    color: '#f59e0b',
                    border: '1px solid #f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 24px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.target.style.background = '#f59e0b'; e.target.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#f59e0b'; }}
                >
                  <AlertTriangle size={16} /> Deactivate Account
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowDeleteDialog(true)}
                  style={{
                    background: 'transparent',
                    color: 'var(--danger, #E54D6B)',
                    border: '1px solid var(--danger, #E54D6B)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 24px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.target.style.background = 'var(--danger, #E54D6B)'; e.target.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--danger, #E54D6B)'; }}
                >
                  <Trash2 size={16} /> Delete Account
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={showDeactivateDialog} onClose={() => setShowDeactivateDialog(false)} PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden', maxWidth: '440px' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b', fontWeight: 600 }}>
          <AlertTriangle size={22} /> Deactivate Account
        </DialogTitle>
        <DialogContent>
          <p style={{ color: 'var(--text-secondary, #555)', lineHeight: 1.6 }}>
            Are you sure you want to deactivate your account? You will be logged out immediately and won't be able to log in again until an admin reactivates your account.
          </p>
          <p style={{ color: 'var(--text-muted, #888)', fontSize: '0.85rem', marginTop: '12px' }}>
            Your data will be preserved. Contact an admin to reactivate later.
          </p>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setShowDeactivateDialog(false)} variant="outlined" sx={{ borderRadius: '10px', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeactivateAccount}
            disabled={deactivating}
            variant="contained"
            sx={{ borderRadius: '10px', textTransform: 'none', backgroundColor: '#f59e0b', '&:hover': { backgroundColor: '#d97706' } }}
          >
            {deactivating ? 'Deactivating...' : 'Yes, Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden', maxWidth: '440px' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#E54D6B', fontWeight: 600 }}>
          <Trash2 size={22} /> Delete Account Permanently
        </DialogTitle>
        <DialogContent>
          <p style={{ color: 'var(--text-secondary, #555)', lineHeight: 1.6 }}>
            Are you sure you want to <strong>permanently delete</strong> your account? This action cannot be undone.
          </p>
          <p style={{ color: 'var(--text-muted, #888)', fontSize: '0.85rem', marginTop: '12px', marginBottom: '16px' }}>
            Your account and all associated data will be permanently removed from the system. You will not be able to recover it.
          </p>
          <div className="form-group">
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Enter your password to confirm:</label>
            <input
              type="password"
              className="form-control"
              placeholder="Your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              style={{ marginTop: '8px' }}
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => { setShowDeleteDialog(false); setDeletePassword(''); }} variant="outlined" sx={{ borderRadius: '10px', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            disabled={deleting || !deletePassword}
            variant="contained"
            sx={{ borderRadius: '10px', textTransform: 'none', backgroundColor: '#E54D6B', '&:hover': { backgroundColor: '#c93d5a' } }}
          >
            {deleting ? 'Deleting...' : 'Yes, Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProfileInfo;
