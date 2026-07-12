import { configureStore } from '@reduxjs/toolkit';
import notificationReducer from './slices/notificationSlice';
import adminReducer from './slices/adminSlice';
import authReducer from './slices/authSlice';
import artistReducer from './slices/artistSlice';
import moderatorReducer from './slices/moderatorSlice';
import libraryReducer from './slices/librarySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notification: notificationReducer,
    admin: adminReducer,
    artist: artistReducer,
    moderator: moderatorReducer,
    library: libraryReducer
  }
});

