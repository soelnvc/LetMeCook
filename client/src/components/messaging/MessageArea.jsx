'use client';

import React, { useState, useRef } from 'react';
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';
import EmojiPicker from './EmojiPicker';
import { apiFetch } from '@/lib/api';
import { getGlobalAvatar } from '@/lib/userAvatarRegistry';

const isOnlyEmojis = (text) => {
  if (!text || typeof text !== 'string') return false;
  const clean = text.trim();
  if (!clean) return false;
  const emojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji_Modifier_Base}|\p{Emoji_Modifier}|\u200d|\ufe0f|\s)+$/u;
  return emojiRegex.test(clean);
};

const getEmojiFontSize = (text) => {
  if (!text) return 48;
  try {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const segments = Array.from(segmenter.segment(text.trim())).filter((s) => s.segment.trim());
    const count = segments.length;
    if (count <= 1) return 50; // Big standalone emoji like Instagram & Telegram
    if (count === 2) return 40;
    if (count === 3) return 34;
    return 28;
  } catch {
    const len = [...text.trim()].length;
    if (len <= 2) return 50;
    if (len <= 4) return 40;
    return 30;
  }
};

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
  onBlockUser,
  onBack
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [dishActionLoadingId, setDishActionLoadingId] = useState(null);
  const [localDishRequestStatuses, setLocalDishRequestStatuses] = useState({});
  const inputRef = useRef(null);

  const resolveUserAvatar = (targetU) => {
    if (!targetU) return null;
    if (targetU.avatar && typeof targetU.avatar === 'string' && targetU.avatar.trim()) {
      return targetU.avatar;
    }
    return getGlobalAvatar(targetU.username || targetU._id || targetU.id);
  };

  const handleDishRequestAction = async (msg, action) => {
    if (!msg.dishRequest?.dishId || !msg.dishRequest?.dishRequestId) return;
    const reqId = String(msg.dishRequest.dishRequestId);
    setDishActionLoadingId(reqId);
    try {
      const res = await apiFetch(`/dishes/${msg.dishRequest.dishId}/requests/${reqId}/${action}`, {
        method: 'POST'
      });
      if (res?.success) {
        setLocalDishRequestStatuses((prev) => ({
          ...prev,
          [reqId]: action === 'approve' ? 'approved' : 'rejected'
        }));
      }
    } catch (err) {
      console.error('Failed responding to dish request in DM:', err);
    } finally {
      setDishActionLoadingId(null);
    }
  };

  const renderDishRequestCard = (m, isBubbleMe) => {
    const dr = m.dishRequest || {};
    const reqId = String(dr.dishRequestId);
    const effectiveStatus = localDishRequestStatuses[reqId] || dr.status || 'pending';
    const isLoading = dishActionLoadingId === reqId;

    return (
      <GlassContainer
        key={m._id}
        radius={22}
        style={{
          alignSelf: isBubbleMe ? 'flex-end' : 'flex-start',
          maxWidth: '82%',
          marginLeft: isBubbleMe ? 'auto' : 46,
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.06)'
        }}
        innerStyle={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          color: '#000000'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🍽️</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#09090b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Dish Join Request
            </span>
          </div>

          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 9999,
              background:
                effectiveStatus === 'approved'
                  ? 'rgba(34, 197, 94, 0.12)'
                  : effectiveStatus === 'rejected'
                  ? 'rgba(239, 68, 68, 0.12)'
                  : 'rgba(244, 63, 94, 0.12)',
              color:
                effectiveStatus === 'approved'
                  ? '#16a34a'
                  : effectiveStatus === 'rejected'
                  ? '#dc2626'
                  : '#e11d48'
            }}
          >
            {effectiveStatus === 'approved'
              ? 'Accepted'
              : effectiveStatus === 'rejected'
              ? 'Declined'
              : 'Pending'}
          </span>
        </div>

        {dr.dishDescription && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 12,
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              fontSize: 13,
              fontWeight: 600,
              color: '#18181b',
              lineHeight: 1.4
            }}
          >
            "{dr.dishDescription}"
          </div>
        )}

        <div style={{ fontSize: 14, color: '#27272a', lineHeight: 1.45 }}>
          {m.content}
        </div>

        {!isBubbleMe && effectiveStatus === 'pending' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <FluidButton
              disabled={isLoading}
              onClick={() => handleDishRequestAction(m, 'approve')}
              style={{
                flex: 1,
                padding: '6px 14px',
                fontSize: 12.5,
                fontWeight: 700,
                color: '#16a34a'
              }}
            >
              {isLoading ? '...' : 'Accept Request'}
            </FluidButton>

            <FluidButton
              disabled={isLoading}
              onClick={() => handleDishRequestAction(m, 'reject')}
              style={{
                flex: 1,
                padding: '6px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                color: '#dc2626'
              }}
            >
              Decline
            </FluidButton>
          </div>
        )}

        {!isBubbleMe && effectiveStatus === 'approved' && (
          <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>✓ Request Accepted • Added to table</span>
          </div>
        )}
        {!isBubbleMe && effectiveStatus === 'rejected' && (
          <div style={{ fontSize: 12, fontWeight: 600, color: '#71717a' }}>
            <span>✕ Request Declined</span>
          </div>
        )}

        {isBubbleMe && (
          <div style={{ fontSize: 12, fontWeight: 600, color: effectiveStatus === 'approved' ? '#16a34a' : effectiveStatus === 'rejected' ? '#dc2626' : '#71717a' }}>
            {effectiveStatus === 'approved'
              ? '✓ Host accepted your request!'
              : effectiveStatus === 'rejected'
              ? '✕ Request was declined'
              : '⏳ Waiting for host to accept...'}
          </div>
        )}
      </GlassContainer>
    );
  };

  const handleInsertEmoji = (emoji) => {
    const input = inputRef.current;
    if (!input) {
      setMessageText((prev) => prev + emoji);
      return;
    }
    const start = input.selectionStart ?? messageText.length;
    const end = input.selectionEnd ?? messageText.length;
    const next = messageText.substring(0, start) + emoji + messageText.substring(end);
    setMessageText(next);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const isPending = conversation?.requestStatus === 'pending' || conversation?.isRequest;
  const mySentMessages = messages.filter(
    (m) =>
      String(m.sender?._id || m.sender?.username || m.sender) ===
      String(currentUser?._id || currentUser?.username)
  );
  const hasSentOneMessage = mySentMessages.length >= 1;

  // The sender is the user who initiated this request
  const firstMsg = messages[0];
  const firstSender = firstMsg?.sender?.username || firstMsg?.sender?._id || firstMsg?.sender;
  const isSender = firstSender
    ? String(firstSender).toLowerCase() === String(currentUser?.username || currentUser?._id || '').toLowerCase()
    : (conversation?.requestSender
      ? String(conversation.requestSender).toLowerCase() === String(currentUser?.username || '').toLowerCase()
      : false);

  // Determine which UI mode to render
  const showRecipientView = isPending && !isSender;
  const showSenderWaiting = isPending && isSender && hasSentOneMessage;
  const showSenderInitialForm = isPending && isSender && !hasSentOneMessage;

  return (
    <div
      className="messages-area-panel"
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="mobile-flex"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px 6px 4px 0',
                    cursor: 'pointer',
                    color: '#09090b',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  title="Back to conversations"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              )}
              <div
                onClick={() => {
                  if (onViewProfile) onViewProfile(activeUser);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: onViewProfile ? 'pointer' : 'default',
                  minWidth: 0
                }}
                title={onViewProfile ? `View @${activeUser.username}'s profile` : ''}
              >
              {(() => {
                const headerAvatar = resolveUserAvatar(activeUser);
                return headerAvatar ? (
                  <img
                    src={headerAvatar}
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
                );
              })()}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 16.5,
                    fontWeight: 600,
                    color: '#09090b',
                    letterSpacing: '-0.3px',
                    lineHeight: '20px'
                  }}
                >
                  {activeUser.name || activeUser.username || 'User'}
                </div>
                <div style={{ fontSize: 12.5, color: '#71717a', marginTop: 2, fontWeight: 400 }}>
                  @{activeUser.username || 'username'}
                  {activeUser.institute?.name && ` · ${activeUser.institute.name}`}
                </div>
              </div>
            </div>
          </div>
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
                const isBubbleMe = isFromCurrentUser;
                const isEmojiMsg = isOnlyEmojis(m.content);
                const emojiSize = isEmojiMsg ? getEmojiFontSize(m.content) : 15;

                if (isBubbleMe) {
                  // Render Dish Join Request card if message contains dishRequest payload
                  if (m.dishRequest && m.dishRequest.dishId) {
                    return renderDishRequestCard(m, true);
                  }
                  // Instagram / Telegram style: Standalone emoji without bubble container
                  if (isEmojiMsg) {
                    return (
                      <div
                        key={m._id}
                        style={{
                          alignSelf: 'flex-end',
                          padding: '4px 6px',
                          fontSize: emojiSize,
                          lineHeight: 1.15,
                          userSelect: 'none',
                          marginBottom: 4,
                          transition: 'transform 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.12)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        {m.content}
                      </div>
                    );
                  }

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
                  // Render Dish Join Request card if message contains dishRequest payload
                  if (m.dishRequest && m.dishRequest.dishId) {
                    return renderDishRequestCard(m, false);
                  }

                  const bubbleUser = activeUser;

                  // Instagram / Telegram style: Standalone emoji without bubble container
                  if (isEmojiMsg) {
                    return (
                      <div
                        key={m._id}
                        style={{
                          alignSelf: 'flex-start',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          marginBottom: 4
                        }}
                      >
                        <div
                          onClick={() => {
                            if (onViewProfile && bubbleUser) onViewProfile(bubbleUser);
                          }}
                          style={{ cursor: onViewProfile ? 'pointer' : 'default', flexShrink: 0 }}
                          title={onViewProfile ? `View @${bubbleUser?.username}'s profile` : ''}
                        >
                          {(() => {
                            const bubbleAvatar = resolveUserAvatar(m.sender) || resolveUserAvatar(bubbleUser);
                            return bubbleAvatar ? (
                              <img
                                src={bubbleAvatar}
                                alt={bubbleUser?.name || 'User'}
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
                            );
                          })()}
                        </div>
                        <div
                          style={{
                            padding: '4px 6px',
                            fontSize: emojiSize,
                            lineHeight: 1.15,
                            userSelect: 'none',
                            transition: 'transform 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.12)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          {m.content}
                        </div>
                      </div>
                    );
                  }

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
                        {(() => {
                          const bubbleAvatar = resolveUserAvatar(m.sender) || resolveUserAvatar(bubbleUser);
                          return bubbleAvatar ? (
                            <img
                              src={bubbleAvatar}
                              alt={bubbleUser?.name || 'User'}
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
                          );
                        })()}
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
                    @{activeUser?.username} wants to send you a message
                  </div>
                  <div style={{ fontSize: 12.5, color: '#6b7280' }}>
                    Do you want to let them send you messages? They won't know you've seen it until you accept.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <FluidButton
                    onClick={() => {
                      if (onAcceptRequest) onAcceptRequest(conversation?.conversationId);
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
                      if (onBlockUser) onBlockUser(activeUser?.username);
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
              </GlassContainer>
            </div>
          ) : (
            /* Normal Input Form (either accepted, or sending the 1 invitation message) */
            <div style={{ padding: '16px 24px', backgroundColor: 'transparent', position: 'relative' }}>
              <EmojiPicker
                isOpen={showEmojiPicker}
                onClose={() => setShowEmojiPicker(false)}
                onSelectEmoji={handleInsertEmoji}
              />
              <form onSubmit={onSendMessage}>
                <GlassContainer
                  radius={9999}
                  innerStyle={{
                    padding: '6px 14px 6px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      padding: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: showEmojiPicker ? 1 : 0.75,
                      transition: 'transform 0.15s ease, opacity 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      if (!showEmojiPicker) e.currentTarget.style.opacity = '0.75';
                    }}
                    title="Choose emoji (Ctrl+Cmd+Space for system picker)"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={showEmojiPicker ? '#09090b' : '#3f3f46'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <path d="M15 8.5a1.5 1.5 0 0 1 1.5 1.5" />
                    </svg>
                  </button>
                  <input
                    ref={inputRef}
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
                      fontSize: 14.5,
                      flex: 1,
                      color: '#09090b',
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
