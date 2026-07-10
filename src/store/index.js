import { configureStore } from '@reduxjs/toolkit';
import notificationReducer from './slices/notificationSlice';
import adminReducer from './slices/adminSlice';
import authReducer from './slices/authSlice';
import artistReducer from './slices/artistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notification: notificationReducer,
    admin: adminReducer,
    artist: artistReducer
  }
});

