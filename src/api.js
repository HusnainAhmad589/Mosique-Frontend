import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
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

export default api;
