import api from './api';

export const vehicleService = {
  createVehicle: async (vehicleData) => {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  },

  updateVehicle: async (id, vehicleData) => {
    const response = await api.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  },

  deleteVehicle: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  assignSeat: async (membershipId, vehicleId) => {
    const response = await api.post('/vehicles/assign', {
      membership_id: membershipId,
      vehicle_id: vehicleId
    });
    return response.data;
  },

  assignSeatsBatch: async (membershipIds, vehicleId) => {
    const response = await api.post('/vehicles/assign-batch', {
      membership_ids: membershipIds,
      vehicle_id: vehicleId
    });
    return response.data;
  },

  assignVehicleLeader: async (vehicleId, membershipId) => {
    const response = await api.post(`/vehicles/${vehicleId}/assign-leader`, {
      membership_id: membershipId
    });
    return response.data;
  }
};
