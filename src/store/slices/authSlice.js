import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

// ─────────────────────────────────────────────────────
// Async Thunks
// ─────────────────────────────────────────────────────

// Called on app startup — checks if a valid cookie session exists and restores the user
export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('mosique_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    const res = await api.get('/auth/me');
    return res.data.user;
  } catch (err) {
    localStorage.removeItem('mosique_token');
    delete api.defaults.headers.common['Authorization'];
    return rejectWithValue(err.response?.data?.message || 'Session expired');
  }
});

// Login
export const loginUser = createAsyncThunk('auth/loginUser', async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('mosique_token', res.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    }
    return res.data; // { user }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

// Register
export const registerUser = createAsyncThunk('auth/registerUser', async (userData, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', userData);
    if (res.data.token) {
      localStorage.setItem('mosique_token', res.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    }
    return res.data; // { user }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

// Logout
export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    // Ignore server error — always clear client state
  } finally {
    localStorage.removeItem('mosique_token');
    delete api.defaults.headers.common['Authorization'];
  }
});

// ─────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: true, // true on startup while checking token
    error: null,
  },
  reducers: {
    // Update user profile in-place (e.g. after profile edit)
    updateUserInfo: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // checkAuth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      });

    // loginUser
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // registerUser
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // logoutUser
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  }
});

export const { updateUserInfo, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
