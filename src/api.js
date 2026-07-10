import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // This tells axios to send cookies with every request (required for HttpOnly cookies)
  withCredentials: true,
});

export default api;
