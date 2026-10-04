'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dine-in'); // 'dine-in', 'kitchen', 'messages', 'connections', 'profile'
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

  // Kitchen (Create Dish) states
  const [dishDesc, setDishDesc] = useState('');
  const [dishCategory, setDishCategory] = useState('sport');
  const [dishCapacity, setDishCapacity] = useState(4);
  const [dishJoinMode, setDishJoinMode] = useState('auto');
  const [dishType, setDishType] = useState('regular');
  const [dishArea, setDishArea] = useState('Campus Ground');

  // Messages states
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [convMessages, setConvMessages] = useState([]);
  const [msgReceiverId, setMsgReceiverId] = useState('');
  const [msgContent, setMsgContent] = useState('');

  // Connections states
  const [connections, setConnections] = useState([]);
  const [targetUserId, setTargetUserId] = useState('');

  // Profile states
  const [bio, setBio] = useState('');
  const [instituteName, setInstituteName] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [searchedProfile, setSearchedProfile] = useState(null);

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

  // Fetch Dishes (Dine-in)
  const fetchDishes = async () => {
    try {
      const query = categoryFilter ? `?category=${categoryFilter}` : '';
      const res = await apiFetch(`/dishes${query}`);
      setDishes(res.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch Conversations (Messages)
  const fetchConversations = async () => {
    try {
      const res = await apiFetch('/messages/conversations');
      setConversations(res.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch Connections
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
    if (activeTab === 'dine-in') fetchDishes();
    if (activeTab === 'messages') fetchConversations();
    if (activeTab === 'connections') fetchConnections();
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

  // Kitchen Handlers
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
      setMessage(`Dish created: ${res.data._id}`);
      setDishDesc('');
      setActiveTab('dine-in');
    } catch (err) {
      setError(err.message);
    }
  };

  // Dish Actions
  const handleJoinDish = async (dishId) => {
    setError('');
    setMessage('');
    try {
      const res = await apiFetch(`/dishes/${dishId}/join`, { method: 'POST' });
      setMessage(`Join result: ${res.data.status}`);
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
      setMessage(`Dish status changed to: ${res.data.status}`);
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

  // Messaging Handlers
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

  // Connection Handlers
  const handleSendConnection = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await apiFetch(`/connections/${targetUserId}`, { method: 'POST' });
      setMessage('Connection request sent');
      setTargetUserId('');
      fetchConnections();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBlockUser = async (targetId) => {
    setError('');
    setMessage('');
    try {
      await apiFetch(`/connections/${targetId}/block`, { method: 'POST' });
      setMessage(`User ${targetId} blocked`);
      fetchConnections();
    } catch (err) {
      setError(err.message);
    }
  };

  // Profile Handlers
  const handleUpdateProfile = async (e) => {
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
        <h2>LetMeCook — Backend Test UI</h2>
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
            <strong>LetMeCook — Test Dashboard</strong> | Logged in as: <u>@{user.username}</u> ({user.name})
          </div>
          <button onClick={handleLogout}>[Logout]</button>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
          User ID: {user._id} | Email: {user.email} | Mobile: {user.mobile}
        </div>
      </header>

      {/* Global Status Feedback */}
      {error && <div style={{ border: '1px solid red', padding: 8, marginBottom: 12, color: 'red' }}>Error: {error}</div>}
      {message && <div style={{ border: '1px solid green', padding: 8, marginBottom: 12, color: 'green' }}>{message}</div>}

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', gap: 10, borderBottom: '1px solid #ccc', paddingBottom: 10, marginBottom: 16 }}>
        <button
          onClick={() => setActiveTab('dine-in')}
          style={{ fontWeight: activeTab === 'dine-in' ? 'bold' : 'normal' }}
        >
          [1. Dine-in (Browse)]
        </button>
        <button
          onClick={() => setActiveTab('kitchen')}
          style={{ fontWeight: activeTab === 'kitchen' ? 'bold' : 'normal' }}
        >
          [2. Kitchen (Create)]
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          style={{ fontWeight: activeTab === 'messages' ? 'bold' : 'normal' }}
        >
          [3. Messages & Requests]
        </button>
        <button
          onClick={() => setActiveTab('connections')}
          style={{ fontWeight: activeTab === 'connections' ? 'bold' : 'normal' }}
        >
          [4. Connections]
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          style={{ fontWeight: activeTab === 'profile' ? 'bold' : 'normal' }}
        >
          [5. Profile & Privacy]
        </button>
      </nav>

      {/* TAB 1: DINE-IN (BROWSE DISHES) */}
      {activeTab === 'dine-in' && (
        <section>
          <h3>Dine-in (Active Dishes)</h3>
          <div style={{ marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
            <label>Filter Category:</label>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

                    <div style={{ marginTop: 8, fontSize: 12 }}>
                      <strong>Participants:</strong> {dish.participants?.map((p) => `@${p.user?.username || p.user}`).join(', ')}
                    </div>

                    {/* Pending join requests for creator */}
                    {isCreator && dish.requests?.length > 0 && (
                      <div style={{ marginTop: 8, borderTop: '1px dashed #aaa', paddingTop: 6 }}>
                        <strong>Pending Requests ({dish.requests.filter(r => r.status === 'pending').length}):</strong>
                        {dish.requests.filter(r => r.status === 'pending').map((r) => (
                          <div key={r._id} style={{ marginTop: 4 }}>
                            User: {r.user?._id || r.user}
                            <button onClick={() => handleApproveRequest(dish._id, r._id)} style={{ marginLeft: 6 }}>[Approve]</button>
                            <button onClick={() => handleRejectRequest(dish._id, r._id)} style={{ marginLeft: 6 }}>[Reject]</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                      {!isParticipant && !hasPendingReq && (
                        <button onClick={() => handleJoinDish(dish._id)}>[Join / Request to Join]</button>
                      )}
                      {hasPendingReq && <span>(Request pending approval)</span>}
                      {isParticipant && !isCreator && (
                        <button onClick={() => handleLeaveDish(dish._id)}>[Leave Dish]</button>
                      )}
                      {isCreator && dish.status === 'lets_cook' && (
                        <button onClick={() => handleUpdateStatus(dish._id, 'cooking')}>[Mark Cooking]</button>
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

      {/* TAB 2: KITCHEN (CREATE DISH) */}
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
              <option value="chefs_special">Chef's Special (Eligibility restricted)</option>
            </select>

            <label>Join Mode:</label>
            <select value={dishJoinMode} onChange={(e) => setDishJoinMode(e.target.value)}>
              <option value="auto">Auto (instant join)</option>
              <option value="approval">Approval (creator approves requests)</option>
              <option value="invite_only">Invite Only</option>
            </select>

            <label>Participant Capacity (Max people):</label>
            <input
              type="number"
              min={2}
              max={50}
              value={dishCapacity}
              onChange={(e) => setDishCapacity(e.target.value)}
            />

            <label>Approximate Location / Area Name:</label>
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

      {/* TAB 3: MESSAGES & REQUESTS */}
      {activeTab === 'messages' && (
        <section>
          <h3>Messages (1-on-1 DMs & Message Requests)</h3>

          {/* New message form */}
          <form onSubmit={handleSendMessage} style={{ border: '1px solid black', padding: 10, marginBottom: 16 }}>
            <h4>Send New Message:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 500 }}>
              <label>Recipient User ID:</label>
              <input
                type="text"
                required
                value={msgReceiverId}
                onChange={(e) => setMsgReceiverId(e.target.value)}
                placeholder="User ObjectId"
              />
              <label>Message Content:</label>
              <input
                type="text"
                required
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
                placeholder="Hello..."
              />
              <button type="submit">[Send Message]</button>
            </div>
          </form>

          {/* Conversations list */}
          <h4>Your Conversations:</h4>
          {conversations.length === 0 ? (
            <p>No conversations yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {conversations.map((c) => (
                <div key={c.conversationId} style={{ border: '1px solid #777', padding: 8 }}>
                  <div>
                    <strong>User:</strong> @{c.user?.username} ({c.user?.name}) | <strong>Last Message:</strong> "{c.lastMessage}"
                  </div>
                  <div>
                    {c.needsResponse && (
                      <span style={{ color: 'orange', fontWeight: 'bold' }}>
                        [Incoming Message Request]
                        <button onClick={() => handleRespondMessageRequest(c.conversationId, 'accepted')} style={{ marginLeft: 8 }}>[Accept]</button>
                        <button onClick={() => handleRespondMessageRequest(c.conversationId, 'rejected')} style={{ marginLeft: 6 }}>[Decline]</button>
                      </span>
                    )}
                    <button onClick={() => handleOpenConversation(c.conversationId)} style={{ marginLeft: 10 }}>
                      [View Thread]
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected conversation thread */}
          {selectedConvId && (
            <div style={{ marginTop: 20, border: '1px solid black', padding: 10 }}>
              <h4>Conversation History ({selectedConvId}):</h4>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #ccc', padding: 8, marginBottom: 10 }}>
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

      {/* TAB 4: CONNECTIONS */}
      {activeTab === 'connections' && (
        <section>
          <h3>Connections & Safety</h3>
          <form onSubmit={handleSendConnection} style={{ border: '1px solid black', padding: 10, marginBottom: 16 }}>
            <h4>Send Connection Request:</h4>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                required
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="User ObjectId"
              />
              <button type="submit">[Connect]</button>
            </div>
          </form>

          <h4>Accepted Connections:</h4>
          {connections.length === 0 ? (
            <p>No connections yet.</p>
          ) : (
            <ul>
              {connections.map((c) => (
                <li key={c.connectionId} style={{ marginBottom: 6 }}>
                  @{c.user?.username} ({c.user?.name}) — ID: {c.user?._id}
                  <button onClick={() => handleBlockUser(c.user?._id)} style={{ marginLeft: 10 }}>[Block User]</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* TAB 5: PROFILE & PRIVACY */}
      {activeTab === 'profile' && (
        <section>
          <h3>Profile & Privacy Testing</h3>
          <form onSubmit={handleUpdateProfile} style={{ border: '1px solid black', padding: 10, marginBottom: 16, maxWidth: 500 }}>
            <h4>Update Your Profile:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label>Bio:</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. gym, code & bad coffee"
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

          {/* Search any user profile to test privacy filtering */}
          <form onSubmit={handleSearchProfile} style={{ border: '1px solid black', padding: 10, maxWidth: 500 }}>
            <h4>Inspect Any User Profile (Privacy Filter Test):</h4>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                required
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                placeholder="Username (e.g. chef_arjun)"
              />
              <button type="submit">[Lookup Profile]</button>
            </div>

            {searchedProfile && (
              <div style={{ marginTop: 10, borderTop: '1px dashed #777', paddingTop: 8 }}>
                <div><strong>Username:</strong> @{searchedProfile.username}</div>
                <div><strong>Name:</strong> {searchedProfile.name}</div>
                <div><strong>Bio (Privacy controlled):</strong> {searchedProfile.bio || '— [Hidden by Privacy]'}</div>
                <div><strong>Institute:</strong> {searchedProfile.institute?.name || '— [Hidden or Not Set]'}</div>
                <div><strong>Stats:</strong> Dishes Created: {searchedProfile.stats?.dishesCreated} | Dishes Joined: {searchedProfile.stats?.dishesJoined}</div>
              </div>
            )}
          </form>
        </section>
      )}
    </div>
  );
}
