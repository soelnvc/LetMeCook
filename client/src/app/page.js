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

  const fetchConversations = async () => {
    try {
      const res = await apiFetch('/messages/conversations');
      setConversations(res.data || []);
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
    setError('');
    setMessage('');
    try {
      const res = await apiFetch('/messages', {
        method: 'POST',
        body: JSON.stringify({ receiverId: msgReceiverId, content: msgContent })
      });
      setMessage(`Message sent (isRequest: ${res.data.isRequest})`);
      setMsgContent('');
      fetchConversations();
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
    return <div style={{ padding: 20, fontFamily: 'monospace' }}>Checking session...</div>;
  }

  // Unauthenticated View
  if (!user) {
    return (
      <div style={{ padding: 24, maxWidth: 450, margin: '40px auto', fontFamily: 'monospace', border: '1px solid black' }}>
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
    <div style={{ padding: 20, fontFamily: 'monospace', maxWidth: 900, margin: '0 auto' }}>
      {/* Top Header */}
      <header style={{ borderBottom: '2px solid black', paddingBottom: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>LetMeCook</strong> | User: <u>@{user.username}</u> ({user.name})
          </div>
          <button onClick={handleLogout}>[Logout]</button>
        </div>
      </header>

      {/* Global Feedback */}
      {error && <div style={{ border: '1px solid red', padding: 8, marginBottom: 12, color: 'red' }}>Error: {error}</div>}
      {message && <div style={{ border: '1px solid green', padding: 8, marginBottom: 12, color: 'green' }}>{message}</div>}

      {/* 5 Primary Navigation Tabs strictly matching PRODUCT.md Section 12 */}
      <nav style={{ display: 'flex', gap: 10, borderBottom: '2px solid black', paddingBottom: 10, marginBottom: 16 }}>
        <button
          onClick={() => { setActiveTab('home'); setShowSettings(false); }}
          style={{ fontWeight: activeTab === 'home' ? 'bold' : 'normal' }}
        >
          [Home]
        </button>
        <button
          onClick={() => { setActiveTab('dine-in'); setShowSettings(false); }}
          style={{ fontWeight: activeTab === 'dine-in' ? 'bold' : 'normal' }}
        >
          [Dine-in]
        </button>
        <button
          onClick={() => { setActiveTab('kitchen'); setShowSettings(false); }}
          style={{ fontWeight: activeTab === 'kitchen' ? 'bold' : 'normal' }}
        >
          [Kitchen]
        </button>
        <button
          onClick={() => { setActiveTab('messages'); setShowSettings(false); }}
          style={{ fontWeight: activeTab === 'messages' ? 'bold' : 'normal' }}
        >
          [Messages]
        </button>
        <button
          onClick={() => { setActiveTab('profile'); setShowSettings(false); }}
          style={{ fontWeight: activeTab === 'profile' ? 'bold' : 'normal' }}
        >
          [Profile]
        </button>
      </nav>

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
      {/* 2. DINE-IN SCREEN (PRODUCT.md Section 14) */}
      {/* ========================================================= */}
      {activeTab === 'dine-in' && (
        <section>
          <h3>Dine-in (Browse & Join Active Dishes)</h3>
          <div style={{ marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
            <label>Category Filter:</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
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
            <button onClick={fetchDishes}>[Refresh]</button>
          </div>

          {dishes.length === 0 ? (
            <p>No active dishes found in Dine-in.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {dishes.map((dish) => {
                const isCreator = dish.creator?._id === user._id || dish.creator === user._id;
                const isParticipant = dish.participants?.some((p) => (p.user?._id || p.user) === user._id);
                const hasPendingReq = dish.requests?.some(
                  (r) => (r.user?._id || r.user) === user._id && r.status === 'pending'
                );

                return (
                  <div key={dish._id} style={{ border: '1px solid black', padding: 12 }}>
                    <div><strong>Description:</strong> {dish.description}</div>
                    <div><strong>Category:</strong> {dish.category} | <strong>Type:</strong> {dish.type} | <strong>Status:</strong> {dish.status}</div>
                    <div><strong>Creator:</strong> @{dish.creator?.username || dish.creator} | <strong>Location:</strong> {dish.location?.areaName || 'Nearby'}</div>
                    <div><strong>Join Mode:</strong> {dish.joinMode} | <strong>Capacity:</strong> {dish.participants?.length}/{dish.capacity?.max}</div>

                    <div style={{ marginTop: 6, fontSize: 12 }}>
                      <strong>Participants:</strong> {dish.participants?.map((p) => `@${p.user?.username || p.user}`).join(', ')}
                    </div>

                    {isCreator && dish.requests?.length > 0 && (
                      <div style={{ marginTop: 8, borderTop: '1px dashed #777', paddingTop: 6 }}>
                        <strong>Pending Requests ({dish.requests.filter(r => r.status === 'pending').length}):</strong>
                        {dish.requests.filter(r => r.status === 'pending').map((r) => (
                          <div key={r._id} style={{ marginTop: 4 }}>
                            User ID: {r.user?._id || r.user}
                            <button onClick={() => handleApproveRequest(dish._id, r._id)} style={{ marginLeft: 6 }}>[Approve]</button>
                            <button onClick={() => handleRejectRequest(dish._id, r._id)} style={{ marginLeft: 6 }}>[Reject]</button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                      {!isParticipant && !hasPendingReq && (
                        <button onClick={() => handleJoinDish(dish._id)}>[Join / Request]</button>
                      )}
                      {hasPendingReq && <span>(Join request pending approval)</span>}
                      {isParticipant && !isCreator && (
                        <button onClick={() => handleLeaveDish(dish._id)}>[Leave Dish]</button>
                      )}
                      {isCreator && dish.status === 'lets_cook' && (
                        <button onClick={() => handleUpdateStatus(dish._id, 'cooking')}>[Start Cooking]</button>
                      )}
                      {isCreator && dish.status === 'cooking' && (
                        <button onClick={() => handleUpdateStatus(dish._id, 'cooked')}>[Mark Cooked]</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
        <section>
          <h3>Messages (1-on-1 DMs & Message Requests)</h3>

          <form onSubmit={handleSendMessage} style={{ border: '1px solid black', padding: 10, marginBottom: 16 }}>
            <h4>Send Message:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 500 }}>
              <label>Recipient User ID:</label>
              <input
                type="text"
                required
                value={msgReceiverId}
                onChange={(e) => setMsgReceiverId(e.target.value)}
                placeholder="User ObjectId"
              />
              <label>Content:</label>
              <input
                type="text"
                required
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
                placeholder="Type message..."
              />
              <button type="submit">[Send Message]</button>
            </div>
          </form>

          <h4>Conversations:</h4>
          {conversations.length === 0 ? (
            <p>No conversations yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {conversations.map((c) => (
                <div key={c.conversationId} style={{ border: '1px solid #777', padding: 8 }}>
                  <div>
                    <strong>User:</strong> @{c.user?.username} ({c.user?.name}) | <strong>Last Message:</strong> "{c.lastMessage}"
                  </div>
                  <div style={{ marginTop: 4 }}>
                    {c.needsResponse && (
                      <span style={{ color: 'orange', fontWeight: 'bold' }}>
                        [Incoming Message Request]
                        <button onClick={() => handleRespondMessageRequest(c.conversationId, 'accepted')} style={{ marginLeft: 8 }}>[Accept]</button>
                        <button onClick={() => handleRespondMessageRequest(c.conversationId, 'rejected')} style={{ marginLeft: 6 }}>[Decline]</button>
                      </span>
                    )}
                    <button onClick={() => handleOpenConversation(c.conversationId)} style={{ marginLeft: 8 }}>
                      [View Thread]
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedConvId && (
            <div style={{ marginTop: 16, border: '1px solid black', padding: 10 }}>
              <h4>Thread ({selectedConvId}):</h4>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #ccc', padding: 8 }}>
                {convMessages.map((m) => (
                  <div key={m._id} style={{ marginBottom: 4 }}>
                    <strong>@{m.sender?.username}:</strong> {m.content} <span style={{ fontSize: 10, color: '#888' }}>({new Date(m.createdAt).toLocaleTimeString()})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
  );
}
