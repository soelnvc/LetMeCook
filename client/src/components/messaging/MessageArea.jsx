'use client';

import React, { useState } from 'react';
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';

export default function MessageArea({
  currentUser,
  activeUser,
  conversation,
  messages = [],
  messageText,
  setMessageText,
  onSendMessage,
  onViewProfile,
  onAcceptRequest,
  onRejectRequest,
  onBlockUser
}) {
  const [isViewingRecipientScreen, setIsViewingRecipientScreen] = useState(false);

  const isPending = conversation?.requestStatus === 'pending';
  const mySentMessages = messages.filter(
    (m) =>
      (m.sender?._id || m.sender?.username || m.sender) ===
      (currentUser?._id || currentUser?.username)
  );
  const hasSentOneMessage = mySentMessages.length >= 1;

  // The sender is the user who initiated this request
  const isSender = conversation?.isRequest
    ? false
    : conversation?.requestSender
      ? String(conversation.requestSender).toLowerCase() === String(currentUser?.username || '').toLowerCase()
      : true;

  // Determine which UI mode to render
  const showRecipientView = isPending && (!isSender || isViewingRecipientScreen);
  const showSenderWaiting = isPending && isSender && !isViewingRecipientScreen && hasSentOneMessage;
  const showSenderInitialForm = isPending && isSender && !isViewingRecipientScreen && !hasSentOneMessage;

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
              justifyContent: 'space-between',
              borderBottom: '1.5px solid rgba(255, 255, 255, 0.7)',
              backgroundColor: 'transparent'
            }}
          >
            <div
              onClick={() => {
                if (onViewProfile) onViewProfile(activeUser);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                cursor: onViewProfile ? 'pointer' : 'default',
                minWidth: 0
              }}
              title={onViewProfile ? `View @${activeUser.username}'s profile` : ''}
            >
              {activeUser.avatar ? (
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name || 'User'}
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                    border: '1px solid rgba(0, 0, 0, 0.08)'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: '50%',
                    backgroundColor: '#8257e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 22,
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}
                >
                  {(activeUser.name || activeUser.username || 'U')[0].toUpperCase()}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 20,
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

            {/* Recipient view indicator / mode switch */}
            {isPending && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isViewingRecipientScreen ? (
                  <>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: '#b45309',
                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                        padding: '4px 10px',
                        borderRadius: 9999
                      }}
                    >
                      @{activeUser.username}'s Screen
                    </span>
                    <FluidButton
                      onClick={() => setIsViewingRecipientScreen(false)}
                      style={{
                        padding: '5px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#000000'
                      }}
                    >
                      My View
                    </FluidButton>
                  </>
                ) : (
                  hasSentOneMessage && (
                    <FluidButton
                      onClick={() => setIsViewingRecipientScreen(true)}
                      style={{
                        padding: '5px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#000000'
                      }}
                    >
                      Switch to @{activeUser.username}'s Screen
                    </FluidButton>
                  )
                )}
              </div>
            )}
          </div>

          {/* Pending Invitation Banner (Sender: 1 message allowed) */}
          {showSenderInitialForm && (
            <div style={{ padding: '14px 28px 0 28px' }}>
              <GlassContainer
                radius={18}
                innerStyle={{
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: '#374151',
                  fontSize: 13
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>
                  This is your invitation to message <strong>@{activeUser.username}</strong>. You can send <strong>1 message</strong>. They must accept before you can continue chatting.
                </span>
              </GlassContainer>
            </div>
          )}

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
                {showSenderInitialForm
                  ? `Send 1 invitation message to @${activeUser.username} to get started.`
                  : 'No messages yet in this conversation.'}
              </div>
            ) : (
              messages.map((m) => {
                const isFromCurrentUser = (m.sender?._id || m.sender?.username || m.sender) === (currentUser?._id || currentUser?.username);
                // When in recipient view mode, invert the perspective so the incoming message appears on the left
                const isBubbleMe = showRecipientView ? !isFromCurrentUser : isFromCurrentUser;

                if (isBubbleMe) {
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
                  const bubbleUser = showRecipientView ? currentUser : activeUser;

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
                        onClick={() => {
                          if (onViewProfile && bubbleUser) onViewProfile(bubbleUser);
                        }}
                        style={{ cursor: onViewProfile ? 'pointer' : 'default', flexShrink: 0 }}
                        title={onViewProfile ? `View @${bubbleUser?.username}'s profile` : ''}
                      >
                        {bubbleUser?.avatar ? (
                          <img
                            src={bubbleUser.avatar}
                            alt={bubbleUser.name || 'User'}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              display: 'block',
                              border: '1px solid rgba(0, 0, 0, 0.08)'
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              backgroundColor: '#8257e5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: 13,
                              fontWeight: 'bold'
                            }}
                          >
                            {(bubbleUser?.name || bubbleUser?.username || 'U')[0].toUpperCase()}
                          </div>
                        )}
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

          {/* Bottom Area: Depends on State */}
          {showRecipientView ? (
            /* Recipient Screen: Accept / Reject / Block */
            <div style={{ padding: '16px 24px', backgroundColor: 'transparent' }}>
              <GlassContainer
                radius={22}
                innerStyle={{
                  padding: '18px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 12,
                  color: '#000000'
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#000000', marginBottom: 4 }}>
                    {isViewingRecipientScreen ? `@${currentUser?.username || 'user'}` : `@${activeUser?.username}`} wants to send you a message
                  </div>
                  <div style={{ fontSize: 12.5, color: '#6b7280' }}>
                    Do you want to let them send you messages? They won't know you've seen it until you accept.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <FluidButton
                    onClick={() => {
                      if (onAcceptRequest) onAcceptRequest(conversation?.conversationId);
                      setIsViewingRecipientScreen(false);
                    }}
                    style={{
                      padding: '8px 26px',
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#16a34a'
                    }}
                  >
                    Accept
                  </FluidButton>

                  <FluidButton
                    onClick={() => {
                      if (onRejectRequest) onRejectRequest(conversation?.conversationId);
                      setIsViewingRecipientScreen(false);
                    }}
                    style={{
                      padding: '8px 22px',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#dc2626'
                    }}
                  >
                    Reject
                  </FluidButton>

                  <FluidButton
                    onClick={() => {
                      const targetToBlock = isViewingRecipientScreen ? currentUser?.username : activeUser?.username;
                      if (onBlockUser) onBlockUser(targetToBlock);
                      setIsViewingRecipientScreen(false);
                    }}
                    style={{
                      padding: '8px 22px',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#71717a'
                    }}
                  >
                    Block
                  </FluidButton>
                </div>

                {isViewingRecipientScreen && (
                  <button
                    type="button"
                    onClick={() => setIsViewingRecipientScreen(false)}
                    style={{
                      marginTop: 2,
                      background: 'none',
                      border: 'none',
                      fontSize: 12,
                      color: '#6b7280',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Back to my view (Sender)
                  </button>
                )}
              </GlassContainer>
            </div>
          ) : showSenderWaiting ? (
            /* Sender Waiting Screen: Message sent, waiting for peer to accept */
            <div style={{ padding: '16px 24px', backgroundColor: 'transparent' }}>
              <GlassContainer
                radius={22}
                innerStyle={{
                  padding: '18px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 10,
                  color: '#000000'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>Wait till @{activeUser?.username} accepts your message</span>
                </div>
                <div style={{ fontSize: 12.5, color: '#6b7280' }}>
                  You have sent your 1 invitation message. You'll be able to send more messages once @{activeUser?.username} accepts your request.
                </div>

                <div style={{ marginTop: 4 }}>
                  <FluidButton
                    onClick={() => setIsViewingRecipientScreen(true)}
                    style={{
                      padding: '7px 18px',
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: '#000000'
                    }}
                  >
                    Switch to @{activeUser?.username}'s Screen (Recipient View)
                  </FluidButton>
                </div>
              </GlassContainer>
            </div>
          ) : (
            /* Normal Input Form (either accepted, or sending the 1 invitation message) */
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
                    placeholder={
                      showSenderInitialForm
                        ? `Send 1 invitation message to @${activeUser?.username}...`
                        : 'Type a Message...'
                    }
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
          )}
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
