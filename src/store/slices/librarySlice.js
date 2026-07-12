import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchFavorites = createAsyncThunk('library/fetchFavorites', async (_, thunkAPI) => {
  try {
    const res = await fetch('http://localhost:3001/api/listener/favorites', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('mosique_token')}` }
    });
    const data = await res.json();
    if (data.success) return data.favorites;
    return thunkAPI.rejectWithValue(data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue('Network error');
  }
});

export const addFavorite = createAsyncThunk('library/addFavorite', async (trackId, thunkAPI) => {
  try {
    const res = await fetch('http://localhost:3001/api/listener/favorites', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('mosique_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ trackId })
    });
    const data = await res.json();
    if (data.success) return { trackId, message: data.message };
    return thunkAPI.rejectWithValue(data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue('Network error');
  }
});

export const removeFavorite = createAsyncThunk('library/removeFavorite', async (trackId, thunkAPI) => {
  try {
    const res = await fetch(`http://localhost:3001/api/listener/favorites/${trackId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('mosique_token')}` }
    });
    const data = await res.json();
    if (data.success) return { trackId, message: data.message };
    return thunkAPI.rejectWithValue(data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue('Network error');
  }
});

export const fetchSavedAlbums = createAsyncThunk('library/fetchSavedAlbums', async (_, thunkAPI) => {
  try {
    const res = await fetch('http://localhost:3001/api/listener/saved-albums', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('mosique_token')}` }
    });
    const data = await res.json();
    if (data.success) return data.albums;
    return thunkAPI.rejectWithValue(data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue('Network error');
  }
});

export const saveAlbum = createAsyncThunk('library/saveAlbum', async (albumId, thunkAPI) => {
  try {
    const res = await fetch('http://localhost:3001/api/listener/saved-albums', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('mosique_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ albumId })
    });
    const data = await res.json();
    if (data.success) return { albumId, message: data.message };
    return thunkAPI.rejectWithValue(data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue('Network error');
  }
});

export const removeSavedAlbum = createAsyncThunk('library/removeSavedAlbum', async (albumId, thunkAPI) => {
  try {
    const res = await fetch(`http://localhost:3001/api/listener/saved-albums/${albumId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('mosique_token')}` }
    });
    const data = await res.json();
    if (data.success) return { albumId, message: data.message };
    return thunkAPI.rejectWithValue(data.message);
  } catch (err) {
    return thunkAPI.rejectWithValue('Network error');
  }
});

const librarySlice = createSlice({
  name: 'library',
  initialState: {
    favorites: [],
    savedAlbums: [],
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
      });
  }
});

export const { clearLibraryMessages } = librarySlice.actions;
export default librarySlice.reducer;
