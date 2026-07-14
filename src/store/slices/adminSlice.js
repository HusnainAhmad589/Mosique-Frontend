import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';
import { showToast } from './notificationSlice';

export const fetchSuperAdminData = createAsyncThunk('admin/fetchSuperAdminData', async (_, { rejectWithValue }) => {
  try {
    const [usersRes, rolesRes] = await Promise.all([
      api.get('/super-admin/users'),
      api.get('/super-admin/roles')
    ]);
    return {
      users: usersRes.data.users || [],
      roles: rolesRes.data.roles || []
    };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch data');
  }
});

export const fetchAdminData = createAsyncThunk('admin/fetchAdminData', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/users');
    return {
      users: response.data.users || [],
      roles: [] // Admins don't fetch roles
    };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
  }
});

export const updateUserRole = createAsyncThunk('admin/updateUserRole', async ({ userId, newRoleId }, { dispatch, rejectWithValue }) => {
  try {
    await api.put(`/super-admin/users/${userId}/role`, { role_id: newRoleId });
    dispatch(showToast({ message: 'User role updated successfully' }));
    return { userId, newRoleId };
  } catch (err) {
    dispatch(showToast({ message: err.response?.data?.message || 'Failed to update role', type: 'error' }));
    return rejectWithValue(err.response?.data?.message);
  }
});

export const toggleUserStatus = createAsyncThunk('admin/toggleUserStatus', async ({ userId, isActive, isAdminPanel }, { dispatch, rejectWithValue }) => {
  try {
    const endpoint = isAdminPanel ? `/admin/users/${userId}/status` : `/super-admin/users/${userId}/status`;
    await api.put(endpoint, { is_active: isActive });
    dispatch(showToast({ message: `User status updated to ${isActive ? 'Active' : 'Inactive'}` }));
    return { userId, isActive };
  } catch (err) {
    dispatch(showToast({ message: err.response?.data?.message || 'Failed to update status', type: 'error' }));
    return rejectWithValue(err.response?.data?.message);
  }
});

export const toggleUserVerification = createAsyncThunk('admin/toggleUserVerification', async ({ userId, isVerified }, { dispatch, rejectWithValue }) => {
  try {
    await api.put(`/admin/users/${userId}/verify`, { is_verified: isVerified });
    dispatch(showToast({ message: `Artist verification updated to ${isVerified ? 'Verified' : 'Unverified'}` }));
    return { userId, isVerified };
  } catch (err) {
    dispatch(showToast({ message: err.response?.data?.message || 'Failed to update verification', type: 'error' }));
    return rejectWithValue(err.response?.data?.message);
  }
});

export const batchDeleteUsers = createAsyncThunk('admin/batchDeleteUsers', async (userIds, { dispatch, rejectWithValue }) => {
  try {
    await api.delete('/super-admin/users/batch', { data: { userIds } });
    dispatch(showToast({ message: 'Selected users deleted successfully' }));
    return userIds;
  } catch (err) {
    dispatch(showToast({ message: err.response?.data?.message || 'Failed to delete users', type: 'error' }));
    return rejectWithValue(err.response?.data?.message);
  }
});

const initialState = {
  users: [],
  roles: [],
  loading: false,
  error: null
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminState: (state) => {
      state.users = [];
      state.roles = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Super Admin Data
      .addCase(fetchSuperAdminData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuperAdminData.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.roles = action.payload.roles;
      })
      .addCase(fetchSuperAdminData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Admin Data
      .addCase(fetchAdminData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminData.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
      })
      .addCase(fetchAdminData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const { userId, newRoleId } = action.payload;
        const user = state.users.find(u => u.id === userId);
        if (user) {
          const role = state.roles.find(r => r.id === newRoleId);
          if (role) {
            user.Role = role;
            if (user.role_id) user.role_id = newRoleId;
          }
        }
      })

      // Toggle Status
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const { userId, isActive } = action.payload;
        const user = state.users.find(u => u.id === userId);
        if (user) {
          user.is_active = isActive;
        }
      })

      // Toggle Verification
      .addCase(toggleUserVerification.fulfilled, (state, action) => {
        const { userId, isVerified } = action.payload;
        const user = state.users.find(u => u.id === userId);
        if (user) {
          user.is_verified = isVerified;
        }
      })

      // Batch Delete
      .addCase(batchDeleteUsers.fulfilled, (state, action) => {
        const userIds = action.payload;
        state.users = state.users.filter(u => !userIds.includes(u.id));
      });
  }
});

export const { clearAdminState } = adminSlice.actions;
export default adminSlice.reducer;
