import { apiFetch } from '@/lib/api';

export const messageService = {
  getConversations: async () => {
    return apiFetch('/messages/conversations');
  },

  getMessages: async (conversationId) => {
    return apiFetch(`/messages/conversations/${conversationId}`);
  },

  sendMessage: async (recipientId, content) => {
    return apiFetch('/messages', {
      method: 'POST',
      body: JSON.stringify({ recipientId, content })
    });
  },

  respondToRequest: async (conversationId, action) => {
    return apiFetch(`/messages/requests/${conversationId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  }
};
