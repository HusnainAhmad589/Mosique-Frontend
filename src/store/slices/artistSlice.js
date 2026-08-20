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
  moderators: [],
  loading: false,
  error: null,
  successMessage: null,
};

export const fetchModerators = createAsyncThunk('artist/fetchModerators', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/artist/moderators');
    return response.data.moderators;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch moderators');
  }
});

export const addModerator = createAsyncThunk('artist/addModerator', async (email, { rejectWithValue }) => {
  try {
    const response = await api.post('/artist/moderators', { email });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add moderator');
  }
});

export const removeModerator = createAsyncThunk('artist/removeModerator', async (moderatorId, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/artist/moderators/${moderatorId}`);
    return { moderatorId, message: response.data.message };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to remove moderator');
  }
});


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
    return res.data.album;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update album status');
  }
});

// Update song status
export const updateSongStatus = createAsyncThunk('artist/updateSongStatus', async ({ songId, status, scheduled_at }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/artist/songs/${songId}/status`, { status, scheduled_at });
    return res.data.song;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update song status');
  }
});

// AI Generate Lyrics
export const generateLyrics = createAsyncThunk('artist/generateLyrics', async (songId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/artist/songs/${songId}/generate-lyrics`);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to generate AI lyrics');
  }
});

// Update Song Lyrics
export const updateSongLyrics = createAsyncThunk('artist/updateSongLyrics', async ({ songId, lyrics }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/artist/songs/${songId}/lyrics`, { lyrics });
    return res.data.song;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update lyrics');
  }
});

// Fetch content by status
export const fetchContentByStatus = createAsyncThunk('artist/fetchContentByStatus', async (status, { rejectWithValue }) => {
  try {
    const res = await api.get(`/artist/content?status=${status}`);
    return { status, songs: res.data.songs, albums: res.data.albums };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch content');
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
        state.successMessage = action.payload.status === 'scheduled' 
          ? `Song scheduled to auto-release on ${new Date(action.payload.scheduled_at).toLocaleString()}`
          : 'Song published successfully!';
      })
      .addCase(publishSong.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Generate Lyrics
      .addCase(generateLyrics.pending, (state) => { state.loading = true; })
      .addCase(generateLyrics.fulfilled, (state, action) => {
        state.loading = false;
        const songId = action.payload?.song?.id || action.payload?.songId;
        if (songId) {
          const index = state.songs.findIndex(s => s.id === songId);
          if (index !== -1) {
            if (action.payload.song) {
              state.songs[index] = action.payload.song;
            } else if (action.payload.lyrics_status) {
              state.songs[index].lyrics_status = action.payload.lyrics_status;
            }
          }
        }
        state.successMessage = action.payload?.message || 'AI Lyrics generation queued!';
      })
      .addCase(generateLyrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Song Lyrics
      .addCase(updateSongLyrics.pending, (state) => { state.loading = true; })
      .addCase(updateSongLyrics.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.songs.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.songs[index] = action.payload;
        }
        state.successMessage = 'Lyrics updated successfully!';
      })
      .addCase(updateSongLyrics.rejected, (state, action) => {
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
      })
      // Update Song Status
      .addCase(updateSongStatus.fulfilled, (state, action) => {
        const index = state.songs.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.songs[index] = action.payload;
        }
      })
      // Fetch Content By Status
      .addCase(fetchContentByStatus.pending, (state) => { state.loading = true; })
      .addCase(fetchContentByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.songs = action.payload.songs;
        state.albums = action.payload.albums;
      })
      .addCase(fetchContentByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Personal Moderators
      .addCase(fetchModerators.fulfilled, (state, action) => {
        state.moderators = action.payload;
      })
      // Add Personal Moderator
      .addCase(addModerator.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addModerator.fulfilled, (state, action) => {
        state.loading = false;
        state.moderators.unshift(action.payload.moderator);
        state.successMessage = action.payload.message;
      })
      .addCase(addModerator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove Personal Moderator
      .addCase(removeModerator.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(removeModerator.fulfilled, (state, action) => {
        state.loading = false;
        state.moderators = state.moderators.filter(m => m.id !== action.payload.moderatorId);
        state.successMessage = action.payload.message;
      })
      .addCase(removeModerator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = artistSlice.actions;
export default artistSlice.reducer;
