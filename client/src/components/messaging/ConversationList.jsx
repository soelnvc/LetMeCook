'use client';

import React from 'react';
import GlassContainer from '@/components/ui/GlassContainer';
import { formatRelativeTime } from '@/lib/utils';

export default function ConversationList({
  userName,
  conversations = [],
  selectedConvId,
  onSelectConversation,
  messagesTab,
  setMessagesTab,
  searchQuery,
  setSearchQuery,
  onRespondRequest,
  onViewProfile
}) {
  const filteredList = conversations.filter((c) => {
    const matchTab = messagesTab === 'requests' ? c.isRequest : !c.isRequest;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchTab;
    const nameMatch = (c.user?.name || '').toLowerCase().includes(query);
    const userMatch = (c.user?.username || '').toLowerCase().includes(query);
    return matchTab && (nameMatch || userMatch);
  });

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
      {/* Header: Username + Tabs */}
      <div style={{ padding: '22px 24px 0 24px' }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#000000',
            marginBottom: 16,
            letterSpacing: '-0.3px'
          }}
        >
          {userName}
        </div>

        {/* Message / Requests Sub-tabs */}
        <div style={{ display: 'flex', gap: 32, borderBottom: '2px solid #000000', paddingBottom: 0 }}>
          <button
            onClick={() => setMessagesTab('message')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 16,
              fontFamily: 'inherit',
              cursor: 'pointer',
              fontWeight: messagesTab === 'message' ? 700 : 500,
              color: '#000000',
              borderBottom: messagesTab === 'message' ? '3.5px solid #000000' : '3.5px solid transparent',
              padding: '0 4px 8px 4px',
              marginBottom: -2,
              transition: 'all 0.15s ease'
            }}
          >
            Message
          </button>
          <button
            onClick={() => setMessagesTab('requests')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 16,
              fontFamily: 'inherit',
              cursor: 'pointer',
              fontWeight: messagesTab === 'requests' ? 700 : 500,
              color: '#000000',
              borderBottom: messagesTab === 'requests' ? '3.5px solid #000000' : '3.5px solid transparent',
              padding: '0 4px 8px 4px',
              marginBottom: -2,
              transition: 'all 0.15s ease'
            }}
          >
            Requests{' '}
            {conversations.filter((c) => c.isRequest).length > 0 &&
              `(${conversations.filter((c) => c.isRequest).length})`}
          </button>
        </div>
      </div>

      {/* Pill Search Bar */}
      <div style={{ padding: '16px 20px 10px 20px' }}>
        <GlassContainer
          radius={9999}
          innerStyle={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            gap: 10
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#000000"
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
            placeholder="Search Bar"
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 14,
              width: '100%',
              color: '#000000',
              fontWeight: 500,
              fontFamily: 'inherit'
            }}
          />
        </GlassContainer>
      </div>

      {/* Conversation List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 14px' }}>
        {filteredList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: '#666', fontSize: 13 }}>
            {messagesTab === 'requests' ? 'No pending requests.' : 'No conversations yet.'}
          </div>
        ) : (
          filteredList.map((c) => {
            const isSelected = selectedConvId === c.conversationId;
            return (
              <div
                key={c.conversationId}
                onClick={() => onSelectConversation(c.conversationId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 14px',
                  borderRadius: 16,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'rgba(0,0,0,0.06)' : 'transparent',
                  marginBottom: 4,
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Avatar */}
                <div
                  onClick={(e) => {
                    if (onViewProfile && c.user) {
                      e.stopPropagation();
                      onViewProfile(c.user);
                    }
                  }}
                  title={onViewProfile ? `View @${c.user?.username || 'user'}'s profile` : ''}
                  style={{ cursor: onViewProfile ? 'pointer' : 'default', flexShrink: 0 }}
                >
                  {c.user?.avatar ? (
                    <img
                      src={c.user.avatar}
                      alt={c.user?.name || 'User'}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        display: 'block',
                        border: '1px solid rgba(0,0,0,0.08)'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        backgroundColor: '#e0c8b0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#4a3b32'
                      }}
                    >
                      {(c.user?.name || c.user?.username || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    onClick={(e) => {
                      if (onViewProfile && c.user) {
                        e.stopPropagation();
                        onViewProfile(c.user);
                      }
                    }}
                    title={onViewProfile ? `View @${c.user?.username || 'user'}'s profile` : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 6,
                      cursor: onViewProfile ? 'pointer' : 'default',
                      width: 'fit-content'
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14.5,
                        fontWeight: 700,
                        color: '#000000',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {c.user?.name || 'NAME'}
                    </span>
                    <span style={{ fontSize: 11.5, color: '#71717a', fontWeight: 500 }}>
                      @{c.user?.username || 'user'}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#333333',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: 2
                    }}
                  >
                    {c.lastMessage || 'Hey there...'}
                  </div>

                  {c.needsResponse && (
                    <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRespondRequest && onRespondRequest(c.conversationId, 'accepted');
                        }}
                        style={{
                          padding: '3px 8px',
                          fontSize: 11,
                          background: '#000000',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 4,
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
                          padding: '3px 8px',
                          fontSize: 11,
                          background: '#ffffff',
                          color: '#000000',
                          border: '1px solid #000000',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div
                  style={{
                    fontSize: 12,
                    color: '#555555',
                    flexShrink: 0,
                    alignSelf: 'flex-start',
                    marginTop: 4
                  }}
                >
                  {formatRelativeTime(c.updatedAt)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
