import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { getToken } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await authService.getMe();
      setUser(res.data);
      setError(null);
    } catch (err) {
      console.warn('Auth check error:', err.message);
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (credentials) => {
    setError(null);
    try {
      const res = await authService.login(credentials);
      setUser(res.user);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await authService.register(userData);
      setUser(res.user);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    refreshUser: fetchUser
  };
}
