import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  googleLogin: async (token) => {
    const response = await api.post('/auth/google', { token });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/users/change-password', passwordData);
    return response.data;
  },

  checkPhone: async (phone) => {
    const response = await api.get(`/users/check-phone/${phone}`);
    return response.data;
  },

  toggleUserStatus: async (userId, password) => {
    const response = await api.put(`/users/${userId}/status`, { password });
    return response.data;
  }
};
