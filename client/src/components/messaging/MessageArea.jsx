'use client';

import React from 'react';
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';

export default function MessageArea({
  currentUser,
  activeUser,
  messages = [],
  messageText,
  setMessageText,
  onSendMessage
}) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'transparent',
        minWidth: 0
      }}
    >
      {activeUser ? (
        <>
          {/* Header */}
          <div
            style={{
              padding: '16px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              borderBottom: '1.5px solid rgba(255, 255, 255, 0.7)',
              backgroundColor: 'transparent'
            }}
          >
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: '50%',
                backgroundColor: '#8257e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 24,
                fontWeight: 'bold',
                flexShrink: 0
              }}
            >
              {(activeUser.name || activeUser.username || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#000000',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {activeUser.name || 'NAME'}
              </div>
              <div style={{ fontSize: 13, color: '#555555', marginTop: 2 }}>
                @{activeUser.username || 'username'}
              </div>
            </div>
          </div>

          {/* Messages Feed */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18
            }}
          >
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', margin: 'auto', color: '#888888', fontSize: 14 }}>
                No messages yet in this conversation. Say hello!
              </div>
            ) : (
              messages.map((m) => {
                const isMe = (m.sender?._id || m.sender) === currentUser?._id;

                if (isMe) {
                  return (
                    <GlassContainer
                      key={m._id}
                      radius={24}
                      style={{ alignSelf: 'flex-end', maxWidth: '70%' }}
                      innerStyle={{
                        padding: '14px 22px',
                        color: '#000000',
                        fontSize: 15,
                        lineHeight: 1.4
                      }}
                    >
                      {m.content}
                    </GlassContainer>
                  );
                } else {
                  return (
                    <div
                      key={m._id}
                      style={{
                        alignSelf: 'flex-start',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        maxWidth: '75%'
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: '#8257e5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: 13,
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}
                      >
                        {(activeUser.name || activeUser.username || 'U')[0].toUpperCase()}
                      </div>
                      <GlassContainer
                        radius={24}
                        style={{ flex: 1 }}
                        innerStyle={{
                          padding: '14px 22px',
                          color: '#000000',
                          fontSize: 15,
                          lineHeight: 1.4
                        }}
                      >
                        {m.content}
                      </GlassContainer>
                    </div>
                  );
                }
              })
            )}
          </div>

          {/* Bottom Input */}
          <div style={{ padding: '16px 24px', backgroundColor: 'transparent' }}>
            <form onSubmit={onSendMessage}>
              <GlassContainer
                radius={9999}
                innerStyle={{
                  padding: '6px 14px 6px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <path d="M15 8.5a1.5 1.5 0 0 1 1.5 1.5" />
                </svg>
                <input
                  type="text"
                  required
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a Message..."
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: 15,
                    flex: 1,
                    color: '#000000',
                    fontFamily: 'inherit'
                  }}
                />
                <FluidButton
                  type="submit"
                  variant="icon"
                  style={{
                    width: 36,
                    height: 36,
                    minWidth: 36,
                    minHeight: 36,
                    flexShrink: 0
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#000000"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </FluidButton>
              </GlassContainer>
            </form>
          </div>
        </>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666666'
          }}
        >
          <div style={{ marginBottom: 14, color: '#9ca3af' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Select a conversation to start chatting</div>
        </div>
      )}
    </div>
  );
}
