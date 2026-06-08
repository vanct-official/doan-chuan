import api from './api';

export const settingService = {
  getSetting: async (key) => {
    try {
      const response = await api.get(`/settings/${key}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching setting for key ${key}:`, error);
      throw error;
    }
  },

  updateSetting: async (key, value) => {
    try {
      const response = await api.put(`/settings/${key}`, { value });
      return response.data;
    } catch (error) {
      console.error(`Error updating setting for key ${key}:`, error);
      throw error;
    }
  }
};
