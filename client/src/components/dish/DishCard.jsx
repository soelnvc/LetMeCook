'use client';

import React, { useState } from 'react';
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';

export default function DishCard({
  dish,
  currentUser,
  onJoin,
  onLeave,
  onStartCooking,
  onMarkCooked,
  onApproveRequest,
  onRejectRequest
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const creatorObj = dish.creator || {};
  const creatorName = creatorObj.name || 'Anonymous';
  const creatorUsername = creatorObj.username || 'user';
  const isCreator = (creatorObj._id || creatorObj) === currentUser?._id;
  const isParticipant = dish.participants?.some(
    (p) => (p.user?._id || p.user) === currentUser?._id
  );
  const hasPendingReq = dish.requests?.some(
    (r) => (r.user?._id || r.user) === currentUser?._id && r.status === 'pending'
  );
  const spotsLeft = dish.capacity?.unlimited
    ? '∞'
    : Math.max(0, (dish.capacity?.max || 4) - (dish.participants?.length || 0));

  return (
    <GlassContainer
      radius={28}
      style={{ width: '100%' }}
      innerStyle={{
        padding: '20px 22px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        position: 'relative',
        color: '#000000',
        boxSizing: 'border-box',
        width: '100%'
      }}
    >
      {/* Left Icon: Signature Cart SVG */}
      <div style={{ paddingTop: 4, flexShrink: 0 }}>
        <svg
          width="44"
          height="44"
          viewBox="0 0 40 40"
          fill="none"
          stroke="#000000"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6h5l3.5 17h18l3.5-12H11" />
          <line x1="14" y1="15" x2="31.5" y2="15" />
          <line x1="15.5" y1="19" x2="28" y2="19" />
          <line x1="19" y1="11" x2="18" y2="23" />
          <line x1="25" y1="11" x2="24" y2="23" />
          <circle cx="16" cy="29" r="2.8" fill="#000000" />
          <circle cx="28" cy="29" r="2.8" fill="#000000" />
        </svg>
      </div>

      {/* Right Card Content */}
      <div style={{ flex: 1, minWidth: 0, color: '#000000' }}>
        {/* Header: DP + Name + Username • Category */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: '#f97316',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 'bold',
              flexShrink: 0
            }}
          >
            {(creatorName || 'U')[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 'bold',
                fontSize: 15,
                color: '#000000',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                lineHeight: 1.2
              }}
            >
              {creatorName}
            </div>
            <div style={{ fontSize: 11, color: '#111111', marginTop: 1 }}>
              @{creatorUsername} • <span style={{ textTransform: 'capitalize' }}>{dish.category}</span>
            </div>
          </div>
        </div>

        {/* Description with read more */}
        <div
          style={{
            fontSize: 13,
            color: '#000000',
            lineHeight: 1.4,
            marginBottom: 4,
            wordBreak: 'break-word'
          }}
        >
          <span style={{ fontWeight: 600, color: '#000000' }}>Description: </span>
          {isExpanded || (dish.description || '').length <= 80
            ? dish.description
            : `${dish.description.slice(0, 80)}...`}
        </div>

        {(dish.description || '').length > 80 && (
          <div style={{ textAlign: 'right', marginBottom: 6 }}>
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              style={{
                background: 'none',
                border: 'none',
                color: '#000000',
                fontSize: 11,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
                fontWeight: 'bold'
              }}
            >
              {isExpanded ? 'show less' : 'read more'}
            </button>
          </div>
        )}

        {/* Meta Info Bar */}
        <div
          style={{
            fontSize: 11,
            color: '#000000',
            marginBottom: 10,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            fontWeight: '500'
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {dish.participants?.length || 1}/{dish.capacity?.max || 4} spots ({spotsLeft} left)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            • {dish.joinMode === 'auto' ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Auto-join
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Request approval
              </>
            )}
          </span>
          {dish.type === 'chefs_special' && (
            <span style={{ color: '#8b0000', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              • <svg width="12" height="12" viewBox="0 0 24 24" fill="#8b0000"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> Chef's Special
            </span>
          )}
        </div>

        {/* Creator Pending Requests Section */}
        {isCreator &&
          dish.requests?.filter((r) => r.status === 'pending').length > 0 && (
            <GlassContainer
              radius={16}
              innerStyle={{ padding: '8px 12px', marginBottom: 10, fontSize: 11, color: '#000000' }}
            >
              <strong>
                Pending Requests ({dish.requests.filter((r) => r.status === 'pending').length}):
              </strong>
              {dish.requests
                .filter((r) => r.status === 'pending')
                .map((r) => (
                  <div
                    key={r._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 4
                    }}
                  >
                    <span style={{ color: '#000000' }}>User: {r.user?._id || r.user}</span>
                    <div>
                      <button
                        onClick={() => onApproveRequest && onApproveRequest(dish._id, r._id)}
                        style={{
                          padding: '3px 8px',
                          fontSize: 11,
                          fontWeight: 600,
                          marginRight: 6,
                          color: '#15803d',
                          background: 'rgba(34, 197, 94, 0.12)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Approve
                      </button>
                      <button
                        onClick={() => onRejectRequest && onRejectRequest(dish._id, r._id)}
                        style={{
                          padding: '3px 8px',
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#b91c1c',
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
            </GlassContainer>
          )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {!isParticipant && !hasPendingReq && (
            <FluidButton
              onClick={() => onJoin && onJoin(dish._id)}
              style={{ padding: '5px 14px', fontSize: 12, fontWeight: 600 }}
            >
              {dish.joinMode === 'auto' ? 'Join Dish' : 'Request to Join'}
            </FluidButton>
          )}
          {hasPendingReq && (
            <span
              style={{
                fontSize: 11,
                color: '#000000',
                fontStyle: 'italic',
                alignSelf: 'center',
                fontWeight: 'bold'
              }}
            >
              Request pending approval
            </span>
          )}
          {isParticipant && !isCreator && (
            <FluidButton
              onClick={() => onLeave && onLeave(dish._id)}
              style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600 }}
            >
              Leave Dish
            </FluidButton>
          )}
          {isCreator && dish.status === 'lets_cook' && (
            <FluidButton
              onClick={() => onStartCooking && onStartCooking(dish._id)}
              style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600 }}
            >
              Start Cooking
            </FluidButton>
          )}
          {isCreator && dish.status === 'cooking' && (
            <FluidButton
              onClick={() => onMarkCooked && onMarkCooked(dish._id)}
              style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600 }}
            >
              Mark Cooked
            </FluidButton>
          )}
        </div>
      </div>
    </GlassContainer>
  );
}
