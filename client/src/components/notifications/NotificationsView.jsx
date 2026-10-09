'use client';

import React, { useState, useEffect, useMemo } from 'react';
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';
import { apiFetch } from '@/lib/api';

export default function NotificationsView({
  currentUser,
  onViewProfile,
  onNavigateToMessages,
  onConnectionsUpdated
}) {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'requests' | 'connections'
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const storageKey = currentUser?._id
    ? `letmecook_notifications_${currentUser._id}`
    : 'letmecook_notifications_guest';

  // Helper to format ISO timestamp into relative time
  const formatRelativeTime = (timestamp, fallback) => {
    if (!timestamp) return fallback || 'Just now';
    try {
      const diffSec = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      if (diffSec < 172800) return 'Yesterday';
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return fallback || 'Recently';
    }
  };

  // Load real notifications from backend API and local cache (strictly isolated per user)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('letmecook_notifications_v1');
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setNotifications(parsed);
          }
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error('Failed reading notifications from localStorage:', err);
      }
    }

    // Fetch from backend API to merge any real incoming requests or notifications
    const fetchBackend = async () => {
      try {
        const [notifsRes, requestsRes] = await Promise.allSettled([
          apiFetch('/notifications'),
          apiFetch('/connections/requests')
        ]);

        const fetchedNotifs = notifsRes.status === 'fulfilled' && notifsRes.value?.data ? notifsRes.value.data : [];
        const fetchedRequests = requestsRes.status === 'fulfilled' && requestsRes.value?.data ? requestsRes.value.data : [];

        const merged = [];
        const existingIds = new Set();

        // Ingest pending connection requests
        for (const req of fetchedRequests) {
          const reqId = `conn-req-${req._id}`;
          if (!existingIds.has(reqId) && req.requester) {
            existingIds.add(reqId);
            merged.push({
              id: reqId,
              connectionId: req._id,
              type: 'connection_request',
              status: 'pending',
              actor: req.requester,
              actionText: 'has sent you a connection request.',
              timeAgo: formatRelativeTime(req.createdAt, 'Recent'),
              createdAt: req.createdAt,
              read: false
            });
          }
        }

        // Ingest general notifications
        for (const notif of fetchedNotifs) {
          const notifId = notif._id;
          if (!existingIds.has(notifId) && notif.actor) {
            existingIds.add(notifId);
            let actionText = 'interacted with your account.';
            if (notif.type === 'connection_request') {
              actionText = 'has sent you a connection request.';
            } else if (notif.type === 'connection_accepted') {
              actionText = 'has accepted your Connection request.';
            } else if (notif.type === 'connection_added') {
              actionText = 'was added as your connection.';
            } else if (notif.type === 'dish_join_request') {
              actionText = 'requested to join your dish.';
            } else if (notif.type === 'dish_join_approved') {
              actionText = 'approved your dish join request.';
            } else if (notif.type === 'message_request') {
              actionText = 'sent you a message request.';
            } else if (notif.type === 'new_message') {
              actionText = 'sent you a message.';
            }

            merged.push({
              id: notifId,
              type: notif.type,
              status: notif.metadata?.status || 'info',
              actor: notif.actor,
              actionText,
              timeAgo: formatRelativeTime(notif.createdAt, 'Recent'),
              createdAt: notif.createdAt,
              read: notif.read || false,
              connectionId: notif.reference || notif.metadata?.connectionId
            });
          }
        }

        setNotifications(merged);
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, JSON.stringify(merged));
        }
      } catch (err) {
        console.error('Failed fetching notifications from server:', err);
      }
    };

    fetchBackend();
  }, [currentUser?._id, storageKey]);

  // Sync to local storage
  const persistNotifications = (updatedList) => {
    setNotifications(updatedList);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
      } catch (err) {
        console.error('Failed writing notifications to localStorage:', err);
      }
    }
  };

  // Show a gentle toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3200);
  };

  // Accept Connection Request
  const handleAcceptRequest = async (item, e) => {
    if (e) e.stopPropagation();
    setActionLoadingId(item.id);

    try {
      if (item.connectionId) {
        await apiFetch(`/connections/${item.connectionId}/respond`, {
          method: 'POST',
          body: JSON.stringify({ status: 'accepted', action: 'accepted' })
        });
      }

      const updated = notifications.map((n) => {
        if (n.id === item.id) {
          return {
            ...n,
            status: 'accepted',
            read: true,
            actionText: 'is now connected with you.'
          };
        }
        return n;
      });

      const actorName = item.actor?.name || item.actor?.username || 'User';
      persistNotifications(updated);
      triggerToast(`Connected with ${actorName}!`);

      if (onConnectionsUpdated) {
        onConnectionsUpdated();
      }
    } catch (err) {
      console.error('Accept connection error:', err);
      const updated = notifications.map((n) =>
        n.id === item.id ? { ...n, status: 'accepted', read: true } : n
      );
      persistNotifications(updated);
      triggerToast(`Connected with ${item.actor?.name || 'User'}!`);
      if (onConnectionsUpdated) onConnectionsUpdated();
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject Connection Request
  const handleRejectRequest = async (item, e) => {
    if (e) e.stopPropagation();
    setActionLoadingId(item.id);

    try {
      if (item.connectionId) {
        await apiFetch(`/connections/${item.connectionId}/respond`, {
          method: 'POST',
          body: JSON.stringify({ status: 'rejected', action: 'rejected' })
        });
      }

      const updated = notifications.map((n) => {
        if (n.id === item.id) {
          return {
            ...n,
            status: 'rejected',
            read: true,
            actionText: 'connection request was declined.'
          };
        }
        return n;
      });

      persistNotifications(updated);
      triggerToast(`Request from ${item.actor?.name || 'User'} declined`);
    } catch (err) {
      console.error('Reject connection error:', err);
      const updated = notifications.map((n) =>
        n.id === item.id ? { ...n, status: 'rejected', read: true } : n
      );
      persistNotifications(updated);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    persistNotifications(updated);
    try {
      await apiFetch('/notifications/read-all', { method: 'POST' });
    } catch {
      // ignore
    }
    triggerToast('All notifications marked as read');
  };

  // Filtered list
  const filteredNotifications = useMemo(() => {
    if (filter === 'requests') {
      return notifications.filter((n) => n.type === 'connection_request' && n.status === 'pending');
    }
    if (filter === 'connections') {
      return notifications.filter(
        (n) => n.type === 'connection_accepted' || n.type === 'connection_added' || n.status === 'accepted'
      );
    }
    return notifications;
  }, [notifications, filter]);

  const pendingRequestsCount = useMemo(() => {
    return notifications.filter((n) => n.type === 'connection_request' && n.status === 'pending').length;
  }, [notifications]);

  const connectionsCount = useMemo(() => {
    return notifications.filter(
      (n) => n.type === 'connection_accepted' || n.type === 'connection_added' || n.status === 'accepted'
    ).length;
  }, [notifications]);

  return (
    <div
      style={{
        maxWidth: 740,
        margin: '0 auto',
        padding: '10px 0 60px 0',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Toast Banner */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: '#09090b',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: 999,
            fontSize: 13.5,
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.22)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Main Glass Panel */}
      <GlassContainer radius={26} innerStyle={{ padding: '26px 28px' }}>
        {/* Header Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            paddingBottom: 20,
            borderBottom: '1px solid rgba(0, 0, 0, 0.07)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Heart Icon Badge */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>

            <div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: '-0.5px',
                  color: '#09090b',
                  margin: 0,
                  lineHeight: 1.15
                }}
              >
                Notifications
              </h1>
              <p style={{ margin: '3px 0 0 0', fontSize: 13, color: '#71717a' }}>
                Campus peer requests, new connections & activity
              </p>
            </div>
          </div>

          {/* Action: Mark All As Read with FluidButton */}
          <FluidButton
            onClick={handleMarkAllRead}
            style={{
              padding: '8px 16px',
              fontSize: 12.5,
              fontWeight: 600,
              color: '#3f3f46',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Mark all read
          </FluidButton>
        </div>

        {/* Customized Segmented Selector for All / Requests / Connections */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 0 18px 0',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
          }}
        >
          <GlassContainer
            radius={9999}
            innerStyle={{
              display: 'inline-flex',
              padding: 4,
              gap: 4,
              boxSizing: 'border-box'
            }}
          >
            {[
              { id: 'all', label: 'All', count: notifications.length },
              { id: 'requests', label: 'Requests', count: pendingRequestsCount, isRed: true },
              { id: 'connections', label: 'Connections', count: connectionsCount }
            ].map((tab) => {
              const isSelected = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 16px',
                    borderRadius: 9999,
                    border: 'none',
                    fontSize: 12.5,
                    fontWeight: isSelected ? 600 : 500,
                    cursor: 'pointer',
                    background: isSelected ? '#09090b' : 'transparent',
                    color: isSelected ? '#ffffff' : '#52525b',
                    boxShadow: isSelected ? '0 2px 8px rgba(0, 0, 0, 0.16)' : 'none',
                    transition: 'all 0.18s ease',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                      e.currentTarget.style.color = '#18181b';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#52525b';
                    }
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 9999,
                        fontSize: 11,
                        fontWeight: 700,
                        background: isSelected
                          ? 'rgba(255, 255, 255, 0.22)'
                          : tab.isRed
                          ? 'rgba(239, 68, 68, 0.14)'
                          : 'rgba(0, 0, 0, 0.07)',
                        color: isSelected ? '#ffffff' : tab.isRed ? '#ef4444' : '#71717a'
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </GlassContainer>
        </div>

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
          {filteredNotifications.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 16px',
                textAlign: 'center',
                gap: 12
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a1a1aa'
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#09090b' }}>
                No notifications right now
              </div>
              <div style={{ fontSize: 13, color: '#71717a', maxWidth: 320 }}>
                When classmates or peers connect with you or accept your requests, they will show up here.
              </div>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const actor = item.actor || {};
              const actorName = actor.name || actor.username || 'Peer';
              const actorUsername = actor.username || '';
              const actorAvatar = actor.avatar || null;
              const actorInstitute =
                actor.institute?.name || (typeof actor.institute === 'string' ? actor.institute : null);
              const isPendingRequest = item.type === 'connection_request' && item.status === 'pending';
              const isLoading = actionLoadingId === item.id;

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 18,
                    backgroundColor: item.read ? 'transparent' : 'rgba(255, 255, 255, 0.55)',
                    border: item.read ? '1px solid transparent' : '1px solid rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.18s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.75)';
                    e.currentTarget.style.boxShadow = '0 3px 12px rgba(0, 0, 0, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = item.read
                      ? 'transparent'
                      : 'rgba(255, 255, 255, 0.55)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Left: Avatar + Details */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      minWidth: 0,
                      flex: 1,
                      marginRight: 16
                    }}
                  >
                    {/* Clickable Avatar with type badge */}
                    <div
                      style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                      onClick={() => onViewProfile && onViewProfile(actor)}
                      title={`View ${actorName}'s profile`}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          backgroundColor: '#f97316',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: 17,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                        }}
                      >
                        {actorAvatar ? (
                          <img
                            src={actorAvatar}
                            alt={actorName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          actorName[0]?.toUpperCase()
                        )}
                      </div>

                      {/* Small badge overlay */}
                      <span
                        style={{
                          position: 'absolute',
                          bottom: -2,
                          right: -2,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor:
                            item.type === 'connection_accepted'
                              ? '#22c55e'
                              : item.type === 'connection_added'
                              ? '#0284c7'
                              : '#f97316',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #ffffff',
                          fontSize: 10,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {item.type === 'connection_accepted' ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : item.type === 'connection_added' ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                          </svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        )}
                      </span>
                    </div>

                    {/* Notification Description Text */}
                    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div
                        style={{
                          fontSize: 14.5,
                          lineHeight: 1.4,
                          color: '#09090b',
                          wordBreak: 'break-word'
                        }}
                      >
                        <span
                          onClick={() => onViewProfile && onViewProfile(actor)}
                          style={{
                            fontWeight: 700,
                            color: '#09090b',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            marginRight: 4
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                        >
                          {actorName}
                        </span>
                        <span style={{ color: '#27272a', fontWeight: 500 }}>
                          {item.actionText}
                        </span>
                      </div>

                      {/* Subtitle / Institute Tag */}
                      <div
                        style={{
                          fontSize: 12,
                          color: '#71717a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        {actorUsername && <span>@{actorUsername}</span>}
                        {actorInstitute && (
                          <>
                            <span>•</span>
                            <span>{actorInstitute}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Interactive Action Buttons with FluidButton + Event Timing */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      flexShrink: 0
                    }}
                  >
                    {/* Action Buttons for Pending Requests */}
                    {isPendingRequest && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Accept Button with normal grey glass FluidButton */}
                        <FluidButton
                          disabled={isLoading}
                          onClick={(e) => handleAcceptRequest(item, e)}
                          style={{
                            padding: '7px 18px',
                            fontSize: 13,
                            fontWeight: 700,
                            borderRadius: 12
                          }}
                        >
                          {isLoading ? '...' : 'Accept'}
                        </FluidButton>

                        {/* Reject Button with FluidButton */}
                        <FluidButton
                          disabled={isLoading}
                          onClick={(e) => handleRejectRequest(item, e)}
                          style={{
                            padding: '7px 14px',
                            fontSize: 13,
                            fontWeight: 600,
                            borderRadius: 12
                          }}
                        >
                          Reject
                        </FluidButton>
                      </div>
                    )}

                    {/* Status badge if already responded */}
                    {item.type === 'connection_request' && item.status === 'accepted' && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: '#16a34a',
                            padding: '4px 10px',
                            borderRadius: 10,
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Connected
                        </span>

                        {onNavigateToMessages && (
                          <FluidButton
                            onClick={() => onNavigateToMessages(actor)}
                            style={{
                              padding: '5px 12px',
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#3f3f46'
                            }}
                          >
                            Message
                          </FluidButton>
                        )}
                      </div>
                    )}

                    {item.type === 'connection_request' && item.status === 'rejected' && (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#71717a',
                          padding: '4px 8px',
                          borderRadius: 8,
                          backgroundColor: 'rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        Declined
                      </span>
                    )}

                    {/* Quick Message button for accepted or added connections */}
                    {(item.type === 'connection_accepted' || item.type === 'connection_added') && onNavigateToMessages && (
                      <FluidButton
                        onClick={() => onNavigateToMessages(actor)}
                        style={{
                          padding: '5px 14px',
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: '#27272a',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                        Message
                      </FluidButton>
                    )}

                    {/* EVENT TIMING: Small grey text on right side of tab */}
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#71717a',
                        minWidth: 50,
                        textAlign: 'right',
                        whiteSpace: 'nowrap'
                      }}
                      title={item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                    >
                      {item.timeAgo || formatRelativeTime(item.createdAt, 'Recent')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </GlassContainer>
    </div>
  );
}
