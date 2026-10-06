'use client';

import React, { useState, useMemo } from 'react';
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';

/**
 * Custom Input wrapped in GlassContainer to avoid browser default styles
 */
function CustomInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  icon = null,
  style = {},
  radius = 14,
  height = 42,
  maxLength,
  ...props
}) {
  return (
    <GlassContainer
      radius={radius}
      style={{ width: '100%', ...style }}
      innerStyle={{
        padding: '0 14px',
        height,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxSizing: 'border-box'
      }}
    >
      {icon && (
        <span style={{ color: '#71717a', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontSize: 13,
          color: '#09090b',
          fontFamily: 'inherit'
        }}
        {...props}
      />
    </GlassContainer>
  );
}

/**
 * Custom Select wrapped in GlassContainer with SVG arrow to eliminate browser default appearance
 */
function CustomSelect({ value, onChange, options, style = {} }) {
  return (
    <GlassContainer
      radius={14}
      style={{ width: '100%', ...style }}
      innerStyle={{
        padding: '0 14px',
        height: 42,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      <select
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontSize: 13,
          fontWeight: 500,
          color: '#09090b',
          fontFamily: 'inherit',
          cursor: 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none',
          paddingRight: 24
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: '#ffffff', color: '#09090b' }}>
            {opt.label}
          </option>
        ))}
      </select>
      <div
        style={{
          position: 'absolute',
          right: 14,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          color: '#71717a'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </GlassContainer>
  );
}

/**
 * Custom Toggle Switch (eliminates native HTML checkboxes)
 */
function CustomToggle({ checked, onChange, id }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 38,
        height: 22,
        borderRadius: 9999,
        background: checked ? '#09090b' : 'rgba(0, 0, 0, 0.12)',
        border: 'none',
        padding: 2,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        position: 'relative',
        transition: 'background 0.2s ease',
        flexShrink: 0,
        outline: 'none'
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#ffffff',
          transform: checked ? 'translateX(16px)' : 'translateX(0px)',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
        }}
      />
    </button>
  );
}

/**
 * Selection Pills using FluidButton:
 * When selected: container is bigger (larger padding) and text is bigger and bolder,
 * with NO black borders or solid black box fills.
 */
function PrivacySelectionPills({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <FluidButton
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: isSelected ? '9px 18px' : '6px 13px',
              fontSize: isSelected ? 13 : 12,
              fontWeight: isSelected ? 800 : 500,
              color: isSelected ? '#09090b' : '#52525b',
              transition: 'all 0.18s ease'
            }}
          >
            {opt.label}
          </FluidButton>
        );
      })}
    </div>
  );
}

export default function SettingsPage({
  user,
  onLogout,
  onUpdateUser,
  onOpenEditProfile,
  themePreference = 'system',
  onThemeChange
}) {
  // Navigation active section
  const [activeSection, setActiveSection] = useState('privacy');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const isAdult = Boolean(user && user.age !== undefined && user.age !== null && Number(user.age) >= 18);

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
  const [currentTheme, setCurrentTheme] = useState(themePreference || 'system');

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

  // 2-Step Deactivation State
  const [deactivateStep, setDeactivateStep] = useState(null); // null | 1 | 2
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivateError, setDeactivateError] = useState('');

  // 3-Step Deletion State
  const [deleteStep, setDeleteStep] = useState(null); // null | 1 | 2 | 3
  const [deleteIdentifier, setDeleteIdentifier] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteCode, setDeleteCode] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Toast Feedback Helper
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
  const handleSaveCredentials = async (e) => {
    if (e) e.preventDefault();
    if (onUpdateUser) {
      await onUpdateUser({
        mobile: mobileNumber,
        email: emailAddress,
        age: Number(age),
        gender
      });
    }
    triggerSuccess('Account credentials updated successfully');
  };

  // Handle personal address save
  const handleSaveAddress = async (e) => {
    if (e) e.preventDefault();
    if (onUpdateUser) {
      await onUpdateUser({
        address
      });
    }
    triggerSuccess('Address updated successfully');
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

              {/* Instagram-style Search using GlassContainer */}
              <GlassContainer
                radius={9999}
                innerStyle={{
                  padding: '0 12px',
                  height: 38,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
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
                    width: '100%',
                    fontFamily: 'inherit'
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#71717a', display: 'flex' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </GlassContainer>
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
                <GlassContainer radius={22} innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                    Visibility Controls
                  </h3>

                  {/* 1. Bio Visible to */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 8, color: '#09090b' }}>
                      Bio Visible to
                    </label>
                    <PrivacySelectionPills
                      value={bioVisibility}
                      onChange={setBioVisibility}
                      options={[
                        { value: 'everyone', label: 'Everyone' },
                        { value: 'institute', label: 'Institute Only' },
                        { value: 'connections', label: 'Connections' },
                        { value: 'nobody', label: 'Nobody' }
                      ]}
                    />
                  </div>

                  {/* 2. Institute Visibility */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 8, color: '#09090b' }}>
                      Institute Visibility
                    </label>
                    <PrivacySelectionPills
                      value={instituteVisibility}
                      onChange={setInstituteVisibility}
                      options={[
                        { value: 'everyone', label: 'Everyone' },
                        { value: 'institute', label: 'Institute Only' },
                        { value: 'nobody', label: 'Nobody' }
                      ]}
                    />
                  </div>

                  {/* 3. DP (Avatar) Visibility */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 8, color: '#09090b' }}>
                      DP (Avatar) Visibility
                    </label>
                    <PrivacySelectionPills
                      value={avatarVisibility}
                      onChange={setAvatarVisibility}
                      options={[
                        { value: 'everyone', label: 'Everyone' },
                        { value: 'institute', label: 'Institute Only' },
                        { value: 'connections', label: 'Connections' },
                        { value: 'nobody', label: 'Nobody' }
                      ]}
                    />
                  </div>

                  {/* 4. Who Can Invite */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 8, color: '#09090b' }}>
                      Who Can Invite You to Dishes
                    </label>
                    <PrivacySelectionPills
                      value={invitePermission}
                      onChange={setInvitePermission}
                      options={[
                        { value: 'everyone', label: 'Everyone' },
                        { value: 'institute', label: 'Institute Only' },
                        { value: 'connections', label: 'Connections' },
                        { value: 'nobody', label: 'Nobody' }
                      ]}
                    />
                  </div>

                  {/* 5. Who Can Message */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 8, color: '#09090b' }}>
                      Who Can Message (DMs)
                    </label>
                    <PrivacySelectionPills
                      value={messagePermission}
                      onChange={setMessagePermission}
                      options={[
                        { value: 'everyone', label: 'Everyone' },
                        { value: 'institute', label: 'Institute Only' },
                        { value: 'connections', label: 'Connections' },
                        { value: 'nobody', label: 'Nobody' }
                      ]}
                    />
                  </div>
                </GlassContainer>

                {/* Discovery & Activity Card */}
                <GlassContainer radius={22} innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                    Discovery & Activity
                  </h3>

                  {/* Profile Discovery Toggle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#09090b', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Global Profile Discovery</span>
                        {!isAdult && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: 6,
                              background: 'rgba(0, 0, 0, 0.06)',
                              color: '#71717a'
                            }}
                          >
                            18+ Only
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>
                        {isAdult
                          ? 'Allow my profile to appear in Global discovery within 5km radius.'
                          : 'Global discovery is restricted to verified 18+ members. Your profile remains active within campus network.'}
                      </div>
                    </div>
                    <CustomToggle
                      checked={isAdult ? globalDiscovery : false}
                      onChange={(val) => {
                        if (!isAdult) return;
                        setGlobalDiscovery(val);
                      }}
                    />
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid rgba(0, 0, 0, 0.06)', margin: '4px 0' }} />

                  {/* Activity Visibility Toggle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#09090b' }}>
                        Activity Visibility
                      </div>
                      <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>
                        Show my active Cooking on profile (Defaults ON for campus coordination).
                      </div>
                    </div>
                    <CustomToggle
                      checked={activityVisibility}
                      onChange={setActivityVisibility}
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
                  ].map((item) => {
                    const isSelected = locationPrivacy === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setLocationPrivacy(item.id);
                          triggerSuccess('Location privacy updated');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          padding: '12px 14px',
                          borderRadius: 14,
                          background: isSelected ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                          border: '1px solid rgba(0, 0, 0, 0.06)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            border: isSelected ? '5px solid #09090b' : '1.5px solid rgba(0, 0, 0, 0.25)',
                            background: '#ffffff',
                            marginTop: 2,
                            flexShrink: 0,
                            boxSizing: 'border-box',
                            transition: 'all 0.15s ease'
                          }}
                        />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 600, color: '#09090b' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#71717a', marginTop: 2 }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassContainer>

              {/* Blocked & Restricted Users Card */}
              <GlassContainer radius={22} innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                  Blocked & Restricted Accounts
                </h3>

                {/* Block a user form using custom input */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <CustomInput
                    placeholder="Enter @username to block..."
                    value={newBlockInput}
                    onChange={(e) => setNewBlockInput(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <FluidButton
                    onClick={() => {
                      if (newBlockInput.trim()) {
                        setBlockedUsers((prev) => [...prev, newBlockInput.trim()]);
                        setNewBlockInput('');
                        triggerSuccess('User blocked');
                      }
                    }}
                    style={{ padding: '8px 18px', fontSize: 12.5, fontWeight: 600, flexShrink: 0 }}
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
                            padding: '8px 12px',
                            borderRadius: 12,
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
                          padding: '8px 12px',
                          borderRadius: 12,
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
                  <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(0, 0, 0, 0.03)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#09090b' }}>
                      Stranger-Safety & Public Campus Zones
                    </div>
                    <div style={{ fontSize: 12, color: '#52525b', marginTop: 2 }}>
                      Always schedule meeting checkpoints in open campus areas (Libraries, SAC, Sports complex, or Campus Cafes) before starting activities.
                    </div>
                  </div>

                  <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(0, 0, 0, 0.03)' }}>
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
                          padding: '10px 12px',
                          borderRadius: 12,
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
                  <CustomToggle
                    checked={pushEnabled}
                    onChange={setPushEnabled}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Email Digests</div>
                    <div style={{ fontSize: 12, color: '#71717a' }}>Weekly campus roundup & important verification notices</div>
                  </div>
                  <CustomToggle
                    checked={emailEnabled}
                    onChange={setEmailEnabled}
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
                      padding: '8px 0',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#09090b' }}>{item.label}</div>
                      <div style={{ fontSize: 11.5, color: '#71717a' }}>{item.desc}</div>
                    </div>
                    <CustomToggle
                      checked={notifPreferences[item.key]}
                      onChange={(val) => {
                        setNotifPreferences((prev) => ({ ...prev, [item.key]: val }));
                      }}
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Account Details Card */}
                <GlassContainer radius={22} innerStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                    Account Credentials
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#52525b', marginBottom: 6 }}>
                        Mobile Number
                      </label>
                      <CustomInput
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="+91..."
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#52525b', marginBottom: 6 }}>
                        Institute Email
                      </label>
                      <CustomInput
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="s.sharma@smail.iitm.ac.in"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#52525b', marginBottom: 6 }}>
                        Age
                      </label>
                      <CustomInput
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="21"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#52525b', marginBottom: 6 }}>
                        Gender
                      </label>
                      <CustomSelect
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        options={[
                          { value: 'Male', label: 'Male' },
                          { value: 'Female', label: 'Female' },
                          { value: 'Non-binary', label: 'Non-binary' },
                          { value: 'Prefer not to say', label: 'Prefer not to say' }
                        ]}
                      />
                    </div>
                  </div>

                  <FluidButton
                    type="button"
                    onClick={handleSaveCredentials}
                    style={{
                      padding: '8px 22px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      alignSelf: 'flex-start',
                      marginTop: 4
                    }}
                  >
                    Save Credentials
                  </FluidButton>
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
                      borderRadius: 14,
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
                      borderRadius: 14,
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
                        color: idVerificationStatus === 'verified' ? '#ffffff' : '#09090b',
                        transition: 'all 0.15s ease'
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
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#52525b', marginBottom: 6 }}>
                      Campus Hostel / Local Address
                    </label>
                    <CustomInput
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Mandakini Hostel, Room 314"
                    />
                  </div>

                  <FluidButton
                    type="button"
                    onClick={handleSaveAddress}
                    style={{
                      padding: '8px 22px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      alignSelf: 'flex-start',
                      marginTop: 4
                    }}
                  >
                    Save Address
                  </FluidButton>
                </GlassContainer>
              </div>
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
                  <CustomInput
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current Password"
                  />
                  <CustomInput
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password (min 8 characters)"
                  />
                  <CustomInput
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                  />

                  <FluidButton
                    onClick={() => {
                      if (!currentPassword || !newPassword) {
                        triggerSuccess('Please enter password fields');
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
                      Temporarily hide your profile and active dishes. Deactivation remains for 14 days.
                    </div>
                  </div>
                  <FluidButton
                    onClick={() => {
                      setDeactivatePassword('');
                      setDeactivateError('');
                      setDeactivateStep(1);
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
                      Permanently remove your profile, connections, and activity tickets with 3-step security verification.
                    </div>
                  </div>
                  <FluidButton
                    onClick={() => {
                      setDeleteIdentifier(user?.email || '');
                      setDeletePassword('');
                      setDeleteCode('');
                      setDeleteError('');
                      setDeleteStep(1);
                    }}
                    style={{
                      padding: '7px 16px',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#dc2626'
                    }}
                  >
                    Delete Account
                  </FluidButton>
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

      {/* ========================================================= */}
      {/* 2-STEP DEACTIVATION MODAL                                 */}
      {/* ========================================================= */}
      {deactivateStep !== null && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: 16
          }}
        >
          <GlassContainer
            radius={24}
            style={{
              maxWidth: 440,
              width: '100%',
              boxShadow: 'none',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}
            innerStyle={{
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            {deactivateStep === 1 ? (
              <>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      color: '#71717a',
                      marginBottom: 4
                    }}
                  >
                    Step 1 of 2 • Deactivation Warning
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#09090b', letterSpacing: '-0.02em' }}>
                    Deactivate Your Account
                  </h3>
                </div>

                <p style={{ fontSize: 13, lineHeight: 1.55, color: '#52525b', margin: 0 }}>
                  Deactivating your account will temporarily disable your profile and hide your active dishes and tickets from campus feeds. Your connections, verified institute status, and activity history will be safely preserved. Deactivation remains for 14 days. If you log back in within 14 days, your profile will be instantly restored.
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                  <FluidButton
                    type="button"
                    onClick={() => setDeactivateStep(null)}
                    style={{ padding: '8px 16px', fontSize: 12.5, fontWeight: 600 }}
                  >
                    Cancel
                  </FluidButton>
                  <FluidButton
                    type="button"
                    onClick={() => setDeactivateStep(2)}
                    style={{
                      padding: '8px 18px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: '#09090b'
                    }}
                  >
                    Continue
                  </FluidButton>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      color: '#71717a',
                      marginBottom: 4
                    }}
                  >
                    Step 2 of 2 • Password Confirmation
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#09090b', letterSpacing: '-0.02em' }}>
                    Confirm Deactivation
                  </h3>
                  <p style={{ fontSize: 12.5, color: '#71717a', margin: '4px 0 0 0' }}>
                    Enter your account password to confirm. Deactivation remains active for 14 days.
                  </p>
                </div>

                {deactivateError && (
                  <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
                    {deactivateError}
                  </div>
                )}

                <CustomInput
                  type="password"
                  placeholder="Enter account password"
                  value={deactivatePassword}
                  onChange={(e) => {
                    setDeactivatePassword(e.target.value);
                    setDeactivateError('');
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <FluidButton
                    type="button"
                    onClick={() => {
                      setDeactivateStep(1);
                      setDeactivateError('');
                    }}
                    style={{ padding: '8px 16px', fontSize: 12.5, fontWeight: 600 }}
                  >
                    Back
                  </FluidButton>

                  <FluidButton
                    type="button"
                    onClick={() => {
                      if (!deactivatePassword.trim()) {
                        setDeactivateError('Please enter your password to deactivate');
                        return;
                      }
                      setDeactivateStep(null);
                      setDeactivatePassword('');
                      triggerSuccess('Account deactivated for 14 days. Logging out...');
                      setTimeout(() => onLogout && onLogout(), 1600);
                    }}
                    style={{
                      padding: '8px 20px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: '#09090b'
                    }}
                  >
                    Deactivate Account (14 Days)
                  </FluidButton>
                </div>
              </>
            )}
          </GlassContainer>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3-STEP DELETION MODAL                                     */}
      {/* ========================================================= */}
      {deleteStep !== null && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: 16
          }}
        >
          <GlassContainer
            radius={24}
            style={{
              maxWidth: 440,
              width: '100%',
              boxShadow: 'none',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}
            innerStyle={{
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            {deleteStep === 1 && (
              <>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      color: '#71717a',
                      marginBottom: 4
                    }}
                  >
                    Step 1 of 3 • Permanent Deletion Warning
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#09090b', letterSpacing: '-0.02em' }}>
                    Permanently Delete Account
                  </h3>
                </div>

                <p style={{ fontSize: 13, lineHeight: 1.55, color: '#52525b', margin: 0 }}>
                  Permanent Account Deletion Warning: This action cannot be undone. All your campus activities, hosted dishes, join tickets, chat history, connection records, and verification status will be permanently deleted from our servers.
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                  <FluidButton
                    type="button"
                    onClick={() => setDeleteStep(null)}
                    style={{ padding: '8px 16px', fontSize: 12.5, fontWeight: 600 }}
                  >
                    Cancel
                  </FluidButton>
                  <FluidButton
                    type="button"
                    onClick={() => setDeleteStep(2)}
                    style={{
                      padding: '8px 18px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: '#dc2626'
                    }}
                  >
                    Continue
                  </FluidButton>
                </div>
              </>
            )}

            {deleteStep === 2 && (
              <>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      color: '#71717a',
                      marginBottom: 4
                    }}
                  >
                    Step 2 of 3 • Credentials Verification
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#09090b', letterSpacing: '-0.02em' }}>
                    Enter Credentials
                  </h3>
                  <p style={{ fontSize: 12.5, color: '#71717a', margin: '4px 0 0 0' }}>
                    Enter your registered email or mobile number and password to receive your security code.
                  </p>
                </div>

                {deleteError && (
                  <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
                    {deleteError}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#71717a', marginBottom: 4 }}>
                      Registered Email or Mobile No.
                    </label>
                    <CustomInput
                      type="text"
                      placeholder="e.g. s.sharma@smail.iitm.ac.in or +91..."
                      value={deleteIdentifier}
                      onChange={(e) => {
                        setDeleteIdentifier(e.target.value);
                        setDeleteError('');
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#71717a', marginBottom: 4 }}>
                      Account Password
                    </label>
                    <CustomInput
                      type="password"
                      placeholder="Enter account password"
                      value={deletePassword}
                      onChange={(e) => {
                        setDeletePassword(e.target.value);
                        setDeleteError('');
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <FluidButton
                    type="button"
                    onClick={() => {
                      setDeleteStep(1);
                      setDeleteError('');
                    }}
                    style={{ padding: '8px 16px', fontSize: 12.5, fontWeight: 600 }}
                  >
                    Back
                  </FluidButton>

                  <FluidButton
                    type="button"
                    onClick={() => {
                      if (!deleteIdentifier.trim() || !deletePassword.trim()) {
                        setDeleteError('Please enter both your registered email/mobile and password');
                        return;
                      }
                      setDeleteStep(3);
                      setDeleteError('');
                      triggerSuccess('Verification code sent to your email and mobile SMS');
                    }}
                    style={{
                      padding: '8px 20px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: '#09090b'
                    }}
                  >
                    Send Code
                  </FluidButton>
                </div>
              </>
            )}

            {deleteStep === 3 && (
              <>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      color: '#71717a',
                      marginBottom: 4
                    }}
                  >
                    Step 3 of 3 • Security Code Verification
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#09090b', letterSpacing: '-0.02em' }}>
                    Enter 6-Digit Code
                  </h3>
                  <p style={{ fontSize: 12.5, color: '#71717a', margin: '4px 0 0 0' }}>
                    A code has been sent via SMS to your mobile and email. Verify it to delete your account.
                  </p>
                </div>

                {deleteError && (
                  <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
                    {deleteError}
                  </div>
                )}

                <div>
                  <CustomInput
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code (e.g. 582914)"
                    value={deleteCode}
                    onChange={(e) => {
                      setDeleteCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setDeleteError('');
                    }}
                    style={{ textAlign: 'center', letterSpacing: '4px', fontSize: 18, fontWeight: 700 }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                    <button
                      type="button"
                      onClick={() => triggerSuccess('Code resent to your email and mobile SMS')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#71717a',
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Resend Code
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <FluidButton
                    type="button"
                    onClick={() => {
                      setDeleteStep(2);
                      setDeleteError('');
                    }}
                    style={{ padding: '8px 16px', fontSize: 12.5, fontWeight: 600 }}
                  >
                    Back
                  </FluidButton>

                  <FluidButton
                    type="button"
                    onClick={() => {
                      if (deleteCode.length < 6) {
                        setDeleteError('Please enter the full 6-digit verification code');
                        return;
                      }
                      setDeleteStep(null);
                      setDeleteIdentifier('');
                      setDeletePassword('');
                      setDeleteCode('');
                      triggerSuccess('Account permanently deleted. Signing out...');
                      setTimeout(() => onLogout && onLogout(), 1600);
                    }}
                    style={{
                      padding: '8px 20px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: '#dc2626'
                    }}
                  >
                    Verify & Delete Account
                  </FluidButton>
                </div>
              </>
            )}
          </GlassContainer>
        </div>
      )}
    </div>
  );
}
