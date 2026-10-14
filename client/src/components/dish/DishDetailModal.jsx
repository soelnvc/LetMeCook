'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';
import EmojiPicker from '@/components/messaging/EmojiPicker';
import { apiFetch } from '@/lib/api';
import { useConfirm } from '@/context/ConfirmContext';
import { useToast } from '@/context/ToastContext';

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
  if (!text) return 30;
  try {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const segments = Array.from(segmenter.segment(text.trim())).filter((s) => s.segment.trim());
    const count = segments.length;
    if (count <= 1) return 30;
    if (count === 2) return 24;
    if (count === 3) return 20;
    return 18;
  } catch {
    const len = [...text.trim()].length;
    if (len <= 2) return 30;
    if (len <= 4) return 24;
    return 18;
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
  dish: propDish,
  initialShowMembers = false,
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
  const [localDish, setLocalDish] = useState(propDish);
  useEffect(() => {
    setLocalDish(propDish);
  }, [propDish]);
  const dish = localDish || propDish || {};

  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mobileTab, setMobileTab] = useState('details'); // 'details' | 'chat'

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
  const [actionLoadingUserId, setActionLoadingUserId] = useState(null);
  const [actionLoadingRequestId, setActionLoadingRequestId] = useState(null);

  const { confirm } = useConfirm();
  const { showStatus, showError } = useToast();

  const inputRef = useRef(null);
  const chatScrollRef = useRef(null);
  const optionsMenuRef = useRef(null);
  const onDishUpdatedRef = useRef(onDishUpdated);
  const isFetchingRef = useRef(false);

  // Keep latest callback ref without triggering effect re-executions
  useEffect(() => {
    onDishUpdatedRef.current = onDishUpdated;
  }, [onDishUpdated]);

  // Show transient toast notification via centered response toast
  const triggerToast = (msg, isError = false) => {
    if (!msg) return;
    if (isError || (typeof msg === 'string' && (msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('error') || msg.toLowerCase().includes('could not')))) {
      showError(msg);
    } else {
      showStatus(msg);
    }
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

  // Support direct opening of Dish Table Directory (e.g. from Join Request notification)
  useEffect(() => {
    if (isOpen && initialShowMembers) {
      setShowMembersModal(true);
    }
  }, [isOpen, initialShowMembers]);

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

  const invitedList = dish.invitedUsers || [];
  const isInvited =
    !isParticipant &&
    invitedList.some((inv) => {
      const u = inv.user?._id || inv.user;
      return u && String(u) === String(currentUser?._id);
    });

  const mutedList = dish.mutedUsers || [];
  const isMuted = mutedList.some((u) => {
    const id = u?._id || u;
    return id && String(id) === String(currentUser?._id);
  });

  const isExpired = dish.status === 'cooked';
  const isUnlocked = isParticipant || isCreator || isExpired;
  const pendingRequestsList = (dish.requests || []).filter((r) => r.status === 'pending');
  const hasPendingReq =
    !isParticipant &&
    (dish.requests || []).some((r) => {
      const reqUid = (r.user?._id || r.user || r.userId)?.toString();
      const myUid = (currentUser?._id || currentUser?.id)?.toString();
      return reqUid && myUid && reqUid === myUid && r.status === 'pending';
    });
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

    if (isMuted) {
      triggerToast('You have been muted in this room by the host.');
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

  // Send real dish invitation
  const handleSendInvite = async (targetUsername) => {
    if (!targetUsername || isInviting || isExpired) return;
    if (isExpired) {
      triggerToast('This dish is cooked. Inviting is closed.');
      return;
    }
    setIsInviting(true);
    const clean = targetUsername.replace(/^@/, '').trim();
    try {
      const res = await apiFetch(`/dishes/${dish._id}/invite`, {
        method: 'POST',
        body: JSON.stringify({ username: clean })
      });
      if (res?.success) {
        triggerToast(`Invited @${clean}!`);
        if (res.data && onDishUpdatedRef.current) {
          onDishUpdatedRef.current(res.data);
        }
        setInviteUsername('');
        setShowInviteDialog(false);
      } else {
        triggerToast(res?.message || 'Could not send invitation');
      }
    } catch (err) {
      triggerToast(err.message || 'Could not send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  // Host: Kick a member
  const handleKickMember = async (targetUserId, targetUsername) => {
    if (!isCreator || actionLoadingUserId || isExpired) return;
    if (isExpired) {
      triggerToast('This dish is cooked. Participant changes are locked.');
      return;
    }
    const ok = await confirm({
      title: 'Remove Member',
      message: `Are you sure you want to remove @${targetUsername || 'this user'} from the dish?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      isDanger: true
    });
    if (!ok) return;
    setActionLoadingUserId(String(targetUserId));
    try {
      const res = await apiFetch(`/dishes/${dish._id}/kick`, {
        method: 'POST',
        body: JSON.stringify({ targetUserId })
      });
      if (res?.success) {
        triggerToast(`@${targetUsername || 'User'} removed from dish`);
        if (res.data && onDishUpdatedRef.current) {
          onDishUpdatedRef.current(res.data);
        }
      } else {
        triggerToast(res?.message || 'Failed to remove user');
      }
    } catch (err) {
      triggerToast(err.message || 'Error removing user');
    } finally {
      setActionLoadingUserId(null);
    }
  };

  // Host: Toggle mute for a member
  const handleToggleMute = async (targetUserId, targetUsername) => {
    if (!isCreator || actionLoadingUserId || isExpired) return;
    if (isExpired) {
      triggerToast('This dish is cooked. Participant changes are locked.');
      return;
    }
    setActionLoadingUserId(String(targetUserId));
    try {
      const res = await apiFetch(`/dishes/${dish._id}/mute`, {
        method: 'POST',
        body: JSON.stringify({ targetUserId })
      });
      if (res?.success) {
        triggerToast(res.message || 'Updated mute status');
        if (res.data && onDishUpdatedRef.current) {
          onDishUpdatedRef.current(res.data);
        }
      } else {
        triggerToast(res?.message || 'Failed to update mute status');
      }
    } catch (err) {
      triggerToast(err.message || 'Error updating mute status');
    } finally {
      setActionLoadingUserId(null);
    }
  };

  // Host: Approve a join request
  const handleApproveJoinRequest = async (requestId, targetUsername) => {
    if (!isCreator || actionLoadingRequestId || isExpired) return;
    setActionLoadingRequestId(String(requestId));
    try {
      const res = await apiFetch(`/dishes/${dish._id}/requests/${requestId}/approve`, {
        method: 'POST'
      });
      const updatedDish = res?.data?.dish || res?.dish;
      if (updatedDish) {
        setLocalDish(updatedDish);
        if (onDishUpdatedRef.current) {
          onDishUpdatedRef.current(updatedDish);
        }
        triggerToast(`@${targetUsername || 'User'} added to the table!`);
      } else {
        // Optimistic update
        setLocalDish((prev) => {
          if (!prev) return prev;
          const reqItem = (prev.requests || []).find((r) => String(r._id) === String(requestId));
          const newParticipants = [...(prev.participants || [])];
          if (reqItem?.user) {
            newParticipants.push({
              user: reqItem.user,
              joinedAt: new Date(),
              role: 'participant'
            });
          }
          return {
            ...prev,
            participants: newParticipants,
            requests: (prev.requests || []).map((r) =>
              String(r._id) === String(requestId) ? { ...r, status: 'approved' } : r
            )
          };
        });
        triggerToast(`@${targetUsername || 'User'} added to the table!`);
      }
    } catch (err) {
      triggerToast(err.message || 'Error approving request');
    } finally {
      setActionLoadingRequestId(null);
    }
  };

  // Host: Reject a join request
  const handleRejectJoinRequest = async (requestId, targetUsername) => {
    if (!isCreator || actionLoadingRequestId || isExpired) return;
    setActionLoadingRequestId(String(requestId));
    try {
      const res = await apiFetch(`/dishes/${dish._id}/requests/${requestId}/reject`, {
        method: 'POST'
      });
      const updatedDish = res?.data?.dish || res?.dish;
      if (updatedDish) {
        setLocalDish(updatedDish);
        if (onDishUpdatedRef.current) {
          onDishUpdatedRef.current(updatedDish);
        }
        triggerToast(`Request from @${targetUsername || 'User'} declined`);
      } else {
        setLocalDish((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            requests: (prev.requests || []).map((r) =>
              String(r._id) === String(requestId) ? { ...r, status: 'rejected' } : r
            )
          };
        });
        triggerToast(`Request from @${targetUsername || 'User'} declined`);
      }
    } catch (err) {
      triggerToast(err.message || 'Error declining request');
    } finally {
      setActionLoadingRequestId(null);
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
      {/* ========================================================= */}
      {/* MAIN FULL-SIZE MODAL CONTAINER (92vw x 88vh Rectangular)  */}
      {/* ========================================================= */}
      <GlassContainer
        radius={28}
        className="dish-detail-modal-glass"
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
        innerClassName="dish-detail-modal-inner"
      >
        {/* Mobile Header: Tab Switcher (Details vs Chat) + Close Button */}
        <div
          className="mobile-flex"
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.45)',
            width: '100%',
            boxSizing: 'border-box',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={() => setMobileTab('details')}
              style={{
                padding: '5px 14px',
                borderRadius: 9999,
                border: 'none',
                fontSize: 12.5,
                fontWeight: mobileTab === 'details' ? 700 : 500,
                background: mobileTab === 'details' ? '#09090b' : 'transparent',
                color: mobileTab === 'details' ? '#ffffff' : '#52525b',
                cursor: 'pointer'
              }}
            >
              Details
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('chat')}
              style={{
                padding: '5px 14px',
                borderRadius: 9999,
                border: 'none',
                fontSize: 12.5,
                fontWeight: mobileTab === 'chat' ? 700 : 500,
                background: mobileTab === 'chat' ? '#09090b' : 'transparent',
                color: mobileTab === 'chat' ? '#ffffff' : '#52525b',
                cursor: 'pointer'
              }}
            >
              Chat
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: 4,
              cursor: 'pointer',
              color: '#52525b'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ========================================================= */}
        {/* LEFT COLUMN: 35% OF POPUP (Ticket Profile, Details, Actions) */}
        {/* ========================================================= */}
        <div
          className={`dish-detail-left-col ${mobileTab !== 'details' ? 'mobile-hidden' : ''}`}
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
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      flexShrink: 0
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: '#18181b',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 15,
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    {(creatorName || 'U')[0].toUpperCase()}
                  </div>
                )}

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 600, color: '#09090b', letterSpacing: '-0.01em' }}>
                      {creatorName}
                    </span>
                    <span
                      style={{
                        fontSize: 9.5,
                        fontWeight: 600,
                        padding: '1.5px 6px',
                        borderRadius: 9999,
                        background: '#18181b',
                        color: '#ffffff',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px'
                      }}
                    >
                      Host
                    </span>
                  </div>

                  <div style={{ fontSize: 11.5, color: '#71717a', marginTop: 1, display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'nowrap', overflow: 'hidden' }}>
                    <span style={{ flexShrink: 0 }}>@{creatorUsername}</span>
                    {creatorInstitute && (
                      <>
                        <span style={{ color: '#a1a1aa' }}>•</span>
                        <span
                          title={creatorInstitute}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3.5,
                            fontWeight: 450,
                            color: '#52525b',
                            maxWidth: 180,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                          </svg>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {creatorInstitute}
                          </span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MIDDLE: ALL DETAILS OF THE DISH WITH DESCRIPTION */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Category & Status Pill Bar (GlassContainers) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <GlassContainer
                  radius={9999}
                  innerStyle={{
                    padding: '4px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11.5,
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    color: '#09090b'
                  }}
                >
                  {getGenreIcon(dish.category, 13)}
                  <span>{dish.category}</span>
                </GlassContainer>

                <GlassContainer
                  radius={9999}
                  innerStyle={{
                    padding: '4px 10px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: dish.status === 'cooked' ? '#71717a' : '#09090b'
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
                <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 5 }}>
                  Description:
                </label>
                <GlassContainer
                  radius={16}
                  innerStyle={{
                    padding: '11px 14px',
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    color: '#09090b',
                    fontWeight: 450,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {dish.description}
                </GlassContainer>
              </div>

              {/* Grid of Key Ticket Specs (GlassContainers) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginTop: 2 }}>
                {/* Capacity */}
                <GlassContainer
                  radius={14}
                  innerStyle={{
                    padding: '9px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ fontSize: 10.5, color: '#71717a', fontWeight: 500, letterSpacing: '0.2px' }}>Capacity</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#09090b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    <span>{participantsList.length}/{dish.capacity?.max || 4} spots</span>
                  </div>
                </GlassContainer>

                {/* Join Mode */}
                <GlassContainer
                  radius={14}
                  innerStyle={{
                    padding: '9px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ fontSize: 10.5, color: '#71717a', fontWeight: 500, letterSpacing: '0.2px' }}>Access Mode</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#09090b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{dish.joinMode === 'auto' ? 'Auto-Join' : 'Approval Req.'}</span>
                  </div>
                </GlassContainer>

                {/* Meetup / Area */}
                <GlassContainer
                  radius={14}
                  innerStyle={{
                    padding: '9px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ fontSize: 10.5, color: '#71717a', fontWeight: 500, letterSpacing: '0.2px' }}>Location</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#09090b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
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
                  radius={14}
                  innerStyle={{
                    padding: '9px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ fontSize: 10.5, color: '#71717a', fontWeight: 500, letterSpacing: '0.2px' }}>Network</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#09090b', marginTop: 2, textTransform: 'capitalize' }}>
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
                {isExpired ? 'Ticket Cooked • View Only' : 'Active Campus Ticket'}
              </span>
            </div>

            {/* Bottom Right: Action Buttons (Invite, Leave, Join, 3-dots) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {/* Not Joined Yet: Show "Request Pending" if pending, "You are Invited!" if invited, otherwise "Join Dish" / "Request to Join" */}
              {!isParticipant && !isExpired && (
                hasPendingReq ? (
                  <FluidButton
                    disabled
                    style={{
                      padding: '8px 18px',
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: '#71717a',
                      opacity: 0.85,
                      cursor: 'not-allowed'
                    }}
                  >
                    Request Pending
                  </FluidButton>
                ) : isInvited ? (
                  <FluidButton
                    onClick={async () => {
                      if (onJoinDish) {
                        const res = await onJoinDish(dish._id);
                        if (res?.dish) setLocalDish(res.dish);
                      }
                    }}
                    style={{
                      padding: '8px 18px',
                      fontSize: 12.5,
                      fontWeight: 600
                    }}
                  >
                    You are Invited!
                  </FluidButton>
                ) : (
                  <FluidButton
                    onClick={async () => {
                      if (onJoinDish) {
                        const res = await onJoinDish(dish._id);
                        if (res?.dish) setLocalDish(res.dish);
                      }
                    }}
                    style={{ padding: '7px 16px', fontSize: 12, fontWeight: 600 }}
                  >
                    {dish.joinMode === 'auto' ? 'Join Dish' : 'Request to Join'}
                  </FluidButton>
                )
              )}

              {/* Participant (Not Host) */}
              {isParticipant && !isCreator && !isExpired && (
                <>
                  <FluidButton
                    onClick={() => setShowInviteDialog(true)}
                    style={{ padding: '6px 13px', fontSize: 12, fontWeight: 600 }}
                  >
                    Invite
                  </FluidButton>
                  <FluidButton
                    onClick={async () => {
                      const ok = await confirm({
                        title: 'Leave Dish Table',
                        message: 'Are you sure you want to leave this dish?',
                        confirmText: 'Leave',
                        cancelText: 'Stay',
                        isDanger: true
                      });
                      if (ok && onLeaveDish) onLeaveDish(dish._id);
                    }}
                    style={{ padding: '6px 13px', fontSize: 12, fontWeight: 600 }}
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
                    style={{ padding: '6px 13px', fontSize: 12, fontWeight: 600 }}
                  >
                    Invite
                  </FluidButton>

                  {dish.status === 'lets_cook' && (
                    <FluidButton
                      onClick={() => onStartCooking && onStartCooking(dish._id)}
                      style={{ padding: '6px 15px', fontSize: 12, fontWeight: 600 }}
                    >
                      Cook
                    </FluidButton>
                  )}

                  {dish.status === 'cooking' && (
                    <FluidButton
                      onClick={() => onMarkCooked && onMarkCooked(dish._id)}
                      style={{ padding: '6px 15px', fontSize: 12, fontWeight: 600 }}
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
                    width: 32,
                    height: 32,
                    minWidth: 32,
                    minHeight: 32
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

                    {isCreator && !isExpired && (
                      <button
                        type="button"
                        onClick={async () => {
                          setShowOptionsMenu(false);
                          const ok = await confirm({
                            title: 'Cancel Dish',
                            message: 'Are you sure you want to cancel and delete this dish? All diners will be notified.',
                            confirmText: 'Delete Dish',
                            cancelText: 'Keep Dish',
                            isDanger: true
                          });
                          if (ok) {
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
          className={`dish-detail-right-col ${mobileTab !== 'chat' ? 'mobile-hidden' : ''}`}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: 'transparent',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Inner Content that gets blurred if not unlocked */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              width: '100%',
              filter: !isUnlocked ? 'blur(16px)' : 'none',
              pointerEvents: !isUnlocked ? 'none' : 'auto',
              userSelect: !isUnlocked ? 'none' : 'auto',
              transition: 'filter 0.25s ease'
            }}
          >
            {/* TOP 10%: NAME OF DISH WITH PFP OF MEMBERS (MAX TOP 7, + SIGN TO VIEW FULL LIST) */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid rgba(0, 0, 0, 0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                height: 64,
                boxSizing: 'border-box',
                flexShrink: 0,
                backgroundColor: 'transparent'
              }}
            >
            {/* Left: Name of the Dish with Glass Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <GlassContainer
                radius={10}
                style={{ flexShrink: 0 }}
                innerStyle={{
                  width: 34,
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#09090b'
                }}
              >
                {getGenreIcon(dish.category, 17)}
              </GlassContainer>

              <div style={{ minWidth: 0 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#09090b',
                    letterSpacing: '-0.01em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={dish.description}
                >
                  {dish.description ? (dish.description.length > 40 ? dish.description.slice(0, 40) + '...' : dish.description) : 'Dish Ticket'}
                </h3>
                <div style={{ fontSize: 11.5, color: '#71717a', marginTop: 1, fontWeight: 450 }}>
                  {participantsList.length} peer{participantsList.length === 1 ? '' : 's'} joined • {isExpired ? 'Ticket Expired' : 'Active Dish Room'}
                </div>
              </div>
            </div>

            {/* Right: PFPs of Members (Max 7, + Sign) and Close Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Member PFPs Avatar Group in GlassContainer */}
              <GlassContainer
                radius={9999}
                onClick={() => setShowMembersModal(true)}
                title="Click to view all members, invited, and requested peers"
                style={{ cursor: 'pointer', position: 'relative' }}
                innerStyle={{
                  padding: '3px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {/* Pending requests dot badge for Creator */}
                {isCreator && pendingRequestsList.length > 0 && !isExpired && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -3,
                      right: -3,
                      minWidth: 16,
                      height: 16,
                      padding: '0 4px',
                      borderRadius: 9999,
                      background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                      color: '#ffffff',
                      fontSize: 9.5,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(225, 29, 72, 0.45)',
                      zIndex: 10
                    }}
                  >
                    {pendingRequestsList.length}
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', marginRight: participantsList.length > 7 ? 4 : 0 }}>
                  {participantsList.slice(0, 7).map((p, idx) => {
                    const u = p.user || {};
                    const avatar = u.avatar;
                    const uname = u.name || u.username || 'Peer';
                    return (
                      <div
                        key={u._id || idx}
                        style={{
                          marginLeft: idx === 0 ? 0 : -6,
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
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1.5px solid #ffffff',
                              display: 'block'
                            }}
                          />
                        ) : (
                          <div
                            title={`@${u.username || 'user'}`}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: '#a1a1aa',
                              color: '#ffffff',
                              border: '1.5px solid #ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 9.5,
                              fontWeight: 600
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
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#09090b',
                      padding: '0 3px'
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
                  width: 30,
                  height: 30,
                  minWidth: 30,
                  minHeight: 30
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                  <span>
                    {hasPendingReq
                      ? 'Your request to join this dish table is pending host approval.'
                      : 'Join this dish table to participate in the group chat!'}
                  </span>
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
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              {/* Dish Room Creation System Pill */}
              <div style={{ textAlign: 'center', margin: '2px 0 6px 0' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '3px 10px',
                    borderRadius: 9999,
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    color: '#71717a',
                    fontSize: 11,
                    fontWeight: 500,
                    userSelect: 'none'
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Dish chat room created • Host: @{creatorUsername}</span>
                </div>
              </div>

              {/* Empty / Loading State */}
              {isLoadingChat && messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: '#888888', fontSize: 13 }}>
                  Loading dish group messages...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: '#888888', fontSize: 13 }}>
                  No messages yet. Say hello to your dish crew!
                </div>
              ) : (
                messages.map((msg, idx) => {
                  // System announcement
                  if (msg.isSystem) {
                    return (
                      <div key={msg._id || idx} style={{ textAlign: 'center', margin: '2px 0' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 10px',
                            borderRadius: 9999,
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            color: '#71717a',
                            fontSize: 11,
                            fontWeight: 450,
                            lineHeight: 1.4,
                            userSelect: 'none'
                          }}
                        >
                          {msg.content}
                        </div>
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
                            padding: '2px 4px',
                            fontSize: emojiSize,
                            lineHeight: 1.15,
                            userSelect: 'none',
                            marginBottom: 2,
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
                        radius={16}
                        style={{ alignSelf: 'flex-end', maxWidth: '75%' }}
                        innerStyle={{
                          padding: '8px 14px',
                          color: '#09090b',
                          fontSize: 13.5,
                          lineHeight: 1.4
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
                            gap: 8,
                            marginBottom: 2
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
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  display: 'block',
                                  border: '1px solid rgba(0, 0, 0, 0.08)'
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  backgroundColor: '#8257e5',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  fontSize: 11,
                                  fontWeight: 'bold'
                                }}
                              >
                                {(senderName[0] || 'U').toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              padding: '2px 4px',
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
                          gap: 8,
                          maxWidth: '78%'
                        }}
                      >
                        <div
                          onClick={() => onViewProfile && onViewProfile(sender)}
                          style={{ cursor: onViewProfile ? 'pointer' : 'default', flexShrink: 0, marginTop: 2 }}
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
                                display: 'block',
                                border: '1px solid rgba(0, 0, 0, 0.08)'
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                backgroundColor: '#8257e5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: 11,
                                fontWeight: 'bold'
                              }}
                            >
                              {(senderName[0] || 'U').toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#71717a', paddingLeft: 4 }}>
                            {senderName}
                          </span>
                          <GlassContainer
                            radius={16}
                            style={{ flex: 1 }}
                            innerStyle={{
                              padding: '8px 14px',
                              color: '#09090b',
                              fontSize: 13.5,
                              lineHeight: 1.4
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

            {/* Muted Warning Banner */}
            {isMuted && (
              <div style={{ padding: '0 24px 8px 24px' }}>
                <GlassContainer
                  radius={12}
                  innerStyle={{
                    padding: '7px 14px',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    color: '#dc2626',
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  <span>You have been muted in this dish room by the host. You cannot send messages.</span>
                </GlassContainer>
              </div>
            )}

            {/* Chat Input Bar or Archived View-Only Indicator */}
            {isExpired ? (
              <div style={{ padding: '8px 18px 12px 18px', backgroundColor: 'transparent' }}>
                <GlassContainer
                  radius={9999}
                  innerStyle={{
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    color: '#71717a',
                    fontSize: 12,
                    fontWeight: 500
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Dish is Cooked • Chat is view only</span>
                </GlassContainer>
              </div>
            ) : (
              <div style={{ padding: '10px 18px', backgroundColor: 'transparent', position: 'relative' }}>
                <EmojiPicker
                  isOpen={showEmojiPicker}
                  onClose={() => setShowEmojiPicker(false)}
                  onSelectEmoji={handleInsertEmoji}
                />
                <form onSubmit={handleSendMessage}>
                  <GlassContainer
                    radius={9999}
                    innerStyle={{
                      padding: '4px 8px 4px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    {/* Emoji Picker Button */}
                    <button
                      type="button"
                      disabled={!isParticipant || isMuted}
                      onClick={() => setShowEmojiPicker((prev) => !prev)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: !isParticipant || isMuted ? 'not-allowed' : 'pointer',
                        padding: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: !isParticipant || isMuted ? 0.35 : showEmojiPicker ? 1 : 0.7,
                        transition: 'transform 0.15s ease, opacity 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (isParticipant && !isMuted) {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.opacity = '1';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isParticipant && !isMuted) {
                          e.currentTarget.style.transform = 'scale(1)';
                          if (!showEmojiPicker) e.currentTarget.style.opacity = '0.7';
                        }
                      }}
                      title="Choose emoji"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={showEmojiPicker ? '#09090b' : '#52525b'}
                        strokeWidth="1.8"
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
                        isMuted
                          ? 'You are muted by the host in this room.'
                          : !isParticipant
                          ? hasPendingReq
                            ? 'Request pending host approval...'
                            : 'Join dish to participate in group chat...'
                          : 'Type a Message...'
                      }
                      disabled={!isParticipant || isMuted || isSending}
                      maxLength={2000}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        fontSize: 13.5,
                        flex: 1,
                        color: '#09090b',
                        fontFamily: 'inherit'
                      }}
                    />

                    {/* Send Button (FluidButton icon from MessageArea) */}
                    <FluidButton
                      type="submit"
                      variant="icon"
                      disabled={!isParticipant || isMuted || isSending || !messageInput.trim()}
                      style={{
                        width: 30,
                        height: 30,
                        minWidth: 30,
                        minHeight: 30,
                        flexShrink: 0
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
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
            )}
          </div>
        </div>

          {/* Frosted Glass Overlay if viewer is not a member or host */}
          {!isUnlocked && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            >
              <GlassContainer
                radius={24}
                style={{
                  maxWidth: 420,
                  width: '90%',
                  boxShadow: '0 20px 48px rgba(0, 0, 0, 0.16)'
                }}
                innerStyle={{
                  padding: '34px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 16
                }}
              >
                <div style={{ color: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {hasPendingReq ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  ) : isInvited ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#09090b', letterSpacing: '-0.02em' }}>
                    {hasPendingReq ? 'Request Pending Approval' : isInvited ? 'You are Invited!' : 'Dish Room Locked'}
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#71717a', lineHeight: 1.5, maxWidth: 320 }}>
                    {hasPendingReq
                      ? 'You requested to join this dish table. Waiting for the host to review and accept your request.'
                      : isInvited
                      ? 'You were invited to this dish table! Accept your invitation to unlock the group chat and view member interactions.'
                      : 'Join this dish table as a confirmed member to unlock the live group chat and connect with other diners.'}
                  </p>
                </div>

                {hasPendingReq ? (
                  <FluidButton
                    disabled
                    style={{
                      padding: '10px 28px',
                      fontSize: 13.5,
                      fontWeight: 600,
                      marginTop: 4,
                      color: '#71717a',
                      opacity: 0.85,
                      cursor: 'not-allowed'
                    }}
                  >
                    Request Pending
                  </FluidButton>
                ) : (
                  <FluidButton
                    onClick={async () => {
                      if (onJoinDish) {
                        const res = await onJoinDish(dish._id);
                        if (res?.dish) setLocalDish(res.dish);
                      }
                    }}
                    style={{
                      padding: '10px 28px',
                      fontSize: 13.5,
                      fontWeight: 600,
                      marginTop: 4
                    }}
                  >
                    {isInvited ? 'Accept Invite to Unlock' : (dish.joinMode === 'auto' ? 'Join Dish to Unlock' : 'Request to Join')}
                  </FluidButton>
                )}
              </GlassContainer>
            </div>
          )}

          {/* Always accessible Close Button when right side is locked */}
          {!isUnlocked && (
            <div style={{ position: 'absolute', top: 18, right: 24, zIndex: 60 }}>
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
          )}
        </div>
      </GlassContainer>

      {/* ========================================================= */}
      {/* FLOATING SUB-MODAL 1: FULL MEMBERS & INVITED LIST         */}
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
            radius={24}
            style={{ width: 960, maxWidth: '96vw', maxHeight: '90vh', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.28)' }}
            innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0, 0, 0, 0.07)', paddingBottom: 12, gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#09090b', letterSpacing: '-0.01em' }}>
                  Dish Table Directory
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 500, padding: '2px 7px', borderRadius: 9999, backgroundColor: 'rgba(0, 0, 0, 0.04)', color: '#3f3f46' }}>
                    {participantsList.length} Joined
                  </span>
                  <span style={{ fontSize: 10.5, fontWeight: 500, padding: '2px 7px', borderRadius: 9999, backgroundColor: 'rgba(0, 0, 0, 0.04)', color: '#3f3f46' }}>
                    {invitedList.length} Invited
                  </span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 500,
                      padding: '2px 7px',
                      borderRadius: 9999,
                      background: pendingRequestsList.length > 0 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                      color: pendingRequestsList.length > 0 ? '#e11d48' : '#71717a'
                    }}
                  >
                    {pendingRequestsList.length} Requested
                  </span>
                </div>
              </div>
              <FluidButton
                variant="icon"
                onClick={() => setShowMembersModal(false)}
                style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, flexShrink: 0 }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </FluidButton>
            </div>

            {/* 3 Separate Columns: Joined Members, Invited, Requested */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 14,
                maxHeight: 460
              }}
            >
              {/* Column 1: Joined Members */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Joined Members ({participantsList.length})
                  </span>
                </div>

                <div className="custom-scrollbar" style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 4 }}>
                  {participantsList.map((p, idx) => {
                    const u = p.user || {};
                    const isHost = (u._id || u).toString() === (dish.creator?._id || dish.creator).toString();
                    const isMemberMuted = mutedList.some(
                      (m) => (m._id || m).toString() === (u._id || u).toString()
                    );
                    const isTargetLoading = actionLoadingUserId === (u._id || u).toString();

                    return (
                      <GlassContainer
                        key={u._id || idx}
                        radius={12}
                        innerStyle={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 10px',
                          gap: 8
                        }}
                      >
                        {/* Member Identity */}
                        <div
                          onClick={() => {
                            if (onViewProfile) {
                              setShowMembersModal(false);
                              onViewProfile(u);
                            }
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, cursor: 'pointer', flex: 1 }}
                        >
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#8257e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 600, flexShrink: 0 }}>
                              {((u.name || u.username || 'U')[0]).toUpperCase()}
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#09090b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {u.name || u.username}
                            </div>
                            <div style={{ fontSize: 10.5, color: '#71717a' }}>
                              @{u.username || 'user'}
                            </div>
                          </div>
                        </div>

                        {/* Status Badges & Host Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                          {/* Role Pill */}
                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 600,
                              padding: '1.5px 6px',
                              borderRadius: 9999,
                              background: isHost ? '#18181b' : 'rgba(0, 0, 0, 0.04)',
                              color: isHost ? '#ffffff' : '#71717a'
                            }}
                          >
                            {isHost ? 'Host' : 'Member'}
                          </span>

                          {/* Muted Pill if muted */}
                          {isMemberMuted && (
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 600,
                                padding: '1.5px 6px',
                                borderRadius: 9999,
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#dc2626'
                              }}
                              title="Muted by host"
                            >
                              Muted
                            </span>
                          )}

                          {/* Host Controls: Kick & Mute for non-host participants (Disabled when Cooked) */}
                          {isCreator && !isHost && !isExpired && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginLeft: 2 }}>
                              <FluidButton
                                disabled={isTargetLoading}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleMute(u._id || u, u.username);
                                }}
                                style={{
                                  padding: '2px 7px',
                                  fontSize: 10.5,
                                  fontWeight: 500,
                                  color: isMemberMuted ? '#16a34a' : '#52525b'
                                }}
                                title={isMemberMuted ? 'Unmute participant' : 'Mute participant'}
                              >
                                {isMemberMuted ? 'Unmute' : 'Mute'}
                              </FluidButton>

                              <FluidButton
                                disabled={isTargetLoading}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleKickMember(u._id || u, u.username);
                                }}
                                style={{
                                  padding: '2px 7px',
                                  fontSize: 10.5,
                                  fontWeight: 500,
                                  color: '#dc2626'
                                }}
                                title="Kick participant from dish"
                              >
                                Kick
                              </FluidButton>
                            </div>
                          )}
                        </div>
                      </GlassContainer>
                    );
                  })}
                </div>
              </div>

              {/* Column 2: Invited (Awaiting Acceptance) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Invited ({invitedList.length})
                  </span>
                  <span style={{ fontSize: 10.5, color: '#a1a1aa' }}>Pending acceptance</span>
                </div>

                <div className="custom-scrollbar" style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 4 }}>
                  {invitedList.length === 0 ? (
                    <div
                      style={{
                        padding: '22px 14px',
                        textAlign: 'center',
                        color: '#71717a',
                        fontSize: 11.5,
                        borderRadius: 12,
                        border: '1px dashed rgba(0, 0, 0, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <span>No pending invitations.</span>
                      {isUnlocked && !isExpired && (
                        <FluidButton
                          onClick={() => {
                            setShowMembersModal(false);
                            setShowInviteDialog(true);
                          }}
                          style={{ padding: '4px 10px', fontSize: 11, fontWeight: 500 }}
                        >
                          Invite Peers
                        </FluidButton>
                      )}
                    </div>
                  ) : (
                    invitedList.map((inv, idx) => {
                      const u = inv.user || {};
                      return (
                        <GlassContainer
                          key={u._id || idx}
                          radius={12}
                          innerStyle={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '7px 10px',
                            gap: 8
                          }}
                        >
                          {/* User info */}
                          <div
                            onClick={() => {
                              if (onViewProfile) {
                                setShowMembersModal(false);
                                onViewProfile(u);
                              }
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, cursor: 'pointer', flex: 1 }}
                          >
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                            ) : (
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#27272a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 600, flexShrink: 0 }}>
                                {((u.name || u.username || 'U')[0]).toUpperCase()}
                              </div>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#09090b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {u.name || u.username || 'Peer'}
                              </div>
                              <div style={{ fontSize: 10.5, color: '#71717a' }}>
                                @{u.username || 'user'}
                              </div>
                            </div>
                          </div>

                          {/* Invited Badge */}
                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 500,
                              padding: '2px 6px',
                              borderRadius: 9999,
                              background: 'rgba(0, 0, 0, 0.04)',
                              color: '#71717a',
                              flexShrink: 0
                            }}
                          >
                            Invited
                          </span>
                        </GlassContainer>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Column 3: Requested (Pending Host Approval) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Requested ({pendingRequestsList.length})
                  </span>
                  <span style={{ fontSize: 10.5, color: '#a1a1aa' }}>Pending host approval</span>
                </div>

                <div className="custom-scrollbar" style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 4 }}>
                  {pendingRequestsList.length === 0 ? (
                    <div
                      style={{
                        padding: '22px 14px',
                        textAlign: 'center',
                        color: '#71717a',
                        fontSize: 11.5,
                        borderRadius: 12,
                        border: '1px dashed rgba(0, 0, 0, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <span>No pending requests.</span>
                    </div>
                  ) : (
                    pendingRequestsList.map((req, idx) => {
                      const u = req.user || {};
                      const isRequestActionLoading = actionLoadingRequestId === String(req._id);
                      return (
                        <GlassContainer
                          key={req._id || idx}
                          radius={12}
                          innerStyle={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '7px 10px',
                            gap: 8
                          }}
                        >
                          {/* User info */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onViewProfile && (u.username || u._id)) {
                                  onViewProfile(u);
                                }
                              }}
                              style={{ cursor: onViewProfile ? 'pointer' : 'default', flexShrink: 0 }}
                              title={onViewProfile ? `View @${u.username || 'user'}'s profile` : ''}
                            >
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name || u.username} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 600 }}>
                                  {((u.name || u.username || 'U')[0] || 'U').toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#09090b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {u.name || u.username || 'Peer'}
                              </div>
                              <div style={{ fontSize: 10.5, color: '#71717a' }}>
                                @{u.username || 'user'}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons for Host */}
                          {isCreator && !isExpired ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                              <FluidButton
                                disabled={Boolean(isRequestActionLoading)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApproveJoinRequest(req._id, u.username);
                                }}
                                style={{
                                  padding: '3px 8px',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: '#16a34a'
                                }}
                                title="Accept join request"
                              >
                                {isRequestActionLoading ? '...' : 'Accept'}
                              </FluidButton>

                              <FluidButton
                                disabled={Boolean(isRequestActionLoading)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectJoinRequest(req._id, u.username);
                                }}
                                style={{
                                  padding: '3px 7px',
                                  fontSize: 11,
                                  fontWeight: 500,
                                  color: '#dc2626'
                                }}
                                title="Decline join request"
                              >
                                Reject
                              </FluidButton>
                            </div>
                          ) : (
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 600,
                                padding: '2px 6px',
                                borderRadius: 9999,
                                background: 'rgba(244, 63, 94, 0.1)',
                                color: '#e11d48',
                                flexShrink: 0
                              }}
                            >
                              Requested
                            </span>
                          )}
                        </GlassContainer>
                      );
                    })
                  )}
                </div>
              </div>
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
