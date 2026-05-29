import api from './api';

export const attendanceService = {
  getAttendance: async (itineraryId, vehicleId) => {
    const response = await api.get('/attendance', {
      params: { itineraryId, vehicleId }
    });
    return response.data;
  },

  markAttendanceBatch: async (data) => {
    const response = await api.post('/attendance/batch', data);
    return response.data;
  },

  getAttendanceByTour: async (tourId) => {
    const response = await api.get(`/attendance/tour/${tourId}`);
    return response.data;
  }
};
