'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import GlassContainer from '@/components/ui/GlassContainer';

/**
 * ResponseToast
 * Renders response messages (error or status) in a small custom container (GlassContainer)
 * positioned in the center of the screen, fading in and automatically fading out in 3 seconds.
 */
export default function ResponseToast({
  text = '',
  type = 'status', // 'status' | 'error'
  isFadingOut = false,
  onDismiss
}) {
  if (typeof document === 'undefined' || !text) return null;

  const isError = type === 'error';

  return createPortal(
    <div
      onClick={onDismiss}
      title="Click to dismiss"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100000,
        pointerEvents: 'auto',
        cursor: 'pointer',
        animation: isFadingOut
          ? 'centerToastOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          : 'centerToastIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      <GlassContainer
        radius={22}
        borderWidth={1.5}
        style={{
          maxWidth: 'min(90vw, 440px)',
          minWidth: 260,
          width: 'max-content',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}
        innerStyle={{
          padding: '12px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          textAlign: 'center'
        }}
      >
        {/* Leading Status / Error Icon */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isError ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="9 12 11.5 14.5 15.5 9.5" />
            </svg>
          )}
        </div>

        {/* Response message text */}
        <span
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: '#09090b',
            letterSpacing: '-0.2px',
            lineHeight: 1.45,
            userSelect: 'none'
          }}
        >
          {text}
        </span>
      </GlassContainer>
    </div>,
    document.body
  );
}
