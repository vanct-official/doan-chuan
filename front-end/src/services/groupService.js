import api from './api';

export const groupService = {
  createGroup: async (groupData) => {
    const response = await api.post('/groups', groupData);
    return response.data;
  },

  getGroupsByTour: async (tourId) => {
    const response = await api.get(`/groups?tour_id=${tourId}`);
    return response.data;
  }
};
