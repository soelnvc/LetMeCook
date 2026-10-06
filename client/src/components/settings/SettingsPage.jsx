'use client';

import React, { useState, useMemo } from 'react';
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';

export default function SettingsPage({
  user,
  onLogout,
  onUpdateUser,
  onOpenEditProfile,
  themePreference = 'system',
  onThemeChange
}) {
  // Navigation active section
  const [activeSection, setActiveSection] = useState('privacy'); // 'account' | 'privacy' | 'safety' | 'notifications' | 'appearance' | 'management'
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // 1. Privacy Settings States
  const [bioVisibility, setBioVisibility] = useState(user?.privacy?.bioVisibility || 'everyone');
  const [instituteVisibility, setInstituteVisibility] = useState(user?.privacy?.instituteVisibility || 'institute');
  const [avatarVisibility, setAvatarVisibility] = useState(user?.privacy?.avatarVisibility || 'everyone');
  const [invitePermission, setInvitePermission] = useState(user?.privacy?.invitePermission || 'everyone');
  const [messagePermission, setMessagePermission] = useState(user?.privacy?.messagePermission || 'everyone');
  const [globalDiscovery, setGlobalDiscovery] = useState(user?.privacy?.globalDiscovery ?? true);
  const [activityVisibility, setActivityVisibility] = useState(user?.privacy?.activityVisibility ?? true);

  // 2. Safety Settings States
  const [locationPrivacy, setLocationPrivacy] = useState('approximate'); // 'never' | 'approximate' | 'on_start'
  const [blockedUsers, setBlockedUsers] = useState(['alex_fake_bot', 'spammer_99']);
  const [newBlockInput, setNewBlockInput] = useState('');
  const [restrictedUsers, setRestrictedUsers] = useState(['campus_troll_01']);
  const [reportHistory] = useState([
    { id: 'rep-1', target: 'Fake Badminton Ticket', date: '2 days ago', status: 'Resolved • Removed' },
    { id: 'rep-2', target: 'Harassment in Chat', date: 'Last week', status: 'Action Taken • User Warned' }
  ]);

  // 3. Notification Settings States
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [notifPreferences, setNotifPreferences] = useState({
    dishInvites: true,
    joinRequests: true,
    joinApprovals: true,
    dishMessages: true,
    dmRequests: true,
    connections: true,
    cookingReminders: true,
    dishExpiry: true,
    verificationUpdates: true
  });

  // 4. Appearance Settings States
  const [currentTheme, setCurrentTheme] = useState(themePreference || 'system'); // 'light' | 'dark' | 'system'

  // 5. Credentials & Verification States
  const [mobileNumber, setMobileNumber] = useState(user?.mobile || '+91 98765 43210');
  const [emailAddress, setEmailAddress] = useState(user?.email || 's.sharma@smail.iitm.ac.in');
  const [age, setAge] = useState(user?.age || '21');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [address, setAddress] = useState(user?.address || 'Mandakini Hostel, Room 314, Campus Zone');
  const [idVerificationStatus, setIdVerificationStatus] = useState(user?.idVerified ? 'verified' : 'unverified');

  // 6. Security & Management States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Feedback helper
  const triggerSuccess = (msg) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg('');
    }, 3000);
  };

  // Nav items configuration (Instagram grouped layout)
  const navSections = [
    {
      group: 'Your Account',
      items: [
        {
          id: 'account',
          label: 'Account & Verification',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )
        },
        {
          id: 'management',
          label: 'Account Management',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          )
        }
      ]
    },
    {
      group: 'Privacy & Safety',
      items: [
        {
          id: 'privacy',
          label: 'Privacy',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )
        },
        {
          id: 'safety',
          label: 'Safety & Location',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          )
        }
      ]
    },
    {
      group: 'Preferences',
      items: [
        {
          id: 'notifications',
          label: 'Notifications',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          )
        },
        {
          id: 'appearance',
          label: 'Appearance',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          )
        }
      ]
    }
  ];

  // Filtered nav items based on search query
  const filteredNavSections = useMemo(() => {
    if (!searchQuery.trim()) return navSections;
    const q = searchQuery.toLowerCase().trim();
    return navSections
      .map((sec) => ({
        ...sec,
        items: sec.items.filter((it) => it.label.toLowerCase().includes(q))
      }))
      .filter((sec) => sec.items.length > 0);
  }, [searchQuery]);

  // Handle privacy save
  const handleSavePrivacy = (e) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({
        privacy: {
          bioVisibility,
          instituteVisibility,
          avatarVisibility,
          invitePermission,
          messagePermission,
          globalDiscovery,
          activityVisibility
        }
      });
    }
    triggerSuccess('Privacy settings saved successfully');
  };

  // Handle account credentials save
  const handleSaveAccount = (e) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({
        mobile: mobileNumber,
        email: emailAddress,
        age: Number(age),
        gender,
        address
      });
    }
    triggerSuccess('Account & Personal Information updated');
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1040,
        margin: '0 auto',
        padding: '16px 12px 64px 12px',
        color: '#09090b',
        boxSizing: 'border-box'
      }}
    >
      {/* Toast Feedback */}
      {saveSuccessMsg && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            background: '#09090b',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: 9999,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {saveSuccessMsg}
        </div>
      )}

      {/* Main Split Layout (Instagram Settings Alignment) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 24,
          alignItems: 'flex-start',
          flexWrap: 'wrap'
        }}
      >
        {/* ========================================================= */}
        {/* LEFT COLUMN: SETTINGS NAVIGATION (Instagram Sidebar Style) */}
        {/* ========================================================= */}
        <aside
          style={{
            width: '100%',
            maxWidth: 270,
            flex: '0 0 270px'
          }}
        >
          <GlassContainer
            radius={24}
            innerStyle={{
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            {/* Header */}
            <div>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  margin: '0 0 12px 0',
                  letterSpacing: '-0.02em',
                  color: '#09090b'
                }}
              >
                Settings
              </h2>

              {/* Instagram-style Search */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(0, 0, 0, 0.04)',
                  borderRadius: 9999,
                  padding: '7px 12px',
                  gap: 8,
                  border: '1px solid rgba(0, 0, 0, 0.06)'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search settings..."
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: 12.5,
                    color: '#09090b',
                    outline: 'none',
                    width: '100%'
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#71717a' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Grouped Nav Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filteredNavSections.map((sec, idx) => (
                <div key={idx}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      color: '#71717a',
                      marginBottom: 6,
                      paddingLeft: 8
                    }}
                  >
                    {sec.group}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {sec.items.map((item) => {
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '9px 12px',
                            borderRadius: 12,
                            border: 'none',
                            background: isActive ? '#09090b' : 'transparent',
                            color: isActive ? '#ffffff' : '#27272a',
                            fontSize: 13,
                            fontWeight: isActive ? 700 : 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <span style={{ color: isActive ? '#ffffff' : '#09090b', display: 'flex' }}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </GlassContainer>
        </aside>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: ACTIVE SETTINGS PANEL                        */}
        {/* ========================================================= */}
        <main
          style={{
            flex: '1 1 560px',
            minWidth: 320
          }}
        >
          {/* SECTION 1: PRIVACY */}
          {activeSection === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                  Privacy Controls
                </h2>
                <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>
                  Manage student visibility, network discovery, and who can interact with you on campus.
                </p>
              </div>

              <form onSubmit={handleSavePrivacy} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Visibility Controls Card */}
                <GlassContainer radius={22} innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                    Visibility Controls
                  </h3>

                  {/* 1. Bio Visible to */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>
                      Bio Visible to
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {['everyone', 'institute', 'connections', 'nobody'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setBioVisibility(opt)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 9999,
                            fontSize: 12,
                            fontWeight: bioVisibility === opt ? 700 : 500,
                            cursor: 'pointer',
                            border: bioVisibility === opt ? '1.5px solid #09090b' : '1px solid rgba(0, 0, 0, 0.08)',
                            background: bioVisibility === opt ? 'rgba(0, 0, 0, 0.07)' : 'transparent',
                            color: '#09090b',
                            textTransform: 'capitalize'
                          }}
                        >
                          {opt === 'institute' ? 'Institute only' : opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Institute Visibility */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>
                      Institute Visibility
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {['everyone', 'institute', 'nobody'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setInstituteVisibility(opt)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 9999,
                            fontSize: 12,
                            fontWeight: instituteVisibility === opt ? 700 : 500,
                            cursor: 'pointer',
                            border: instituteVisibility === opt ? '1.5px solid #09090b' : '1px solid rgba(0, 0, 0, 0.08)',
                            background: instituteVisibility === opt ? 'rgba(0, 0, 0, 0.07)' : 'transparent',
                            color: '#09090b',
                            textTransform: 'capitalize'
                          }}
                        >
                          {opt === 'institute' ? 'Institute only' : opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. DP (Avatar) Visibility */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>
                      DP (Avatar) Visibility
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {['everyone', 'institute', 'connections', 'nobody'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAvatarVisibility(opt)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 9999,
                            fontSize: 12,
                            fontWeight: avatarVisibility === opt ? 700 : 500,
                            cursor: 'pointer',
                            border: avatarVisibility === opt ? '1.5px solid #09090b' : '1px solid rgba(0, 0, 0, 0.08)',
                            background: avatarVisibility === opt ? 'rgba(0, 0, 0, 0.07)' : 'transparent',
                            color: '#09090b',
                            textTransform: 'capitalize'
                          }}
                        >
                          {opt === 'institute' ? 'Institute only' : opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Who Can Invite */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>
                      Who Can Invite You to Dishes
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {['everyone', 'institute', 'connections', 'nobody'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setInvitePermission(opt)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 9999,
                            fontSize: 12,
                            fontWeight: invitePermission === opt ? 700 : 500,
                            cursor: 'pointer',
                            border: invitePermission === opt ? '1.5px solid #09090b' : '1px solid rgba(0, 0, 0, 0.08)',
                            background: invitePermission === opt ? 'rgba(0, 0, 0, 0.07)' : 'transparent',
                            color: '#09090b',
                            textTransform: 'capitalize'
                          }}
                        >
                          {opt === 'institute' ? 'Institute only' : opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5. Who Can Message */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>
                      Who Can Message (DMs)
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {['everyone', 'institute', 'connections', 'nobody'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setMessagePermission(opt)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 9999,
                            fontSize: 12,
                            fontWeight: messagePermission === opt ? 700 : 500,
                            cursor: 'pointer',
                            border: messagePermission === opt ? '1.5px solid #09090b' : '1px solid rgba(0, 0, 0, 0.08)',
                            background: messagePermission === opt ? 'rgba(0, 0, 0, 0.07)' : 'transparent',
                            color: '#09090b',
                            textTransform: 'capitalize'
                          }}
                        >
                          {opt === 'institute' ? 'Institute only' : opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </GlassContainer>

                {/* Discovery & Activity Card */}
                <GlassContainer radius={22} innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                    Discovery & Activity
                  </h3>

                  {/* Profile Discovery Toggle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#09090b' }}>
                        Global Profile Discovery
                      </div>
                      <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>
                        Allow my profile to appear in Global discovery. Useful for students wanting wider coordination within 5km radius.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={globalDiscovery}
                      onChange={(e) => setGlobalDiscovery(e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: '#09090b', cursor: 'pointer' }}
                    />
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid rgba(0, 0, 0, 0.06)', margin: '4px 0' }} />

                  {/* Activity Visibility Toggle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#09090b' }}>
                        Activity Visibility
                      </div>
                      <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>
                        Show my active Cooking on profile. (Defaults ON as it is core to activity coordination).
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={activityVisibility}
                      onChange={(e) => setActivityVisibility(e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: '#09090b', cursor: 'pointer' }}
                    />
                  </div>
                </GlassContainer>

                <FluidButton
                  type="submit"
                  style={{
                    padding: '9px 24px',
                    fontSize: 13,
                    fontWeight: 700,
                    alignSelf: 'flex-start'
                  }}
                >
                  Save Privacy Settings
                </FluidButton>
              </form>
            </div>
          )}

          {/* SECTION 2: SAFETY */}
          {activeSection === 'safety' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                  Safety & Location Privacy
                </h2>
                <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>
                  Controls for campus stranger-safety, location precision, and user blocking.
                </p>
              </div>

              {/* Location Privacy Card */}
              <GlassContainer radius={22} innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                  Location Privacy
                </h3>
                <p style={{ fontSize: 12.5, color: '#71717a', margin: 0 }}>
                  Important: Exact meeting spot coordinates are never broadcast publicly.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { id: 'never', title: 'Never show exact location', desc: 'Only displays your registered institute name.' },
                    { id: 'approximate', title: 'Show approximate area/institute only', desc: 'Displays campus zone (~500m radius) without exact building.' },
                    { id: 'on_start', title: 'Share exact spot only when dish is accepted', desc: 'Exact spot is revealed only after mutual confirmation.' }
                  ].map((item) => (
                    <label
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 12,
                        background: locationPrivacy === item.id ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="radio"
                        name="locationPrivacy"
                        checked={locationPrivacy === item.id}
                        onChange={() => {
                          setLocationPrivacy(item.id);
                          triggerSuccess('Location privacy updated');
                        }}
                        style={{ marginTop: 2, accentColor: '#09090b' }}
                      />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#09090b' }}>{item.title}</div>
                        <div style={{ fontSize: 11.5, color: '#71717a', marginTop: 1 }}>{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </GlassContainer>

              {/* Blocked & Restricted Users Card */}
              <GlassContainer radius={22} innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                  Blocked & Restricted Accounts
                </h3>

                {/* Block a user form */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={newBlockInput}
                    onChange={(e) => setNewBlockInput(e.target.value)}
                    placeholder="Enter @username to block..."
                    style={{
                      flex: 1,
                      padding: '8px 14px',
                      borderRadius: 9999,
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      fontSize: 12.5,
                      outline: 'none',
                      background: 'rgba(255, 255, 255, 0.6)'
                    }}
                  />
                  <FluidButton
                    onClick={() => {
                      if (newBlockInput.trim()) {
                        setBlockedUsers((prev) => [...prev, newBlockInput.trim()]);
                        setNewBlockInput('');
                        triggerSuccess('User blocked');
                      }
                    }}
                    style={{ padding: '6px 16px', fontSize: 12, fontWeight: 600 }}
                  >
                    Block
                  </FluidButton>
                </div>

                {/* Blocked list */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#71717a', marginBottom: 6 }}>
                    Blocked Users ({blockedUsers.length})
                  </div>
                  {blockedUsers.length === 0 ? (
                    <div style={{ fontSize: 12, color: '#71717a' }}>No blocked accounts.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {blockedUsers.map((bUser) => (
                        <div
                          key={bUser}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 12px',
                            borderRadius: 10,
                            background: 'rgba(0, 0, 0, 0.03)'
                          }}
                        >
                          <span style={{ fontSize: 12.5, fontWeight: 600 }}>@{bUser}</span>
                          <button
                            onClick={() => {
                              setBlockedUsers((prev) => prev.filter((u) => u !== bUser));
                              triggerSuccess('User unblocked');
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#dc2626',
                              fontSize: 11.5,
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Unblock
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Restricted Users */}
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#71717a', marginBottom: 6 }}>
                    Hidden / Restricted Users ({restrictedUsers.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {restrictedUsers.map((rUser) => (
                      <div
                        key={rUser}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 12px',
                          borderRadius: 10,
                          background: 'rgba(0, 0, 0, 0.03)'
                        }}
                      >
                        <span style={{ fontSize: 12.5, fontWeight: 600 }}>@{rUser}</span>
                        <button
                          onClick={() => {
                            setRestrictedUsers((prev) => prev.filter((u) => u !== rUser));
                            triggerSuccess('Restriction removed');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#71717a',
                            fontSize: 11.5,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassContainer>

              {/* Safety Center & Report History */}
              <GlassContainer radius={22} innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                  Safety Center & Guidelines
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(0, 0, 0, 0.03)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#09090b' }}>
                      Stranger-Safety & Public Campus Zones
                    </div>
                    <div style={{ fontSize: 12, color: '#52525b', marginTop: 2 }}>
                      Always schedule meeting checkpoints in open campus areas (Libraries, SAC, Sports complex, or Campus Cafes) before starting activities.
                    </div>
                  </div>

                  <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(0, 0, 0, 0.03)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#09090b' }}>
                      Reporting & Immediate Review
                    </div>
                    <div style={{ fontSize: 12, color: '#52525b', marginTop: 2 }}>
                      Reports remain completely anonymous to the reported user. Moderators verify reports against community safety standards.
                    </div>
                  </div>
                </div>

                {/* Report History */}
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#71717a', marginBottom: 6 }}>
                    Your Report History
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {reportHistory.map((rep) => (
                      <div
                        key={rep.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: 10,
                          background: 'rgba(0, 0, 0, 0.02)',
                          fontSize: 12
                        }}
                      >
                        <div>
                          <strong style={{ color: '#09090b' }}>{rep.target}</strong>
                          <span style={{ color: '#71717a', marginLeft: 6 }}>• {rep.date}</span>
                        </div>
                        <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 11.5 }}>
                          {rep.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassContainer>
            </div>
          )}

          {/* SECTION 3: NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                  Notification Controls
                </h2>
                <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>
                  Manage delivery channels and granular alerts for active dishes, requests, and campus events.
                </p>
              </div>

              {/* Channels Card */}
              <GlassContainer radius={22} innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                  Delivery Channels
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Push Notifications</div>
                    <div style={{ fontSize: 12, color: '#71717a' }}>Real-time updates to your browser or device</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushEnabled}
                    onChange={(e) => setPushEnabled(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#09090b', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Email Digests</div>
                    <div style={{ fontSize: 12, color: '#71717a' }}>Weekly campus roundup & important verification notices</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#09090b', cursor: 'pointer' }}
                  />
                </div>
              </GlassContainer>

              {/* Granular Activity Alerts */}
              <GlassContainer radius={22} innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                  Dish & Activity Alerts
                </h3>

                {[
                  { key: 'dishInvites', label: 'Dish Invites', desc: 'When peers invite you to join an activity' },
                  { key: 'joinRequests', label: 'Join Requests', desc: 'When someone asks to join your created dish' },
                  { key: 'joinApprovals', label: 'Join Approvals', desc: 'When your request to join a dish is approved' },
                  { key: 'dishMessages', label: 'Dish Group Chat', desc: 'New messages in active dish activity rooms' },
                  { key: 'dmRequests', label: 'DM Requests', desc: 'Direct message requests from campus connections' },
                  { key: 'connections', label: 'Connection Requests', desc: 'When a student requests to connect with you' },
                  { key: 'cookingReminders', label: 'Cooking Reminders', desc: '15-minute countdown before your activity starts' },
                  { key: 'dishExpiry', label: 'Dish Expiry & Completion', desc: 'When dishes expire or get marked cooked' },
                  { key: 'verificationUpdates', label: 'Verification Updates', desc: 'Institute and identity validation status' }
                ].map((item) => (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 0',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#09090b' }}>{item.label}</div>
                      <div style={{ fontSize: 11.5, color: '#71717a' }}>{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPreferences[item.key]}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setNotifPreferences((prev) => ({ ...prev, [item.key]: val }));
                      }}
                      style={{ width: 17, height: 17, accentColor: '#09090b', cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </GlassContainer>

              <FluidButton
                onClick={() => triggerSuccess('Notification preferences saved')}
                style={{ padding: '9px 24px', fontSize: 13, fontWeight: 700, alignSelf: 'flex-start' }}
              >
                Save Notifications
              </FluidButton>
            </div>
          )}

          {/* SECTION 4: APPEARANCE */}
          {activeSection === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                  Appearance & Theme
                </h2>
                <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>
                  Customize interface aesthetics, contrast, and color palette.
                </p>
              </div>

              <GlassContainer radius={22} innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                  Theme Selector
                </h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: 12
                  }}
                >
                  {[
                    {
                      id: 'light',
                      title: 'Light Mode',
                      icon: (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="5" />
                          <line x1="12" y1="1" x2="12" y2="3" />
                          <line x1="12" y1="21" x2="12" y2="23" />
                        </svg>
                      )
                    },
                    {
                      id: 'dark',
                      title: 'Dark Mode',
                      icon: (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                      )
                    },
                    {
                      id: 'system',
                      title: 'System Default',
                      icon: (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                      )
                    }
                  ].map((mode) => {
                    const isSelected = currentTheme === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          setCurrentTheme(mode.id);
                          if (onThemeChange) onThemeChange(mode.id);
                          triggerSuccess(`Theme set to ${mode.title}`);
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 10,
                          padding: '16px 12px',
                          borderRadius: 16,
                          border: isSelected ? '2px solid #09090b' : '1px solid rgba(0, 0, 0, 0.08)',
                          background: isSelected ? 'rgba(0, 0, 0, 0.06)' : 'transparent',
                          cursor: 'pointer',
                          color: '#09090b',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {mode.icon}
                        <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500 }}>
                          {mode.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </GlassContainer>
            </div>
          )}

          {/* SECTION 5: ACCOUNT & VERIFICATION */}
          {activeSection === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                  Account & Verification
                </h2>
                <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>
                  Manage credentials, student institute verification, and personal information.
                </p>
              </div>

              {/* Instagram-style Profile Card */}
              <GlassContainer radius={22} innerStyle={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: '#f97316',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      fontWeight: 800
                    }}
                  >
                    {(user?.name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>@{user?.username || 'user'}</div>
                    <div style={{ fontSize: 12.5, color: '#71717a' }}>{user?.institute?.name || 'IIT Madras'}</div>
                  </div>
                </div>

                <FluidButton
                  onClick={() => onOpenEditProfile && onOpenEditProfile()}
                  style={{ padding: '6px 16px', fontSize: 12, fontWeight: 600 }}
                >
                  Edit Profile
                </FluidButton>
              </GlassContainer>

              <form onSubmit={handleSaveAccount} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Account Details Card */}
                <GlassContainer radius={22} innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                    Account Credentials
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#52525b', marginBottom: 4 }}>
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 10,
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          background: 'rgba(255, 255, 255, 0.7)',
                          fontSize: 13,
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#52525b', marginBottom: 4 }}>
                        Institute Email
                      </label>
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 10,
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          background: 'rgba(255, 255, 255, 0.7)',
                          fontSize: 13,
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#52525b', marginBottom: 4 }}>
                        Age
                      </label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 10,
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          background: 'rgba(255, 255, 255, 0.7)',
                          fontSize: 13,
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#52525b', marginBottom: 4 }}>
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 10,
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          background: '#ffffff',
                          fontSize: 13,
                          outline: 'none',
                          boxSizing: 'border-box',
                          color: '#09090b'
                        }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </GlassContainer>

                {/* Verification Status Card */}
                <GlassContainer radius={22} innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                    Campus & Identity Verification
                  </h3>

                  {/* Institute Verification */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(22, 163, 74, 0.08)',
                      border: '1px solid rgba(22, 163, 74, 0.2)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        Institute Verified: {user?.institute?.name || 'IIT Madras'}
                      </div>
                      <div style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>
                        Batch of {user?.institute?.year || '2029'} • Verified via institutional smail
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 9999,
                        background: '#15803d',
                        color: '#ffffff',
                        fontSize: 11,
                        fontWeight: 700
                      }}
                    >
                      Active
                    </span>
                  </div>

                  {/* Government ID Verification (Optional) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(0, 0, 0, 0.03)',
                      border: '1px solid rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#09090b' }}>
                        Government ID Verification (Optional)
                      </div>
                      <div style={{ fontSize: 11.5, color: '#71717a', marginTop: 2, maxWidth: 360 }}>
                        Important: Only your verification badge is displayed. Documents are never shown on your profile.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIdVerificationStatus('verified');
                        triggerSuccess('ID Verification status updated');
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 9999,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid rgba(0, 0, 0, 0.15)',
                        background: idVerificationStatus === 'verified' ? '#09090b' : '#ffffff',
                        color: idVerificationStatus === 'verified' ? '#ffffff' : '#09090b'
                      }}
                    >
                      {idVerificationStatus === 'verified' ? 'Verified ID' : 'Verify ID'}
                    </button>
                  </div>
                </GlassContainer>

                {/* Personal Information (Address - Optional) */}
                <GlassContainer radius={22} innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                    Personal Information (Optional)
                  </h3>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#52525b', marginBottom: 4 }}>
                      Campus Hostel / Local Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Mandakini Hostel, Room 314"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 10,
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        background: 'rgba(255, 255, 255, 0.7)',
                        fontSize: 13,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </GlassContainer>

                <FluidButton
                  type="submit"
                  style={{ padding: '9px 24px', fontSize: 13, fontWeight: 700, alignSelf: 'flex-start' }}
                >
                  Save Account Details
                </FluidButton>
              </form>
            </div>
          )}

          {/* SECTION 6: ACCOUNT MANAGEMENT */}
          {activeSection === 'management' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                  Account Management
                </h2>
                <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>
                  Manage login credentials, data exports, deactivation, and session logout.
                </p>
              </div>

              {/* Password & Security Card */}
              <GlassContainer radius={22} innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                  Change Password & Security
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current Password"
                    style={{
                      padding: '9px 12px',
                      borderRadius: 10,
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      background: 'rgba(255, 255, 255, 0.7)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password (min 8 characters)"
                    style={{
                      padding: '9px 12px',
                      borderRadius: 10,
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      background: 'rgba(255, 255, 255, 0.7)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    style={{
                      padding: '9px 12px',
                      borderRadius: 10,
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      background: 'rgba(255, 255, 255, 0.7)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />

                  <FluidButton
                    onClick={() => {
                      if (!currentPassword || !newPassword) {
                        alert('Please fill out password fields');
                        return;
                      }
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      triggerSuccess('Password updated successfully');
                    }}
                    style={{ padding: '7px 20px', fontSize: 12.5, fontWeight: 600, alignSelf: 'flex-start', marginTop: 4 }}
                  >
                    Update Password
                  </FluidButton>
                </div>
              </GlassContainer>

              {/* Data & Deactivation Card */}
              <GlassContainer radius={22} innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Download My Data */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>Download My Data</div>
                    <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>
                      Request an archive containing all your activity tickets, messages, and connections.
                    </div>
                  </div>
                  <FluidButton
                    onClick={() => triggerSuccess('Data archive requested. Link will be sent to your email.')}
                    style={{ padding: '7px 16px', fontSize: 12, fontWeight: 600 }}
                  >
                    Request Archive
                  </FluidButton>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid rgba(0, 0, 0, 0.06)', margin: 0 }} />

                {/* Deactivate Account */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>Deactivate Account</div>
                    <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>
                      Temporarily hide your profile and active dishes without permanently deleting history.
                    </div>
                  </div>
                  <FluidButton
                    onClick={() => {
                      if (confirm('Are you sure you want to temporarily deactivate your LetMeCook account?')) {
                        triggerSuccess('Account deactivated. Logging out...');
                        setTimeout(() => onLogout && onLogout(), 1500);
                      }
                    }}
                    style={{ padding: '7px 16px', fontSize: 12, fontWeight: 600 }}
                  >
                    Deactivate
                  </FluidButton>
                </div>
              </GlassContainer>

              {/* Danger Zone: Delete & Logout */}
              <GlassContainer radius={22} innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#dc2626' }}>
                  Danger Zone & Session
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#dc2626' }}>Delete Account</div>
                    <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>
                      Permanently remove your profile, connections, and activity tickets. This action cannot be undone.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('PERMANENT DELETION: Are you sure you want to permanently delete your account and all data?')) {
                        onLogout && onLogout();
                      }
                    }}
                    style={{
                      padding: '7px 16px',
                      borderRadius: 9999,
                      border: '1px solid rgba(220, 38, 38, 0.3)',
                      background: 'rgba(220, 38, 38, 0.08)',
                      color: '#dc2626',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Delete Account
                  </button>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid rgba(0, 0, 0, 0.06)', margin: 0 }} />

                {/* Logout Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>Log Out</div>
                    <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>
                      Sign out of this browser session.
                    </div>
                  </div>
                  <FluidButton
                    onClick={() => onLogout && onLogout()}
                    style={{
                      padding: '8px 20px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log Out
                  </FluidButton>
                </div>
              </GlassContainer>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
