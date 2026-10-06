import { apiFetch } from '@/lib/api';

export const connectionService = {
  getConnections: async () => {
    return apiFetch('/connections');
  },

  sendRequest: async (userId) => {
    return apiFetch(`/connections/${userId}`, {
      method: 'POST'
    });
  },

  respondToRequest: async (connectionId, action) => {
    return apiFetch(`/connections/${connectionId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  },

  blockUser: async (userId) => {
    return apiFetch(`/connections/${userId}/block`, {
      method: 'POST'
    });
  }
};
