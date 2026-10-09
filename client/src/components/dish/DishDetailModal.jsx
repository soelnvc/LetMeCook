'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';
import EmojiPicker from '@/components/messaging/EmojiPicker';
import { apiFetch } from '@/lib/api';

/**
 * Check if text contains only emojis (copied from MessageArea)
 */
const isOnlyEmojis = (text) => {
  if (!text || typeof text !== 'string') return false;
  const clean = text.trim();
  if (!clean) return false;
  const emojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji_Modifier_Base}|\p{Emoji_Modifier}|\u200d|\ufe0f|\s)+$/u;
  return emojiRegex.test(clean);
};

/**
 * Determine dynamic emoji font size (copied from MessageArea)
 */
const getEmojiFontSize = (text) => {
  if (!text) return 48;
  try {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const segments = Array.from(segmenter.segment(text.trim())).filter((s) => s.segment.trim());
    const count = segments.length;
    if (count <= 1) return 48;
    if (count === 2) return 38;
    if (count === 3) return 32;
    return 26;
  } catch {
    const len = [...text.trim()].length;
    if (len <= 2) return 48;
    if (len <= 4) return 38;
    return 28;
  }
};

/**
 * Genre-specific vector icons for dish tickets
 */
function getGenreIcon(category = '', size = 26) {
  const cat = (category || '').toLowerCase().trim();

  if (cat === 'sport' || cat === 'sports' || cat === 'fitness') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="20" cy="20" r="15" />
        <line x1="5" y1="20" x2="35" y2="20" />
        <path d="M20 5a16 16 0 0 1 0 30" />
        <path d="M20 5a16 16 0 0 0 0 30" />
      </svg>
    );
  }

  if (cat === 'study' || cat === 'code' || cat === 'academics') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 31V9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v22a3 3 0 0 0-3-2H9a3 3 0 0 0-3 2z" />
        <path d="M34 31V9a3 3 0 0 0-3-3h-8a3 3 0 0 0-3 3v22a3 3 0 0 1 3-2h8a3 3 0 0 1 3 2z" />
        <line x1="20" y1="9" x2="20" y2="29" />
      </svg>
    );
  }

  if (cat === 'gaming' || cat === 'games' || cat === 'game') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="11" width="30" height="18" rx="7" />
        <line x1="14" y1="16" x2="14" y2="24" />
        <line x1="10" y1="20" x2="18" y2="20" />
        <circle cx="27" cy="18" r="1.5" fill="currentColor" />
        <circle cx="24" cy="22" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  if (cat === 'travel') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 6H8a4 4 0 0 0-4 4v16a4 4 0 0 0 4 4h24a4 4 0 0 0 4-4V10a4 4 0 0 0-4-4h-6" />
        <rect x="14" y="3" width="12" height="6" rx="2" />
        <circle cx="12" cy="22" r="3" />
        <circle cx="28" cy="22" r="3" />
      </svg>
    );
  }

  // Default: Dining & Food
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6v12a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4V6" />
      <line x1="12" y1="22" x2="12" y2="34" />
      <path d="M28 6v28" />
      <path d="M24 6h4a4 4 0 0 1 4 4v6h-8z" />
    </svg>
  );
}

export default function DishDetailModal({
  isOpen,
  dish,
  onClose,
  currentUser,
  connections = [],
  onJoinDish,
  onLeaveDish,
  onStartCooking,
  onMarkCooked,
  onDeleteDish,
  onViewProfile,
  onReportDish,
  onDishUpdated
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatError, setChatError] = useState('');

  // Floating dialogs & menus
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [toastMessage, setToastMessage] = useState('');

  const inputRef = useRef(null);
  const chatScrollRef = useRef(null);
  const optionsMenuRef = useRef(null);
  const onDishUpdatedRef = useRef(onDishUpdated);
  const isFetchingRef = useRef(false);

  // Keep latest callback ref without triggering effect re-executions
  useEffect(() => {
    onDishUpdatedRef.current = onDishUpdated;
  }, [onDishUpdated]);

  // Show transient toast notification
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Mount/unmount animation
  useEffect(() => {
    if (isOpen && dish) {
      setIsMounted(true);
      const timer = setTimeout(() => setIsVisible(true), 15);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsMounted(false);
        setMessages([]);
        setMessageInput('');
        setShowEmojiPicker(false);
        setShowOptionsMenu(false);
        setShowMembersModal(false);
        setShowInviteDialog(false);
        setShowRateModal(false);
        setChatError('');
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, dish]);

  // Close 3-dots menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target)) {
        setShowOptionsMenu(false);
      }
    };
    if (showOptionsMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [showOptionsMenu]);

  // Keyboard shortcut: Escape closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showEmojiPicker) {
          setShowEmojiPicker(false);
        } else if (showOptionsMenu) {
          setShowOptionsMenu(false);
        } else if (showMembersModal) {
          setShowMembersModal(false);
        } else if (showInviteDialog) {
          setShowInviteDialog(false);
        } else if (showRateModal) {
          setShowRateModal(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showEmojiPicker, showOptionsMenu, showMembersModal, showInviteDialog, showRateModal, onClose]);

  // Safely fetch and poll Dish Chat messages (no infinite loops)
  useEffect(() => {
    if (!isOpen || !dish?._id) return;
    let isCancelled = false;

    const doFetch = async (isSilent = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      if (!isSilent) setIsLoadingChat(true);

      try {
        const res = await apiFetch(`/dishes/${dish._id}/chat`);
        if (!isCancelled && res?.success && res.data) {
          setMessages(res.data.messages || []);
          if (res.data.dish && onDishUpdatedRef.current) {
            onDishUpdatedRef.current(res.data.dish);
          }
        }
      } catch (err) {
        if (!isCancelled && !isSilent) {
          console.error('Failed to load dish chat:', err);
        }
      } finally {
        isFetchingRef.current = false;
        if (!isCancelled && !isSilent) setIsLoadingChat(false);
      }
    };

    // Initial load
    doFetch(false);

    // Live polling every 4.5 seconds
    const timer = setInterval(() => {
      doFetch(true);
    }, 4500);

    return () => {
      isCancelled = true;
      clearInterval(timer);
    };
  }, [isOpen, dish?._id]);

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isMounted || !dish) return null;

  // Determine participant and creator roles
  const creatorObj = dish.creator || {};
  const creatorName = creatorObj.name || 'Anonymous Peer';
  const creatorUsername = creatorObj.username || 'user';
  const creatorAvatar = creatorObj.avatar;
  const creatorInstitute =
    typeof creatorObj.institute === 'object'
      ? creatorObj.institute?.name
      : creatorObj.institute || 'Campus Peer';

  const isCreator =
    (creatorObj._id && String(creatorObj._id) === String(currentUser?._id)) ||
    (creatorObj.username && creatorObj.username === currentUser?.username) ||
    String(creatorObj) === String(currentUser?._id);

  const participantsList = dish.participants || [];
  const isParticipant =
    participantsList.some(
      (p) => (p.user?._id || p.user)?.toString() === currentUser?._id?.toString()
    ) || isCreator;

  const isExpired = dish.status === 'cooked';
  const spotsLeft = dish.capacity?.unlimited
    ? '∞'
    : Math.max(0, (dish.capacity?.max || 4) - participantsList.length);

  // Insert emoji at cursor position (copied from MessageArea)
  const handleInsertEmoji = (emoji) => {
    const input = inputRef.current;
    if (!input) {
      setMessageInput((prev) => prev + emoji);
      return;
    }
    const start = input.selectionStart ?? messageInput.length;
    const end = input.selectionEnd ?? messageInput.length;
    const next = messageInput.substring(0, start) + emoji + messageInput.substring(end);
    setMessageInput(next);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  // Send a message to the group chat
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || isSending) return;

    if (isExpired) {
      triggerToast('Dish ticket has expired. Chat is archived.');
      return;
    }

    if (!isParticipant) {
      triggerToast('Join this dish to chat with members.');
      return;
    }

    const content = messageInput.trim();
    setMessageInput('');
    setIsSending(true);
    setChatError('');

    try {
      const res = await apiFetch(`/dishes/${dish._id}/chat/messages`, {
        method: 'POST',
        body: JSON.stringify({ content })
      });

      if (res && res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        setShowEmojiPicker(false);
      } else {
        setChatError(res?.message || 'Failed to send message');
      }
    } catch (err) {
      setChatError(err.message || 'Error sending message');
      setMessageInput(content); // restore on error
    } finally {
      setIsSending(false);
    }
  };

  // Quick invite helper
  const handleSendInvite = async (targetUsername) => {
    if (!targetUsername || isInviting) return;
    setIsInviting(true);
    try {
      await apiFetch(`/dishes/${dish._id}/chat/messages`, {
        method: 'POST',
        body: JSON.stringify({
          content: `@${currentUser?.username || 'Host'} invited @${targetUsername.replace('@', '')} to this dish table! 🎉`
        })
      });
      triggerToast(`Invited @${targetUsername.replace('@', '')}!`);
      setInviteUsername('');
      setShowInviteDialog(false);
    } catch (err) {
      triggerToast(err.message || 'Could not send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  // Share ticket helper
  const handleShareTicket = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}?dishId=${dish._id}` : '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      triggerToast('Ticket link copied to clipboard!');
    }
    setShowOptionsMenu(false);
  };

  // Submit rating helper
  const handleSubmitRating = () => {
    triggerToast(`Thanks for rating ${userRating} / 5 stars!`);
    setShowRateModal(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.48)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        padding: '20px',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            top: 24,
            zIndex: 1500,
            transform: 'translateY(0)',
            transition: 'transform 0.2s ease'
          }}
        >
          <GlassContainer
            radius={9999}
            innerStyle={{
              padding: '8px 20px',
              fontSize: 13,
              fontWeight: 600,
              color: '#09090b',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
            }}
          >
            <span>✓</span>
            <span>{toastMessage}</span>
          </GlassContainer>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN FULL-SIZE MODAL CONTAINER (92vw x 88vh Rectangular)  */}
      {/* ========================================================= */}
      <GlassContainer
        radius={28}
        style={{
          width: '92vw',
          maxWidth: 1240,
          height: '88vh',
          maxHeight: 860,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.28), 0 4px 16px rgba(0, 0, 0, 0.1)',
          transform: isVisible ? 'scale(1)' : 'scale(0.97)',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        innerStyle={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          height: '100%',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* ========================================================= */}
        {/* LEFT COLUMN: 35% OF POPUP (Ticket Profile, Details, Actions) */}
        {/* ========================================================= */}
        <div
          style={{
            width: '35%',
            minWidth: 340,
            maxWidth: 420,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            borderRight: '1px solid rgba(0, 0, 0, 0.08)',
            backgroundColor: 'transparent',
            boxSizing: 'border-box',
            position: 'relative'
          }}
        >
          {/* Scrollable Upper Area (Profile + Dish Details) */}
          <div
            className="custom-scrollbar"
            style={{
              padding: '24px 24px 16px 24px',
              overflowY: 'auto',
              flex: 1
            }}
          >
            {/* 1. TOP: PROFILE PART OF THE OWNER */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 16,
                borderBottom: '1px solid rgba(0, 0, 0, 0.07)',
                marginBottom: 18
              }}
            >
              <div
                onClick={() => {
                  if (onViewProfile && creatorObj) {
                    onViewProfile({
                      ...creatorObj,
                      avatar: creatorAvatar,
                      name: creatorName,
                      username: creatorUsername
                    });
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: onViewProfile ? 'pointer' : 'default'
                }}
              >
                {/* Creator Avatar */}
                {creatorAvatar ? (
                  <img
                    src={creatorAvatar}
                    alt={creatorName}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1.5px solid rgba(0, 0, 0, 0.1)',
                      flexShrink: 0
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: '#8257e5',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 17,
                      fontWeight: 800,
                      flexShrink: 0
                    }}
                  >
                    {(creatorName || 'U')[0].toUpperCase()}
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 15.5, fontWeight: 700, color: '#09090b', letterSpacing: '-0.02em' }}>
                      {creatorName}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 9999,
                        background: 'rgba(0, 0, 0, 0.08)',
                        color: '#09090b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px'
                      }}
                    >
                      Host
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: '#71717a', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>@{creatorUsername}</span>
                    {creatorInstitute && (
                      <>
                        <span>•</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600, color: '#3f3f46' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                          </svg>
                          {creatorInstitute}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MIDDLE: ALL DETAILS OF THE DISH WITH DESCRIPTION */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Category & Status Pill Bar (GlassContainers) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <GlassContainer
                  radius={9999}
                  innerStyle={{
                    padding: '5px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    color: '#09090b'
                  }}
                >
                  {getGenreIcon(dish.category, 14)}
                  <span>{dish.category}</span>
                </GlassContainer>

                <GlassContainer
                  radius={9999}
                  innerStyle={{
                    padding: '5px 12px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    color:
                      dish.status === 'cooked'
                        ? '#71717a'
                        : dish.status === 'cooking'
                        ? '#ea580c'
                        : '#16a34a'
                  }}
                >
                  {dish.status === 'cooked'
                    ? 'Cooked & Expired'
                    : dish.status === 'cooking'
                    ? 'Cooking Now'
                    : "Let's Cook"}
                </GlassContainer>
              </div>

              {/* Dish Description Box (GlassContainer) */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                  Description:
                </label>
                <GlassContainer
                  radius={16}
                  innerStyle={{
                    padding: '13px 15px',
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: '#09090b',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {dish.description}
                </GlassContainer>
              </div>

              {/* Grid of Key Ticket Specs (GlassContainers) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                {/* Capacity */}
                <GlassContainer
                  radius={16}
                  innerStyle={{
                    padding: '11px 13px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ fontSize: 11, color: '#71717a', fontWeight: 600 }}>Capacity</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#09090b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    {participantsList.length}/{dish.capacity?.max || 4} spots ({spotsLeft} left)
                  </div>
                </GlassContainer>

                {/* Join Mode */}
                <GlassContainer
                  radius={16}
                  innerStyle={{
                    padding: '11px 13px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ fontSize: 11, color: '#71717a', fontWeight: 600 }}>Access Mode</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#09090b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {dish.joinMode === 'auto' ? 'Auto-Join' : 'Approval Req.'}
                  </div>
                </GlassContainer>

                {/* Meetup / Area */}
                <GlassContainer
                  radius={16}
                  innerStyle={{
                    padding: '11px 13px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ fontSize: 11, color: '#71717a', fontWeight: 600 }}>Location</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#09090b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span title={dish.location?.areaName || 'Campus Spot'}>
                      {dish.location?.areaName || 'Campus Spot'}
                    </span>
                  </div>
                </GlassContainer>

                {/* Visibility */}
                <GlassContainer
                  radius={16}
                  innerStyle={{
                    padding: '11px 13px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ fontSize: 11, color: '#71717a', fontWeight: 600 }}>Network</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#09090b', marginTop: 2, textTransform: 'capitalize' }}>
                    {dish.visibility === 'institute' ? 'Institute Only' : 'Global Campus'}
                  </div>
                </GlassContainer>
              </div>
            </div>
          </div>

          {/* 3. BOTTOM BAR (35% COLUMN): LEFT = TIME & GREY INFO, RIGHT = ACTION BUTTONS + 3-DOTS */}
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            {/* Bottom Left: Time, Date & other small grey text things */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={{ fontSize: 11, color: '#71717a', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {dish.createdAt ? new Date(dish.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Today'}
              </span>
              <span style={{ fontSize: 10.5, color: '#a1a1aa', fontWeight: 500 }}>
                {isExpired ? 'Ticket Cooked • Archived' : 'Active Campus Ticket'}
              </span>
            </div>

            {/* Bottom Right: Action Buttons (Invite, Leave, Join, 3-dots) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {/* Not Joined Yet */}
              {!isParticipant && !isExpired && (
                <FluidButton
                  onClick={() => onJoinDish && onJoinDish(dish._id)}
                  style={{ padding: '8px 18px', fontSize: 12.5, fontWeight: 700 }}
                >
                  {dish.joinMode === 'auto' ? 'Join Dish' : 'Request'}
                </FluidButton>
              )}

              {/* Participant (Not Host) */}
              {isParticipant && !isCreator && !isExpired && (
                <>
                  <FluidButton
                    onClick={() => setShowInviteDialog(true)}
                    style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600 }}
                  >
                    Invite
                  </FluidButton>
                  <FluidButton
                    onClick={() => onLeaveDish && onLeaveDish(dish._id)}
                    style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600 }}
                  >
                    Leave
                  </FluidButton>
                </>
              )}

              {/* Host / Creator Actions */}
              {isCreator && !isExpired && (
                <>
                  <FluidButton
                    onClick={() => setShowInviteDialog(true)}
                    style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600 }}
                  >
                    Invite
                  </FluidButton>

                  {dish.status === 'lets_cook' && (
                    <FluidButton
                      onClick={() => onStartCooking && onStartCooking(dish._id)}
                      style={{ padding: '7px 14px', fontSize: 12, fontWeight: 700 }}
                    >
                      Cook
                    </FluidButton>
                  )}

                  {dish.status === 'cooking' && (
                    <FluidButton
                      onClick={() => onMarkCooked && onMarkCooked(dish._id)}
                      style={{ padding: '7px 14px', fontSize: 12, fontWeight: 700 }}
                    >
                      Done
                    </FluidButton>
                  )}
                </>
              )}

              {/* 3 Dot Options Button (FluidButton icon) */}
              <div style={{ position: 'relative' }} ref={optionsMenuRef}>
                <FluidButton
                  variant="icon"
                  type="button"
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  title="More options"
                  style={{
                    width: 34,
                    height: 34,
                    minWidth: 34,
                    minHeight: 34
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="19" cy="12" r="1.5" />
                    <circle cx="5" cy="12" r="1.5" />
                  </svg>
                </FluidButton>

                {/* Options Dropdown Menu */}
                {showOptionsMenu && (
                  <GlassContainer
                    radius={16}
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 8px)',
                      right: 0,
                      width: 170,
                      zIndex: 1300,
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)'
                    }}
                    innerStyle={{
                      padding: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleShareTicket}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: 'none',
                        background: 'transparent',
                        color: '#09090b',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontFamily: 'inherit',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                      Share Ticket
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowOptionsMenu(false);
                        setShowRateModal(true);
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: 'none',
                        background: 'transparent',
                        color: '#09090b',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontFamily: 'inherit',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      Rate Experience
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowOptionsMenu(false);
                        if (onReportDish) onReportDish(dish);
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: 'none',
                        background: 'transparent',
                        color: '#dc2626',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontFamily: 'inherit',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                        <line x1="4" y1="22" x2="4" y2="15" />
                      </svg>
                      Report Dish
                    </button>

                    {isCreator && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          if (window.confirm('Are you sure you want to cancel and delete this dish?')) {
                            if (onDeleteDish) onDeleteDish(dish._id);
                            onClose();
                          }
                        }}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 10,
                          border: 'none',
                          background: 'transparent',
                          color: '#dc2626',
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontFamily: 'inherit',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(220, 38, 38, 0.08)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete Dish
                      </button>
                    )}
                  </GlassContainer>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: 65% OF POPUP (Header with Member PFPs & Chat) */}
        {/* ========================================================= */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: 'transparent',
            position: 'relative'
          }}
        >
          {/* TOP 10%: NAME OF DISH WITH PFP OF MEMBERS (MAX TOP 7, + SIGN TO VIEW FULL LIST) */}
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              height: 72,
              boxSizing: 'border-box',
              flexShrink: 0,
              backgroundColor: 'transparent'
            }}
          >
            {/* Left: Name of the Dish with Glass Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <GlassContainer
                radius={12}
                style={{ flexShrink: 0 }}
                innerStyle={{
                  width: 38,
                  height: 38,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#09090b'
                }}
              >
                {getGenreIcon(dish.category, 20)}
              </GlassContainer>

              <div style={{ minWidth: 0 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16.5,
                    fontWeight: 700,
                    color: '#09090b',
                    letterSpacing: '-0.02em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={dish.description}
                >
                  {dish.description ? (dish.description.length > 40 ? dish.description.slice(0, 40) + '...' : dish.description) : 'Dish Ticket'}
                </h3>
                <div style={{ fontSize: 12, color: '#71717a', marginTop: 1, fontWeight: 500 }}>
                  {participantsList.length} peer{participantsList.length === 1 ? '' : 's'} joined • {isExpired ? 'Ticket Expired' : 'Active Dish Room'}
                </div>
              </div>
            </div>

            {/* Right: PFPs of Members (Max 7, + Sign) and Close Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Member PFPs Avatar Group in GlassContainer */}
              <GlassContainer
                radius={9999}
                onClick={() => setShowMembersModal(true)}
                title="Click to view all members"
                style={{ cursor: 'pointer' }}
                innerStyle={{
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginRight: participantsList.length > 7 ? 6 : 0 }}>
                  {participantsList.slice(0, 7).map((p, idx) => {
                    const u = p.user || {};
                    const avatar = u.avatar;
                    const uname = u.name || u.username || 'Peer';
                    return (
                      <div
                        key={u._id || idx}
                        style={{
                          marginLeft: idx === 0 ? 0 : -8,
                          zIndex: 10 - idx,
                          position: 'relative'
                        }}
                      >
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={uname}
                            title={`@${u.username || 'user'}`}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid #ffffff',
                              display: 'block'
                            }}
                          />
                        ) : (
                          <div
                            title={`@${u.username || 'user'}`}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              backgroundColor: '#a1a1aa',
                              color: '#ffffff',
                              border: '2px solid #ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 10,
                              fontWeight: 700
                            }}
                          >
                            {(uname[0] || 'U').toUpperCase()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* If more than 7, display + sign */}
                {participantsList.length > 7 && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#09090b',
                      padding: '0 4px'
                    }}
                  >
                    +{participantsList.length - 7}
                  </span>
                )}
              </GlassContainer>

              {/* Close Button (FluidButton icon) */}
              <FluidButton
                variant="icon"
                type="button"
                onClick={onClose}
                title="Close"
                style={{
                  width: 34,
                  height: 34,
                  minWidth: 34,
                  minHeight: 34
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </FluidButton>
            </div>
          </div>

          {/* ========================================================= */}
          {/* ALL OTHER PART: DISH CHAT (Copied from MessageArea)       */}
          {/* ========================================================= */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: 'transparent'
            }}
          >
            {/* Expired Warning Banner: Frosted glass with red accent */}
            {isExpired && (
              <div style={{ padding: '12px 24px 0 24px' }}>
                <div
                  style={{
                    padding: '11px 18px',
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, rgba(254, 226, 226, 0.42) 0%, rgba(255, 255, 255, 0.6) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1.5px solid rgba(239, 68, 68, 0.28)',
                    boxShadow: '0 4px 16px rgba(239, 68, 68, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: '#dc2626'
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>This dish ticket has expired and chat is archived.</span>
                </div>
              </div>
            )}

            {!isParticipant && !isExpired && (
              <div style={{ padding: '12px 24px 0 24px' }}>
                <div
                  style={{
                    padding: '11px 18px',
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.45) 0%, rgba(255, 255, 255, 0.6) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1.5px solid rgba(59, 130, 246, 0.28)',
                    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: '#2563eb'
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                  <span>Join this dish table to participate in the group chat!</span>
                </div>
              </div>
            )}

            {/* Scrollable Chat Messages Feed */}
            <div
              ref={chatScrollRef}
              className="custom-scrollbar"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}
            >
              {/* Dish Room Creation System Pill */}
              <div style={{ textAlign: 'center', margin: '4px 0 10px 0' }}>
                <GlassContainer
                  radius={9999}
                  style={{ display: 'inline-block' }}
                  innerStyle={{
                    padding: '5px 16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: '#71717a'
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Dish chat room created • Host: @{creatorUsername}</span>
                </GlassContainer>
              </div>

              {/* Empty / Loading State */}
              {isLoadingChat && messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: '#888888', fontSize: 13.5 }}>
                  Loading dish group messages...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: '#888888', fontSize: 14 }}>
                  No messages yet. Say hello to your dish crew!
                </div>
              ) : (
                messages.map((msg, idx) => {
                  // System announcement
                  if (msg.isSystem) {
                    return (
                      <div key={msg._id || idx} style={{ textAlign: 'center', margin: '4px 0' }}>
                        <GlassContainer
                          radius={9999}
                          style={{ display: 'inline-block' }}
                          innerStyle={{
                            padding: '4px 14px',
                            fontSize: 11,
                            fontWeight: 500,
                            color: '#71717a'
                          }}
                        >
                          {msg.content}
                        </GlassContainer>
                      </div>
                    );
                  }

                  const sender = msg.sender || {};
                  const isOwn = (sender._id || sender).toString() === currentUser?._id?.toString();
                  const senderName = sender.name || sender.username || 'Peer';
                  const senderAvatar = sender.avatar;
                  const isEmojiMsg = isOnlyEmojis(msg.content);
                  const emojiSize = isEmojiMsg ? getEmojiFontSize(msg.content) : 15;

                  if (isOwn) {
                    // Own message (aligned right)
                    if (isEmojiMsg) {
                      return (
                        <div
                          key={msg._id || idx}
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
                          {msg.content}
                        </div>
                      );
                    }

                    return (
                      <GlassContainer
                        key={msg._id || idx}
                        radius={24}
                        style={{ alignSelf: 'flex-end', maxWidth: '72%' }}
                        innerStyle={{
                          padding: '13px 20px',
                          color: '#000000',
                          fontSize: 14.5,
                          lineHeight: 1.45
                        }}
                      >
                        {msg.content}
                      </GlassContainer>
                    );
                  } else {
                    // Other peer's message (aligned left with avatar & name)
                    if (isEmojiMsg) {
                      return (
                        <div
                          key={msg._id || idx}
                          style={{
                            alignSelf: 'flex-start',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 4
                          }}
                        >
                          <div
                            onClick={() => onViewProfile && onViewProfile(sender)}
                            style={{ cursor: onViewProfile ? 'pointer' : 'default', flexShrink: 0 }}
                            title={`@${sender.username || 'user'}`}
                          >
                            {senderAvatar ? (
                              <img
                                src={senderAvatar}
                                alt={senderName}
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
                                {(senderName[0] || 'U').toUpperCase()}
                              </div>
                            )}
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
                            {msg.content}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg._id || idx}
                        style={{
                          alignSelf: 'flex-start',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          maxWidth: '75%'
                        }}
                      >
                        <div
                          onClick={() => onViewProfile && onViewProfile(sender)}
                          style={{ cursor: onViewProfile ? 'pointer' : 'default', flexShrink: 0, marginTop: 4 }}
                          title={`@${sender.username || 'user'}`}
                        >
                          {senderAvatar ? (
                            <img
                              src={senderAvatar}
                              alt={senderName}
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
                              {(senderName[0] || 'U').toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#52525b', paddingLeft: 6 }}>
                            {senderName}
                          </span>
                          <GlassContainer
                            radius={24}
                            style={{ flex: 1 }}
                            innerStyle={{
                              padding: '13px 20px',
                              color: '#000000',
                              fontSize: 14.5,
                              lineHeight: 1.45
                            }}
                          >
                            {msg.content}
                          </GlassContainer>
                        </div>
                      </div>
                    );
                  }
                })
              )}
            </div>

            {/* Error banner if send failed */}
            {chatError && (
              <div style={{ padding: '8px 24px' }}>
                <GlassContainer
                  radius={12}
                  innerStyle={{
                    padding: '6px 14px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#dc2626',
                    fontSize: 12,
                    fontWeight: 600
                  }}
                >
                  {chatError}
                </GlassContainer>
              </div>
            )}

            {/* Chat Input Bar (Copied directly from MessageArea.jsx) */}
            <div style={{ padding: '16px 24px', backgroundColor: 'transparent', position: 'relative' }}>
              <EmojiPicker
                isOpen={showEmojiPicker}
                onClose={() => setShowEmojiPicker(false)}
                onSelectEmoji={handleInsertEmoji}
              />
              <form onSubmit={handleSendMessage}>
                <GlassContainer
                  radius={9999}
                  innerStyle={{
                    padding: '6px 14px 6px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}
                >
                  {/* Emoji Picker Button */}
                  <button
                    type="button"
                    disabled={isExpired || !isParticipant}
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: isExpired || !isParticipant ? 'not-allowed' : 'pointer',
                      padding: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: isExpired || !isParticipant ? 0.4 : showEmojiPicker ? 1 : 0.75,
                      transition: 'transform 0.15s ease, opacity 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpired && isParticipant) {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.opacity = '1';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpired && isParticipant) {
                        e.currentTarget.style.transform = 'scale(1)';
                        if (!showEmojiPicker) e.currentTarget.style.opacity = '0.75';
                      }
                    }}
                    title="Choose emoji"
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

                  {/* Message Text Input */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={
                      isExpired
                        ? 'This dish ticket has expired and chat is archived.'
                        : !isParticipant
                        ? 'Join dish to participate in group chat...'
                        : 'Type a Message...'
                    }
                    disabled={isExpired || !isParticipant || isSending}
                    maxLength={2000}
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

                  {/* Send Button (FluidButton icon from MessageArea) */}
                  <FluidButton
                    type="submit"
                    variant="icon"
                    disabled={isExpired || !isParticipant || isSending || !messageInput.trim()}
                    style={{
                      width: 36,
                      height: 36,
                      minWidth: 36,
                      minHeight: 36,
                      flexShrink: 0
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </FluidButton>
                </GlassContainer>
              </form>
            </div>
          </div>
        </div>
      </GlassContainer>

      {/* ========================================================= */}
      {/* FLOATING SUB-MODAL 1: FULL MEMBERS LIST                   */}
      {/* ========================================================= */}
      {showMembersModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: 1350,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMembersModal(false);
          }}
        >
          <GlassContainer
            radius={22}
            style={{ width: 380, maxWidth: '92vw', boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)' }}
            innerStyle={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#09090b' }}>
                  Dish Members ({participantsList.length})
                </h3>
              </div>
              <FluidButton
                variant="icon"
                onClick={() => setShowMembersModal(false)}
                style={{ width: 30, height: 30, minWidth: 30, minHeight: 30 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </FluidButton>
            </div>

            <div className="custom-scrollbar" style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {participantsList.map((p, idx) => {
                const u = p.user || {};
                const isHost = (u._id || u).toString() === (dish.creator?._id || dish.creator).toString();
                return (
                  <GlassContainer
                    key={u._id || idx}
                    radius={14}
                    onClick={() => {
                      if (onViewProfile) {
                        setShowMembersModal(false);
                        onViewProfile(u);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                    innerStyle={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#8257e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                          {((u.name || u.username || 'U')[0]).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#09090b' }}>{u.name || u.username}</div>
                        <div style={{ fontSize: 11, color: '#71717a' }}>@{u.username || 'user'}</div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 9999,
                        background: isHost ? '#09090b' : 'rgba(0, 0, 0, 0.06)',
                        color: isHost ? '#ffffff' : '#52525b'
                      }}
                    >
                      {isHost ? 'Host' : 'Member'}
                    </span>
                  </GlassContainer>
                );
              })}
            </div>
          </GlassContainer>
        </div>
      )}

      {/* ========================================================= */}
      {/* FLOATING SUB-MODAL 2: INVITE PEER DIALOG                   */}
      {/* ========================================================= */}
      {showInviteDialog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: 1350,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowInviteDialog(false);
          }}
        >
          <GlassContainer
            radius={22}
            style={{ width: 420, maxWidth: '92vw', boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)' }}
            innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#09090b' }}>
                Invite Peers to Dish
              </h3>
              <FluidButton
                variant="icon"
                onClick={() => setShowInviteDialog(false)}
                style={{ width: 30, height: 30, minWidth: 30, minHeight: 30 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </FluidButton>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendInvite(inviteUsername);
              }}
              style={{ display: 'flex', gap: 8 }}
            >
              <GlassContainer radius={14} style={{ flex: 1 }} innerStyle={{ padding: '0 12px', height: 40, display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Enter @username to invite..."
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#09090b', fontFamily: 'inherit' }}
                />
              </GlassContainer>
              <FluidButton type="submit" disabled={isInviting || !inviteUsername.trim()} style={{ padding: '8px 16px', fontSize: 12.5, fontWeight: 700 }}>
                {isInviting ? 'Sending...' : 'Invite'}
              </FluidButton>
            </form>

            {/* Quick Connections List */}
            {connections && connections.length > 0 && (
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#71717a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Quick Invite Connections:
                </div>
                <div className="custom-scrollbar" style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {connections.map((c, i) => {
                    const u = c.user || c;
                    const isAlreadyIn = participantsList.some(
                      (p) => (p.user?._id || p.user)?.toString() === u._id?.toString()
                    );
                    return (
                      <GlassContainer
                        key={u._id || i}
                        radius={12}
                        innerStyle={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#8257e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                              {((u.name || u.username || 'U')[0]).toUpperCase()}
                            </div>
                          )}
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#09090b' }}>
                            @{u.username}
                          </span>
                        </div>

                        {isAlreadyIn ? (
                          <span style={{ fontSize: 11, color: '#71717a', fontWeight: 600 }}>In Dish</span>
                        ) : (
                          <FluidButton
                            onClick={() => handleSendInvite(u.username)}
                            style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700 }}
                          >
                            Invite
                          </FluidButton>
                        )}
                      </GlassContainer>
                    );
                  })}
                </div>
              </div>
            )}
          </GlassContainer>
        </div>
      )}

      {/* ========================================================= */}
      {/* FLOATING SUB-MODAL 3: RATE & REVIEW DIALOG                 */}
      {/* ========================================================= */}
      {showRateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: 1350,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowRateModal(false);
          }}
        >
          <GlassContainer
            radius={22}
            style={{ width: 360, maxWidth: '92vw', boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)' }}
            innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#09090b' }}>
                Rate Dish Experience
              </h3>
              <FluidButton
                variant="icon"
                onClick={() => setShowRateModal(false)}
                style={{ width: 28, height: 28, minWidth: 28, minHeight: 28 }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </FluidButton>
            </div>

            <p style={{ margin: 0, fontSize: 12.5, color: '#71717a' }}>
              How was your experience participating in @{creatorUsername}'s dish?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '8px 0' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setUserRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    color: star <= userRating ? '#f59e0b' : '#d4d4d8',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill={star <= userRating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 4 }}>
              <FluidButton onClick={() => setShowRateModal(false)} style={{ padding: '8px 16px', fontSize: 12.5, fontWeight: 600 }}>
                Cancel
              </FluidButton>
              <FluidButton onClick={handleSubmitRating} style={{ padding: '8px 20px', fontSize: 12.5, fontWeight: 700 }}>
                Submit Rating
              </FluidButton>
            </div>
          </GlassContainer>
        </div>
      )}
    </div>
  );
}
