'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Navigation strictly per Section 12 of PRODUCT.md: Home, Dine-in, Kitchen, Messages, Profile
  const [activeTab, setActiveTab] = useState('home'); 
  const [showSettings, setShowSettings] = useState(false);
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
  const [instituteName, setInstituteName] = useState('');
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
      setBio(res.data.bio || '');
      setInstituteName(res.data.institute?.name || '');
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
      setActiveTab('dine-in');
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
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          bio,
          institute: { name: instituteName }
        })
      });
      setUser(res.data);
      setMessage('Profile updated');
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
      <div style={{ padding: 24, maxWidth: 450, margin: '40px auto', fontFamily: "'Inter', sans-serif", border: '1px solid black' }}>
        <h2>LetMeCook — Auth Test</h2>
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{ fontWeight: isLogin ? 'bold' : 'normal', marginRight: 8 }}
          >
            [Sign In]
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{ fontWeight: !isLogin ? 'bold' : 'normal' }}
          >
            [Register]
          </button>
        </div>

        {error && <div style={{ border: '1px solid red', padding: 8, marginBottom: 12, color: 'red' }}>Error: {error}</div>}
        {message && <div style={{ border: '1px solid green', padding: 8, marginBottom: 12, color: 'green' }}>{message}</div>}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isLogin ? (
            <>
              <label>Email or Username:</label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="chef_arjun or arjun@example.com"
              />
              <label>Password:</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit" style={{ marginTop: 10 }}>Submit Login</button>
            </>
          ) : (
            <>
              <label>Username (min 3 chars):</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label>Display Name:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <label>Email:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Mobile Number:</label>
              <input
                type="text"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
              <label>Password (min 6 chars):</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit" style={{ marginTop: 10 }}>Submit Register</button>
            </>
          )}
        </form>
      </div>
    );
  }

  // Authenticated View
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafbfc', fontFamily: "'Inter', sans-serif", color: '#000000' }}>
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
            transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s ease',
            backgroundColor: '#f3f4f6',
            borderRight: '1.5px solid #d1d5db',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            height: '100vh',
            zIndex: 50,
            overflow: 'hidden',
            boxShadow: navHovered ? '4px 0 16px rgba(0,0,0,0.1)' : 'none'
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
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setShowSettings(false); }}
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
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    fontSize: 12,
                    fontWeight: 'bold',
                    background: '#ffffff',
                    color: '#000000',
                    border: '1px solid #000000',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', fontSize: 18 }}>👤</div>
            )}
          </div>
        </aside>
      </div>

      {/* Main App Container */}
      <div style={{ flex: 1, padding: '24px 36px', maxWidth: 960, margin: '0 auto', minWidth: 0, boxSizing: 'border-box', color: '#000000' }}>
        {/* Global Feedback */}
        {error && <div style={{ border: '1px solid red', padding: 10, marginBottom: 16, color: '#b91c1c', backgroundColor: '#fef2f2', borderRadius: 6 }}>Error: {error}</div>}
        {message && <div style={{ border: '1px solid green', padding: 10, marginBottom: 16, color: '#15803d', backgroundColor: '#f0fdf4', borderRadius: 6 }}>{message}</div>}

      {/* ========================================================= */}
      {/* 1. HOME SCREEN (PRODUCT.md Section 13) */}
      {/* ========================================================= */}
      {activeTab === 'home' && (
        <section>
          <h3>Home (Personalized Dashboard)</h3>
          
          {/* Personalized Greeting */}
          <div style={{ border: '1px solid black', padding: 12, marginBottom: 16 }}>
            <div><strong>Personalized Welcome:</strong></div>
            <div style={{ fontSize: 16, marginTop: 4 }}>
              "Evening, {user.name}. What's cooking?" 👀
            </div>
          </div>

          {/* Current Cooking Banner */}
          <div style={{ border: '1px solid black', padding: 12, marginBottom: 16 }}>
            <div><strong>Current Cooking:</strong></div>
            {dishes.some(d => d.participants?.some(p => (p.user?._id || p.user) === user._id) && d.status !== 'cooked') ? (
              <div style={{ marginTop: 6, color: 'green' }}>
                You have active dishes cooking! Check below or go to Dine-in.
              </div>
            ) : (
              <div style={{ marginTop: 6, color: '#555' }}>
                "Nothing cooking yet. Someone has to start the chaos."
                <button onClick={() => setActiveTab('kitchen')} style={{ marginLeft: 10 }}>[Go to Kitchen]</button>
              </div>
            )}
          </div>

          {/* Cooking Stats & Dish History Summary */}
          <div style={{ border: '1px solid black', padding: 12, marginBottom: 16 }}>
            <div><strong>Cooking Stats & History:</strong></div>
            <div style={{ marginTop: 4 }}>
              Dishes Created: {user.stats?.dishesCreated || 0} | Dishes Joined: {user.stats?.dishesJoined || 0} | People Cooked With: {user.stats?.peopleCookedWith || 0}
            </div>
          </div>

          {/* Top Relevant Dishes */}
          <div style={{ border: '1px solid black', padding: 12 }}>
            <div><strong>Top Active Dishes (Summary):</strong></div>
            {dishes.slice(0, 3).length === 0 ? (
              <p style={{ marginTop: 6 }}>No dishes cooking right now.</p>
            ) : (
              <ul style={{ marginTop: 6 }}>
                {dishes.slice(0, 3).map(d => (
                  <li key={d._id} style={{ marginBottom: 6 }}>
                    <strong>{d.description}</strong> ({d.category}) — Status: {d.status} | Spots: {d.participants?.length}/{d.capacity?.max}
                    <button onClick={() => setActiveTab('dine-in')} style={{ marginLeft: 8 }}>[Open in Dine-in]</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 2. DINE-IN SCREEN (Proposed Design) */}
      {/* ========================================================= */}
      {activeTab === 'dine-in' && (
        <section style={{ maxWidth: 860, margin: '0 auto', color: '#000000' }}>
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
            <button
              onClick={fetchDishes}
              style={{ padding: '3px 10px', fontSize: 12, color: '#000000', backgroundColor: '#ffffff', border: '1px solid #000000', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
            >
              [Refresh]
            </button>
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
                <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed #999', borderRadius: 12, color: '#555' }}>
                  No dishes found in <strong>{dineInTab.replace('_', ' ')}</strong>.
                </div>
              );
            }

            return (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                  gap: 20
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
                    <div
                      key={dish._id}
                      style={{
                        backgroundColor: '#ccd5de',
                        borderRadius: 24,
                        padding: '18px 20px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 16,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
                        border: '1px solid #b8c4cf',
                        border: '1px solid #b8c4cf',
                        position: 'relative',
                        color: '#000000'
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
                          <div style={{ background: '#e5ebf1', borderRadius: 8, padding: 8, marginBottom: 10, fontSize: 11, color: '#000000' }}>
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
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {!isParticipant && !hasPendingReq && (
                            <button
                              onClick={() => handleJoinDish(dish._id)}
                              style={{
                                padding: '5px 12px',
                                fontSize: 12,
                                fontWeight: 'bold',
                                background: '#000000',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer'
                              }}
                            >
                              {dish.joinMode === 'auto' ? 'Join Dish' : 'Request to Join'}
                            </button>
                          )}
                          {hasPendingReq && (
                            <span style={{ fontSize: 11, color: '#000000', fontStyle: 'italic', alignSelf: 'center', fontWeight: 'bold' }}>
                              Request pending approval
                            </span>
                          )}
                          {isParticipant && !isCreator && (
                            <button
                              onClick={() => handleLeaveDish(dish._id)}
                              style={{ padding: '4px 10px', fontSize: 11, background: '#ffffff', color: '#000000', border: '1px solid #000000', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              Leave Dish
                            </button>
                          )}
                          {isCreator && dish.status === 'lets_cook' && (
                            <button
                              onClick={() => handleUpdateStatus(dish._id, 'cooking')}
                              style={{ padding: '4px 10px', fontSize: 11, background: '#ffffff', color: '#000000', border: '1px solid #000000', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              Start Cooking
                            </button>
                          )}
                          {isCreator && dish.status === 'cooking' && (
                            <button
                              onClick={() => handleUpdateStatus(dish._id, 'cooked')}
                              style={{ padding: '4px 10px', fontSize: 11, background: '#ffffff', color: '#000000', border: '1px solid #000000', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              Mark Cooked
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </section>
      )}

      {/* ========================================================= */}
      {/* 3. KITCHEN SCREEN (PRODUCT.md Section 15) */}
      {/* ========================================================= */}
      {activeTab === 'kitchen' && (
        <section>
          <h3>Kitchen (Create a Dish)</h3>
          <form onSubmit={handleCreateDish} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 500 }}>
            <label>Dish Description (What do you want to do?):</label>
            <textarea
              required
              rows={3}
              value={dishDesc}
              onChange={(e) => setDishDesc(e.target.value)}
              placeholder="e.g. Badminton doubles at 6 PM near campus court"
            />

            <label>Category:</label>
            <select value={dishCategory} onChange={(e) => setDishCategory(e.target.value)}>
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

            <label>Dish Type:</label>
            <select value={dishType} onChange={(e) => setDishType(e.target.value)}>
              <option value="regular">Regular</option>
              <option value="chefs_special">Chef's Special (Restricted Eligibility)</option>
            </select>

            <label>Join Mode:</label>
            <select value={dishJoinMode} onChange={(e) => setDishJoinMode(e.target.value)}>
              <option value="auto">Auto (instant join)</option>
              <option value="approval">Approval (creator approves requests)</option>
              <option value="invite_only">Invite Only</option>
            </select>

            <label>Capacity (Max participants):</label>
            <input
              type="number"
              min={2}
              max={50}
              value={dishCapacity}
              onChange={(e) => setDishCapacity(e.target.value)}
            />

            <label>Approximate Location / Area:</label>
            <input
              type="text"
              value={dishArea}
              onChange={(e) => setDishArea(e.target.value)}
              placeholder="e.g. Campus Court"
            />

            <button type="submit" style={{ marginTop: 10 }}>[Publish Dish]</button>
          </form>
        </section>
      )}

      {/* ========================================================= */}
      {/* 4. MESSAGES SCREEN (PRODUCT.md Section 16) */}
      {/* ========================================================= */}
      {activeTab === 'messages' && (
        <section
          style={{
            height: 'calc(100vh - 64px)',
            display: 'flex',
            border: '1.5px solid #000000',
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}
        >
          {/* Left Panel: Conversations List */}
          <div
            style={{
              width: 360,
              flexShrink: 0,
              borderRight: '1.5px solid #000000',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#ffffff'
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
              <div
                style={{
                  backgroundColor: '#cdd5de',
                  borderRadius: 24,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 18px',
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
              </div>
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
                        backgroundColor: isSelected ? '#eef2f6' : 'transparent',
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
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', minWidth: 0 }}>
                {activeUser ? (
                  <>
                    {/* Top Header */}
                    <div
                      style={{
                        padding: '16px 28px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 18,
                        borderBottom: '1.5px solid #000000',
                        backgroundColor: '#ffffff'
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
                            // Outgoing Message (Person 1Message user)
                            return (
                              <div
                                key={m._id}
                                style={{
                                  alignSelf: 'flex-end',
                                  maxWidth: '70%',
                                  backgroundColor: '#cdd5de',
                                  borderRadius: 22,
                                  padding: '14px 22px',
                                  color: '#000000',
                                  fontSize: 15,
                                  lineHeight: 1.4,
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                                }}
                              >
                                {m.content}
                              </div>
                            );
                          } else {
                            // Incoming Message (Person 2 Message)
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
                                <div
                                  style={{
                                    backgroundColor: '#cdd5de',
                                    borderRadius: 22,
                                    padding: '14px 22px',
                                    color: '#000000',
                                    fontSize: 15,
                                    lineHeight: 1.4,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                                  }}
                                >
                                  {m.content}
                                </div>
                              </div>
                            );
                          }
                        })
                      )}
                    </div>

                    {/* Bottom Input Bar */}
                    <div style={{ padding: '16px 24px', backgroundColor: '#ffffff' }}>
                      <form
                        onSubmit={handleSendMessage}
                        style={{
                          backgroundColor: '#cdd5de',
                          borderRadius: 26,
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
                        <button
                          type="submit"
                          style={{
                            backgroundColor: '#000000',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '50%',
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                          </svg>
                        </button>
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
        </section>
      )}

      {/* ========================================================= */}
      {/* 5. PROFILE SCREEN & SETTINGS (PRODUCT.md Section 18 & 23) */}
      {/* ========================================================= */}
      {activeTab === 'profile' && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>Profile (Identity + Trust + Activity)</h3>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{ fontWeight: showSettings ? 'bold' : 'normal' }}
            >
              [{showSettings ? 'Hide Settings' : 'Settings ⚙️'}]
            </button>
          </div>

          {/* Profile Card View */}
          <div style={{ border: '1px solid black', padding: 12, marginBottom: 16 }}>
            <div><strong>@{user.username}</strong> — {user.name}</div>
            <div style={{ marginTop: 4 }}><strong>Bio:</strong> {user.bio || '(no bio set)'}</div>
            <div style={{ marginTop: 4 }}><strong>Institute:</strong> {user.institute?.name ? `🎓 ${user.institute.name}` : '(none)'}</div>
            <div style={{ marginTop: 4 }}>
              <strong>Stats:</strong> {user.stats?.dishesCreated || 0} Dishes Created · {user.stats?.dishesJoined || 0} Joined · {user.stats?.peopleCookedWith || 0} People
            </div>
          </div>

          {/* Profile Edit Form */}
          <form onSubmit={handleSaveProfile} style={{ border: '1px solid black', padding: 12, marginBottom: 16, maxWidth: 500 }}>
            <h4>Edit Profile:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label>Bio:</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="gym, code & bad coffee"
              />
              <label>Institute Name:</label>
              <input
                type="text"
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
                placeholder="e.g. IIT Delhi"
              />
              <button type="submit">[Save Profile]</button>
            </div>
          </form>

          {/* ACCESSIBLE FROM PROFILE: SETTINGS (PRODUCT.md Section 23) */}
          {showSettings && (
            <div style={{ border: '2px solid black', padding: 14, marginBottom: 16, maxWidth: 550, backgroundColor: '#fcfcfc' }}>
              <h4>⚙️ Settings (Privacy & Visibility)</h4>
              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label>Bio Visibility:</label>
                <select value={bioVisibility} onChange={(e) => setBioVisibility(e.target.value)}>
                  <option value="everyone">Everyone</option>
                  <option value="institute">Institute</option>
                  <option value="connections">Connections</option>
                  <option value="nobody">Nobody</option>
                </select>

                <label>Institute Visibility:</label>
                <select value={instituteVisibility} onChange={(e) => setInstituteVisibility(e.target.value)}>
                  <option value="everyone">Everyone</option>
                  <option value="institute">Institute</option>
                  <option value="nobody">Nobody</option>
                </select>

                <label>Avatar Visibility:</label>
                <select value={avatarVisibility} onChange={(e) => setAvatarVisibility(e.target.value)}>
                  <option value="everyone">Everyone</option>
                  <option value="institute">Institute</option>
                  <option value="connections">Connections</option>
                  <option value="nobody">Nobody</option>
                </select>

                <label>Who Can Message:</label>
                <select value={messagePermission} onChange={(e) => setMessagePermission(e.target.value)}>
                  <option value="everyone">Everyone</option>
                  <option value="institute">Institute</option>
                  <option value="connections">Connections</option>
                  <option value="nobody">Nobody</option>
                </select>

                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={globalDiscovery}
                    onChange={(e) => setGlobalDiscovery(e.target.checked)}
                  />
                  Participate in Global Discovery
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={activityVisibility}
                    onChange={(e) => setActivityVisibility(e.target.checked)}
                  />
                  Show Active Cooking on Profile
                </label>

                <button type="submit" style={{ marginTop: 6 }}>[Save Privacy Settings]</button>
              </form>
            </div>
          )}

          {/* Good Company / Connections (PRODUCT.md Section 19) */}
          <div style={{ border: '1px solid black', padding: 12, marginBottom: 16 }}>
            <h4>Connections & Good Company:</h4>
            {connections.length === 0 ? (
              <p>No connections yet.</p>
            ) : (
              <ul>
                {connections.map((c) => (
                  <li key={c.connectionId}>
                    @{c.user?.username} ({c.user?.name}) — ID: {c.user?._id}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Privacy Inspection Test */}
          <form onSubmit={handleSearchProfile} style={{ border: '1px solid black', padding: 12 }}>
            <h4>Inspect User Profile (Privacy Filter Test):</h4>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                required
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                placeholder="Username (e.g. chef_arjun)"
              />
              <button type="submit">[Lookup]</button>
            </div>

            {searchedProfile && (
              <div style={{ marginTop: 10, borderTop: '1px dashed #777', paddingTop: 8 }}>
                <div><strong>Username:</strong> @{searchedProfile.username}</div>
                <div><strong>Name:</strong> {searchedProfile.name}</div>
                <div><strong>Bio:</strong> {searchedProfile.bio || '— [Filtered by Privacy]'}</div>
                <div><strong>Institute:</strong> {searchedProfile.institute?.name || '— [Filtered or Not Set]'}</div>
              </div>
            )}
          </form>
        </section>
      )}
      </div>
    </div>
  );
}
