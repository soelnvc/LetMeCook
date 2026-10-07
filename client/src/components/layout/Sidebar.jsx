'use client';

import React, { useState } from 'react';
import GlassContainer from '@/components/ui/GlassContainer';

export default function Sidebar({
  user,
  activeTab,
  setActiveTab,
  showKitchenModal,
  setShowKitchenModal,
  showSearchModal,
  setShowSearchModal,
  onOpenSearch,
  setShowSettings,
  setShowAppearanceModal,
  setShowReportModal,
  unreadNotificationsCount = 0,
  onLogout
}) {
  const [navHovered, setNavHovered] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isAdult = Boolean(user?.age && Number(user.age) >= 18);

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: (isActive) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive ? '2' : '1.9'} strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    {
      id: 'dine-in',
      label: 'Dine in',
      icon: (isActive) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? '2.3' : '1.9'} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      )
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: (isActive) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive ? '2' : '1.9'} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      )
    },
    {
      id: 'search',
      label: 'Search',
      icon: (isActive) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? '2.5' : '2'} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: (isActive) => (
        <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill={isActive ? '#ef4444' : 'none'}
            stroke={isActive ? '#ef4444' : 'currentColor'}
            strokeWidth={isActive ? '2' : '1.9'}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {unreadNotificationsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                boxShadow: '0 0 0 1.5px #e6dfe4'
              }}
            />
          )}
        </span>
      )
    },
    {
      id: 'kitchen',
      label: 'Cook',
      icon: (isActive) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? '2.4' : '1.9'} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      )
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (isActive) => {
        const hasProfilePhoto = Boolean(user && (user.avatar || user.profilePhoto || user.profilePicture || user.avatarUrl));
        const profilePhotoUrl = user ? (user.avatar || user.profilePhoto || user.profilePicture || user.avatarUrl) : null;
        if (hasProfilePhoto) {
          return (
            <img
              src={profilePhotoUrl}
              alt={user?.name || user?.username || 'Profile'}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                objectFit: 'cover',
                display: 'block',
                boxShadow: isActive ? '0 0 0 2px #000000' : 'none'
              }}
            />
          );
        }
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive ? '2' : '1.9'} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      }
    }
  ];

  return (
    <div
      onMouseEnter={() => setNavHovered(true)}
      onMouseLeave={() => setNavHovered(false)}
      style={{
        width: 220,
        flexShrink: 0,
        position: 'relative'
      }}
    >
      <aside
        style={{
          width: navHovered ? 210 : 64,
          transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: '#e6dfe4',
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: 'inset -4px 0 16px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          height: '100vh',
          zIndex: 50,
          overflow: 'hidden'
        }}
      >
        {/* Top Brand / Logo */}
        <div
          style={{
            padding: '16px 10px 14px',
            display: 'flex',
            alignItems: 'center',
            height: 72,
            boxSizing: 'border-box'
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              minWidth: 44,
              flexShrink: 0,
              color: '#000000'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h20" />
              <path d="M4 12v6a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-6" />
              <path d="M8 8a4 4 0 0 1 8 0" />
              <path d="M12 2v2" />
            </svg>
          </span>
          <span
            style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: '-0.4px',
              color: '#000000',
              maxWidth: navHovered ? 140 : 0,
              opacity: navHovered ? 1 : 0,
              transform: navHovered ? 'translateX(0)' : 'translateX(-6px)',
              transition: 'max-width 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'inline-block',
              marginLeft: 6
            }}
          >
            LetMeCook
          </span>
        </div>

        {/* Navigation Links */}
        <div
          style={{
            padding: '12px 10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 8,
            flex: 1
          }}
        >
          {navItems
            .filter((item) => item.id !== 'global' || isAdult)
            .map((item) => {
            const isActive = item.id === 'search'
              ? Boolean(showSearchModal)
              : (item.id === 'kitchen' ? showKitchenModal : activeTab === item.id);
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'search') {
                    if (onOpenSearch) onOpenSearch();
                    else if (setShowSearchModal) setShowSearchModal(true);
                  } else if (item.id === 'kitchen') {
                    if (setShowKitchenModal) setShowKitchenModal(true);
                  } else {
                    if (setActiveTab) setActiveTab(item.id);
                    if (setShowSettings) setShowSettings(false);
                  }
                }}
                title={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  height: 44,
                  padding: 0,
                  borderRadius: 12,
                  background: isActive ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                  color: '#000000',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.16s ease',
                  boxSizing: 'border-box',
                  overflow: 'hidden'
                }}
                className="btn-zoom-click"
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 44,
                    height: 44,
                    minWidth: 44,
                    flexShrink: 0,
                    color: '#000000'
                  }}
                >
                  {item.icon(isActive)}
                </span>
                <span
                  style={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    color: '#000000',
                    fontSize: 14.5,
                    letterSpacing: '-0.1px',
                    fontWeight: isActive ? 700 : 500,
                    maxWidth: navHovered ? 130 : 0,
                    opacity: navHovered ? 1 : 0,
                    transform: navHovered ? 'translateX(0)' : 'translateX(-6px)',
                    transition: 'max-width 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'inline-block',
                    marginLeft: 6
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Area: Instagram style "More" button */}
        <div style={{ padding: '14px 10px', display: 'flex', borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <button
            onClick={() => setShowMoreMenu((prev) => !prev)}
            title="More"
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              height: 44,
              padding: 0,
              borderRadius: 12,
              background: showMoreMenu ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
              color: '#000000',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.16s ease',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}
            className="btn-zoom-click"
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                minWidth: 44,
                flexShrink: 0,
                color: '#000000'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={showMoreMenu ? '2.5' : '2'} strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </span>
            <span
              style={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                color: '#000000',
                fontSize: 14.5,
                letterSpacing: '-0.1px',
                fontWeight: showMoreMenu ? 700 : 500,
                maxWidth: navHovered ? 130 : 0,
                opacity: navHovered ? 1 : 0,
                transform: navHovered ? 'translateX(0)' : 'translateX(-6px)',
                transition: 'max-width 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'inline-block',
                marginLeft: 6
              }}
            >
              More
            </span>
          </button>
        </div>
      </aside>

      {/* MORE POPUP MENU */}
      {showMoreMenu && (
        <>
          <div
            onClick={() => setShowMoreMenu(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 90
            }}
          />

          <div
            style={{
              position: 'fixed',
              bottom: 68,
              left: 12,
              width: 220,
              zIndex: 100,
              animation: 'fadeSlideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <GlassContainer
              radius={18}
              borderWidth={1.5}
              style={{
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.06)'
              }}
              innerStyle={{
                padding: '8px 6px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              {/* Settings */}
              <button
                onClick={() => {
                  if (setActiveTab) setActiveTab('settings');
                  setShowMoreMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#000000',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Settings
              </button>

              {/* Appearance */}
              <button
                onClick={() => {
                  if (setShowAppearanceModal) setShowAppearanceModal(true);
                  setShowMoreMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#000000',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                Appearance
              </button>

              {/* Report a Problem */}
              <button
                onClick={() => {
                  if (setShowReportModal) setShowReportModal(true);
                  setShowMoreMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#000000',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Report a Problem
              </button>

              {/* Divider */}
              <div style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.08)', margin: '4px 6px' }} />

              {/* Logout */}
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  if (onLogout) onLogout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#ef4444',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Log out
              </button>
            </GlassContainer>
          </div>
        </>
      )}
    </div>
  );
}
