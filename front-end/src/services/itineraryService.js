import api from './api';

export const itineraryService = {
  getItinerariesByTour: async (tourId) => {
    const response = await api.get(`/tours/${tourId}/itineraries`);
    return response.data;
  },

  createItinerary: async (data) => {
    const response = await api.post('/itineraries', data);
    return response.data;
  },

  updateItinerary: async (id, data) => {
    const response = await api.put(`/itineraries/${id}`, data);
    return response.data;
  },

  deleteItinerary: async (id) => {
    const response = await api.delete(`/itineraries/${id}`);
    return response.data;
  }
};
