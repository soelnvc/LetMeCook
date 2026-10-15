'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/user.service';

const ThemeContext = createContext({
  themePreference: 'light',
  resolvedTheme: 'light',
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {}
});

const STORAGE_KEY = 'letmecook_theme';

export function ThemeProvider({ children, initialUserTheme = null }) {
  const [themePreference, setThemePreferenceState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          return saved;
        }
      } catch {}
    }
    return initialUserTheme || 'light';
  });

  const [systemIsDark, setSystemIsDark] = useState(false);

  // Detect OS dark mode
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemIsDark(mediaQuery.matches);

    const handler = (e) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedTheme = themePreference === 'system'
    ? (systemIsDark ? 'dark' : 'light')
    : themePreference;

  const isDark = resolvedTheme === 'dark';

  // Apply to document DOM & CSS variables
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, [isDark]);

  // Set Theme with LocalStorage & Full-stack Backend Persistence
  const setTheme = useCallback((newTheme) => {
    if (!['light', 'dark', 'system'].includes(newTheme)) return;

    setThemePreferenceState(newTheme);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch {}

      // If user is authenticated, sync to backend user profile
      const token = localStorage.getItem('token');
      if (token) {
        userService.updateProfile({ theme: newTheme }).catch((err) => {
          console.warn('[ThemeContext] Background profile sync error:', err.message);
        });
      }
    }
  }, []);

  // Quick 1-click toggle between light and dark
  const toggleTheme = useCallback(() => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
  }, [isDark, setTheme]);

  // Sync if incoming authenticated user object has a saved theme
  const syncWithUser = useCallback((userTheme) => {
    if (userTheme && ['light', 'dark', 'system'].includes(userTheme)) {
      setThemePreferenceState(userTheme);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, userTheme);
        } catch {}
      }
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        themePreference,
        resolvedTheme,
        isDark,
        setTheme,
        toggleTheme,
        syncWithUser
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      themePreference: 'light',
      resolvedTheme: 'light',
      isDark: false,
      setTheme: () => {},
      toggleTheme: () => {},
      syncWithUser: () => {}
    };
  }
  return context;
}
