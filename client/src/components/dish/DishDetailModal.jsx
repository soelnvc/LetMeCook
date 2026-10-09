'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';
import EmojiPicker from '@/components/messaging/EmojiPicker';
import { apiFetch } from '@/lib/api';

/**
 * Genre-specific vector icons for dish tickets
 */
function getGenreIcon(category = '', size = 28) {
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

  const chatScrollRef = useRef(null);
  const pollTimerRef = useRef(null);
  const optionsMenuRef = useRef(null);

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
        setShowOptionsMenu(false);
        setShowInviteDialog(false);
        setShowMembersModal(false);
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

  // Fetch Dish Chat messages
  const fetchChat = useCallback(async (isSilent = false) => {
    if (!dish?._id) return;
    if (!isSilent) setIsLoadingChat(true);

    try {
      const res = await apiFetch(`/dishes/${dish._id}/chat`);
      if (res && res.success && res.data) {
        setMessages(res.data.messages || []);
        // Check if dish status updated
        if (res.data.dish && onDishUpdated) {
          onDishUpdated(res.data.dish);
        }
      }
    } catch (err) {
      if (!isSilent) {
        console.error('Failed to load dish chat:', err);
      }
    } finally {
      if (!isSilent) setIsLoadingChat(false);
    }
  }, [dish?._id, onDishUpdated]);

  // Initialize and poll chat while modal is open
  useEffect(() => {
    if (isOpen && dish?._id) {
      fetchChat(false);

      // Start live polling every 3.5 seconds
      pollTimerRef.current = setInterval(() => {
        fetchChat(true);
      }, 3500);

      return () => {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      };
    }
  }, [isOpen, dish?._id, fetchChat]);

  // Auto-scroll chat to bottom when messages update
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
  const isParticipant = participantsList.some(
    (p) => (p.user?._id || p.user)?.toString() === currentUser?._id?.toString()
  ) || isCreator;

  const isExpired = dish.status === 'cooked';
  const spotsLeft = dish.capacity?.unlimited
    ? '∞'
    : Math.max(0, (dish.capacity?.max || 4) - participantsList.length);

  // Send a message to the group chat
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || isSending) return;

    if (isExpired) {
      triggerToast('Dish ticket has expired. Chat is closed.');
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
        throw new Error(res?.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setChatError(err.message || 'Failed to send message');
      setMessageInput(content); // restore input
    } finally {
      setIsSending(false);
    }
  };

  // Quick invite handler
  const handleSendInvite = async (targetUsername) => {
    const uname = (targetUsername || inviteUsername || '').trim().replace(/^@/, '');
    if (!uname) return;

    setIsInviting(true);
    try {
      const res = await apiFetch(`/dishes/${dish._id}/invite`, {
        method: 'POST',
        body: JSON.stringify({ username: uname })
      });

      if (res && (res.success || res.message)) {
        triggerToast(`Invitation sent to @${uname}!`);
        setInviteUsername('');
        setShowInviteDialog(false);
      } else {
        throw new Error(res?.message || 'Failed to send invitation');
      }
    } catch (err) {
      triggerToast(err.message || 'Could not send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  // Copy shareable ticket link
  const handleShareTicket = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/?dish=${dish._id}`;
      navigator.clipboard.writeText(url).then(
        () => triggerToast('Ticket link copied to clipboard!'),
        () => triggerToast(`Dish ID: ${dish._id}`)
      );
    }
    setShowOptionsMenu(false);
  };

  // Rate dish submission
  const handleSubmitRating = () => {
    triggerToast(`Thanks! You rated this dish ${userRating}/5 stars.`);
    setShowRateModal(false);
    setShowOptionsMenu(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        boxSizing: 'border-box',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1400,
            background: '#09090b',
            color: '#ffffff',
            padding: '10px 22px',
            borderRadius: 9999,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Main Large Rectangular Modal Box */}
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
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.28)',
          transform: isVisible ? 'scale(1)' : 'scale(0.96)',
          transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        innerStyle={{
          padding: 0,
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box'
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
            backgroundColor: 'rgba(255, 255, 255, 0.38)',
            boxSizing: 'border-box',
            position: 'relative'
          }}
        >
          {/* Scrollable Upper Area (Profile + Dish Details) */}
          <div
            className="custom-scrollbar"
            style={{
              padding: '26px 26px 16px 26px',
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
                      width: 46,
                      height: 46,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1.5px solid rgba(0, 0, 0, 0.1)',
                      flexShrink: 0
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: '50%',
                      backgroundColor: '#f97316',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      fontWeight: 800,
                      flexShrink: 0
                    }}
                  >
                    {(creatorName || 'U')[0].toUpperCase()}
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em' }}>
                      {creatorName}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 9999,
                        background: 'rgba(0, 0, 0, 0.07)',
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
              {/* Category & Status Pill Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 12px', borderRadius: 9999, background: 'rgba(0, 0, 0, 0.06)', color: '#09090b', fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
                  {getGenreIcon(dish.category, 14)}
                  <span>{dish.category}</span>
                </div>

                <div
                  style={{
                    padding: '4px 12px',
                    borderRadius: 9999,
                    fontSize: 11.5,
                    fontWeight: 700,
                    backgroundColor:
                      dish.status === 'cooked'
                        ? 'rgba(113, 113, 122, 0.14)'
                        : dish.status === 'cooking'
                        ? 'rgba(249, 115, 22, 0.14)'
                        : 'rgba(34, 197, 94, 0.14)',
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
                </div>
              </div>

              {/* Dish Description Box */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                  Description:
                </label>
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: '#09090b',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    padding: '12px 14px',
                    borderRadius: 14,
                    border: '1px solid rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {dish.description}
                </div>
              </div>

              {/* Grid of Key Ticket Specs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                {/* Capacity */}
                <div style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255, 255, 255, 0.45)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ fontSize: 11, color: '#71717a', fontWeight: 600 }}>Capacity</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#09090b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    {participantsList.length}/{dish.capacity?.max || 4} spots ({spotsLeft} left)
                  </div>
                </div>

                {/* Join Mode */}
                <div style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255, 255, 255, 0.45)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ fontSize: 11, color: '#71717a', fontWeight: 600 }}>Access Mode</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#09090b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {dish.joinMode === 'auto' ? 'Auto-Join' : 'Approval Req.'}
                  </div>
                </div>

                {/* Meetup / Area */}
                <div style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255, 255, 255, 0.45)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ fontSize: 11, color: '#71717a', fontWeight: 600 }}>Location</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#09090b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{dish.location?.areaName || 'Campus Spot'}</span>
                  </div>
                </div>

                {/* Visibility */}
                <div style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255, 255, 255, 0.45)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ fontSize: 11, color: '#71717a', fontWeight: 600 }}>Network</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#09090b', marginTop: 2, textTransform: 'capitalize' }}>
                    {dish.visibility === 'institute' ? 'Institute Only' : 'Global Campus'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. BOTTOM BAR (35% COLUMN): LEFT = TIME & GREY INFO, RIGHT = ACTION BUTTONS + 3-DOTS */}
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
              backgroundColor: 'rgba(255, 255, 255, 0.55)',
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

            {/* Bottom Right: Invite, Leave / Status action, and 3-dot options menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
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

              {/* 3 Dot Options Button (Rate, Report, Share, Delete) */}
              <div style={{ position: 'relative' }} ref={optionsMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  title="More options"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    background: 'rgba(255, 255, 255, 0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#09090b',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.75)')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="19" cy="12" r="1.5" />
                    <circle cx="5" cy="12" r="1.5" />
                  </svg>
                </button>

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
                        borderRadius: 8,
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
                        fontFamily: 'inherit'
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
                        borderRadius: 8,
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
                        fontFamily: 'inherit'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      Rate & Review
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowOptionsMenu(false);
                        if (onReportDish) onReportDish(dish);
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontFamily: 'inherit'
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
                          borderRadius: 8,
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
                          fontFamily: 'inherit'
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
            backgroundColor: 'rgba(255, 255, 255, 0.22)',
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
              backgroundColor: 'rgba(255, 255, 255, 0.45)'
            }}
          >
            {/* Left: Name of the Dish */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: 'rgba(0, 0, 0, 0.06)',
                  color: '#09090b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {getGenreIcon(dish.category, 20)}
              </div>

              <div style={{ minWidth: 0 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 800,
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
                <div style={{ fontSize: 11.5, color: '#71717a', marginTop: 1 }}>
                  {participantsList.length} peer{participantsList.length === 1 ? '' : 's'} joined • {isExpired ? 'Ticket Expired' : 'Active Dish Room'}
                </div>
              </div>
            </div>

            {/* Right: PFPs of Members (Max 7, + Sign) and Close Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Member PFPs Avatar Group */}
              <div
                onClick={() => setShowMembersModal(true)}
                title="Click to view all members"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 9999,
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.65)')}
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
              </div>

              {/* Close Button (X) */}
              <button
                type="button"
                onClick={onClose}
                title="Close"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#09090b',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* ALL OTHER PART: DISH CHAT                                 */}
          {/* ========================================================= */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Expired or Non-Participant Warning Banner */}
            {isExpired && (
              <div
                style={{
                  padding: '9px 18px',
                  background: 'rgba(244, 63, 94, 0.08)',
                  borderBottom: '1px solid rgba(244, 63, 94, 0.2)',
                  color: '#e11d48',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  justifyContent: 'center'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                This dish ticket has expired (Cooked). Group chat is archived and read-only.
              </div>
            )}

            {!isParticipant && !isExpired && (
              <div
                style={{
                  padding: '9px 18px',
                  background: 'rgba(59, 130, 246, 0.08)',
                  borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
                  color: '#2563eb',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  justifyContent: 'center'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                You are viewing this dish. Join to participate in the real-time group chat!
              </div>
            )}

            {/* Scrollable Chat Messages Area */}
            <div
              ref={chatScrollRef}
              className="custom-scrollbar"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              {/* System Info Bubble */}
              <div style={{ textAlign: 'center', margin: '8px 0 14px 0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 14px',
                    borderRadius: 9999,
                    background: 'rgba(0, 0, 0, 0.05)',
                    color: '#71717a',
                    fontSize: 11,
                    fontWeight: 600
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Dish chat created • Host: @{creatorUsername}
                </span>
              </div>

              {/* Messages Feed */}
              {isLoadingChat && messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#71717a', fontSize: 13 }}>
                  Loading dish group messages...
                </div>
              ) : (
                messages.map((msg, idx) => {
                  if (msg.isSystem) {
                    return (
                      <div key={msg._id || idx} style={{ textAlign: 'center', margin: '4px 0' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 12px',
                            borderRadius: 9999,
                            background: 'rgba(0, 0, 0, 0.04)',
                            color: '#71717a',
                            fontSize: 11,
                            fontWeight: 500
                          }}
                        >
                          {msg.content}
                        </span>
                      </div>
                    );
                  }

                  const sender = msg.sender || {};
                  const isOwn = (sender._id || sender).toString() === currentUser?._id?.toString();
                  const senderName = sender.name || sender.username || 'Peer';
                  const senderAvatar = sender.avatar;

                  return (
                    <div
                      key={msg._id || idx}
                      style={{
                        display: 'flex',
                        flexDirection: isOwn ? 'row-reverse' : 'row',
                        alignItems: 'flex-end',
                        gap: 10,
                        maxWidth: '82%',
                        alignSelf: isOwn ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {/* Sender Avatar for others */}
                      {!isOwn && (
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
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '1px solid rgba(0, 0, 0, 0.08)'
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                backgroundColor: '#71717a',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 10,
                                fontWeight: 700
                              }}
                            >
                              {(senderName[0] || 'U').toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Message Content Bubble */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                        {!isOwn && (
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#71717a', marginBottom: 2, paddingLeft: 4 }}>
                            {senderName}
                          </span>
                        )}

                        <div
                          style={{
                            padding: '9px 15px',
                            borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            background: isOwn ? '#09090b' : 'rgba(255, 255, 255, 0.85)',
                            color: isOwn ? '#ffffff' : '#09090b',
                            fontSize: 13.5,
                            lineHeight: 1.45,
                            wordBreak: 'break-word',
                            boxShadow: isOwn
                              ? '0 2px 8px rgba(0, 0, 0, 0.16)'
                              : '0 2px 8px rgba(0, 0, 0, 0.04)',
                            border: isOwn ? 'none' : '1px solid rgba(0, 0, 0, 0.06)'
                          }}
                        >
                          {msg.content}
                        </div>

                        <span style={{ fontSize: 9.5, color: '#a1a1aa', marginTop: 2, padding: '0 4px' }}>
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Error banner if send failed */}
            {chatError && (
              <div style={{ padding: '6px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', fontSize: 11.5, fontWeight: 600 }}>
                {chatError}
              </div>
            )}

            {/* Chat Input Bar */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                backgroundColor: 'rgba(255, 255, 255, 0.65)',
                position: 'relative'
              }}
            >
              {/* Emoji Picker Popup */}
              {showEmojiPicker && (
                <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', right: 20, zIndex: 1300 }}>
                  <EmojiPicker
                    onSelect={(emoji) => {
                      setMessageInput((prev) => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </div>
              )}

              <form onSubmit={handleSendMessage} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Text input inside GlassContainer */}
                <GlassContainer
                  radius={16}
                  style={{ flex: 1 }}
                  innerStyle={{
                    padding: '0 14px',
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    boxSizing: 'border-box'
                  }}
                >
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={
                      isExpired
                        ? 'Dish is cooked • Chat is closed'
                        : !isParticipant
                        ? 'Join dish to participate in group chat...'
                        : 'Message your dish crew...'
                    }
                    disabled={isExpired || !isParticipant || isSending}
                    maxLength={2000}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: 13.5,
                      color: '#09090b',
                      fontFamily: 'inherit'
                    }}
                  />

                  {/* Emoji Button */}
                  <button
                    type="button"
                    disabled={isExpired || !isParticipant}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    title="Insert emoji"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: isExpired || !isParticipant ? 'not-allowed' : 'pointer',
                      color: showEmojiPicker ? '#09090b' : '#71717a',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: isExpired || !isParticipant ? 0.4 : 1
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                  </button>
                </GlassContainer>

                {/* Send Button: Normal grey glass FluidButton */}
                <FluidButton
                  type="submit"
                  disabled={isExpired || !isParticipant || isSending || !messageInput.trim()}
                  style={{
                    padding: '10px 18px',
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span>Send</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </FluidButton>
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
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#09090b' }}>
                  Dish Members ({participantsList.length})
                </h3>
              </div>
              <button
                onClick={() => setShowMembersModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="custom-scrollbar" style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {participantsList.map((p, idx) => {
                const u = p.user || {};
                const isHost = (u._id || u).toString() === (dish.creator?._id || dish.creator).toString();
                return (
                  <div
                    key={u._id || idx}
                    onClick={() => {
                      if (onViewProfile) {
                        setShowMembersModal(false);
                        onViewProfile(u);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#71717a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
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
                  </div>
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
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#09090b' }}>
                Invite Peers to Dish
              </h3>
              <button
                onClick={() => setShowInviteDialog(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
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
                      <div
                        key={u._id || i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 10px',
                          borderRadius: 10,
                          background: 'rgba(255, 255, 255, 0.45)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#71717a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
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
                      </div>
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
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#09090b' }}>
              Rate Dish Experience
            </h3>
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
