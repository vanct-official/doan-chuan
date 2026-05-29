import api from './api';

export const membershipService = {
  addMember: async (memberData) => {
    const response = await api.post('/members', memberData);
    return response.data;
  },

  addMembersBatch: async (batchData) => {
    const response = await api.post('/members/batch', batchData);
    return response.data;
  },

  updateMember: async (id, memberData) => {
    const response = await api.put(`/members/${id}`, memberData);
    return response.data;
  },

  deleteMember: async (id) => {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  },

  bulkApproveMembers: async (membershipIds) => {
    const response = await api.put('/members/approve', {
      membership_ids: membershipIds
    });
    return response.data;
  },

  leaveTour: async (id, leave_reason) => {
    const response = await api.post(`/members/${id}/leave`, { leave_reason });
    return response.data;
  }
};
