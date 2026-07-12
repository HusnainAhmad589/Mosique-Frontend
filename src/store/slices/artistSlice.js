import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

export const fetchProfile = createAsyncThunk('artist/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/artist/profile');
    return response.data.profile;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
  }
});

export const updateProfile = createAsyncThunk('artist/updateProfile', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.put('/artist/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.profile;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
  }
});

export const fetchAlbums = createAsyncThunk('artist/fetchAlbums', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/artist/albums');
    return response.data.albums;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch albums');
  }
});

export const createAlbum = createAsyncThunk('artist/createAlbum', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post('/artist/albums', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.album;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create album');
  }
});

export const fetchSongs = createAsyncThunk('artist/fetchSongs', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/artist/songs');
    return response.data.songs;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch songs');
  }
});

export const publishSong = createAsyncThunk('artist/publishSong', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post('/artist/songs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.song;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to publish song');
  }
});

export const deleteSong = createAsyncThunk('artist/deleteSong', async (songId, { rejectWithValue }) => {
  try {
    await api.delete(`/artist/songs/${songId}`);
    return songId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete song');
  }
});

export const fetchCategories = createAsyncThunk('artist/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/categories');
    return response.data.categories;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
  }
});

const initialState = {
  profile: null,
  albums: [],
  songs: [],
  categories: [],
  loading: false,
  error: null,
  successMessage: null,
};

// Delete an album
export const deleteAlbum = createAsyncThunk('artist/deleteAlbum', async (albumId, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/artist/albums/${albumId}`);
    return { albumId, success: res.data.success };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete album');
  }
});

// Update album status
export const updateAlbumStatus = createAsyncThunk('artist/updateAlbumStatus', async ({ albumId, status }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/artist/albums/${albumId}/status`, { status });
    return res.data.album; // Assuming backend returns the updated album
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update album status');
  }
});

const artistSlice = createSlice({
  name: 'artist',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => { state.loading = true; })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => { state.loading = true; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.successMessage = 'Profile updated successfully!';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Albums
      .addCase(fetchAlbums.fulfilled, (state, action) => {
        state.albums = action.payload;
      })
      // Create Album
      .addCase(createAlbum.pending, (state) => { state.loading = true; })
      .addCase(createAlbum.fulfilled, (state, action) => {
        state.loading = false;
        state.albums.unshift(action.payload);
        state.successMessage = 'Album created successfully!';
      })
      .addCase(createAlbum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Songs
      .addCase(fetchSongs.fulfilled, (state, action) => {
        state.songs = action.payload;
      })
      // Publish Song
      .addCase(publishSong.pending, (state) => { state.loading = true; })
      .addCase(publishSong.fulfilled, (state, action) => {
        state.loading = false;
        state.songs.unshift(action.payload);
        state.successMessage = 'Song published successfully!';
      })
      .addCase(publishSong.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Delete Song
      .addCase(deleteSong.pending, (state) => { state.loading = true; })
      .addCase(deleteSong.fulfilled, (state, action) => {
        state.loading = false;
        state.songs = state.songs.filter(s => s.id !== action.payload);
        state.successMessage = 'Song deleted successfully!';
      })
      .addCase(deleteSong.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Album
      .addCase(deleteAlbum.fulfilled, (state, action) => {
        state.albums = state.albums.filter(a => a.id !== action.payload.albumId);
      })
      // Update Album Status
      .addCase(updateAlbumStatus.fulfilled, (state, action) => {
        const index = state.albums.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.albums[index] = action.payload;
        }
      });
  },
});

export const { clearMessages } = artistSlice.actions;
export default artistSlice.reducer;
