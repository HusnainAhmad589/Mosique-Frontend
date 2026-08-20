import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

export const fetchReports = createAsyncThunk('moderator/fetchReports', async (_, thunkAPI) => {
  try {
    const res = await api.get('/moderator/reports');
    if (res.data.success) {
      return res.data.reports;
    }
    return thunkAPI.rejectWithValue(res.data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Network error');
  }
});

export const resolveReport = createAsyncThunk('moderator/resolveReport', async ({ reportId, action, resolution_note }, thunkAPI) => {
  try {
    const res = await api.put(`/moderator/reports/${reportId}/resolve`, { action, resolution_note });
    if (res.data.success) {
      return { reportId, status: action === 'dismiss' ? 'dismissed' : 'resolved', message: res.data.message };
    }
    return thunkAPI.rejectWithValue(res.data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Network error');
  }
});

export const fetchPendingContent = createAsyncThunk('moderator/fetchPendingContent', async (_, thunkAPI) => {
  try {
    const res = await api.get('/moderator/pending-content');
    if (res.data.success) {
      return res.data.pending;
    }
    return thunkAPI.rejectWithValue(res.data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Network error');
  }
});

export const reviewContent = createAsyncThunk('moderator/reviewContent', async ({ type, id, action, reason }, thunkAPI) => {
  try {
    const res = await api.put(`/moderator/review/${type}/${id}`, { action, reason });
    if (res.data.success) {
      return { type, id, status: action === 'approve' ? 'published' : 'draft', message: res.data.message };
    }
    return thunkAPI.rejectWithValue(res.data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Network error');
  }
});

export const removeSong = createAsyncThunk('moderator/removeSong', async (songId, thunkAPI) => {
  try {
    const res = await api.delete(`/moderator/songs/${songId}`);
    if (res.data.success) {
      return { songId, message: res.data.message };
    }
    return thunkAPI.rejectWithValue(res.data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Network error');
  }
});

export const updateSong = createAsyncThunk('moderator/updateSong', async ({ songId, title, status }, thunkAPI) => {
  try {
    const res = await api.put(`/moderator/songs/${songId}`, { title, status });
    if (res.data.success) {
      return { songId, song: res.data.song, message: res.data.message };
    }
    return thunkAPI.rejectWithValue(res.data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Network error');
  }
});

export const fetchArtistsDashboard = createAsyncThunk('moderator/fetchArtistsDashboard', async (_, thunkAPI) => {
  try {
    const res = await api.get('/moderator/artists');
    if (res.data.success) {
      return res.data.artists;
    }
    return thunkAPI.rejectWithValue(res.data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Network error');
  }
});

const moderatorSlice = createSlice({
  name: 'moderator',
  initialState: {
    reports: [],
    pendingContent: { songs: [], albums: [] },
    artists: [],
    loading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearModeratorMessages(state) {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resolveReport.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(resolveReport.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        const index = state.reports.findIndex(r => r.id === action.payload.reportId);
        if (index !== -1) {
          state.reports[index].status = action.payload.status;
        }
      })
      .addCase(resolveReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPendingContent.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPendingContent.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingContent = action.payload;
      })
      .addCase(fetchPendingContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(reviewContent.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(reviewContent.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        // Remove from pending lists
        if (action.payload.type === 'song') {
          state.pendingContent.songs = state.pendingContent.songs.filter(s => s.id !== action.payload.id);
        } else if (action.payload.type === 'album') {
          state.pendingContent.albums = state.pendingContent.albums.filter(a => a.id !== action.payload.id);
        }
      })
      .addCase(reviewContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove Song
      .addCase(removeSong.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(removeSong.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        // Update related reports to resolved
        state.reports = state.reports.map(r =>
          r.song_id === action.payload.songId && r.status === 'pending'
            ? { ...r, status: 'resolved' }
            : r
        );
      })
      .addCase(removeSong.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Song
      .addCase(updateSong.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateSong.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        // Update the song title in reports if changed
        state.reports = state.reports.map(r =>
          r.song_id === action.payload.songId
            ? { ...r, title: action.payload.song?.title || r.title, song_status: action.payload.song?.status || r.song_status }
            : r
        );
      })
      .addCase(updateSong.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Artists Dashboard
      .addCase(fetchArtistsDashboard.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchArtistsDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.artists = action.payload;
      })
      .addCase(fetchArtistsDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearModeratorMessages } = moderatorSlice.actions;
export default moderatorSlice.reducer;
