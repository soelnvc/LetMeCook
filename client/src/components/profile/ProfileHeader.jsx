'use client';

import React, { useState } from 'react';

export default function ProfileHeader({
  user,
  pronouns = 'He/Him',
  instituteName = 'IIT MADRAS',
  instituteYear = '2029',
  bio = '',
  interests = ['music', 'Gym', 'Sports', 'Anime', 'Coffee'],
  connectionsCount = 72,
  onEditProfile,
  onOpenSettings,
  onTabChange
}) {
  const [bioExpanded, setBioExpanded] = useState(false);

  const rawBio =
    user?.bio ||
    bio ||
    "Always down for badminton, late night study sessions, gym workouts, or grabbing coffee at the campus cafe. Let's cook! #Badminton #Gym #Study #Gaming #Coffee";
  const isLong = rawBio.length > 90;
  const displayBio = isLong && !bioExpanded ? rawBio.slice(0, 90) + '...' : rawBio;
  const bioParts = displayBio.split(/(#[a-zA-Z0-9_]+)/g);

  const hasAvatar = Boolean(
    user && (user.avatar || user.profilePhoto || user.profilePicture || user.avatarUrl)
  );
  const avatarUrl = user
    ? user.avatar || user.profilePhoto || user.profilePicture || user.avatarUrl
    : null;

  return (
    <div style={{ display: 'flex', gap: 64, alignItems: 'flex-start', marginBottom: 44 }}>
      {/* Profile Picture Column */}
      <div style={{ flexShrink: 0 }}>
        {hasAvatar ? (
          <img
            src={avatarUrl}
            alt={user?.name || user?.username || 'Profile'}
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        ) : (
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
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
      </div>

      {/* Profile Information Column */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Row 1: Username + Edit Profile + Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <h2
            style={{
              fontSize: 21,
              fontWeight: 600,
              margin: 0,
              color: '#000000',
              letterSpacing: '-0.3px'
            }}
          >
            {user?.username || 'soelnvc'}
          </h2>

          <button
            onClick={onEditProfile}
            style={{
              padding: '7px 18px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              backgroundColor: 'rgba(0, 0, 0, 0.08)',
              border: 'none',
              color: '#000000',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.08)')}
          >
            Edit Profile
          </button>

          <button
            onClick={onOpenSettings}
            title="Settings & Privacy"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#000000',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg
              width="20"
              height="20"
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
          </button>
        </div>

        {/* Row 2: Stats Row */}
        <div style={{ display: 'flex', gap: 36, fontSize: 15.5, color: '#000000' }}>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => onTabChange && onTabChange('dishes')}
          >
            <strong>{user?.stats?.dishesCreated ?? 17}</strong> cooked
          </span>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => onTabChange && onTabChange('joined')}
          >
            <strong>{user?.stats?.dishesJoined ?? 19}</strong> joined
          </span>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => onOpenSettings && onOpenSettings()}
          >
            <strong>{connectionsCount}</strong> connections
          </span>
        </div>

        {/* Row 3: Name, Pronouns, Verified Institute, Bio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, lineHeight: 1.45 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#000000' }}>
              {user?.name || 'Sid G'}
            </span>
            <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
              {pronouns || user?.pronouns || 'He/Him'}
            </span>
          </div>

          {/* Institute with Verified Tick Badge */}
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
            <span style={{ fontWeight: 600 }}>
              🎓 {user?.institute?.name || instituteName || 'IIT MADRAS'}
            </span>
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
            <span style={{ color: '#6b7280', fontWeight: 500 }}>
              • Batch of {user?.institute?.year || instituteYear || '2029'}
            </span>
          </div>

          {/* Bio with Blue Hashtags Inside */}
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

          {/* Tags using Button Aesthetics */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {(interests && interests.length > 0
              ? interests
              : ['music', 'Gym', 'Sports', 'Anime', 'Coffee']
            ).map((tag, idx) => (
              <button
                key={idx}
                type="button"
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 12.5,
                  fontWeight: 600,
                  backgroundColor: 'rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  color: '#111827',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)')}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
