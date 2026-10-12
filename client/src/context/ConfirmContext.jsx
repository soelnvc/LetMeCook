'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomConfirmModal from '@/components/ui/CustomConfirmModal';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState(null);

  const confirm = useCallback(({
    title = 'Are you sure?',
    message = '',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = false
  }) => {
    return new Promise((resolve) => {
      setConfirmState({
        title,
        message,
        confirmText,
        cancelText,
        isDanger,
        resolve
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState?.resolve) {
      confirmState.resolve(true);
    }
    setConfirmState(null);
  }, [confirmState]);

  const handleCancel = useCallback(() => {
    if (confirmState?.resolve) {
      confirmState.resolve(false);
    }
    setConfirmState(null);
  }, [confirmState]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {confirmState && (
        <CustomConfirmModal
          isOpen={true}
          title={confirmState.title}
          message={confirmState.message}
          confirmText={confirmState.confirmText}
          cancelText={confirmState.cancelText}
          isDanger={confirmState.isDanger}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    // Graceful fallback to browser confirm if ever rendered outside provider
    return {
      confirm: async ({ message, title }) => {
        if (typeof window === 'undefined') return false;
        return window.confirm(title ? `${title}\n\n${message || ''}` : message);
      }
    };
  }
  return context;
}
