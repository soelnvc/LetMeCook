import { apiFetch } from '@/lib/api';

export const userService = {
  updateProfile: async (profileData) => {
    return apiFetch('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(profileData)
    });
  },

  getPublicProfile: async (username) => {
    return apiFetch(`/users/${username}`);
  }
};
