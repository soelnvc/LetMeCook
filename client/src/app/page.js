'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import GlassContainer from '@/components/GlassContainer';
import FluidButton from '@/components/FluidButton';

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

  // Kitchen states
  const [dishDesc, setDishDesc] = useState('');
  const [dishCategory, setDishCategory] = useState('sport');
  const [dishCapacity, setDishCapacity] = useState(4);
  const [dishJoinMode, setDishJoinMode] = useState('auto');
  const [dishType, setDishType] = useState('regular');
  const [dishArea, setDishArea] = useState('Campus Court');

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
    if (activeTab === 'profile') fetchConnections();
  }, [user, activeTab, categoryFilter]);

  // Auth Handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
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
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setMessage('Logged out');
  };

  // Kitchen Create Dish
  const handleCreateDish = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await apiFetch('/dishes', {
        method: 'POST',
        body: JSON.stringify({
          description: dishDesc,
          category: dishCategory,
          type: dishType,
          joinMode: dishJoinMode,
          capacity: { max: Number(dishCapacity), unlimited: false },
          location: { areaName: dishArea }
        })
      });
      setMessage(`Dish published: ${res.data._id}`);
      setDishDesc('');
      setShowKitchenModal(false);
      fetchDishes();
    } catch (err) {
      setError(err.message);
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
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="chef_arjun or arjun@example.com"
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: 'rgba(255,255,255,0.7)' }}
                />
                <label style={{ fontSize: 13, fontWeight: 600 }}>Password:</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: 'rgba(255,255,255,0.7)' }}
                />
                <button type="submit" style={{ marginTop: 10, padding: '10px 16px', borderRadius: 8, backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Submit Login</button>
              </>
            ) : (
              <>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Username (min 3 chars):</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: 'rgba(255,255,255,0.7)' }}
                />
                <label style={{ fontSize: 13, fontWeight: 600 }}>Display Name:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: 'rgba(255,255,255,0.7)' }}
                />
                <label style={{ fontSize: 13, fontWeight: 600 }}>Email:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: 'rgba(255,255,255,0.7)' }}
                />
                <label style={{ fontSize: 13, fontWeight: 600 }}>Mobile Number:</label>
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: 'rgba(255,255,255,0.7)' }}
                />
                <label style={{ fontSize: 13, fontWeight: 600 }}>Password (min 6 chars):</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: 'rgba(255,255,255,0.7)' }}
                />
                <button type="submit" style={{ marginTop: 10, padding: '10px 16px', borderRadius: 8, backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Submit Register</button>
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
            width: navHovered ? 210 : 54,
            transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            backgroundColor: '#e6dfe4',
            borderRight: '1.5px solid rgba(255, 255, 255, 0.7)',
            boxShadow: 'inset -6px 0 16px rgba(0, 0, 0, 0.025)',
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
          {/* Top brand icon */}
          <div style={{ padding: '18px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>🍳</span>
            {navHovered && <strong style={{ whiteSpace: 'nowrap', fontSize: 16, color: '#000000' }}>LetMeCook</strong>}
          </div>

          {/* Middle Navigation Links or Rotated Wireframe Annotation */}
          {navHovered ? (
            <div style={{ padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              {[
                { id: 'home', label: 'Home', icon: '🏠' },
                { id: 'dine-in', label: 'Dine in', icon: '🍽️' },
                { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
                { id: 'messages', label: 'Messages', icon: '💬' },
                { id: 'profile', label: 'Profile', icon: '👤' }
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
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: isActive ? '#000000' : 'transparent',
                      color: isActive ? '#ffffff' : '#000000',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 14,
                      textAlign: 'left',
                      fontWeight: isActive ? 'bold' : '600',
                      width: '100%',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <span style={{ whiteSpace: 'nowrap', color: isActive ? '#ffffff' : '#000000' }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  whiteSpace: 'nowrap',
                  fontSize: 11,
                  letterSpacing: 2.5,
                  fontWeight: 'bold',
                  color: '#000000',
                  textTransform: 'uppercase',
                  userSelect: 'none',
                  padding: '20px 0'
                }}
              >
                NAVIGATION (on HOVER STATE expanded)
              </div>
            </div>
          )}

          {/* Bottom User Area */}
          <div style={{ padding: '14px 12px', borderTop: '1px solid #e5e7eb' }}>
            {navHovered ? (
              <div>
                <div style={{ fontSize: 13, fontWeight: 'bold', color: '#000000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  @{user.username}
                </div>
                <div style={{ fontSize: 11, color: '#333333', marginBottom: 8 }}>
                  {user.name}
                </div>
                <FluidButton
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600
                  }}
                >
                  Logout
                </FluidButton>
              </div>
            ) : (
              <div style={{ textAlign: 'center', fontSize: 18 }}>👤</div>
            )}
          </div>
        </aside>
      </div>

      {/* Main App Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: activeTab === 'profile' ? 'center' : 'flex-start', minHeight: '100vh', padding: activeTab === 'profile' ? '24px 32px' : '40px 32px', minWidth: 0, boxSizing: 'border-box', color: '#000000' }}>
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
      {/* ========================================================= */}
      {/* 5. PROFILE SCREEN & SETTINGS (Matching Wireframe)        */}
      {/* ========================================================= */}
      {activeTab === 'profile' && (
        <section style={{ width: '100%', maxWidth: 800, margin: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#000000' }}>
          
          {/* TOP PROFILE IDENTITY HEADER */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36, marginBottom: 44, width: '100%' }}>
            {/* Large Purple Avatar */}
            <div
              style={{
                width: 216,
                height: 216,
                borderRadius: '50%',
                backgroundColor: '#8257e5',
                flexShrink: 0
              }}
            />

            {/* Profile Info Details */}
            <div
              style={{
                height: 216,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: 1,
                maxWidth: 520
              }}
            >
              {/* Line 1: username + Settings Gear */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: '#000000', lineHeight: 1 }}>
                  {user.username || 'username'}
                </h1>
                <FluidButton
                  variant="icon"
                  onClick={() => setShowSettings(true)}
                  title="Open Settings & Privacy"
                  style={{ width: 34, height: 34, minWidth: 34, minHeight: 34 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </FluidButton>
              </div>

              {/* Line 2: Name, Pronouns, Connections */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#000000', lineHeight: 1 }}>
                  {user.name || 'Name'}
                </span>
                <span style={{ fontSize: 13, color: '#4b5563', fontWeight: 500 }}>
                  {pronouns || user.pronouns || 'He/Him'}
                </span>
                <span style={{ fontSize: 14, color: '#111827', fontWeight: 500, marginLeft: 14 }}>
                  {connections.length > 0 ? `${connections.length} connections` : '72 connections'}
                </span>
              </div>

              {/* Line 3: Bio with Read More toggle */}
              <div style={{ fontSize: 14, lineHeight: '1.45', color: '#111827' }}>
                {(() => {
                  const fullBio = user.bio || bio || 'Mastering sourdough fermentation, late night pasta experiments, and finding the best espresso roast in town. Always down to cook together!';
                  const isLong = fullBio.length > 70;
                  const displayBio = isLong && !bioExpanded ? fullBio.slice(0, 70) + '...' : fullBio;
                  return (
                    <div>
                      <span>Bio: {displayBio}</span>
                      {isLong && (
                        <button
                          onClick={() => setBioExpanded(!bioExpanded)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#000000',
                            fontWeight: 600,
                            fontSize: 13,
                            marginLeft: 6,
                            padding: 0,
                            textDecoration: 'underline'
                          }}
                        >
                          {bioExpanded ? 'show less' : 'read more'}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Line 4: Stats */}
              <div style={{ display: 'flex', gap: 20, fontSize: 15, fontWeight: 600, color: '#111827', lineHeight: 1 }}>
                <span>{user.stats?.dishesCreated ?? 16} Cooked</span>
                <span>{user.stats?.dishesJoined ?? 19} Joined</span>
              </div>

              {/* Line 5: Edit Profile Pill Button */}
              <div>
                <FluidButton
                  onClick={() => setShowEditProfile(true)}
                  style={{
                    padding: '10px 24px',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#000000'
                  }}
                >
                  Edit Profile (Only show when viewing Own Profile)
                </FluidButton>
              </div>
            </div>
          </div>

          {/* MIDDLE SECTION: TAGS & ACHIEVEMENTS */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', width: '100%', marginBottom: 36 }}>
            {/* Left Column: Tags */}
            <div style={{ width: 230, flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 10 }}>
                \Tags
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 10px', width: 230 }}>
                {(interests && interests.length > 0 ? interests : ['music', 'Gym', 'Sports', 'Anime', 'Coffee']).map((tag, idx) => (
                  <FluidButton
                    key={idx}
                    as="span"
                    style={{
                      padding: '7px 20px',
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#000000',
                      cursor: 'default'
                    }}
                  >
                    {tag}
                  </FluidButton>
                ))}
              </div>
            </div>

            {/* Right Column: Achievements */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 10 }}>
                Achievements
              </div>
              <GlassContainer
                radius={28}
                style={{ width: '100%' }}
                innerStyle={{
                  height: 112,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  padding: '12px 28px',
                  boxSizing: 'border-box'
                }}
              >
                {/* 1. Chef's Hat Badge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} title="Master Chef">
                  <svg width="60" height="54" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M18 36 C12 36 8 30 11 23 C13 18 19 16 23 18 C25 11 34 8 40 13 C46 9 55 12 56 19 C60 21 61 29 56 34 C54 36 51 36 49 36 Z"
                      fill="#ffffff"
                      stroke="#cbd5e1"
                      strokeWidth="1.8"
                    />
                    <path d="M25 21 C26 28 27 34 27 36" stroke="#e2e8f0" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M36 15 C36 24 36 32 36 36" stroke="#e2e8f0" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M46 19 C45 26 44 32 43 36" stroke="#e2e8f0" strokeWidth="2.2" strokeLinecap="round" />
                    <rect x="17" y="36" width="33" height="13" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.8" />
                    <line x1="20" y1="41" x2="47" y2="41" stroke="#e2e8f0" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* 2. Steaming Coffee Cup Badge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} title="Coffee Connoisseur">
                  <svg width="66" height="54" viewBox="0 0 68 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 13 C20 9 24 6 22 2" stroke="#92400e" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    <path d="M30 11 C28 7 32 4 30 1" stroke="#92400e" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    <path d="M38 13 C36 9 40 6 38 2" stroke="#92400e" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    <ellipse cx="32" cy="49" rx="27" ry="5" fill="#fdfbf7" stroke="#78350f" strokeWidth="2" />
                    <ellipse cx="32" cy="48" rx="21" ry="3" fill="#e7d8c9" />
                    <path d="M44 26 C53 26 55 38 43 41" stroke="#78350f" strokeWidth="3.2" fill="none" strokeLinecap="round" />
                    <path d="M14 21 L18 43 C19 46 25 47 32 47 C39 47 45 46 46 43 L50 21 Z" fill="#6f4e37" stroke="#451a03" strokeWidth="2" />
                    <ellipse cx="32" cy="21" rx="18" ry="4.5" fill="#3e2312" stroke="#451a03" strokeWidth="1.5" />
                    <ellipse cx="31" cy="21" rx="13" ry="3" fill="#583119" />
                    <ellipse cx="28" cy="20" rx="4" ry="1.2" fill="#a16207" opacity="0.6" />
                  </svg>
                </div>

                {/* 3. Crescent Moon on Cloud Badge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} title="Midnight Kitchen">
                  <svg width="66" height="54" viewBox="0 0 68 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M37 7 C32 12 32 20 37 25 C40 28 44 29 47 28 C43 35 33 37 26 32 C19 26 20 15 27 9 C30 7 33 6 37 7 Z"
                      fill="#fde047"
                      stroke="#ca8a04"
                      strokeWidth="2"
                    />
                    <circle cx="51" cy="13" r="1.5" fill="#eab308" />
                    <circle cx="16" cy="18" r="1.2" fill="#eab308" />
                    <path
                      d="M18 43 C13 43 9 39 10 34 C11 29 16 28 19 29 C22 23 30 22 35 26 C38 24 43 24 45 27 C50 26 55 30 54 35 C57 37 57 42 52 43 Z"
                      fill="#ffffff"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </GlassContainer>
            </div>
          </div>

          {/* BOTTOM SECTION: INSTITUTES */}
          <div style={{ width: '100%' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 10 }}>
              Institutes
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, width: '100%' }}>
              {/* Card 1: IIT MADRAS with Academic Crest */}
              <GlassContainer
                radius={28}
                style={{ width: '100%' }}
                innerStyle={{
                  padding: '24px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 22,
                  boxSizing: 'border-box'
                }}
              >
                {/* Academic Book + Globe Crest SVG */}
                <div style={{ width: 78, height: 78, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="76" height="76" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="44" stroke="#000000" strokeWidth="5" strokeDasharray="9 4" fill="none" />
                    <g transform="translate(0, 8)">
                      <circle cx="50" cy="54" r="28" stroke="#000000" strokeWidth="4" fill="none" />
                      <ellipse cx="50" cy="54" rx="14" ry="28" stroke="#000000" strokeWidth="3" fill="none" />
                      <line x1="22" y1="54" x2="78" y2="54" stroke="#000000" strokeWidth="3.5" />
                      <path d="M 26 43 Q 50 48 74 43" stroke="#000000" strokeWidth="2.5" fill="none" />
                      <path d="M 26 65 Q 50 60 74 65" stroke="#000000" strokeWidth="2.5" fill="none" />
                      <line x1="50" y1="26" x2="50" y2="82" stroke="#000000" strokeWidth="3" />
                    </g>
                    <g transform="translate(0, -7)">
                      <path
                        d="M 50 26 C 42 16, 28 17, 20 20 L 20 40 C 28 37, 42 36, 50 44 C 58 36, 72 37, 80 40 L 80 20 C 72 17, 58 16, 50 26 Z"
                        fill="#ffffff"
                        stroke="#000000"
                        strokeWidth="4"
                        strokeLinejoin="round"
                      />
                      <line x1="50" y1="26" x2="50" y2="44" stroke="#000000" strokeWidth="3.5" />
                      <path d="M 27 26 C 33 24, 42 24, 46 29" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                      <path d="M 27 32 C 33 30, 42 30, 46 35" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                      <path d="M 73 26 C 67 24, 58 24, 54 29" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                      <path d="M 73 32 C 67 30, 58 30, 54 35" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                    </g>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#000000', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    {user.institute?.name || instituteName || 'IIT MADRAS'}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: '#111827', marginTop: 4 }}>
                    Batch of {user.institute?.year || instituteYear || '2029'}
                  </div>
                </div>
              </GlassContainer>

              {/* Card 2: SST with Campus Building Silhouette */}
              <GlassContainer
                radius={28}
                style={{ width: '100%' }}
                innerStyle={{
                  padding: '24px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 22,
                  boxSizing: 'border-box'
                }}
              >
                {/* University Campus Building Silhouette SVG */}
                <div style={{ width: 78, height: 78, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="76" height="76" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 90 L12 55 L35 55 L35 32 L50 20 L65 32 L65 55 L88 55 L88 90 Z" fill="#000000" />
                    <path d="M42 90 L42 66 Q50 60 58 66 L58 90 Z" fill="#e6dfe4" />
                    <rect x="18" y="60" width="10" height="12" rx="2" fill="#e6dfe4" />
                    <rect x="18" y="76" width="10" height="10" rx="2" fill="#e6dfe4" />
                    <rect x="72" y="60" width="10" height="12" rx="2" fill="#e6dfe4" />
                    <rect x="72" y="76" width="10" height="10" rx="2" fill="#e6dfe4" />
                    <circle cx="50" cy="42" r="5" fill="#e6dfe4" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#000000', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    {user.secondaryInstitute?.name || secondaryInstituteName || 'SST'}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: '#111827', marginTop: 4 }}>
                    Batch of {user.secondaryInstitute?.year || secondaryInstituteYear || '2029'}
                  </div>
                </div>
              </GlassContainer>
            </div>
          </div>

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

          {/* SETTINGS MODAL (Triggered by Gear Icon ⚙) */}
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

        </section>
      )}

      {/* ========================================================= */}
      {/* KITCHEN POPUP MODAL (Opens on ANY page via navigation or actions) */}
      {/* ========================================================= */}
      {showKitchenModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setShowKitchenModal(false)}
        >
          <GlassContainer
            radius={28}
            style={{ width: '100%', maxWidth: 580 }}
            innerStyle={{
              padding: '30px 34px',
              maxHeight: '90vh',
              overflowY: 'auto',
              color: '#000000'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>🍳</span>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: '#000000' }}>
                  Kitchen (Create a Dish)
                </h2>
              </div>
              <FluidButton
                variant="icon"
                onClick={() => setShowKitchenModal(false)}
                style={{ width: 32, height: 32, minWidth: 32, minHeight: 32 }}
              >
                ✕
              </FluidButton>
            </div>

            <form onSubmit={handleCreateDish} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#374151' }}>
                  Dish Description (What do you want to do?):
                </label>
                <textarea
                  required
                  rows={3}
                  value={dishDesc}
                  onChange={(e) => setDishDesc(e.target.value)}
                  placeholder="e.g. Badminton doubles at 6 PM near campus court"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid rgba(0, 0, 0, 0.15)',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    fontSize: 14,
                    color: '#000000',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#374151' }}>Category:</label>
                  <select
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: '1px solid rgba(0, 0, 0, 0.15)',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      fontSize: 14,
                      color: '#000000',
                      boxSizing: 'border-box'
                    }}
                  >
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
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#374151' }}>Dish Type:</label>
                  <select
                    value={dishType}
                    onChange={(e) => setDishType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: '1px solid rgba(0, 0, 0, 0.15)',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      fontSize: 14,
                      color: '#000000',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="regular">Regular</option>
                    <option value="chefs_special">Chef's Special</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#374151' }}>Join Mode:</label>
                  <select
                    value={dishJoinMode}
                    onChange={(e) => setDishJoinMode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: '1px solid rgba(0, 0, 0, 0.15)',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      fontSize: 14,
                      color: '#000000',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="auto">Auto (instant join)</option>
                    <option value="approval">Approval (creator approves)</option>
                    <option value="invite_only">Invite Only</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#374151' }}>Capacity (Max):</label>
                  <input
                    type="number"
                    min={2}
                    max={50}
                    value={dishCapacity}
                    onChange={(e) => setDishCapacity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: '1px solid rgba(0, 0, 0, 0.15)',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      fontSize: 14,
                      color: '#000000',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#374151' }}>Approximate Location / Area:</label>
                <input
                  type="text"
                  value={dishArea}
                  onChange={(e) => setDishArea(e.target.value)}
                  placeholder="e.g. Campus Court"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid rgba(0, 0, 0, 0.15)',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    fontSize: 14,
                    color: '#000000',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                <FluidButton
                  type="button"
                  onClick={() => setShowKitchenModal(false)}
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
                  Publish Dish
                </FluidButton>
              </div>
            </form>
          </GlassContainer>
        </div>
      )}
      </div>
    </div>
  );
}
