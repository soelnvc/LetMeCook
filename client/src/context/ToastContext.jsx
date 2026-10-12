'use client';

import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import ResponseToast from '@/components/ui/ResponseToast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null); // { id, text, type: 'status' | 'error', isFadingOut: boolean }
  const timerRef = useRef(null);
  const fadeOutTimerRef = useRef(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);
    setToast(null);
  }, []);

  const showToast = useCallback((text, type = 'status') => {
    if (!text || typeof text !== 'string') return;
    const cleanText = text.trim();
    if (!cleanText) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);

    const id = Date.now();
    setToast({ id, text: cleanText, type, isFadingOut: false });

    // Begin fade out at 2.7s (300ms transition)
    fadeOutTimerRef.current = setTimeout(() => {
      setToast((cur) => (cur && cur.id === id ? { ...cur, isFadingOut: true } : cur));
    }, 2700);

    // Completely dismiss at 3.0s
    timerRef.current = setTimeout(() => {
      setToast((cur) => (cur && cur.id === id ? null : cur));
    }, 3000);
  }, []);

  const showError = useCallback((text) => {
    showToast(text, 'error');
  }, [showToast]);

  const showStatus = useCallback((text) => {
    showToast(text, 'status');
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showError, showStatus, hideToast }}>
      {children}
      {toast && (
        <ResponseToast
          text={toast.text}
          type={toast.type}
          isFadingOut={toast.isFadingOut}
          onDismiss={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: () => {},
      showError: () => {},
      showStatus: () => {},
      hideToast: () => {}
    };
  }
  return context;
}
