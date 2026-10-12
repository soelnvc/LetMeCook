'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';

/**
 * CustomConfirmModal
 * Replaces native browser confirm dialogs across the app.
 * Uses GlassContainer and FluidButton with clean typography and frosted backdrop.
 */
export default function CustomConfirmModal({
  isOpen = false,
  title = 'Are you sure?',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (typeof document === 'undefined' || !isOpen) return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel?.();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.42)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'confirmModalBackdropIn 0.18s ease-out'
      }}
    >
      <GlassContainer
        radius={28}
        borderWidth={1.5}
        style={{
          maxWidth: 390,
          width: '100%',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.22)',
          border: '1px solid rgba(255, 255, 255, 0.35)'
        }}
        innerStyle={{
          padding: '26px 24px 22px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 16,
          animation: 'confirmModalContentIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header Icon Badge */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#09090b'
          }}
        >
          {isDanger ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )}
        </div>

        {/* Title and Message */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
          <h3
            style={{
              fontSize: 17.5,
              fontWeight: 700,
              color: '#09090b',
              margin: 0,
              letterSpacing: '-0.3px',
              lineHeight: 1.3
            }}
          >
            {title}
          </h3>
          {message && (
            <p
              style={{
                fontSize: 13.5,
                color: '#64748b',
                margin: 0,
                lineHeight: 1.5,
                wordBreak: 'break-word'
              }}
            >
              {message}
            </p>
          )}
        </div>

        {/* Action Buttons using FluidButton */}
        <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 4 }}>
          <FluidButton
            onClick={() => onCancel?.()}
            style={{
              flex: 1,
              padding: '11px',
              fontSize: 14,
              fontWeight: 600,
              color: '#64748b'
            }}
          >
            {cancelText}
          </FluidButton>

          <FluidButton
            onClick={() => onConfirm?.()}
            style={{
              flex: 1,
              padding: '11px',
              fontSize: 14,
              fontWeight: 600,
              color: '#09090b'
            }}
          >
            {confirmText}
          </FluidButton>
        </div>
      </GlassContainer>
    </div>,
    document.body
  );
}
