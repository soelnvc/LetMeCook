'use client';

import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '@/lib/api';
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';
import KitchenModal from '@/components/kitchen/KitchenModal';
import Sidebar from '@/components/layout/Sidebar';
import DishCard from '@/components/dish/DishCard';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AwardsLibrary from '@/components/profile/AwardsLibrary';
import ConversationList from '@/components/messaging/ConversationList';
import MessageArea from '@/components/messaging/MessageArea';
import HomeDashboard from '@/components/home/HomeDashboard';
import DineInFeed from '@/components/dinein/DineInFeed';
import GlobalPage from '@/components/global/GlobalPage';
import SettingsPage from '@/components/settings/SettingsPage';
import { dishService } from '@/services/dish.service';
import { authService } from '@/services/auth.service';

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
  const [registerAge, setRegisterAge] = useState('');

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
      const res = await dishService.getDishes({ category: categoryFilter, status: 'all' });
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
    if (activeTab === 'home' || activeTab === 'dine-in' || activeTab === 'global') fetchDishes();
    if (activeTab === 'messages') fetchConversations();
    if (activeTab === 'profile') {
      fetchConnections();
      fetchDishes();
    }
  }, [user, activeTab, categoryFilter]);

  // Age restriction check: Only 18+ users can access Global features and tickets
  const isAdult = Boolean(user && user.age !== undefined && user.age !== null && Number(user.age) >= 18);

  // Guard: If an underaged user attempts to access the Global tab, redirect them to Home
  useEffect(() => {
    if (user && !isAdult && activeTab === 'global') {
      setActiveTab('home');
    }
  }, [user, isAdult, activeTab]);

  // Filter global tickets for underage users across the app
  const visibleDishes = useMemo(() => {
    if (isAdult) return dishes;
    return dishes.filter((d) => d.visibility !== 'global' && d.location?.scope !== 'nearby');
  }, [dishes, isAdult]);

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
        if (!registerAge || isNaN(Number(registerAge))) {
          throw new Error('Age is mandatory and must be entered during account creation');
        }
        res = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            username,
            name,
            email,
            mobile,
            password,
            age: Number(registerAge)
          })
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
      const res = await dishService.createDish(payload);
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
      const res = await dishService.joinDish(dishId);
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
      const res = await dishService.leaveDish(dishId);
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
      const res = await dishService.updateStatus(dishId, status);
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
      const res = await dishService.approveRequest(dishId, requestId);
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
      await dishService.rejectRequest(dishId, requestId);
      setMessage(`Rejected join request`);
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
                <label style={{ fontSize: 13, fontWeight: 600 }}>Age (must be entered):</label>
                <input
                  type="number"
                  required
                  min="13"
                  max="120"
                  placeholder="e.g. 19"
                  disabled={isAuthSubmitting}
                  value={registerAge}
                  onChange={(e) => setRegisterAge(e.target.value)}
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
      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showKitchenModal={showKitchenModal}
        setShowKitchenModal={setShowKitchenModal}
        setShowSettings={setShowSettings}
        setShowAppearanceModal={setShowAppearanceModal}
        setShowReportModal={setShowReportModal}
        onLogout={handleLogout}
      />

      {/* Main App Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', padding: activeTab === 'profile' ? '54px 24px 80px' : '40px 32px', minWidth: 0, boxSizing: 'border-box', color: '#000000' }}>
        {/* Global Feedback */}
        {error && <div style={{ border: '1px solid red', padding: 10, marginBottom: 16, color: '#b91c1c', backgroundColor: '#fef2f2', borderRadius: 6 }}>Error: {error}</div>}
        {message && <div style={{ border: '1px solid green', padding: 10, marginBottom: 16, color: '#15803d', backgroundColor: '#f0fdf4', borderRadius: 6 }}>{message}</div>}

      {/* ========================================================= */}
      {/* 1. HOME SCREEN (PRODUCT.md Section 13) */}
      {/* ========================================================= */}
      {activeTab === 'home' && (
        <HomeDashboard
          user={user}
          dishes={visibleDishes}
          onOpenKitchenModal={(category) => {
            if (category) setCategoryFilter(category);
            setShowKitchenModal(true);
          }}
          onJoinDish={handleJoinDish}
          onExploreDineIn={() => setActiveTab('dine-in')}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}

      {/* ========================================================= */}
      {/* 2. DINE-IN SCREEN (Redesigned with Modern Real-App UI/UX) */}
      {/* ========================================================= */}
      {activeTab === 'dine-in' && (
        <DineInFeed
          user={user}
          dishes={visibleDishes}
          fetchDishes={fetchDishes}
          onJoinDish={handleJoinDish}
          onLeaveDish={handleLeaveDish}
          onStartCooking={(id) => handleUpdateStatus(id, 'cooking')}
          onMarkCooked={(id) => handleUpdateStatus(id, 'cooked')}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
          onOpenKitchenModal={(category) => {
            if (category) setCategoryFilter(category);
            setShowKitchenModal(true);
          }}
          initialTab={dineInTab}
          initialCategory={categoryFilter}
        />
      )}

      {/* ========================================================= */}
      {/* 3. GLOBAL DISHES SCREEN (Location-based Within 5km)       */}
      {/* ========================================================= */}
      {activeTab === 'global' && isAdult && (
        <GlobalPage
          user={user}
          dishes={dishes}
          onJoinDish={handleJoinDish}
          onOpenKitchenModal={(category) => {
            if (category) setCategoryFilter(category);
            setShowKitchenModal(true);
          }}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
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
            <ConversationList
              userName={user.name || user.username}
              conversations={conversations}
              selectedConvId={selectedConvId}
              onSelectConversation={handleOpenConversation}
              messagesTab={messagesTab}
              setMessagesTab={setMessagesTab}
              searchQuery={searchMsgQuery}
              setSearchQuery={setSearchMsgQuery}
              onRespondRequest={handleRespondMessageRequest}
            />

            {/* Right Panel: Chat Thread */}
            {(() => {
              const activeConv = conversations.find((c) => c.conversationId === selectedConvId);
              const activeUser =
                activeConv?.user ||
                (convMessages.length > 0
                  ? convMessages[0].sender?._id === user._id
                    ? convMessages[0].receiver
                    : convMessages[0].sender
                  : null);

              return (
                <MessageArea
                  currentUser={user}
                  activeUser={activeUser}
                  messages={convMessages}
                  messageText={msgContent}
                  setMessageText={setMsgContent}
                  onSendMessage={handleSendMessage}
                />
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
          <ProfileHeader
            user={user}
            pronouns={pronouns}
            instituteName={instituteName}
            instituteYear={instituteYear}
            bio={bio}
            interests={interests}
            connectionsCount={connections.length > 0 ? connections.length : 72}
            onEditProfile={() => setShowEditProfile(true)}
            onOpenSettings={() => setActiveTab('settings')}
            onTabChange={(tab) => setProfileActiveTab(tab)}
            onTagClick={(tag) => {
              const cleaned = tag.startsWith('#') ? tag.slice(1).toLowerCase() : tag.toLowerCase();
              setCategoryFilter(cleaned);
              setActiveTab('dine_in');
            }}
          />

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

          {/* TAB 1: DISHES (Own Active Ticket on top, Previous Tickets down the line) */}
          {profileActiveTab === 'dishes' && (
            <div>
              {(() => {
                const userOwnedDishes = dishes.filter(d => (d.creator?._id || d.creator) === user._id);
                
                // Activity Ticket Fallback (Studying, Sport, Gym, Chit-Chat, Cafe - NO food demo)
                const fallbackActiveDish = {
                  _id: 'active-ticket-own',
                  description: 'Casual badminton doubles match followed by smoothies at indoor court. Looking for 1 more player to join!',
                  category: 'sport',
                  status: 'cooking',
                  joinMode: 'auto',
                  capacity: { max: 4 },
                  participants: [{ user: { name: user.name || 'Sid G', username: user.username || 'soelnvc' } }, { user: 'p1' }, { user: 'p2' }],
                  timing: { cookStart: 'Today at 6:00 PM' }
                };

                const fallbackPreviousDishes = [
                  {
                    _id: 'prev-ticket-1',
                    description: 'Late night Super Smash Bros Ultimate mini-tournament in student center lounge.',
                    category: 'gaming',
                    status: 'cooked',
                    capacity: { max: 6 },
                    participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }, { user: '5' }, { user: '6' }]
                  },
                  {
                    _id: 'prev-ticket-2',
                    description: 'DSA Trees & Graphs mock technical interview session in Library Study Room 4.',
                    category: 'study',
                    status: 'cooked',
                    capacity: { max: 3 },
                    participants: [{ user: '1' }, { user: '2' }, { user: '3' }]
                  },
                  {
                    _id: 'prev-ticket-3',
                    description: 'Evening walk to Campus Cafe for iced coffee & casual chit-chat after classes.',
                    category: 'social',
                    status: 'cooked',
                    capacity: { max: 4 },
                    participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }]
                  }
                ];

                const realActive = userOwnedDishes.filter(d => d.status !== 'cooked');
                const realPrevious = userOwnedDishes.filter(d => d.status === 'cooked');

                const activeDish = realActive.length > 0 ? realActive[0] : (userOwnedDishes.length === 0 ? fallbackActiveDish : null);
                const previousDishes = realPrevious.length > 0 ? realPrevious : (userOwnedDishes.length === 0 ? fallbackPreviousDishes : []);

                const spotsLeft = activeDish ? (activeDish.capacity?.unlimited ? '∞' : Math.max(0, (activeDish.capacity?.max || activeDish.capacity || 4) - (activeDish.participants?.length || 0))) : 0;

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {/* ACTIVE TICKET (Rendered minimally, exactly like a ticket from our feed) */}
                    {activeDish && (
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
                        {/* Left Icon: Wireframe Shopping Cart SVG (same as Feed) */}
                        <div style={{ paddingTop: 3, flexShrink: 0 }}>
                          <svg
                            width="42"
                            height="42"
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
                          {/* Header: DP + Name + Username • Category and Status */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
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
                                {(user.name || user.username || 'S')[0].toUpperCase()}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 'bold', fontSize: 14.5, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.4px', lineHeight: 1.2 }}>
                                  {user.name || 'Sid G'}
                                </div>
                                <div style={{ fontSize: 11.5, color: '#4b5563', marginTop: 1 }}>
                                  @{user.username || 'soelnvc'} • <span style={{ textTransform: 'capitalize' }}>{activeDish.category || 'sport'}</span>
                                </div>
                              </div>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', backgroundColor: 'rgba(22, 163, 74, 0.1)', padding: '3px 10px', borderRadius: 9999 }}>
                              Cooking
                            </span>
                          </div>

                          {/* Description */}
                          <div style={{ fontSize: 13.5, color: '#000000', lineHeight: 1.45, marginBottom: 8, wordBreak: 'break-word' }}>
                            <span style={{ fontWeight: 600, color: '#000000' }}>Description: </span>
                            {activeDish.description}
                          </div>

                          {/* Meta Info Bar: Capacity, Join Mode */}
                          <div style={{ fontSize: 11.5, color: '#4b5563', display: 'flex', flexWrap: 'wrap', gap: 10, fontWeight: '500', alignItems: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                              {activeDish.participants?.length || 3}/{activeDish.capacity?.max || activeDish.capacity || 4} spots ({spotsLeft} left)
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              • {activeDish.joinMode === 'auto' ? (
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
                            {activeDish.timing?.cookStart && <span>• {activeDish.timing.cookStart}</span>}
                          </div>
                        </div>
                      </GlassContainer>
                    )}

                    {/* PREVIOUS DISHES (Completed Activity Tickets down the line) */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#6b7280', margin: 0 }}>
                          Previous Dishes ({previousDishes.length})
                        </h4>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>
                          History
                        </span>
                      </div>

                      {previousDishes.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666666' }}>
                          <p style={{ fontSize: 14, margin: 0 }}>No previous dishes yet.</p>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                          {previousDishes.map((dish) => (
                            <GlassContainer
                              key={dish._id}
                              radius={18}
                              style={{ aspectRatio: '1 / 1', position: 'relative', cursor: 'default', overflow: 'hidden' }}
                              innerStyle={{
                                padding: 18,
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
                                    {dish.category || 'Activity'}
                                  </span>
                                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, backgroundColor: 'rgba(0,0,0,0.06)', color: '#4b5563', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Cooked
                                  </span>
                                </div>
                                <p style={{ fontSize: 13, color: '#111827', margin: 0, lineHeight: 1.4, lineClamp: 4, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {dish.description}
                                </p>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: 11.5, color: '#666666' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                  </svg>
                                  {dish.participants?.length || 1}/{dish.capacity?.max || dish.capacity || 4} spots
                                </span>
                                <span style={{ textTransform: 'capitalize' }}>{dish.category || 'Done'}</span>
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

          {/* TAB 2: JOINED (Active Joined Ticket on top, Previous Joined Tickets down the line) */}
          {profileActiveTab === 'joined' && (
            <div>
              {(() => {
                const userJoinedDishes = dishes.filter(d => (d.creator?._id || d.creator) !== user._id && (d.participants || []).some(p => (p.user?._id || p.user) === user._id));

                const fallbackActiveJoined = {
                  _id: 'active-joined-ticket',
                  description: 'Weekend 5k morning run & core workout session around campus track. Join in!',
                  category: 'sport',
                  creator: { name: 'Alex Rivera', username: 'alex_cooks' },
                  status: 'cooking',
                  joinMode: 'auto',
                  capacity: { max: 4 },
                  participants: [{ user: 'alex' }, { user: user._id }, { user: 'p3' }],
                  timing: { cookStart: 'Tomorrow at 7:00 AM' }
                };

                const fallbackPreviousJoined = [
                  {
                    _id: 'prev-joined-1',
                    description: 'Deep work study session: preparing for System Design & distributed consensus algorithms in library.',
                    category: 'learning',
                    creator: { name: 'Maya Lin', username: 'mayachef' },
                    status: 'cooked',
                    capacity: { max: 3 },
                    participants: [{ user: '1' }, { user: '2' }, { user: '3' }]
                  },
                  {
                    _id: 'prev-joined-2',
                    description: 'Casual badminton doubles match followed by protein shakes at campus court.',
                    category: 'sport',
                    creator: { name: 'Priya Patel', username: 'priyabakes' },
                    status: 'cooked',
                    capacity: { max: 4 },
                    participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }]
                  },
                  {
                    _id: 'prev-joined-3',
                    description: 'Board games & casual chit-chat evening at student center lounge.',
                    category: 'social',
                    creator: { name: 'Alex Rivera', username: 'alex_cooks' },
                    status: 'cooked',
                    capacity: { max: 5 },
                    participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }]
                  }
                ];

                const realActiveJoined = userJoinedDishes.filter(d => d.status !== 'cooked');
                const realPreviousJoined = userJoinedDishes.filter(d => d.status === 'cooked');

                const activeJoined = realActiveJoined.length > 0 ? realActiveJoined[0] : (userJoinedDishes.length === 0 ? fallbackActiveJoined : null);
                const previousJoined = realPreviousJoined.length > 0 ? realPreviousJoined : (userJoinedDishes.length === 0 ? fallbackPreviousJoined : []);

                const spotsLeft = activeJoined ? (activeJoined.capacity?.unlimited ? '∞' : Math.max(0, (activeJoined.capacity?.max || activeJoined.capacity || 4) - (activeJoined.participants?.length || 0))) : 0;

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {/* ACTIVE JOINED TICKET (Minimal, like a ticket from our feed) */}
                    {activeJoined && (
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
                        {/* Left Icon: Wireframe Shopping Cart SVG */}
                        <div style={{ paddingTop: 3, flexShrink: 0 }}>
                          <svg
                            width="42"
                            height="42"
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
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
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
                                {(activeJoined.creator?.name || activeJoined.creator?.username || 'A')[0].toUpperCase()}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 'bold', fontSize: 14.5, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.4px', lineHeight: 1.2 }}>
                                  {activeJoined.creator?.name || 'Alex Rivera'}
                                </div>
                                <div style={{ fontSize: 11.5, color: '#4b5563', marginTop: 1 }}>
                                  @{activeJoined.creator?.username || 'alex_cooks'} • <span style={{ textTransform: 'capitalize' }}>{activeJoined.category || 'sport'}</span>
                                </div>
                              </div>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#0284c7', backgroundColor: 'rgba(2, 132, 199, 0.1)', padding: '3px 10px', borderRadius: 9999 }}>
                              Joined
                            </span>
                          </div>

                          <div style={{ fontSize: 13.5, color: '#000000', lineHeight: 1.45, marginBottom: 8, wordBreak: 'break-word' }}>
                            <span style={{ fontWeight: 600, color: '#000000' }}>Description: </span>
                            {activeJoined.description}
                          </div>

                          <div style={{ fontSize: 11.5, color: '#4b5563', display: 'flex', flexWrap: 'wrap', gap: 10, fontWeight: '500', alignItems: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                              {activeJoined.participants?.length || 2}/{activeJoined.capacity?.max || activeJoined.capacity || 4} spots ({spotsLeft} left)
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              • {activeJoined.joinMode === 'auto' ? (
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
                            {activeJoined.timing?.cookStart && <span>• {activeJoined.timing.cookStart}</span>}
                          </div>
                        </div>
                      </GlassContainer>
                    )}

                    {/* PREVIOUS JOINED DISHES */}
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                          {previousJoined.map((dish) => (
                            <GlassContainer
                              key={dish._id}
                              radius={18}
                              style={{ aspectRatio: '1 / 1', position: 'relative', cursor: 'default', overflow: 'hidden' }}
                              innerStyle={{
                                padding: 18,
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
                                    {dish.category || 'Activity'}
                                  </span>
                                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, backgroundColor: 'rgba(0,0,0,0.06)', color: '#4b5563', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Joined
                                  </span>
                                </div>
                                <p style={{ fontSize: 13, color: '#111827', margin: 0, lineHeight: 1.4, lineClamp: 4, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {dish.description}
                                </p>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: 11.5, color: '#666666' }}>
                                <span>Host: @{dish.creator?.username || 'chef'}</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                  </svg>
                                  {dish.participants?.length || 1}/{dish.capacity?.max || dish.capacity || 4}
                                </span>
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

          {/* TAB 3: AWARDS (Award Library based on PRODUCT.md Section 20 Achievements) */}
          {profileActiveTab === 'awards' && <AwardsLibrary />}


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
                  <FluidButton
                    variant="icon"
                    onClick={() => setShowEditProfile(false)}
                    style={{ width: 32, height: 32, minWidth: 32, minHeight: 32 }}
                    title="Close"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </FluidButton>
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
                      placeholder="Tell campus what activities you're down for, hobbies, and ideas (e.g. #Badminton #Gym #Study #Gaming)..."
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      {interests.map((tag, i) => (
                        <FluidButton
                          key={i}
                          type="button"
                          onClick={() => setInterests(interests.filter((_, idx) => idx !== i))}
                          title="Click to remove tag"
                          style={{
                            padding: '4px 12px',
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: '#111827'
                          }}
                        >
                          <span>{tag.startsWith('#') ? tag.slice(1) : tag}</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4, opacity: 0.6 }}>
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </FluidButton>
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
                        placeholder="Add new tag (e.g. Badminton, Gym, Study, Anime, Coffee)..."
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: 10,
                          border: '1px solid #d1d5db',
                          fontSize: 13,
                          color: '#000000'
                        }}
                      />
                      <FluidButton
                        type="button"
                        onClick={() => {
                          if (newTagInput.trim() && !interests.includes(newTagInput.trim())) {
                            setInterests([...interests, newTagInput.trim()]);
                            setNewTagInput('');
                          }
                        }}
                        style={{
                          padding: '7px 18px',
                          fontSize: 13,
                          fontWeight: 600
                        }}
                      >
                        + Add
                      </FluidButton>
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
      {/* 6. APP SETTINGS SCREEN (Dedicated Instagram-Style Page)     */}
      {/* ========================================================= */}
      {activeTab === 'settings' && (
        <SettingsPage
          user={user}
          onLogout={handleLogout}
          onUpdateUser={async (updatedFields) => {
            try {
              const res = await apiFetch('/users/me', {
                method: 'PATCH',
                body: JSON.stringify(updatedFields)
              });
              setUser(res.data);
              setMessage('Settings saved successfully');
            } catch (err) {
              setError(err.message);
            }
          }}
          onOpenEditProfile={() => setShowEditProfile(true)}
          themePreference={themePreference}
          onThemeChange={(newTheme) => setThemePreference(newTheme)}
        />
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
                title="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
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
                title="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </FluidButton>
            </div>

            {reportSubmitted ? (
              <div style={{ textAlign: 'center', padding: '24px 8px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#16a34a', margin: '0 auto 16px auto' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
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
