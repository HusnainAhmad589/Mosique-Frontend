import axios from 'axios';

// Get base backend URL from Vite environment variable (default to localhost in dev)
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  // Send cookies with every request (for HttpOnly cookies)
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mosique_token');
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers) {
    delete config.headers.Authorization;
  }
  return config;
});

/**
 * Resolves static media URLs (covers, avatars, banners, audio files).
 * Handles both absolute URLs (http:// or https://) and relative backend static paths (/uploads/...).
 */
export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export default api;

