import { apiFetch } from '@/lib/api';

export const dishService = {
  getDishes: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.status) query.append('status', params.status);
    if (params.scope) query.append('scope', params.scope);
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiFetch(`/dishes${queryString}`);
  },

  getDishById: async (id) => {
    return apiFetch(`/dishes/${id}`);
  },

  createDish: async (dishData) => {
    return apiFetch('/dishes', {
      method: 'POST',
      body: JSON.stringify(dishData)
    });
  },

  joinDish: async (id) => {
    return apiFetch(`/dishes/${id}/join`, {
      method: 'POST'
    });
  },

  leaveDish: async (id) => {
    return apiFetch(`/dishes/${id}/leave`, {
      method: 'POST'
    });
  },

  updateStatus: async (id, status) => {
    return apiFetch(`/dishes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  approveRequest: async (dishId, requestId) => {
    return apiFetch(`/dishes/${dishId}/requests/${requestId}/approve`, {
      method: 'POST'
    });
  },

  rejectRequest: async (dishId, requestId) => {
    return apiFetch(`/dishes/${dishId}/requests/${requestId}/reject`, {
      method: 'POST'
    });
  }
};
