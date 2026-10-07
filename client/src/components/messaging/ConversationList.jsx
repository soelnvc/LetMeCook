'use client';

import React from 'react';
import GlassContainer from '@/components/ui/GlassContainer';

const formatInstagramTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks}w`;
};

export default function ConversationList({
  userName,
  conversations = [],
  selectedConvId,
  onSelectConversation,
  messagesTab,
  setMessagesTab,
  searchQuery,
  setSearchQuery,
}) {
  // Filter and sort conversations by newest activity descending (newest chat always on top!)
  const filteredList = conversations
    .filter((c) => {
      const matchTab = messagesTab === 'requests' ? c.isRequest : !c.isRequest;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchTab;
      const nameMatch = (c.user?.name || '').toLowerCase().includes(query);
      const userMatch = (c.user?.username || '').toLowerCase().includes(query);
      return matchTab && (nameMatch || userMatch);
    })
    .sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.lastMessage?.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.lastMessage?.createdAt || 0).getTime();
      return timeB - timeA;
    });

  const pendingRequestsCount = conversations.filter((c) => c.isRequest).length;

  return (
    <div
      style={{
        width: 360,
        flexShrink: 0,
        borderRight: '1.5px solid rgba(255, 255, 255, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'transparent'
      }}
    >
      {/* Header: User Display Name + Customized Segmented Selector */}
      <div style={{ padding: '20px 22px 0 22px' }}>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#09090b',
            letterSpacing: '-0.4px',
            marginBottom: 14
          }}
        >
          {userName}
        </div>

        {/* Customized Segmented Control for Messages / Requests */}
        <GlassContainer
          radius={9999}
          innerStyle={{
            display: 'flex',
            padding: 4,
            gap: 4,
            boxSizing: 'border-box'
          }}
        >
          <button
            type="button"
            onClick={() => setMessagesTab('message')}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '7px 16px',
              borderRadius: 9999,
              border: 'none',
              fontSize: 13.5,
              fontWeight: messagesTab === 'message' ? 600 : 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              background: messagesTab === 'message' ? '#09090b' : 'transparent',
              color: messagesTab === 'message' ? '#ffffff' : '#71717a',
              boxShadow: messagesTab === 'message' ? '0 2px 8px rgba(0, 0, 0, 0.16)' : 'none',
              transition: 'all 0.18s ease'
            }}
          >
            Messages
          </button>
          <button
            type="button"
            onClick={() => setMessagesTab('requests')}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '7px 16px',
              borderRadius: 9999,
              border: 'none',
              fontSize: 13.5,
              fontWeight: messagesTab === 'requests' ? 600 : 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              background: messagesTab === 'requests' ? '#09090b' : 'transparent',
              color: messagesTab === 'requests' ? '#ffffff' : '#71717a',
              boxShadow: messagesTab === 'requests' ? '0 2px 8px rgba(0, 0, 0, 0.16)' : 'none',
              transition: 'all 0.18s ease'
            }}
          >
            Requests
            {pendingRequestsCount > 0 && (
              <span
                style={{
                  backgroundColor: messagesTab === 'requests' ? '#ffffff' : '#f43f5e',
                  color: messagesTab === 'requests' ? '#09090b' : '#ffffff',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 9999,
                  lineHeight: '14px'
                }}
              >
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </GlassContainer>
      </div>

      {/* Pill Search Bar */}
      <div style={{ padding: '14px 20px 8px 20px' }}>
        <GlassContainer
          radius={9999}
          innerStyle={{
            display: 'flex',
            alignItems: 'center',
            padding: '7px 14px',
            gap: 10
          }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#71717a"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 13.5,
              width: '100%',
              color: '#09090b',
              fontWeight: 400,
              fontFamily: 'inherit'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#71717a',
                fontSize: 13,
                padding: '0 2px'
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </GlassContainer>
      </div>

      {/* Conversation List (Instagram Direct UI/UX overhaul) */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 12px' }}>
        {filteredList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 12px', color: '#71717a', fontSize: 13 }}>
            {messagesTab === 'requests' ? 'No pending message requests.' : 'No conversations yet.'}
          </div>
        ) : (
          filteredList.map((c) => {
            const isSelected = selectedConvId === c.conversationId;
            const displayName = c.user?.name || c.user?.username || 'User';
            const username = c.user?.username || 'user';
            const lastMsgText =
              typeof c.lastMessage === 'object' && c.lastMessage !== null
                ? c.lastMessage.content || 'Hey there...'
                : c.lastMessage || 'Hey there...';
            const timeAgo = formatInstagramTime(c.updatedAt || c.lastMessage?.createdAt);

            return (
              <div
                key={c.conversationId}
                onClick={() => onSelectConversation(c.conversationId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 14,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.06)' : 'transparent',
                  marginBottom: 3,
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.03)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Avatar with subtle border */}
                <div style={{ flexShrink: 0 }}>
                  {c.user?.avatar ? (
                    <img
                      src={c.user.avatar}
                      alt={displayName}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        display: 'block',
                        border: '1px solid rgba(0, 0, 0, 0.08)'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: '#e4d5c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 17,
                        fontWeight: 600,
                        color: '#4a3b32',
                        border: '1px solid rgba(0, 0, 0, 0.06)'
                      }}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Details (Instagram Natural Title Case & Clean Spacing) */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Top Line: Name + Timestamp on the right */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 6
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 5,
                        minWidth: 0,
                        overflow: 'hidden'
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#09090b',
                          letterSpacing: '-0.2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {displayName}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: '#71717a',
                          fontWeight: 400,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        @{username}
                      </span>
                    </div>

                    {/* Compact relative time on far right */}
                    <span
                      style={{
                        fontSize: 11.5,
                        color: '#8e8e93',
                        fontWeight: 400,
                        flexShrink: 0,
                        marginLeft: 4
                      }}
                    >
                      {timeAgo}
                    </span>
                  </div>

                  {/* Bottom Line: Message Preview Snippet */}
                  <div
                    style={{
                      fontSize: 13,
                      color: '#71717a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: 3,
                      lineHeight: '16px'
                    }}
                  >
                    {lastMsgText}
                  </div>

                  {/* Actions for pending requests in Requests tab */}
                  {c.needsResponse && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRespondRequest && onRespondRequest(c.conversationId, 'accepted');
                        }}
                        style={{
                          padding: '4px 10px',
                          fontSize: 11.5,
                          background: '#09090b',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRespondRequest && onRespondRequest(c.conversationId, 'rejected');
                        }}
                        style={{
                          padding: '4px 10px',
                          fontSize: 11.5,
                          background: '#ffffff',
                          color: '#09090b',
                          border: '1px solid #d4d4d8',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
