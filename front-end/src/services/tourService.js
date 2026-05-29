import api from './api';

export const tourService = {
  getAllTours: async () => {
    const response = await api.get('/tours');
    return response.data;
  },

  getMyTours: async () => {
    const response = await api.get('/tours/my');
    return response.data;
  },
  
  createTour: async (tourData) => {
    const response = await api.post('/tours', tourData);
    return response.data;
  },

  getTourById: async (id, status) => {
    const url = status ? `/tours/${id}?status=${status}` : `/tours/${id}`;
    const response = await api.get(url);
    return response.data;
  },

  updateTour: async (id, tourData) => {
    const response = await api.put(`/tours/${id}`, tourData);
    return response.data;
  },

  deleteTour: async (id) => {
    const response = await api.delete(`/tours/${id}`);
    return response.data;
  }
};
