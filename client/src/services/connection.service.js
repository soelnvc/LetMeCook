import { apiFetch } from '@/lib/api';

export const connectionService = {
  getConnections: async () => {
    return apiFetch('/connections');
  },

  getRequests: async () => {
    return apiFetch('/connections/requests');
  },

  sendRequest: async (userId) => {
    return apiFetch(`/connections/${userId}`, {
      method: 'POST'
    });
  },

  respondToRequest: async (connectionId, action) => {
    return apiFetch(`/connections/${connectionId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ status: action, action })
    });
  },

  blockUser: async (userId) => {
    return apiFetch(`/connections/${userId}/block`, {
      method: 'POST'
    });
  }
};
