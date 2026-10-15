'use client';

import React from 'react';
import GlassContainer from '@/components/ui/GlassContainer';
import { useTheme } from '@/context/ThemeContext';

/**
 * MobileNav.jsx
 * Instagram Mobile UX inspired navigation:
 * 1. Mobile Top Header: Brand logo + Direct Message bubble + Heart Notifications
 * 2. Mobile Bottom Navbar: 5 core tabs (Home, Dine-in, Cook (+), Search, Profile)
 */
export default function MobileNav({
  user,
  activeTab,
  setActiveTab,
  showKitchenModal,
  setShowKitchenModal,
  showSearchModal,
  setShowSearchModal,
  unreadNotificationsCount = 0,
  unreadMessagesCount = 0,
  isViewingPeer = false,
  onBackFromPeer,
  activeChatUser = null,
  onBackFromChat,
  settingsSection = null,
  onBackFromSettings
}) {
  const { isDark, toggleTheme } = useTheme();
  const profilePhotoUrl = user ? (user.avatar || user.profilePhoto || user.profilePicture || user.avatarUrl) : null;

  // Contextual back action
  const hasBackAction = Boolean(
    (activeTab === 'profile' && isViewingPeer) ||
    (activeTab === 'messages' && activeChatUser) ||
    activeTab === 'settings' ||
    activeTab === 'notifications'
  );

  const handleBackClick = () => {
    if (activeTab === 'profile' && isViewingPeer && onBackFromPeer) {
      onBackFromPeer();
    } else if (activeTab === 'messages' && activeChatUser && onBackFromChat) {
      onBackFromChat();
    } else if (activeTab === 'settings' && onBackFromSettings) {
      onBackFromSettings();
    } else if (activeTab === 'notifications') {
      setActiveTab('home');
    } else {
      setActiveTab('home');
    }
  };

  const getBackTitle = () => {
    if (activeTab === 'messages' && activeChatUser) {
      return activeChatUser?.name || `@${activeChatUser?.username}` || 'Messages';
    }
    if (activeTab === 'profile') return 'Back';
    if (activeTab === 'settings') return 'Settings';
    if (activeTab === 'notifications') return 'Notifications';
    return 'Back';
  };

  return (
    <>
      {/* ========================================================= */}
      {/* 1. TOP MOBILE HEADER                                      */}
      {/* ========================================================= */}
      <header
        className="mobile-flex"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 52,
          backgroundColor: isDark ? 'rgba(18, 19, 22, 0.94)' : 'rgba(230, 223, 228, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
          zIndex: 70,
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          boxSizing: 'border-box'
        }}
      >
        {/* Left: Back button (contextual) OR Create Dish Plus Icon */}
        {hasBackAction ? (
          <button
            id="mobile-header-back"
            onClick={handleBackClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              padding: '6px 4px',
              cursor: 'pointer',
              color: isDark ? '#ffffff' : '#09090b',
              fontWeight: 700,
              fontSize: 14.5
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>{getBackTitle()}</span>
          </button>
        ) : (
          <button
            id="mobile-header-create-dish"
            onClick={() => setShowKitchenModal(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: 6,
              cursor: 'pointer',
              color: isDark ? '#ffffff' : '#09090b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8
            }}
            className="mobile-nav-item"
            title="Create Dish"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        )}

        {/* Top Middle: App Name (Centered) */}
        <div
          onClick={() => setActiveTab('home')}
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#ffffff' : '#000000'
            }}
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h20" />
              <path d="M4 12v6a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-6" />
              <path d="M8 8a4 4 0 0 1 8 0" />
              <path d="M12 2v2" />
            </svg>
          </span>
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: '-0.4px',
              color: isDark ? '#ffffff' : '#09090b',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            LetMeCook
          </span>
        </div>

        {/* Right side: Quick Theme Toggle & Notifications */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            id="mobile-header-theme-toggle"
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              padding: 6,
              cursor: 'pointer',
              color: isDark ? '#ffffff' : '#09090b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="mobile-nav-item"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <button
            id="mobile-header-notifications"
            onClick={() => setActiveTab('notifications')}
            style={{
              background: 'none',
              border: 'none',
              padding: 6,
              cursor: 'pointer',
              color: activeTab === 'notifications' ? '#ef4444' : (isDark ? '#ffffff' : '#09090b'),
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="mobile-nav-item"
            title="Notifications"
          >
            <svg
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill={activeTab === 'notifications' ? '#ef4444' : 'none'}
              stroke={activeTab === 'notifications' ? '#ef4444' : 'currentColor'}
              strokeWidth={activeTab === 'notifications' ? '2.2' : '1.9'}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {unreadNotificationsCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  boxShadow: isDark ? '0 0 0 2px #121316' : '0 0 0 2px #e6dfe4'
                }}
              />
            )}
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. BOTTOM MOBILE NAVIGATION BAR (Home, Dine in, Messages, Search, Profile) */}
      {/* ========================================================= */}
      <nav
        className="mobile-flex"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 54,
          backgroundColor: isDark ? 'rgba(18, 19, 22, 0.94)' : 'rgba(230, 223, 228, 0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
          zIndex: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingBottom: 'env(safe-area-inset-bottom, 6px)',
          paddingLeft: 8,
          paddingRight: 8,
          boxSizing: 'border-box'
        }}
      >
        {/* 1. Home Tab */}
        <button
          id="mobile-tab-home"
          onClick={() => setActiveTab('home')}
          className="mobile-nav-item"
          style={{
            background: 'none',
            border: 'none',
            padding: 8,
            cursor: 'pointer',
            color: activeTab === 'home' ? '#09090b' : '#52525b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}
          title="Home"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={activeTab === 'home' ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={activeTab === 'home' ? '2.3' : '1.8'}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>

        {/* 2. Dine-In Tab */}
        <button
          id="mobile-tab-dinein"
          onClick={() => setActiveTab('dine-in')}
          className="mobile-nav-item"
          style={{
            background: 'none',
            border: 'none',
            padding: 8,
            cursor: 'pointer',
            color: activeTab === 'dine-in' ? '#09090b' : '#52525b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}
          title="Dine in"
        >
          <svg
            width="23"
            height="23"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={activeTab === 'dine-in' ? '2.5' : '1.8'}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
            <line x1="6" y1="1" x2="6" y2="4" />
            <line x1="10" y1="1" x2="10" y2="4" />
            <line x1="14" y1="1" x2="14" y2="4" />
          </svg>
        </button>

        {/* 3. Messages Tab */}
        <button
          id="mobile-tab-messages"
          onClick={() => setActiveTab('messages')}
          className="mobile-nav-item"
          style={{
            background: 'none',
            border: 'none',
            padding: 8,
            cursor: 'pointer',
            color: activeTab === 'messages' ? '#09090b' : '#52525b',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}
          title="Messages"
        >
          <svg
            width="23"
            height="23"
            viewBox="0 0 24 24"
            fill={activeTab === 'messages' ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={activeTab === 'messages' ? '2.2' : '1.8'}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          {unreadMessagesCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 7,
                right: 'calc(50% - 13px)',
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                boxShadow: isDark ? '0 0 0 2px #121316' : '0 0 0 2px #e6dfe4'
              }}
            />
          )}
        </button>

        {/* 4. Search Tab */}
        <button
          id="mobile-tab-search"
          onClick={() => setShowSearchModal(true)}
          className="mobile-nav-item"
          style={{
            background: 'none',
            border: 'none',
            padding: 8,
            cursor: 'pointer',
            color: showSearchModal ? '#09090b' : '#52525b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}
          title="Search"
        >
          <svg
            width="23"
            height="23"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={showSearchModal ? '2.5' : '1.9'}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* 5. Profile Tab */}
        <button
          id="mobile-tab-profile"
          onClick={() => setActiveTab('profile')}
          className="mobile-nav-item"
          style={{
            background: 'none',
            border: 'none',
            padding: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}
          title="Profile"
        >
          {profilePhotoUrl ? (
            <img
              src={profilePhotoUrl}
              alt={user?.name || 'Profile'}
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                objectFit: 'cover',
                display: 'block',
                boxShadow: activeTab === 'profile' ? '0 0 0 2px #09090b' : 'none',
                border: '1px solid rgba(0, 0, 0, 0.1)'
              }}
            />
          ) : (
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                backgroundColor: '#18181b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                boxShadow: activeTab === 'profile' ? '0 0 0 2px #09090b' : 'none'
              }}
            >
              {(user?.name || user?.username || 'U')[0].toUpperCase()}
            </div>
          )}
        </button>
      </nav>
    </>
  );
}
