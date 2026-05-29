import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_URL, // Backend base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto attach JWT token if available in local storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
