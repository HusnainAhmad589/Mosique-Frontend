import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchReports = createAsyncThunk('moderator/fetchReports', async (_, thunkAPI) => {
  try {
    const res = await fetch('http://localhost:3001/api/moderator/reports', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('mosique_token')}`
      }
    });
    const data = await res.json();
    if (data.success) {
      return data.reports;
    }
    return thunkAPI.rejectWithValue(data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue('Network error');
  }
});

export const resolveReport = createAsyncThunk('moderator/resolveReport', async ({ reportId, action }, thunkAPI) => {
  try {
    const res = await fetch(`http://localhost:3001/api/moderator/reports/${reportId}/resolve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('mosique_token')}`
      },
      body: JSON.stringify({ action })
    });
    const data = await res.json();
    if (data.success) {
      return { reportId, status: action === 'approve' ? 'resolved' : 'dismissed', message: data.message };
    }
    return thunkAPI.rejectWithValue(data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue('Network error');
  }
});

export const fetchPendingContent = createAsyncThunk('moderator/fetchPendingContent', async (_, thunkAPI) => {
  try {
    const res = await fetch('http://localhost:3001/api/moderator/pending-content', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('mosique_token')}`
      }
    });
    const data = await res.json();
    if (data.success) {
      return data.pending;
    }
    return thunkAPI.rejectWithValue(data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue('Network error');
  }
});

export const reviewContent = createAsyncThunk('moderator/reviewContent', async ({ type, id, action, reason }, thunkAPI) => {
  try {
    const res = await fetch(`http://localhost:3001/api/moderator/review/${type}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('mosique_token')}`
      },
      body: JSON.stringify({ action, reason })
    });
    const data = await res.json();
    if (data.success) {
      return { type, id, status: action === 'approve' ? 'published' : 'draft', message: data.message };
    }
    return thunkAPI.rejectWithValue(data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue('Network error');
  }
});

const moderatorSlice = createSlice({
  name: 'moderator',
  initialState: {
    reports: [],
    pendingContent: { songs: [], albums: [] },
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
      });
  }
});

export const { clearModeratorMessages } = moderatorSlice.actions;
export default moderatorSlice.reducer;
