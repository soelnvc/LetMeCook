'use client';

import React, { useState } from 'react';
import FluidButton from '@/components/ui/FluidButton';
import GlassContainer from '@/components/ui/GlassContainer';

export default function ProfileHeader({
  user,
  isSelf = true,
  pronouns = '',
  instituteName = '',
  instituteYear = '',
  bio = '',
  interests = [],
  connectionsCount = 0,
  dishesCreatedCount,
  dishesJoinedCount,
  onEditProfile,
  onOpenSettings,
  onTabChange,
  onTagClick,
  onUpdateUser,
  onViewConnections,
  // 2nd person specific props:
  isConnected = false,
  isRequested = false,
  onToggleConnect,
  onMessage,
  onBlockUser,
  onReportUser
}) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    if (!isSelf) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        if (onUpdateUser) {
          Promise.resolve(onUpdateUser({ avatar: dataUrl }))
            .catch(() => {})
            .finally(() => setIsUploading(false));
        } else {
          setIsUploading(false);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const rawBio = user?.bio || bio || '';
  const isLong = rawBio.length > 90;
  const displayBio = isLong && !bioExpanded ? rawBio.slice(0, 90) + '...' : rawBio;
  const bioParts = displayBio ? displayBio.split(/(#[a-zA-Z0-9_]+)/g) : [];

  const hasAvatar = Boolean(
    user && (user.avatar || user.profilePhoto || user.profilePicture || user.avatarUrl)
  );
  const avatarUrl = user
    ? user.avatar || user.profilePhoto || user.profilePicture || user.avatarUrl
    : null;

  const displayInterests =
    (user?.interests && user.interests.length > 0)
      ? user.interests
      : (interests && interests.length > 0 ? interests : []);

  const displayInstitute = user?.institute?.name || (typeof user?.institute === 'string' ? user.institute : instituteName) || '';
  const displayYear = user?.institute?.year || instituteYear || '';

  return (
    <div style={{ display: 'flex', gap: 64, alignItems: 'flex-start', marginBottom: 44, position: 'relative' }}>
      {/* Profile Picture Column */}
      <div style={{ flexShrink: 0 }}>
        {isSelf && (
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        )}
        <div
          onClick={() => {
            if (isSelf) fileInputRef.current?.click();
          }}
          onMouseEnter={() => {
            if (isSelf) setIsHovered(true);
          }}
          onMouseLeave={() => {
            if (isSelf) setIsHovered(false);
          }}
          title={isSelf ? 'Click to update profile photo' : `@${user?.username || 'user'}`}
          style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            position: 'relative',
            cursor: isSelf ? 'pointer' : 'default',
            overflow: 'hidden',
            border: '2px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)'
          }}
        >
          {hasAvatar ? (
            <img
              src={avatarUrl}
              alt={user?.name || user?.username || 'Profile'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#f97316',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 54,
                fontWeight: 800,
                userSelect: 'none'
              }}
            >
              {(user?.name || user?.username || 'S')[0].toUpperCase()}
            </div>
          )}

          {/* Hover / Upload overlay (ONLY for self) */}
          {isSelf && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                color: '#ffffff',
                opacity: isHovered || isUploading ? 1 : 0,
                transition: 'opacity 0.2s ease',
                backdropFilter: 'blur(2px)'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3px' }}>
                {isUploading ? 'Saving...' : 'Update DP'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Information Column */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Row 1: Username + Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2
              style={{
                fontSize: 21,
                fontWeight: 600,
                margin: 0,
                color: '#000000',
                letterSpacing: '-0.3px'
              }}
            >
              {user?.username || 'user'}
            </h2>
            {/* Verified badge */}
            <span
              title="Verified Campus Peer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0095f6'
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#0095f6">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </span>
          </div>

          {/* Action Buttons: Self vs 2nd Person */}
          {isSelf ? (
            <>
              <FluidButton
                onClick={onEditProfile}
                style={{
                  padding: '7px 20px',
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                Edit Profile
              </FluidButton>

              <FluidButton
                variant="icon"
                onClick={onOpenSettings}
                title="Settings & Privacy"
                style={{
                  width: 34,
                  height: 34,
                  minWidth: 34,
                  minHeight: 34,
                  color: '#000000'
                }}
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </FluidButton>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Connect / Following Button */}
              <FluidButton
                onClick={onToggleConnect}
                style={{
                  padding: '7px 22px',
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: isConnected ? '#16a34a' : isRequested ? '#2563eb' : '#000000'
                }}
              >
                {isConnected ? 'Connected' : isRequested ? 'Requested' : 'Connect'}
              </FluidButton>

              {/* Message Button */}
              <FluidButton
                onClick={onMessage}
                style={{
                  padding: '7px 22px',
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                Message
              </FluidButton>

              {/* Options '...' menu */}
              <div style={{ position: 'relative' }}>
                <FluidButton
                  variant="icon"
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  title="More options"
                  style={{
                    width: 34,
                    height: 34,
                    minWidth: 34,
                    minHeight: 34,
                    color: '#000000'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="19" cy="12" r="1.5" />
                    <circle cx="5" cy="12" r="1.5" />
                  </svg>
                </FluidButton>

                {showOptionsMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '120%',
                      right: 0,
                      zIndex: 120,
                      width: 200
                    }}
                  >
                    <GlassContainer
                      radius={18}
                      borderWidth={1.5}
                      style={{ width: '100%', boxShadow: '0 16px 40px rgba(0, 0, 0, 0.16)' }}
                      innerStyle={{
                        padding: '8px 6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        color: '#000000'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          if (onBlockUser) onBlockUser(user?.username);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '9px 12px',
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#dc2626',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: 10,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.08)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                        </svg>
                        Block @{user?.username}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          if (onReportUser) onReportUser(user?.username);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '9px 12px',
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#b91c1c',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: 10,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(185, 28, 28, 0.08)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                          <line x1="4" y1="22" x2="4" y2="15" />
                        </svg>
                        Report @{user?.username}
                      </button>
                      <div style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.08)', margin: '3px 6px' }} />
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          if (typeof navigator !== 'undefined' && navigator.clipboard) {
                            navigator.clipboard.writeText(`${window.location.origin}/@${user?.username || 'user'}`);
                            setLinkCopied(true);
                            setTimeout(() => setLinkCopied(false), 2000);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '9px 12px',
                          fontSize: 13,
                          fontWeight: 500,
                          color: '#09090b',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: 10,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        {linkCopied ? 'Link Copied!' : 'Copy Profile Link'}
                      </button>
                    </GlassContainer>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Row 2: Stats Row */}
        <div style={{ display: 'flex', gap: 36, fontSize: 15.5, color: '#000000' }}>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => onTabChange && onTabChange('dishes')}
          >
            <strong>{dishesCreatedCount ?? user?.stats?.dishesCreated ?? 0}</strong> cooked
          </span>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => onTabChange && onTabChange('joined')}
          >
            <strong>{dishesJoinedCount ?? user?.stats?.dishesJoined ?? 0}</strong> joined
          </span>
          <span
            style={{ cursor: isSelf ? 'pointer' : 'default' }}
            onClick={() => {
              if (isSelf) {
                if (onViewConnections) onViewConnections();
                else if (onOpenSettings) onOpenSettings();
              }
            }}
          >
            <strong>{connectionsCount ?? 0}</strong> connections
          </span>
        </div>

        {/* Row 3: Name, Pronouns, Verified Institute, Bio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, lineHeight: 1.45 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#000000' }}>
              {user?.name || user?.username || ''}
            </span>
            {(pronouns || user?.pronouns) && (
              <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
                {user?.pronouns || pronouns}
              </span>
            )}
          </div>

          {/* Institute with Verified Tick Badge & SVG Cap Icon (Only when institute exists) */}
          {displayInstitute && (
            <div
              style={{
                fontSize: 13.5,
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexWrap: 'wrap'
              }}
            >
              <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                {displayInstitute}
              </span>
              {user?.institute?.verified && (
                <span
                  title="Verified Institute Student"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0095f6'
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#0095f6">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </span>
              )}
              {displayYear && (
                <span style={{ color: '#6b7280', fontWeight: 500 }}>
                  • Batch of {displayYear}
                </span>
              )}
            </div>
          )}

          {/* Bio with Blue Hashtags Inside */}
          {rawBio ? (
            <div style={{ color: '#111827', marginTop: 4, maxWidth: 540 }}>
              <span>
                {bioParts.map((part, i) => {
                  if (part.startsWith('#')) {
                    return (
                      <span
                        key={i}
                        style={{
                          color: '#0095f6',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'opacity 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        {part}
                      </span>
                    );
                  }
                  return part;
                })}
              </span>
              {isLong && (
                <button
                  onClick={() => setBioExpanded(!bioExpanded)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontWeight: 600,
                    fontSize: 13,
                    marginLeft: 6,
                    padding: 0
                  }}
                >
                  {bioExpanded ? 'show less' : 'more'}
                </button>
              )}
            </div>
          ) : (
            isSelf && (
              <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: 13, marginTop: 4 }}>
                No bio added yet.
              </div>
            )
          )}

          {/* Tags using FluidButton aesthetics */}
          {displayInterests && displayInterests.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {displayInterests.map((tag, idx) => (
                <FluidButton
                  key={idx}
                  onClick={() => onTagClick && onTagClick(tag)}
                  style={{
                    padding: '5px 14px',
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: '#111827'
                  }}
                >
                  {tag.startsWith('#') ? tag.slice(1) : tag}
                </FluidButton>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

