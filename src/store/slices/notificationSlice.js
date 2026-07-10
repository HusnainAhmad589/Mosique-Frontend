import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

// Async thunks for bell notifications
export const fetchNotifications = createAsyncThunk('notification/fetchNotifications', async () => {
  const response = await api.get('/notifications');
  return response.data.notifications;
});

export const fetchUnreadCount = createAsyncThunk('notification/fetchUnreadCount', async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data.count;
});

export const markAsRead = createAsyncThunk('notification/markAsRead', async (id) => {
  await api.put(`/notifications/${id}/read`);
  return id;
});

export const markAllAsRead = createAsyncThunk('notification/markAllAsRead', async () => {
  await api.put('/notifications/read-all');
});

const initialState = {
  toast: {
    message: '',
    type: 'success', // 'success' | 'error' | 'info' | 'warning'
    open: false,
  },
  bell: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null
  }
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showToast: (state, action) => {
      state.toast = {
        message: action.payload.message,
        type: action.payload.type || 'success',
        open: true
      };
    },
    hideToast: (state) => {
      state.toast.open = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.bell.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.bell.loading = false;
        state.bell.notifications = action.payload;
        state.bell.unreadCount = action.payload.filter(n => !n.is_read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.bell.loading = false;
        state.bell.error = action.error.message;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.bell.unreadCount = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const id = action.payload;
        const notification = state.bell.notifications.find(n => n.id === id);
        if (notification && !notification.is_read) {
          notification.is_read = true;
          state.bell.unreadCount = Math.max(0, state.bell.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.bell.notifications.forEach(n => { n.is_read = true; });
        state.bell.unreadCount = 0;
      });
  }
});

export const { showToast, hideToast } = notificationSlice.actions;
export default notificationSlice.reducer;
