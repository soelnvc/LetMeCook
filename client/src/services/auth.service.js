import { apiFetch } from '@/lib/api';
import { setToken, clearToken } from '@/lib/auth';

export const authService = {
  login: async (credentials) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (res.token) {
      setToken(res.token);
    }
    return res;
  },

  register: async (userData) => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (res.token) {
      setToken(res.token);
    }
    return res;
  },

  getMe: async () => {
    return apiFetch('/auth/me');
  },

  logout: () => {
    clearToken();
  }
};
