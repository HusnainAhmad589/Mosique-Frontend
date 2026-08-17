import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

export const fetchFavorites = createAsyncThunk('library/fetchFavorites', async (_, thunkAPI) => {
  try {
    const res = await api.get('/listener/favorites');
    if (res.data.success) return res.data.favorites;
    return thunkAPI.rejectWithValue(res.data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Network error');
  }
});

export const addFavorite = createAsyncThunk('library/addFavorite', async (trackId, thunkAPI) => {
  try {
    const res = await api.post('/listener/favorites', { trackId });
    if (res.data.success) return { trackId, message: res.data.message };
    return thunkAPI.rejectWithValue(res.data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Network error');
  }
});

export const removeFavorite = createAsyncThunk('library/removeFavorite', async (trackId, thunkAPI) => {
  try {
    const res = await api.delete(`/listener/favorites/${trackId}`);
    if (res.data.success) return { trackId, message: res.data.message };
    return thunkAPI.rejectWithValue(res.data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Network error');
  }
});

export const fetchSavedAlbums = createAsyncThunk('library/fetchSavedAlbums', async (_, thunkAPI) => {
  try {
    const res = await api.get('/listener/saved-albums');
    if (res.data.success) return res.data.albums;
    return thunkAPI.rejectWithValue(res.data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Network error');
  }
});

export const saveAlbum = createAsyncThunk('library/saveAlbum', async (albumId, thunkAPI) => {
  try {
    const res = await api.post('/listener/saved-albums', { albumId });
    if (res.data.success) return { albumId, message: res.data.message };
    return thunkAPI.rejectWithValue(res.data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Network error');
  }
});

export const removeSavedAlbum = createAsyncThunk('library/removeSavedAlbum', async (albumId, thunkAPI) => {
  try {
    const res = await api.delete(`/listener/saved-albums/${albumId}`);
    if (res.data.success) return { albumId, message: res.data.message };
    return thunkAPI.rejectWithValue(res.data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Network error');
  }
});

export const fetchHistory = createAsyncThunk('library/fetchHistory', async (_, thunkAPI) => {
  try {
    const res = await api.get('/listener/history');
    if (res.data.success) return res.data.history;
    return thunkAPI.rejectWithValue(res.data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Network error');
  }
});

export const addToHistory = createAsyncThunk('library/addToHistory', async (songId, thunkAPI) => {
  try {
    const res = await api.post('/listener/history', { songId });
    if (res.data.success) return { songId };
    return thunkAPI.rejectWithValue(res.data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Network error');
  }
});

const librarySlice = createSlice({
  name: 'library',
  initialState: {
    favorites: [],
    savedAlbums: [],
    history: [],
    loading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearLibraryMessages(state) {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Favorites
      .addCase(fetchFavorites.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Favorite
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
        // Ideally we'd fetchFavorites again or just push the new song if we had full song data
        // For simplicity, we just show success. A refresh of the library view will fetch the latest.
      })
      .addCase(addFavorite.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove Favorite
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter(s => s.id !== action.payload.trackId);
        state.successMessage = action.payload.message;
      })
      // Fetch Saved Albums
      .addCase(fetchSavedAlbums.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSavedAlbums.fulfilled, (state, action) => {
        state.loading = false;
        state.savedAlbums = action.payload;
      })
      .addCase(fetchSavedAlbums.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save Album
      .addCase(saveAlbum.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
      })
      .addCase(saveAlbum.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove Saved Album
      .addCase(removeSavedAlbum.fulfilled, (state, action) => {
        state.savedAlbums = state.savedAlbums.filter(a => a.id !== action.payload.albumId);
        state.successMessage = action.payload.message;
      })
      // Fetch History
      .addCase(fetchHistory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearLibraryMessages } = librarySlice.actions;
export default librarySlice.reducer;
