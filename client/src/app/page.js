'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import GlassContainer from '@/components/GlassContainer';
import FluidButton from '@/components/FluidButton';
import KitchenModal from '@/components/KitchenModal';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Navigation strictly per Section 12 of PRODUCT.md: Home, Dine-in, Kitchen, Messages, Profile
  const [activeTab, setActiveTab] = useState('home'); 
  const [showSettings, setShowSettings] = useState(false);
  const [showKitchenModal, setShowKitchenModal] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Auth states
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');

  // Dine-in states
  const [dishes, setDishes] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dineInTab, setDineInTab] = useState('join_to_cook'); // 'join_to_cook', 'cooking', 'global', 'my_dishes'
  const [expandedDishes, setExpandedDishes] = useState({});
  const [navHovered, setNavHovered] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [themePreference, setThemePreference] = useState('light');

  // Kitchen states
  const [isSubmittingDish, setIsSubmittingDish] = useState(false);

  // Messages states
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [convMessages, setConvMessages] = useState([]);
  const [msgReceiverId, setMsgReceiverId] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [messagesTab, setMessagesTab] = useState('message'); // 'message' | 'requests'
  const [searchMsgQuery, setSearchMsgQuery] = useState('');

  // Profile & Settings states
  const [bio, setBio] = useState('');
  const [instituteName, setInstituteName] = useState('IIT MADRAS');
  const [instituteYear, setInstituteYear] = useState('2029');
  const [secondaryInstituteName, setSecondaryInstituteName] = useState('SST');
  const [secondaryInstituteYear, setSecondaryInstituteYear] = useState('2029');
  const [profileName, setProfileName] = useState('');
  const [pronouns, setPronouns] = useState('He/Him');
  const [interests, setInterests] = useState(['music', 'Gym', 'Sports', 'Anime', 'Coffee']);
  const [newTagInput, setNewTagInput] = useState('');
  const [bioExpanded, setBioExpanded] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState('dishes'); // 'dishes' | 'joined' | 'awards'
  const [searchUsername, setSearchUsername] = useState('');
  const [searchedProfile, setSearchedProfile] = useState(null);
  const [connections, setConnections] = useState([]);

  // Privacy Settings form states
  const [bioVisibility, setBioVisibility] = useState('everyone');
  const [instituteVisibility, setInstituteVisibility] = useState('institute');
  const [avatarVisibility, setAvatarVisibility] = useState('everyone');
  const [invitePermission, setInvitePermission] = useState('everyone');
  const [messagePermission, setMessagePermission] = useState('everyone');
  const [globalDiscovery, setGlobalDiscovery] = useState(true);
  const [activityVisibility, setActivityVisibility] = useState(true);

  // Check auth session
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch('/auth/me');
      setUser(res.data);
      setProfileName(res.data.name || '');
      setPronouns(res.data.pronouns || 'He/Him');
      setBio(res.data.bio || '');
      setInstituteName(res.data.institute?.name || 'IIT MADRAS');
      setInstituteYear(res.data.institute?.year ? String(res.data.institute.year) : '2029');
      setSecondaryInstituteName(res.data.secondaryInstitute?.name || 'SST');
      setSecondaryInstituteYear(res.data.secondaryInstitute?.year ? String(res.data.secondaryInstitute.year) : '2029');
      if (res.data.interests && res.data.interests.length > 0) {
        setInterests(res.data.interests);
      } else {
        setInterests(['music', 'Gym', 'Sports', 'Anime', 'Coffee']);
      }
      if (res.data.privacy) {
        setBioVisibility(res.data.privacy.bioVisibility || 'everyone');
        setInstituteVisibility(res.data.privacy.instituteVisibility || 'institute');
        setAvatarVisibility(res.data.privacy.avatarVisibility || 'everyone');
        setInvitePermission(res.data.privacy.invitePermission || 'everyone');
        setMessagePermission(res.data.privacy.messagePermission || 'everyone');
        setGlobalDiscovery(res.data.privacy.globalDiscovery ?? true);
        setActivityVisibility(res.data.privacy.activityVisibility ?? true);
      }
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const fetchDishes = async () => {
    try {
      const query = categoryFilter ? `?category=${categoryFilter}` : '';
      const res = await apiFetch(`/dishes${query}`);
      setDishes(res.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}hrs ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths}mon ago`;
  };

  const fetchConversations = async (forceConvId) => {
    try {
      const res = await apiFetch('/messages/conversations');
      const data = res.data || [];
      setConversations(data);
      const targetId = forceConvId || selectedConvId;
      if (!targetId && data.length > 0) {
        const first = data.find(c => !c.isRequest) || data[0];
        if (first) {
          handleOpenConversation(first.conversationId);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchConnections = async () => {
    try {
      const res = await apiFetch('/connections');
      setConnections(res.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'home' || activeTab === 'dine-in') fetchDishes();
    if (activeTab === 'messages') fetchConversations();
    if (activeTab === 'profile') {
      fetchConnections();
      fetchDishes();
    }
  }, [user, activeTab, categoryFilter]);

  // Auth Handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    if (isAuthSubmitting) return;
    setError('');
    setMessage('');
    setIsAuthSubmitting(true);
    try {
      let res;
      if (isLogin) {
        res = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ identifier, password })
        });
      } else {
        res = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ username, name, email, mobile, password })
        });
      }
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setMessage('Authenticated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setMessage('Logged out');
  };

  // Kitchen Create Dish (Sequential Flow)
  const handleCreateDish = async (payload) => {
    setError('');
    setMessage('');
    setIsSubmittingDish(true);
    try {
      const res = await apiFetch('/dishes', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setMessage(`Dish published: ${res.data._id}`);
      setShowKitchenModal(false);
      fetchDishes();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmittingDish(false);
    }
  };

  // Dish Operations
  const handleJoinDish = async (dishId) => {
    setError('');
    setMessage('');
    try {
      const res = await apiFetch(`/dishes/${dishId}/join`, { method: 'POST' });
      setMessage(`Join status: ${res.data.status}`);
      fetchDishes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLeaveDish = async (dishId) => {
    setError('');
    setMessage('');
    try {
      const res = await apiFetch(`/dishes/${dishId}/leave`, { method: 'POST' });
      setMessage(res.data.message);
      fetchDishes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateStatus = async (dishId, status) => {
    setError('');
    setMessage('');
    try {
      const res = await apiFetch(`/dishes/${dishId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      setMessage(`Dish status: ${res.data.status}`);
      fetchDishes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApproveRequest = async (dishId, requestId) => {
    setError('');
    setMessage('');
    try {
      const res = await apiFetch(`/dishes/${dishId}/requests/${requestId}/approve`, { method: 'POST' });
      setMessage(`Approved join request: ${res.data.status}`);
      fetchDishes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejectRequest = async (dishId, requestId) => {
    setError('');
    setMessage('');
    try {
      const res = await apiFetch(`/dishes/${dishId}/requests/${requestId}/reject`, { method: 'POST' });
      setMessage(`Rejected join request: ${res.data.status}`);
      fetchDishes();
    } catch (err) {
      setError(err.message);
    }
  };

  // Messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgContent.trim()) return;
    setError('');
    setMessage('');

    let targetReceiverId = msgReceiverId;
    if (selectedConvId) {
      const activeConv = conversations.find((c) => c.conversationId === selectedConvId);
      if (activeConv && activeConv.user) {
        targetReceiverId = activeConv.user._id || activeConv.user;
      }
    }

    if (!targetReceiverId) {
      setError('Please select a conversation to reply to.');
      return;
    }

    try {
      await apiFetch('/messages', {
        method: 'POST',
        body: JSON.stringify({ receiverId: targetReceiverId, content: msgContent })
      });
      setMsgContent('');
      if (selectedConvId) {
        handleOpenConversation(selectedConvId);
      }
      fetchConversations(selectedConvId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenConversation = async (convId) => {
    setSelectedConvId(convId);
    try {
      const res = await apiFetch(`/messages/conversations/${convId}`);
      setConvMessages(res.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRespondMessageRequest = async (convId, status) => {
    setError('');
    setMessage('');
    try {
      const res = await apiFetch(`/messages/requests/${convId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
      setMessage(`Request response: ${res.data.requestStatus}`);
      fetchConversations();
    } catch (err) {
      setError(err.message);
    }
  };

  // Profile & Settings
  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: profileName,
          pronouns,
          bio,
          interests,
          institute: { name: instituteName, year: Number(instituteYear) || 2029 },
          secondaryInstitute: { name: secondaryInstituteName, year: Number(secondaryInstituteYear) || 2029 }
        })
      });
      setUser(res.data);
      setShowEditProfile(false);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          privacy: {
            bioVisibility,
            instituteVisibility,
            avatarVisibility,
            invitePermission,
            messagePermission,
            globalDiscovery,
            activityVisibility
          }
        })
      });
      setUser(res.data);
      setMessage('Privacy settings saved');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearchProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSearchedProfile(null);
    try {
      const res = await apiFetch(`/users/${searchUsername}`);
      setSearchedProfile(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: 20, fontFamily: "'Inter', sans-serif" }}>Checking session...</div>;
  }

  // Unauthenticated View
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#e6dfe4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box' }}>
        <GlassContainer radius={28} style={{ width: '100%', maxWidth: 460 }} innerStyle={{ padding: 28, fontFamily: "'Inter', sans-serif" }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 22, fontWeight: 700 }}>LetMeCook — Auth Test</h2>
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              style={{ fontWeight: isLogin ? 'bold' : 'normal', marginRight: 8, padding: '4px 8px', cursor: 'pointer' }}
            >
              [Sign In]
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              style={{ fontWeight: !isLogin ? 'bold' : 'normal', padding: '4px 8px', cursor: 'pointer' }}
            >
              [Register]
            </button>
          </div>

          {error && <div style={{ border: '1px solid red', padding: 8, marginBottom: 12, color: 'red', borderRadius: 8, backgroundColor: 'rgba(254, 242, 242, 0.7)' }}>Error: {error}</div>}
          {message && <div style={{ border: '1px solid green', padding: 8, marginBottom: 12, color: 'green', borderRadius: 8, backgroundColor: 'rgba(240, 253, 244, 0.7)' }}>{message}</div>}

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isLogin ? (
              <>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Email or Username:</label>
                <input
                  type="text"
                  required
                  disabled={isAuthSubmitting}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="chef_arjun or arjun@example.com"
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: isAuthSubmitting ? 'rgba(240,240,240,0.6)' : 'rgba(255,255,255,0.7)', opacity: isAuthSubmitting ? 0.7 : 1 }}
                />
                <label style={{ fontSize: 13, fontWeight: 600 }}>Password:</label>
                <input
                  type="password"
                  required
                  disabled={isAuthSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: isAuthSubmitting ? 'rgba(240,240,240,0.6)' : 'rgba(255,255,255,0.7)', opacity: isAuthSubmitting ? 0.7 : 1 }}
                />
                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  style={{
                    marginTop: 10,
                    padding: '10px 16px',
                    borderRadius: 8,
                    backgroundColor: '#000',
                    color: '#fff',
                    border: 'none',
                    cursor: isAuthSubmitting ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    opacity: isAuthSubmitting ? 0.75 : 1,
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  {isAuthSubmitting && (
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.75s linear infinite'
                      }}
                    />
                  )}
                  <span>{isAuthSubmitting ? 'Signing in...' : 'Submit Login'}</span>
                </button>
              </>
            ) : (
              <>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Username (min 3 chars):</label>
                <input
                  type="text"
                  required
                  disabled={isAuthSubmitting}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: isAuthSubmitting ? 'rgba(240,240,240,0.6)' : 'rgba(255,255,255,0.7)', opacity: isAuthSubmitting ? 0.7 : 1 }}
                />
                <label style={{ fontSize: 13, fontWeight: 600 }}>Display Name:</label>
                <input
                  type="text"
                  required
                  disabled={isAuthSubmitting}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: isAuthSubmitting ? 'rgba(240,240,240,0.6)' : 'rgba(255,255,255,0.7)', opacity: isAuthSubmitting ? 0.7 : 1 }}
                />
                <label style={{ fontSize: 13, fontWeight: 600 }}>Email:</label>
                <input
                  type="email"
                  required
                  disabled={isAuthSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: isAuthSubmitting ? 'rgba(240,240,240,0.6)' : 'rgba(255,255,255,0.7)', opacity: isAuthSubmitting ? 0.7 : 1 }}
                />
                <label style={{ fontSize: 13, fontWeight: 600 }}>Mobile Number:</label>
                <input
                  type="text"
                  required
                  disabled={isAuthSubmitting}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: isAuthSubmitting ? 'rgba(240,240,240,0.6)' : 'rgba(255,255,255,0.7)', opacity: isAuthSubmitting ? 0.7 : 1 }}
                />
                <label style={{ fontSize: 13, fontWeight: 600 }}>Password (min 6 chars):</label>
                <input
                  type="password"
                  required
                  disabled={isAuthSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: isAuthSubmitting ? 'rgba(240,240,240,0.6)' : 'rgba(255,255,255,0.7)', opacity: isAuthSubmitting ? 0.7 : 1 }}
                />
                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  style={{
                    marginTop: 10,
                    padding: '10px 16px',
                    borderRadius: 8,
                    backgroundColor: '#000',
                    color: '#fff',
                    border: 'none',
                    cursor: isAuthSubmitting ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    opacity: isAuthSubmitting ? 0.75 : 1,
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  {isAuthSubmitting && (
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.75s linear infinite'
                      }}
                    />
                  )}
                  <span>{isAuthSubmitting ? 'Registering...' : 'Submit Register'}</span>
                </button>
              </>
            )}
          </form>
        </GlassContainer>
      </div>
    );
  }

  // Authenticated View
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#e6dfe4', fontFamily: "'Inter', sans-serif", color: '#000000' }}>
      {/* Reserved Navigation Space (blank space reserved so hovering nav never shifts content) */}
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
              {/* Sleek Cook / Pot Logo SVG */}
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

          {/* Navigation Links — Centered vertically, Icons 100% static, text drawer animated */}
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
            {[
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
                id: 'messages',
                label: 'Messages',
                icon: (isActive) => (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive ? '2' : '1.9'} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
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
            ].map((item) => {
              const isActive = item.id === 'kitchen' ? showKitchenModal : activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'kitchen') {
                      setShowKitchenModal(true);
                    } else {
                      setActiveTab(item.id);
                      setShowSettings(false);
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
              onClick={() => setShowMoreMenu(prev => !prev)}
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

        {/* MORE POPUP MENU (Instagram inspired, built with GlassContainer) */}
        {showMoreMenu && (
          <>
            {/* Backdrop click dismiss */}
            <div
              onClick={() => setShowMoreMenu(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 90
              }}
            />

            {/* Popup above More button */}
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
                {/* 1. Settings */}
                <button
                  onClick={() => {
                    setShowSettings(true);
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
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Settings
                </button>

                {/* 2. Appearance */}
                <button
                  onClick={() => {
                    setShowAppearanceModal(true);
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
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  Appearance
                </button>

                {/* 3. Report a Problem */}
                <button
                  onClick={() => {
                    setShowReportModal(true);
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
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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

                {/* 4. Logout */}
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    handleLogout();
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
                    color: '#dc2626',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </GlassContainer>
            </div>
          </>
        )}

      </div>

      {/* Main App Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', padding: activeTab === 'profile' ? '54px 24px 80px' : '40px 32px', minWidth: 0, boxSizing: 'border-box', color: '#000000' }}>
        {/* Global Feedback */}
        {error && <div style={{ border: '1px solid red', padding: 10, marginBottom: 16, color: '#b91c1c', backgroundColor: '#fef2f2', borderRadius: 6 }}>Error: {error}</div>}
        {message && <div style={{ border: '1px solid green', padding: 10, marginBottom: 16, color: '#15803d', backgroundColor: '#f0fdf4', borderRadius: 6 }}>{message}</div>}

      {/* ========================================================= */}
      {/* 1. HOME SCREEN (PRODUCT.md Section 13) */}
      {/* ========================================================= */}
      {activeTab === 'home' && (
        <section style={{ width: '100%', maxWidth: 720 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 20px 0', letterSpacing: '-0.5px' }}>Home (Personalized Dashboard)</h2>
          
          {/* Personalized Greeting */}
          <GlassContainer radius={24} style={{ marginBottom: 16 }} innerStyle={{ padding: '18px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#4b5563' }}>Personalized Welcome</div>
            <div style={{ fontSize: 20, fontWeight: 600, marginTop: 6, color: '#000000' }}>
              "Evening, {user.name}. What's cooking?" 👀
            </div>
          </GlassContainer>

          {/* Current Cooking Banner */}
          <GlassContainer radius={24} style={{ marginBottom: 16 }} innerStyle={{ padding: '18px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#4b5563' }}>Current Cooking</div>
            {dishes.some(d => d.participants?.some(p => (p.user?._id || p.user) === user._id) && d.status !== 'cooked') ? (
              <div style={{ marginTop: 8, color: '#15803d', fontWeight: 600, fontSize: 15 }}>
                You have active dishes cooking! Check below or go to Dine-in.
              </div>
            ) : (
              <div style={{ marginTop: 8, color: '#374151', fontSize: 15, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span>"Nothing cooking yet. Someone has to start the chaos."</span>
                <FluidButton
                  onClick={() => setShowKitchenModal(true)}
                  style={{
                    padding: '6px 16px',
                    fontSize: 13,
                    fontWeight: 600
                  }}
                >
                  Create a Dish
                </FluidButton>
              </div>
            )}
          </GlassContainer>

          {/* Cooking Stats & Dish History Summary */}
          <GlassContainer radius={24} style={{ marginBottom: 16 }} innerStyle={{ padding: '18px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#4b5563' }}>Cooking Stats & History</div>
            <div style={{ marginTop: 8, fontSize: 15, fontWeight: 500, color: '#000000' }}>
              Dishes Created: <strong>{user.stats?.dishesCreated || 0}</strong> &nbsp;•&nbsp; Dishes Joined: <strong>{user.stats?.dishesJoined || 0}</strong> &nbsp;•&nbsp; People Cooked With: <strong>{user.stats?.peopleCookedWith || 0}</strong>
            </div>
          </GlassContainer>

          {/* Top Relevant Dishes */}
          <GlassContainer radius={24} innerStyle={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#4b5563' }}>Top Active Dishes (Summary)</div>
            {dishes.slice(0, 3).length === 0 ? (
              <p style={{ marginTop: 8, color: '#6b7280' }}>No dishes cooking right now.</p>
            ) : (
              <ul style={{ marginTop: 12, paddingLeft: 20 }}>
                {dishes.slice(0, 3).map(d => (
                  <li key={d._id} style={{ marginBottom: 10, fontSize: 14 }}>
                    <strong>{d.description}</strong> ({d.category}) — Status: <span style={{ textTransform: 'capitalize' }}>{d.status}</span> | Spots: {d.participants?.length}/{d.capacity?.max}
                    <button
                      onClick={() => setActiveTab('dine-in')}
                      style={{
                        marginLeft: 12,
                        backgroundColor: 'transparent',
                        color: '#000000',
                        border: '1px solid #000000',
                        borderRadius: 9999,
                        padding: '2px 10px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Open in Dine-in
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </GlassContainer>
        </section>
      )}

      {/* ========================================================= */}
      {/* 2. DINE-IN SCREEN (Proposed Design) */}
      {/* ========================================================= */}
      {activeTab === 'dine-in' && (
        <section style={{ width: '100%', maxWidth: 860, margin: '0 auto', color: '#000000' }}>
          {/* Header Title */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ fontSize: 40, fontFamily: '"Georgia", "Playfair Display", "Times New Roman", serif', fontWeight: 'bold', margin: '0 0 20px 0', letterSpacing: '-0.5px', color: '#000000' }}>
              Dine in
            </h1>
            
            {/* Top Sub-Navigation Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2.5px solid #000000', paddingBottom: 0, fontSize: 16 }}>
              {[
                { key: 'join_to_cook', label: 'Join to Cook' },
                { key: 'cooking', label: 'Cooking' },
                { key: 'global', label: 'Global' },
                { key: 'my_dishes', label: 'My Dishes' }
              ].map((tab) => {
                const isActive = dineInTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setDineInTab(tab.key)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 17,
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      fontWeight: isActive ? 'bold' : 'normal',
                      color: '#000000',
                      borderBottom: isActive ? '3.5px solid #000000' : '3.5px solid transparent',
                      padding: '6px 12px 10px 12px',
                      marginBottom: -2.5,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginBottom: 20, color: '#000000' }}>
            <span style={{ fontSize: 12, color: '#000000', fontWeight: 'bold' }}>Filter Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '3px 8px', fontSize: 12, color: '#000000', backgroundColor: '#ffffff', border: '1px solid #000000', borderRadius: 4 }}
            >
              <option value="">All</option>
              <option value="sport">Sport</option>
              <option value="study">Study</option>
              <option value="travel">Travel</option>
              <option value="food">Food</option>
              <option value="gaming">Gaming</option>
              <option value="social">Social</option>
              <option value="help">Help</option>
              <option value="learning">Learning</option>
              <option value="other">Other</option>
            </select>
            <FluidButton
              onClick={fetchDishes}
              style={{ padding: '4px 14px', fontSize: 12, fontWeight: 600 }}
            >
              Refresh
            </FluidButton>
          </div>

          {/* Filtered Dishes based on Sub-Tab */}
          {(() => {
            const filteredDishes = dishes.filter((dish) => {
              if (dineInTab === 'join_to_cook') {
                return dish.status === 'lets_cook';
              }
              if (dineInTab === 'cooking') {
                return dish.status === 'cooking';
              }
              if (dineInTab === 'global') {
                return dish.visibility === 'global';
              }
              if (dineInTab === 'my_dishes') {
                const isCreator = (dish.creator?._id || dish.creator) === user._id;
                const isParticipant = dish.participants?.some((p) => (p.user?._id || p.user) === user._id);
                return isCreator || isParticipant;
              }
              return true;
            });

            if (filteredDishes.length === 0) {
              return (
                <GlassContainer radius={24} style={{ width: '100%' }} innerStyle={{ textAlign: 'center', padding: '40px 20px', color: '#555' }}>
                  No dishes found in <strong>{dineInTab.replace('_', ' ')}</strong>.
                </GlassContainer>
              );
            }

            return (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 20,
                  alignItems: 'start',
                  width: '100%'
                }}
              >
                {filteredDishes.map((dish) => {
                  const creatorObj = dish.creator || {};
                  const creatorName = creatorObj.name || 'Unknown Chef';
                  const creatorUsername = creatorObj.username || 'user';
                  const isCreator = (creatorObj._id || creatorObj) === user._id;
                  const isParticipant = dish.participants?.some((p) => (p.user?._id || p.user) === user._id);
                  const hasPendingReq = dish.requests?.some(
                    (r) => (r.user?._id || r.user) === user._id && r.status === 'pending'
                  );
                  const isExpanded = !!expandedDishes[dish._id];
                  const spotsLeft = dish.capacity?.unlimited ? '∞' : Math.max(0, (dish.capacity?.max || 4) - (dish.participants?.length || 0));

                  return (
                    <GlassContainer
                      key={dish._id}
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
                      {/* Left Icon: Wireframe Shopping Cart SVG */}
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
                        {/* Header: DP + Name + Username */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              backgroundColor: '#9353d3',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 13,
                              fontWeight: 'bold',
                              flexShrink: 0
                            }}
                          >
                            dp
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 'bold', fontSize: 15, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.2 }}>
                              {creatorName}
                            </div>
                            <div style={{ fontSize: 11, color: '#111111', marginTop: 1 }}>
                              @{creatorUsername} • <span style={{ textTransform: 'capitalize' }}>{dish.category}</span>
                            </div>
                          </div>
                        </div>

                        {/* Description with read more */}
                        <div style={{ fontSize: 13, color: '#000000', lineHeight: 1.4, marginBottom: 4, wordBreak: 'break-word' }}>
                          <span style={{ fontWeight: 600, color: '#000000' }}>Description: </span>
                          {isExpanded || dish.description.length <= 80
                            ? dish.description
                            : `${dish.description.slice(0, 80)}...`}
                        </div>

                        {dish.description.length > 80 && (
                          <div style={{ textAlign: 'right', marginBottom: 6 }}>
                            <button
                              onClick={() =>
                                setExpandedDishes((prev) => ({ ...prev, [dish._id]: !prev[dish._id] }))
                              }
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

                        {/* Meta Info Bar: Capacity, Join Mode, Status */}
                        <div style={{ fontSize: 11, color: '#000000', marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 8, fontWeight: '500' }}>
                          <span>👥 {dish.participants?.length || 1}/{dish.capacity?.max || 4} spots ({spotsLeft} left)</span>
                          <span>• {dish.joinMode === 'auto' ? '⚡ Auto-join' : '⏳ Request approval'}</span>
                          {dish.type === 'chefs_special' && <span style={{ color: '#8b0000', fontWeight: 'bold' }}>• ⭐ Chef's Special</span>}
                        </div>

                        {/* Creator Pending Requests Section */}
                        {isCreator && dish.requests?.filter((r) => r.status === 'pending').length > 0 && (
                          <GlassContainer radius={16} innerStyle={{ padding: '8px 12px', marginBottom: 10, fontSize: 11, color: '#000000' }}>
                            <strong>Pending Requests ({dish.requests.filter((r) => r.status === 'pending').length}):</strong>
                            {dish.requests
                              .filter((r) => r.status === 'pending')
                              .map((r) => (
                                <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                  <span style={{ color: '#000000' }}>User: {r.user?._id || r.user}</span>
                                  <div>
                                    <button onClick={() => handleApproveRequest(dish._id, r._id)} style={{ padding: '2px 6px', fontSize: 11, marginRight: 4, color: '#000000', background: '#fff', border: '1px solid #000', borderRadius: 3, cursor: 'pointer' }}>[✓ Approve]</button>
                                    <button onClick={() => handleRejectRequest(dish._id, r._id)} style={{ padding: '2px 6px', fontSize: 11, color: '#000000', background: '#fff', border: '1px solid #000', borderRadius: 3, cursor: 'pointer' }}>[✕ Reject]</button>
                                  </div>
                                </div>
                              ))}
                          </GlassContainer>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {!isParticipant && !hasPendingReq && (
                            <FluidButton
                              onClick={() => handleJoinDish(dish._id)}
                              style={{
                                padding: '5px 14px',
                                fontSize: 12,
                                fontWeight: 600
                              }}
                            >
                              {dish.joinMode === 'auto' ? 'Join Dish' : 'Request to Join'}
                            </FluidButton>
                          )}
                          {hasPendingReq && (
                            <span style={{ fontSize: 11, color: '#000000', fontStyle: 'italic', alignSelf: 'center', fontWeight: 'bold' }}>
                              Request pending approval
                            </span>
                          )}
                          {isParticipant && !isCreator && (
                            <FluidButton
                              onClick={() => handleLeaveDish(dish._id)}
                              style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600 }}
                            >
                              Leave Dish
                            </FluidButton>
                          )}
                          {isCreator && dish.status === 'lets_cook' && (
                            <FluidButton
                              onClick={() => handleUpdateStatus(dish._id, 'cooking')}
                              style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600 }}
                            >
                              Start Cooking
                            </FluidButton>
                          )}
                          {isCreator && dish.status === 'cooking' && (
                            <FluidButton
                              onClick={() => handleUpdateStatus(dish._id, 'cooked')}
                              style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600 }}
                            >
                              Mark Cooked
                            </FluidButton>
                          )}
                        </div>
                      </div>
                    </GlassContainer>
                  );
                })}
              </div>
            );
          })()}
        </section>
      )}



      {/* ========================================================= */}
      {/* 4. MESSAGES SCREEN (PRODUCT.md Section 16) */}
      {/* ========================================================= */}
      {activeTab === 'messages' && (
        <section style={{ width: '100%', maxWidth: 1040, height: 'calc(100vh - 64px)' }}>
          <GlassContainer
            radius={28}
            style={{ width: '100%', height: '100%' }}
            innerStyle={{
              display: 'flex',
              height: '100%',
              width: '100%',
              overflow: 'hidden'
            }}
          >
            {/* Left Panel: Conversations List */}
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
                <div style={{ fontSize: 28, fontWeight: 700, color: '#000000', marginBottom: 16, letterSpacing: '-0.3px' }}>
                  {user.name || user.username}
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
                    Requests {conversations.filter((c) => c.isRequest).length > 0 && `(${conversations.filter((c) => c.isRequest).length})`}
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    value={searchMsgQuery}
                    onChange={(e) => setSearchMsgQuery(e.target.value)}
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
                {(() => {
                  const list = conversations.filter((c) => {
                    const matchTab = messagesTab === 'requests' ? c.isRequest : !c.isRequest;
                    const query = searchMsgQuery.trim().toLowerCase();
                    if (!query) return matchTab;
                    const nameMatch = (c.user?.name || '').toLowerCase().includes(query);
                    const usernameMatch = (c.user?.username || '').toLowerCase().includes(query);
                    const lastMsgMatch = (c.lastMessage || '').toLowerCase().includes(query);
                    return matchTab && (nameMatch || usernameMatch || lastMsgMatch);
                  });

                  if (list.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '36px 16px', color: '#666666', fontSize: 14 }}>
                        {messagesTab === 'requests' ? 'No message requests' : 'No conversations found'}
                      </div>
                    );
                  }

                  return list.map((c) => {
                    const isSelected = selectedConvId === c.conversationId;
                    const otherUser = c.user || {};
                    return (
                      <div
                        key={c.conversationId}
                        onClick={() => handleOpenConversation(c.conversationId)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          padding: '12px 14px',
                          borderRadius: 14,
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
                          marginBottom: 4,
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        {/* Purple Avatar Circle */}
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            backgroundColor: '#8257e5',
                            flexShrink: 0
                          }}
                        />

                        {/* Name & Snippet */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                            {otherUser.name || 'NAME'}
                          </div>
                          <div style={{ fontSize: 13, color: '#333333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                            {c.lastMessage || 'Hey there how are...'}
                          </div>

                          {/* Requests Action Buttons */}
                          {c.needsResponse && (
                            <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRespondMessageRequest(c.conversationId, 'accepted'); }}
                                style={{ padding: '3px 8px', fontSize: 11, background: '#000000', color: '#ffffff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
                              >
                                Accept
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRespondMessageRequest(c.conversationId, 'rejected'); }}
                                style={{ padding: '3px 8px', fontSize: 11, background: '#ffffff', color: '#000000', border: '1px solid #000000', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div style={{ fontSize: 12, color: '#555555', flexShrink: 0, alignSelf: 'flex-start', marginTop: 4 }}>
                          {formatTimeAgo(c.updatedAt)}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Right Panel: Chat Thread */}
            {(() => {
              const activeConv = conversations.find((c) => c.conversationId === selectedConvId);
              const activeUser = activeConv?.user || (convMessages.length > 0 ? (convMessages[0].sender?._id === user._id ? convMessages[0].receiver : convMessages[0].sender) : null);

              return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'transparent', minWidth: 0 }}>
                  {activeUser ? (
                    <>
                      {/* Top Header */}
                      <div
                        style={{
                          padding: '16px 28px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 18,
                          borderBottom: '1.5px solid rgba(255, 255, 255, 0.7)',
                          backgroundColor: 'transparent'
                        }}
                      >
                        <div
                          style={{
                            width: 62,
                            height: 62,
                            borderRadius: '50%',
                            backgroundColor: '#8257e5',
                            flexShrink: 0
                          }}
                        />
                        <div>
                          <div style={{ fontSize: 22, fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {activeUser.name || 'NAME'}
                          </div>
                          <div style={{ fontSize: 13, color: '#555555', marginTop: 2 }}>
                            @{activeUser.username || 'username'}
                          </div>
                        </div>
                      </div>

                      {/* Messages Area */}
                      <div
                        style={{
                          flex: 1,
                          overflowY: 'auto',
                          padding: '24px 32px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 18
                        }}
                      >
                        {convMessages.length === 0 ? (
                          <div style={{ textAlign: 'center', margin: 'auto', color: '#888888', fontSize: 14 }}>
                            No messages yet in this conversation. Say hello!
                          </div>
                        ) : (
                          convMessages.map((m) => {
                            const isMe = (m.sender?._id || m.sender) === user._id;

                            if (isMe) {
                              // Outgoing Message
                              return (
                                <GlassContainer
                                  key={m._id}
                                  radius={24}
                                  style={{ alignSelf: 'flex-end', maxWidth: '70%' }}
                                  innerStyle={{
                                    padding: '14px 22px',
                                    color: '#000000',
                                    fontSize: 15,
                                    lineHeight: 1.4
                                  }}
                                >
                                  {m.content}
                                </GlassContainer>
                              );
                            } else {
                              // Incoming Message
                              return (
                                <div
                                  key={m._id}
                                  style={{
                                    alignSelf: 'flex-start',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    maxWidth: '75%'
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: '50%',
                                      backgroundColor: '#8257e5',
                                      flexShrink: 0
                                    }}
                                  />
                                  <GlassContainer
                                    radius={24}
                                    style={{ flex: 1 }}
                                    innerStyle={{
                                      padding: '14px 22px',
                                      color: '#000000',
                                      fontSize: 15,
                                      lineHeight: 1.4
                                    }}
                                  >
                                    {m.content}
                                  </GlassContainer>
                                </div>
                              );
                            }
                          })
                        )}
                      </div>

                      {/* Bottom Input Bar */}
                      <div style={{ padding: '16px 24px', backgroundColor: 'transparent' }}>
                        <form onSubmit={handleSendMessage}>
                          <GlassContainer
                            radius={9999}
                            innerStyle={{
                              padding: '6px 14px 6px 18px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12
                            }}
                          >
                            {/* Winking Smiley SVG Icon */}
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <circle cx="12" cy="12" r="10" />
                              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                              <line x1="9" y1="9" x2="9.01" y2="9" />
                              <path d="M15 8.5a1.5 1.5 0 0 1 1.5 1.5" />
                            </svg>
                            <input
                              type="text"
                              required
                              value={msgContent}
                              onChange={(e) => setMsgContent(e.target.value)}
                              placeholder="Type a Message..."
                              style={{
                                border: 'none',
                                background: 'transparent',
                                outline: 'none',
                                fontSize: 15,
                                flex: 1,
                                color: '#000000',
                                fontFamily: 'inherit'
                              }}
                            />
                            <FluidButton
                              type="submit"
                              variant="icon"
                              style={{
                                width: 36,
                                height: 36,
                                minWidth: 36,
                                minHeight: 36,
                                flexShrink: 0
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                              </svg>
                            </FluidButton>
                          </GlassContainer>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#666666' }}>
                      <div style={{ fontSize: 44, marginBottom: 12 }}>💬</div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>Select a conversation to start chatting</div>
                    </div>
                  )}
                </div>
              );
            })()}
          </GlassContainer>
        </section>
      )}

      {/* ========================================================= */}
      {/* 5. PROFILE SCREEN & SETTINGS (PRODUCT.md Section 18 & 23) */}
      {/* ========================================================= */}
      {activeTab === 'profile' && (
        <section style={{ width: '100%', maxWidth: 935, margin: '0 auto', color: '#000000', fontFamily: "'Inter', sans-serif", paddingTop: 16 }}>
          
          {/* ========================================================= */}
          {/* 1. TOP PROFILE HEADER (Instagram Profile Layout)          */}
          {/* ========================================================= */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 56, marginBottom: 44, padding: '0 20px', flexWrap: 'wrap' }}>
            {/* Left Column: Avatar with Instagram Note */}
            <div style={{ width: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flexShrink: 0 }}>
              {/* Floating Note Tag */}
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  left: 6,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: 16,
                  padding: '3px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#4b5563',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  cursor: 'default',
                  zIndex: 2,
                  whiteSpace: 'nowrap'
                }}
              >
                Note...
              </div>

              {/* Large Circular Avatar: Orange if no photo, no glow/shadow */}
              <div
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  backgroundColor: '#f97316',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                  border: 'none',
                  position: 'relative'
                }}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 52, color: '#ffffff', fontWeight: 800, userSelect: 'none' }}>
                    {(user.name || user.username || 'S')[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Profile Info */}
            <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Row 1: Username & Action Buttons (View Archive Removed) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 21, fontWeight: 600, margin: 0, letterSpacing: '-0.3px', color: '#000000', lineHeight: 1.2 }}>
                  {user.username || 'username'}
                </h1>

                {/* Edit Profile Button */}
                <button
                  onClick={() => setShowEditProfile(true)}
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
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.12)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.08)'}
                >
                  Edit Profile
                </button>

                {/* Settings Gear Button */}
                <button
                  onClick={() => setShowSettings(true)}
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
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>
              </div>

              {/* Row 2: Stats Row */}
              <div style={{ display: 'flex', gap: 36, fontSize: 15.5, color: '#000000' }}>
                <span style={{ cursor: 'pointer' }} onClick={() => setProfileActiveTab('dishes')}>
                  <strong>{user.stats?.dishesCreated ?? 17}</strong> cooked
                </span>
                <span style={{ cursor: 'pointer' }} onClick={() => setProfileActiveTab('joined')}>
                  <strong>{user.stats?.dishesJoined ?? 19}</strong> joined
                </span>
                <span style={{ cursor: 'pointer' }} onClick={() => setShowSettings(true)}>
                  <strong>{connections.length > 0 ? connections.length : 72}</strong> connections
                </span>
              </div>

              {/* Row 3: Name, Pronouns, Verified Institute, Bio with Blue Hashtags, Button Aesthetic Tags */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, lineHeight: 1.45 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#000000' }}>
                    {user.name || 'Sid G'}
                  </span>
                  <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
                    {pronouns || user.pronouns || 'He/Him'}
                  </span>
                </div>

                {/* Institute with Verified Tick Badge */}
                <div style={{ fontSize: 13.5, color: '#374151', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600 }}>🎓 {user.institute?.name || instituteName || 'IIT MADRAS'}</span>
                  {/* Verified Tick Mark */}
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
                    • Batch of {user.institute?.year || instituteYear || '2029'}
                  </span>
                </div>

                {/* Bio with Blue Hashtags Inside */}
                <div style={{ color: '#111827', marginTop: 4, maxWidth: 540 }}>
                  {(() => {
                    const rawBio = user.bio || bio || 'Mastering sourdough fermentation, late night pasta experiments, and finding the best espresso roast in town. Always down to cook together! #sourdough #pasta #espresso';
                    const isLong = rawBio.length > 90;
                    const displayBio = isLong && !bioExpanded ? rawBio.slice(0, 90) + '...' : rawBio;
                    
                    // Parse words to format hashtags in blue
                    const bioParts = displayBio.split(/(#[a-zA-Z0-9_]+)/g);

                    return (
                      <div>
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
                                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.75'}
                                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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
                    );
                  })()}
                </div>

                {/* Tags using Button Aesthetics */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                  {(interests && interests.length > 0 ? interests : ['music', 'Gym', 'Sports', 'Anime', 'Coffee']).map((tag, idx) => (
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
                        display: 'inline-flex',
                        alignItems: 'center',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {tag.startsWith('#') ? tag.slice(1) : tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. TAB BAR (DISHES, JOINED, AWARDS)                        */}
          {/* ========================================================= */}
          <div
            style={{
              borderTop: '1px solid rgba(0, 0, 0, 0.1)',
              display: 'flex',
              justifyContent: 'center',
              gap: 56,
              marginBottom: 28
            }}
          >
            {[
              {
                id: 'dishes',
                label: 'DISHES',
                icon: (isActive) => (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? '2.4' : '2'} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                )
              },
              {
                id: 'joined',
                label: 'JOINED',
                icon: (isActive) => (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? '2.4' : '2'} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                )
              },
              {
                id: 'awards',
                label: 'AWARDS',
                icon: (isActive) => (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? '2.4' : '2'} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                  </svg>
                )
              }
            ].map((tab) => {
              const isActive = profileActiveTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setProfileActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    height: 52,
                    marginTop: -1,
                    borderTop: isActive ? '1.5px solid #000000' : '1.5px solid transparent',
                    borderBottom: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 12.5,
                    fontWeight: isActive ? 700 : 600,
                    letterSpacing: '1px',
                    color: isActive ? '#000000' : '#888888',
                    transition: 'color 0.15s ease, border-color 0.15s ease'
                  }}
                >
                  {tab.icon(isActive)}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ========================================================= */}
          {/* 3. TAB VIEWS CONTENT                                      */}
          {/* ========================================================= */}

          {/* TAB 1: DISHES (Own Active Dish on top, Previous Dishes down the line) */}
          {profileActiveTab === 'dishes' && (
            <div>
              {(() => {
                const userOwnedDishes = dishes.filter(d => (d.creator?._id || d.creator) === user._id);
                
                // Fallbacks so demo is always rich and structured
                const fallbackActiveDish = {
                  _id: 'active-dish-demo',
                  title: 'Truffle Tagliatelle & Burrata',
                  cuisine: 'Italian Handmade Pasta',
                  description: 'Slow-simmered winter black truffle sauce paired with artisan hand-rolled tagliatelle and fresh imported burrata. Cooking together live tonight!',
                  status: 'cooking',
                  capacity: 4,
                  participants: [{ user: { name: user.name || 'Sid G' } }, { user: { name: 'Elena R' } }, { user: { name: 'Lucas M' } }],
                  location: { landmark: 'Host Kitchen - Block 4' },
                  timing: { cookStart: 'Tonight at 8:00 PM' }
                };

                const fallbackPreviousDishes = [
                  {
                    _id: 'prev-dish-1',
                    title: 'Sourdough Neapolitan Pizza',
                    cuisine: 'Wood-fired Pizza',
                    description: '48-hour cold fermented sourdough dough with San Marzano tomatoes, fresh basil, and fior di latte.',
                    status: 'cooked',
                    capacity: 5,
                    participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }, { user: '5' }],
                    location: { landmark: 'Common Kitchen' }
                  },
                  {
                    _id: 'prev-dish-2',
                    title: 'Smoked Shakshuka Brunch',
                    cuisine: 'Middle Eastern',
                    description: 'Poached farm eggs in spiced tomato, roasted pepper sauce with cumin and zaatar flatbread.',
                    status: 'cooked',
                    capacity: 4,
                    participants: [{ user: '1' }, { user: '2' }, { user: '3' }],
                    location: { landmark: 'North Wing Terrace' }
                  },
                  {
                    _id: 'prev-dish-3',
                    title: 'Artisan Espresso Pour-over Tasting',
                    cuisine: 'Coffee & Dessert',
                    description: 'Single-origin Ethiopian Yirgacheffe pairing with homemade citrus biscotti and extraction demo.',
                    status: 'cooked',
                    capacity: 6,
                    participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }],
                    location: { landmark: 'Brew Lab' }
                  }
                ];

                const realActive = userOwnedDishes.filter(d => d.status !== 'cooked');
                const realPrevious = userOwnedDishes.filter(d => d.status === 'cooked');

                const activeDish = realActive.length > 0 ? realActive[0] : (userOwnedDishes.length === 0 ? fallbackActiveDish : null);
                const previousDishes = realPrevious.length > 0 ? realPrevious : (userOwnedDishes.length === 0 ? fallbackPreviousDishes : []);

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
                    {/* SECTION A: OWN ACTIVE DISH ON TOP */}
                    {activeDish && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.2)' }} />
                            <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#15803d', margin: 0 }}>
                              Own Active Dish
                            </h4>
                          </div>
                          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>
                            🔥 Live Session
                          </span>
                        </div>

                        {/* Prominent Active Dish Card */}
                        <GlassContainer
                          radius={22}
                          style={{ width: '100%' }}
                          innerStyle={{
                            padding: '24px 28px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16,
                            boxSizing: 'border-box'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.1)', padding: '3px 10px', borderRadius: 9999 }}>
                                  {activeDish.cuisine || activeDish.category || 'Specialty'}
                                </span>
                                <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                                  {activeDish.timing?.cookStart || 'Cooking Tonight'}
                                </span>
                              </div>
                              <h3 style={{ fontSize: 21, fontWeight: 800, margin: '0 0 6px 0', color: '#000000', letterSpacing: '-0.3px' }}>
                                {activeDish.title || activeDish.description}
                              </h3>
                              <p style={{ fontSize: 14, color: '#4b5563', margin: 0, maxWidth: 680, lineHeight: 1.5 }}>
                                {activeDish.description || 'Join in the active cooking session to prepare delicious food together.'}
                              </p>
                            </div>

                            <FluidButton
                              onClick={() => setShowKitchenModal(true)}
                              style={{ padding: '8px 20px', fontSize: 13, fontWeight: 600, flexShrink: 0 }}
                            >
                              Open Kitchen
                            </FluidButton>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: 14, fontSize: 13, color: '#4b5563', flexWrap: 'wrap', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                              <span>👥 <strong>{activeDish.participants?.length || 3}</strong>/{activeDish.capacity?.max || activeDish.capacity || 4} spots filled</span>
                              <span>📍 {activeDish.location?.landmark || activeDish.location?.areaName || 'Host kitchen'}</span>
                            </div>
                            <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                              ✓ In Progress
                            </span>
                          </div>
                        </GlassContainer>
                      </div>
                    )}

                    {/* SECTION B: PREVIOUS DISHES DOWN THE LINE */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#6b7280', margin: 0 }}>
                          Previous Dishes ({previousDishes.length})
                        </h4>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>
                          Completed Sessions
                        </span>
                      </div>

                      {previousDishes.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666666' }}>
                          <p style={{ fontSize: 14, margin: 0 }}>No previous dishes yet. Your completed dishes will appear here.</p>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                          {previousDishes.map((dish) => (
                            <GlassContainer
                              key={dish._id}
                              radius={18}
                              style={{ aspectRatio: '1 / 1', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
                              innerStyle={{
                                padding: 20,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                boxSizing: 'border-box'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555555' }}>
                                    {dish.cuisine || dish.category || 'Home Cooking'}
                                  </span>
                                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, backgroundColor: 'rgba(0,0,0,0.06)', color: '#4b5563' }}>
                                    ✓ Cooked
                                  </span>
                                </div>
                                <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 6px 0', color: '#000000', lineHeight: 1.3 }}>
                                  {dish.title || (dish.description ? (dish.description.length > 35 ? dish.description.slice(0, 35) + '...' : dish.description) : 'Culinary Dish')}
                                </h4>
                                <p style={{ fontSize: 12.5, color: '#4b5563', margin: 0, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {dish.description || 'Delicious culinary creation cooked together.'}
                                </p>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: 12, color: '#666666' }}>
                                <span>👥 {dish.participants?.length || 1}/{dish.capacity?.max || dish.capacity || 4}</span>
                                <span>📍 {dish.location?.landmark || dish.location?.areaName || 'Campus'}</span>
                              </div>
                            </GlassContainer>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 2: JOINED (Active Joined on top, Previous Joined down the line) */}
          {profileActiveTab === 'joined' && (
            <div>
              {(() => {
                const userJoinedDishes = dishes.filter(d => (d.creator?._id || d.creator) !== user._id && (d.participants || []).some(p => (p.user?._id || p.user) === user._id));

                const fallbackActiveJoined = {
                  _id: 'active-joined-demo',
                  title: 'Tokyo Shoyu Ramen & Chashu Pork',
                  cuisine: 'Japanese Ramen',
                  creator: { name: 'Kenji Sato', username: 'kenji_chef' },
                  description: '12-hour simmered dashi pork bone broth with spring noodles, seasoned ajitsuke tamago, and melted chashu. Gathering to cook and feast together!',
                  status: 'cooking',
                  capacity: 4,
                  participants: [{ user: 'kenji' }, { user: user._id }, { user: 'p3' }],
                  location: { landmark: 'East Dorm Kitchen 2B' },
                  timing: { cookStart: 'Tonight at 7:30 PM' }
                };

                const fallbackPreviousJoined = [
                  {
                    _id: 'prev-joined-1',
                    title: 'Spanish Paella Valenciana',
                    cuisine: 'Spanish Cuisine',
                    creator: { name: 'Maria Santos', username: 'maria_cooks' },
                    description: 'Saffron bomba rice with rosemary, butter beans, chicken, and socarrat crisp crust.',
                    status: 'cooked',
                    capacity: 6,
                    participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }],
                    location: { landmark: 'Courtyard Dining Table' }
                  },
                  {
                    _id: 'prev-joined-2',
                    title: 'Handcrafted Xiao Long Bao',
                    cuisine: 'Dim Sum',
                    creator: { name: 'Chen Wei', username: 'chef_chen' },
                    description: 'Delicate soup dumplings filled with savory ginger pork and rich gelatin broth.',
                    status: 'cooked',
                    capacity: 4,
                    participants: [{ user: '1' }, { user: '2' }, { user: '3' }],
                    location: { landmark: 'West Quad Hall' }
                  },
                  {
                    _id: 'prev-joined-3',
                    title: 'Matcha Mille Crêpe Cake',
                    cuisine: 'French-Japanese Bakery',
                    creator: { name: 'Aoi Tanaka', username: 'aoi_pastry' },
                    description: 'Twenty paper-thin green tea crêpes layered with light Uji matcha chantilly cream.',
                    status: 'cooked',
                    capacity: 5,
                    participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }],
                    location: { landmark: 'Bakery Studio' }
                  }
                ];

                const realActiveJoined = userJoinedDishes.filter(d => d.status !== 'cooked');
                const realPreviousJoined = userJoinedDishes.filter(d => d.status === 'cooked');

                const activeJoined = realActiveJoined.length > 0 ? realActiveJoined[0] : (userJoinedDishes.length === 0 ? fallbackActiveJoined : null);
                const previousJoined = realPreviousJoined.length > 0 ? realPreviousJoined : (userJoinedDishes.length === 0 ? fallbackPreviousJoined : []);

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
                    {/* SECTION A: ACTIVE JOINED DISH ON TOP */}
                    {activeJoined && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0284c7', display: 'inline-block', boxShadow: '0 0 0 3px rgba(2, 132, 199, 0.2)' }} />
                            <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#0369a1', margin: 0 }}>
                              Active Joined Dish
                            </h4>
                          </div>
                          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>
                            🔥 Joined Session
                          </span>
                        </div>

                        <GlassContainer
                          radius={22}
                          style={{ width: '100%' }}
                          innerStyle={{
                            padding: '24px 28px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16,
                            boxSizing: 'border-box'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#0284c7', backgroundColor: 'rgba(2, 132, 199, 0.1)', padding: '3px 10px', borderRadius: 9999 }}>
                                  {activeJoined.cuisine || activeJoined.category || 'Dine-In'}
                                </span>
                                <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                                  Host: @{activeJoined.creator?.username || 'chef'}
                                </span>
                              </div>
                              <h3 style={{ fontSize: 21, fontWeight: 800, margin: '0 0 6px 0', color: '#000000', letterSpacing: '-0.3px' }}>
                                {activeJoined.title || activeJoined.description}
                              </h3>
                              <p style={{ fontSize: 14, color: '#4b5563', margin: 0, maxWidth: 680, lineHeight: 1.5 }}>
                                {activeJoined.description || 'You are participating in this dish with the host chef.'}
                              </p>
                            </div>

                            <FluidButton
                              onClick={() => setActiveTab('messages')}
                              style={{ padding: '8px 20px', fontSize: 13, fontWeight: 600, flexShrink: 0 }}
                            >
                              Message Host
                            </FluidButton>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: 14, fontSize: 13, color: '#4b5563', flexWrap: 'wrap', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                              <span>👥 <strong>{activeJoined.participants?.length || 3}</strong>/{activeJoined.capacity?.max || activeJoined.capacity || 4} participants</span>
                              <span>📍 {activeJoined.location?.landmark || activeJoined.location?.areaName || 'Campus kitchen'}</span>
                            </div>
                            <span style={{ fontSize: 12, color: '#0284c7', fontWeight: 600 }}>
                              ✓ Confirmed Spot
                            </span>
                          </div>
                        </GlassContainer>
                      </div>
                    )}

                    {/* SECTION B: PREVIOUS JOINED DISHES DOWN THE LINE */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#6b7280', margin: 0 }}>
                          Past Joined Sessions ({previousJoined.length})
                        </h4>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>
                          History
                        </span>
                      </div>

                      {previousJoined.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666666' }}>
                          <p style={{ fontSize: 14, margin: 0 }}>No past joined dishes yet.</p>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                          {previousJoined.map((dish) => (
                            <GlassContainer
                              key={dish._id}
                              radius={18}
                              style={{ aspectRatio: '1 / 1', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
                              innerStyle={{
                                padding: 20,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                boxSizing: 'border-box'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555555' }}>
                                    {dish.cuisine || dish.category || 'Dine-In'}
                                  </span>
                                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, backgroundColor: 'rgba(0,0,0,0.06)', color: '#4b5563' }}>
                                    ✓ Joined
                                  </span>
                                </div>
                                <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 6px 0', color: '#000000', lineHeight: 1.3 }}>
                                  {dish.title || (dish.description ? (dish.description.length > 35 ? dish.description.slice(0, 35) + '...' : dish.description) : 'Dish Session')}
                                </h4>
                                <p style={{ fontSize: 12.5, color: '#4b5563', margin: 0, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {dish.description}
                                </p>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: 12, color: '#666666' }}>
                                <span>Host: @{dish.creator?.username || 'chef'}</span>
                                <span>👥 {dish.participants?.length || 1}/{dish.capacity?.max || dish.capacity || 4}</span>
                              </div>
                            </GlassContainer>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 3: AWARDS (Award Library - Owned on top, Locked in B&W down the line) */}
          {profileActiveTab === 'awards' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px 0', color: '#000000', letterSpacing: '-0.3px' }}>
                    Award Library
                  </h3>
                  <p style={{ fontSize: 13.5, color: '#6b7280', margin: 0 }}>
                    Badges unlocked through campus cooking, hosting sessions, and culinary exploration.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, fontSize: 12, fontWeight: 700 }}>
                  <span style={{ padding: '5px 12px', borderRadius: 9999, backgroundColor: 'rgba(34, 197, 94, 0.12)', color: '#15803d' }}>
                    ✓ 3 Unlocked
                  </span>
                  <span style={{ padding: '5px 12px', borderRadius: 9999, backgroundColor: 'rgba(0, 0, 0, 0.06)', color: '#4b5563' }}>
                    🔒 5 to Unlock
                  </span>
                </div>
              </div>

              {/* 1. OWNED / UNLOCKED AWARDS (Top Section - Full Color) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 14 }}>🏆</span>
                  <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#15803d', margin: 0 }}>
                    Owned Awards
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                  {/* Owned 1: Master Chef */}
                  <GlassContainer
                    radius={22}
                    innerStyle={{
                      padding: '24px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 12,
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ width: 84, height: 84, borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(0, 0, 0, 0.08)' }}>
                      <svg width="52" height="46" viewBox="0 0 64 64" fill="none">
                        <path d="M18 36 C12 36 8 30 11 23 C13 18 19 16 23 18 C25 11 34 8 40 13 C46 9 55 12 56 19 C60 21 61 29 56 34 C54 36 51 36 49 36 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.8" />
                        <path d="M25 21 C26 28 27 34 27 36" stroke="#e2e8f0" strokeWidth="2.2" strokeLinecap="round" />
                        <path d="M36 15 C36 24 36 32 36 36" stroke="#e2e8f0" strokeWidth="2.2" strokeLinecap="round" />
                        <path d="M46 19 C45 26 44 32 43 36" stroke="#e2e8f0" strokeWidth="2.2" strokeLinecap="round" />
                        <rect x="17" y="36" width="33" height="13" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.8" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#15803d', backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: 9999, marginBottom: 6 }}>
                        ✓ Unlocked
                      </div>
                      <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px 0', color: '#000000' }}>Master Chef</h4>
                      <p style={{ fontSize: 12.5, color: '#4b5563', margin: 0, lineHeight: 1.4 }}>
                        Hosted and executed 10+ culinary sessions on campus.
                      </p>
                    </div>
                  </GlassContainer>

                  {/* Owned 2: Coffee Roast */}
                  <GlassContainer
                    radius={22}
                    innerStyle={{
                      padding: '24px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 12,
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ width: 84, height: 84, borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(0, 0, 0, 0.08)' }}>
                      <svg width="54" height="46" viewBox="0 0 68 56" fill="none">
                        <path d="M22 13 C20 9 24 6 22 2" stroke="#92400e" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                        <path d="M30 11 C28 7 32 4 30 1" stroke="#92400e" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                        <ellipse cx="32" cy="49" rx="27" ry="5" fill="#fdfbf7" stroke="#78350f" strokeWidth="2" />
                        <path d="M44 26 C53 26 55 38 43 41" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
                        <path d="M14 21 L18 43 C19 46 25 47 32 47 C39 47 45 46 46 43 L50 21 Z" fill="#6f4e37" stroke="#451a03" strokeWidth="2" />
                        <ellipse cx="32" cy="21" rx="18" ry="4.5" fill="#3e2312" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#b45309', backgroundColor: 'rgba(245, 158, 11, 0.12)', padding: '2px 8px', borderRadius: 9999, marginBottom: 6 }}>
                        ✓ Unlocked
                      </div>
                      <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px 0', color: '#000000' }}>Coffee Roast</h4>
                      <p style={{ fontSize: 12.5, color: '#4b5563', margin: 0, lineHeight: 1.4 }}>
                        Campus specialty coffee artisan • 20+ pour-overs brewed.
                      </p>
                    </div>
                  </GlassContainer>

                  {/* Owned 3: Midnight Kitchen */}
                  <GlassContainer
                    radius={22}
                    innerStyle={{
                      padding: '24px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 12,
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ width: 84, height: 84, borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(0, 0, 0, 0.08)' }}>
                      <svg width="54" height="46" viewBox="0 0 68 56" fill="none">
                        <path d="M37 7 C32 12 32 20 37 25 C40 28 44 29 47 28 C43 35 33 37 26 32 C19 26 20 15 27 9 C30 7 33 6 37 7 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
                        <path d="M18 43 C13 43 9 39 10 34 C11 29 16 28 19 29 C22 23 30 22 35 26 C38 24 43 24 45 27 C50 26 55 30 54 35 C57 37 57 42 52 43 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#ca8a04', backgroundColor: 'rgba(234, 179, 8, 0.12)', padding: '2px 8px', borderRadius: 9999, marginBottom: 6 }}>
                        ✓ Unlocked
                      </div>
                      <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px 0', color: '#000000' }}>Midnight Kitchen</h4>
                      <p style={{ fontSize: 12.5, color: '#4b5563', margin: 0, lineHeight: 1.4 }}>
                        Late-night cooking champion • Prepared dishes after 11:00 PM.
                      </p>
                    </div>
                  </GlassContainer>
                </div>
              </div>

              {/* 2. YET TO BE UNLOCKED (Down the line - Black & White Grayscale) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>🔒</span>
                  <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#6b7280', margin: 0 }}>
                    Yet to Unlock (Award Library)
                  </h4>
                </div>
                <p style={{ fontSize: 12.5, color: '#6b7280', margin: '0 0 16px 0' }}>
                  These badges remain in black & white until unlock requirements are satisfied.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                  {[
                    {
                      id: 'table-host',
                      title: 'Campus Table Host',
                      desc: 'Host dishes with 20 distinct students across campus.',
                      progress: '14 / 20 students',
                      progressPercent: 70,
                      icon: (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 20h18" />
                          <path d="M5 20v-8a7 7 0 0 1 14 0v8" />
                          <path d="M12 4v1" />
                          <circle cx="12" cy="4" r="1" />
                        </svg>
                      )
                    },
                    {
                      id: 'flavor-explorer',
                      title: 'Flavor Explorer',
                      desc: 'Cook recipes across 5 distinct international cuisines.',
                      progress: '3 / 5 cuisines',
                      progressPercent: 60,
                      icon: (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      )
                    },
                    {
                      id: 'golden-apron',
                      title: 'Golden Apron',
                      desc: 'Achieve 5-star ratings on 10 completed cooking sessions.',
                      progress: '6 / 10 sessions',
                      progressPercent: 60,
                      icon: (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      )
                    },
                    {
                      id: 'early-riser',
                      title: 'Early Riser Baker',
                      desc: 'Host an early morning breakfast session before 8:30 AM.',
                      progress: '0 / 1 hosted',
                      progressPercent: 0,
                      icon: (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v4" />
                          <path d="M4.93 10.93l2.83 2.83" />
                          <path d="M2 18h20" />
                          <path d="M20 18a8 8 0 0 0-16 0" />
                          <path d="M19.07 10.93l-2.83 2.83" />
                        </svg>
                      )
                    },
                    {
                      id: 'iron-pan',
                      title: 'Iron Pan Master',
                      desc: 'Lead a high-heat wok or cast-iron cooking session.',
                      progress: '0 / 1 completed',
                      progressPercent: 0,
                      icon: (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                        </svg>
                      )
                    }
                  ].map((locked) => (
                    <GlassContainer
                      key={locked.id}
                      radius={22}
                      style={{
                        filter: 'grayscale(100%)',
                        opacity: 0.72,
                        transition: 'opacity 0.2s ease'
                      }}
                      innerStyle={{
                        padding: '24px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 12,
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ width: 84, height: 84, borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px dashed rgba(0, 0, 0, 0.2)' }}>
                        {locked.icon}
                      </div>

                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#4b5563', backgroundColor: 'rgba(0, 0, 0, 0.08)', padding: '2px 8px', borderRadius: 9999, marginBottom: 6 }}>
                          <span>🔒</span> Locked
                        </div>
                        <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px 0', color: '#000000' }}>
                          {locked.title}
                        </h4>
                        <p style={{ fontSize: 12.5, color: '#4b5563', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                          {locked.desc}
                        </p>

                        {/* Progress Bar in B&W */}
                        <div style={{ width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.08)', borderRadius: 9999, height: 6, overflow: 'hidden', marginBottom: 6 }}>
                          <div style={{ width: `${locked.progressPercent}%`, height: '100%', backgroundColor: '#4b5563', borderRadius: 9999 }} />
                        </div>
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: '#4b5563' }}>
                          {locked.progress}
                        </span>
                      </div>
                    </GlassContainer>
                  ))}
                </div>
              </div>
            </div>
          )}


          {/* EDIT PROFILE MODAL (Triggered by pill button) */}
          {showEditProfile && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(3px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16
              }}
              onClick={() => setShowEditProfile(false)}
            >
              <GlassContainer
                radius={28}
                style={{ width: '100%', maxWidth: 540 }}
                innerStyle={{
                  padding: 28,
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  color: '#000000'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Edit Profile</h3>
                  <button
                    onClick={() => setShowEditProfile(false)}
                    style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Display Name:</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Sid G"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                        color: '#000000'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Pronouns:</label>
                    <input
                      type="text"
                      value={pronouns}
                      onChange={(e) => setPronouns(e.target.value)}
                      placeholder="e.g. He/Him, She/Her, They/Them"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                        color: '#000000'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Bio:</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="Tell the community what you like to cook, your specialties, and what inspires you..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                        color: '#000000',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* Tags Editor */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Tags / Interests:</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      {interests.map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            backgroundColor: '#cdd5de',
                            color: '#000000',
                            padding: '4px 12px',
                            borderRadius: 9999,
                            fontSize: 13,
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => setInterests(interests.filter((_, idx) => idx !== i))}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#4b5563',
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: 14,
                              fontWeight: 700
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newTagInput.trim() && !interests.includes(newTagInput.trim())) {
                              setInterests([...interests, newTagInput.trim()]);
                              setNewTagInput('');
                            }
                          }
                        }}
                        placeholder="Add new tag (e.g. Baking, Tacos, Vegan)..."
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1px solid #d1d5db',
                          fontSize: 13,
                          color: '#000000'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newTagInput.trim() && !interests.includes(newTagInput.trim())) {
                            setInterests([...interests, newTagInput.trim()]);
                            setNewTagInput('');
                          }
                        }}
                        style={{
                          backgroundColor: '#111827',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 14px',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  {/* Institutes Editor */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Primary Institute:</label>
                      <input
                        type="text"
                        value={instituteName}
                        onChange={(e) => setInstituteName(e.target.value)}
                        placeholder="e.g. IIT MADRAS"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1px solid #d1d5db',
                          fontSize: 13,
                          color: '#000000'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Primary Batch Year:</label>
                      <input
                        type="number"
                        value={instituteYear}
                        onChange={(e) => setInstituteYear(e.target.value)}
                        placeholder="2029"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1px solid #d1d5db',
                          fontSize: 13,
                          color: '#000000'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Secondary Institute:</label>
                      <input
                        type="text"
                        value={secondaryInstituteName}
                        onChange={(e) => setSecondaryInstituteName(e.target.value)}
                        placeholder="e.g. SST"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1px solid #d1d5db',
                          fontSize: 13,
                          color: '#000000'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Secondary Batch Year:</label>
                      <input
                        type="number"
                        value={secondaryInstituteYear}
                        onChange={(e) => setSecondaryInstituteYear(e.target.value)}
                        placeholder="2029"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1px solid #d1d5db',
                          fontSize: 13,
                          color: '#000000'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                    <FluidButton
                      type="button"
                      onClick={() => setShowEditProfile(false)}
                      style={{
                        padding: '8px 22px',
                        fontSize: 14,
                        fontWeight: 600
                      }}
                    >
                      Cancel
                    </FluidButton>
                    <FluidButton
                      type="submit"
                      style={{
                        padding: '8px 26px',
                        fontSize: 14,
                        fontWeight: 600
                      }}
                    >
                      Save Profile
                    </FluidButton>
                  </div>
                </form>
              </GlassContainer>
            </div>
          )}

        </section>
      )}

      {/* ========================================================= */}
      {/* GLOBAL SETTINGS MODAL (Accessible from any screen & More menu) */}
      {/* ========================================================= */}
      {showSettings && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setShowSettings(false)}
        >
          <GlassContainer
            radius={28}
            style={{ width: '100%', maxWidth: 580 }}
            innerStyle={{
              padding: 28,
              maxHeight: '90vh',
              overflowY: 'auto',
              color: '#000000'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22 }}>⚙️</span>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Settings & Privacy</h3>
              </div>
              <FluidButton
                variant="icon"
                onClick={() => setShowSettings(false)}
                style={{ width: 32, height: 32, minWidth: 32, minHeight: 32 }}
              >
                ✕
              </FluidButton>
            </div>

            {/* Privacy & Visibility Settings Form */}
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Bio Visibility:</label>
                  <select
                    value={bioVisibility}
                    onChange={(e) => setBioVisibility(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, color: '#000000' }}
                  >
                    <option value="everyone">Everyone</option>
                    <option value="institute">Institute Only</option>
                    <option value="connections">Connections Only</option>
                    <option value="nobody">Nobody (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Institute Visibility:</label>
                  <select
                    value={instituteVisibility}
                    onChange={(e) => setInstituteVisibility(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, color: '#000000' }}
                  >
                    <option value="everyone">Everyone</option>
                    <option value="institute">Institute Only</option>
                    <option value="nobody">Nobody (Hidden)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Avatar Visibility:</label>
                  <select
                    value={avatarVisibility}
                    onChange={(e) => setAvatarVisibility(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, color: '#000000' }}
                  >
                    <option value="everyone">Everyone</option>
                    <option value="institute">Institute</option>
                    <option value="connections">Connections</option>
                    <option value="nobody">Nobody</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Who Can Message:</label>
                  <select
                    value={messagePermission}
                    onChange={(e) => setMessagePermission(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, color: '#000000' }}
                  >
                    <option value="everyone">Everyone</option>
                    <option value="institute">Institute</option>
                    <option value="connections">Connections</option>
                    <option value="nobody">Nobody</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={globalDiscovery}
                    onChange={(e) => setGlobalDiscovery(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#000000' }}
                  />
                  <span>Participate in Global Discovery</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={activityVisibility}
                    onChange={(e) => setActivityVisibility(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#000000' }}
                  />
                  <span>Show Active Cooking on Profile</span>
                </label>
              </div>

              <FluidButton
                type="submit"
                style={{
                  padding: '8px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                  marginTop: 8,
                  alignSelf: 'flex-start'
                }}
              >
                Save Privacy Settings
              </FluidButton>
            </form>

            {/* Privacy Filter Inspector */}
            <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #e5e7eb' }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px 0' }}>Inspect Profile (Privacy Filter Test)</h4>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 10px 0' }}>
                Verify how your privacy settings filter out info when another student looks up a user.
              </p>
              <form onSubmit={handleSearchProfile} style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  required
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  placeholder="Username (e.g. chef_arjun or mayachef)"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 13,
                    color: '#000000'
                  }}
                />
                <FluidButton
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    fontSize: 13,
                    fontWeight: 600
                  }}
                >
                  Lookup
                </FluidButton>
              </form>

              {searchedProfile && (
                <div style={{ marginTop: 12, backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, border: '1px solid #e5e7eb', fontSize: 13 }}>
                  <div><strong>Username:</strong> @{searchedProfile.username}</div>
                  <div><strong>Name:</strong> {searchedProfile.name}</div>
                  <div><strong>Pronouns:</strong> {searchedProfile.pronouns || '—'}</div>
                  <div><strong>Bio:</strong> {searchedProfile.bio || '— [Filtered by Privacy]'}</div>
                  <div><strong>Institute:</strong> {searchedProfile.institute?.name || '— [Filtered or Not Set]'}</div>
                </div>
              )}
            </div>

            {/* Connections List */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px 0' }}>Your Connections ({connections.length})</h4>
              {connections.length === 0 ? (
                <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>No direct connections established yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {connections.map((c) => (
                    <div key={c.connectionId} style={{ fontSize: 13, color: '#374151' }}>
                      • @{c.user?.username} ({c.user?.name})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassContainer>
        </div>
      )}

      {/* ========================================================= */}
      {/* APPEARANCE MODAL (Built with GlassContainer) */}
      {/* ========================================================= */}
      {showAppearanceModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setShowAppearanceModal(false)}
        >
          <GlassContainer
            radius={24}
            style={{ width: '100%', maxWidth: 430 }}
            innerStyle={{ padding: 26, color: '#000000' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(0, 0, 0, 0.06)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </span>
                <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Appearance</h3>
              </div>
              <FluidButton
                variant="icon"
                onClick={() => setShowAppearanceModal(false)}
                style={{ width: 32, height: 32, minWidth: 32, minHeight: 32 }}
              >
                ✕
              </FluidButton>
            </div>

            <p style={{ fontSize: 13.5, color: '#52525b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Choose your display appearance for LetMeCook:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { id: 'light', label: 'Light Mode', desc: 'Soft frosted daylight tone (Default)' },
                { id: 'dark', label: 'Dark Mode', desc: 'Deep obsidian night theme (Coming soon)' },
                { id: 'system', label: 'System Default', desc: 'Match your operating system appearance' }
              ].map((theme) => {
                const isSelected = themePreference === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setThemePreference(theme.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: isSelected ? '1.5px solid #000000' : '1px solid rgba(0, 0, 0, 0.08)',
                      background: isSelected ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.4)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#000000' }}>{theme.label}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{theme.desc}</div>
                    </div>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: isSelected ? '5px solid #000000' : '2px solid #ccc',
                        boxSizing: 'border-box'
                      }}
                    />
                  </button>
                );
              })}
            </div>

            <FluidButton
              onClick={() => setShowAppearanceModal(false)}
              style={{ width: '100%', padding: '10px 0', fontSize: 13.5, fontWeight: 600 }}
            >
              Done
            </FluidButton>
          </GlassContainer>
        </div>
      )}

      {/* ========================================================= */}
      {/* REPORT A PROBLEM MODAL (Built with GlassContainer) */}
      {/* ========================================================= */}
      {showReportModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => {
            setShowReportModal(false);
            setReportSubmitted(false);
          }}
        >
          <GlassContainer
            radius={24}
            style={{ width: '100%', maxWidth: 470 }}
            innerStyle={{ padding: 26, color: '#000000' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(0, 0, 0, 0.06)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </span>
                <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Report a Problem</h3>
              </div>
              <FluidButton
                variant="icon"
                onClick={() => {
                  setShowReportModal(false);
                  setReportSubmitted(false);
                }}
                style={{ width: 32, height: 32, minWidth: 32, minHeight: 32 }}
              >
                ✕
              </FluidButton>
            </div>

            {reportSubmitted ? (
              <div style={{ textAlign: 'center', padding: '24px 8px' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 17, fontWeight: 700 }}>Thank you for your report!</h4>
                <p style={{ margin: 0, fontSize: 13.5, color: '#52525b', lineHeight: 1.5 }}>
                  Our team has received your feedback and will look into it promptly.
                </p>
                <FluidButton
                  onClick={() => {
                    setShowReportModal(false);
                    setReportSubmitted(false);
                    setReportDescription('');
                  }}
                  style={{ marginTop: 20, width: '100%', padding: '9px 0', fontSize: 13.5, fontWeight: 600 }}
                >
                  Close
                </FluidButton>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!reportDescription.trim()) return;
                  setReportSubmitted(true);
                }}
              >
                <p style={{ fontSize: 13.5, color: '#52525b', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                  Please describe what went wrong or feature improvements you'd like to see:
                </p>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Explain what happened or what's broken..."
                  rows={4}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 13px',
                    borderRadius: 12,
                    border: '1px solid rgba(0, 0, 0, 0.14)',
                    fontSize: 13.5,
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    resize: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.65)',
                    marginBottom: 16,
                    outline: 'none',
                    color: '#000000'
                  }}
                />
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <FluidButton
                    type="button"
                    variant="secondary"
                    onClick={() => setShowReportModal(false)}
                    style={{ padding: '8px 18px', fontSize: 13, fontWeight: 500 }}
                  >
                    Cancel
                  </FluidButton>
                  <FluidButton
                    type="submit"
                    disabled={!reportDescription.trim()}
                    style={{ padding: '8px 20px', fontSize: 13, fontWeight: 600 }}
                  >
                    Send Report
                  </FluidButton>
                </div>
              </form>
            )}
          </GlassContainer>
        </div>
      )}


      {/* ========================================================= */}
      {/* KITCHEN POPUP MODAL (Guided Sequential Creation Flow) */}
      {/* ========================================================= */}
      <KitchenModal
        isOpen={showKitchenModal}
        onClose={() => setShowKitchenModal(false)}
        onSubmitDish={handleCreateDish}
        isSubmitting={isSubmittingDish}
      />
      </div>
    </div>
  );
}
