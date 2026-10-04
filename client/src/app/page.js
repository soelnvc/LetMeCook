'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function AuthPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');

  // Check login status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiFetch('/auth/me');
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });

      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, name, email, mobile, password })
      });

      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIdentifier('');
    setPassword('');
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Checking session...</span>
        </div>
      </div>
    );
  }

  // Authenticated State -> Empty Home Page with Logout button
  if (user) {
    return (
      <main className="min-h-screen bg-neutral-950 flex flex-col justify-between p-6 md:p-12">
        <header className="flex justify-between items-center max-w-4xl mx-auto w-full pb-6 border-b border-neutral-800">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🍳</span>
            <span className="font-bold text-xl tracking-tight text-neutral-100">LetMeCook</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            Log out
          </button>
        </header>

        <section className="max-w-4xl mx-auto w-full my-auto text-center py-16">
          <div className="inline-block p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-4 text-3xl">
            👋
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-100 tracking-tight">
            Welcome to LetMeCook, <span className="text-amber-500">{user.name}</span>!
          </h1>
          <p className="mt-3 text-neutral-400 max-w-md mx-auto text-sm md:text-base">
            You are successfully authenticated via MongoDB Atlas.
          </p>

          <div className="mt-8 p-6 bg-neutral-900/60 border border-neutral-800 rounded-xl text-left max-w-md mx-auto text-xs space-y-2 text-neutral-300 font-mono">
            <div><span className="text-neutral-500">Username:</span> @{user.username}</div>
            <div><span className="text-neutral-500">Email:</span> {user.email}</div>
            <div><span className="text-neutral-500">User ID:</span> {user._id}</div>
            <div><span className="text-neutral-500">Dishes Created:</span> {user.stats?.dishesCreated || 0}</div>
            <div><span className="text-neutral-500">Dishes Joined:</span> {user.stats?.dishesJoined || 0}</div>
          </div>
        </section>

        <footer className="max-w-4xl mx-auto w-full pt-6 border-t border-neutral-900 text-center text-xs text-neutral-600">
          LetMeCook • Temporary Real-World Coordination
        </footer>
      </main>
    );
  }

  // Unauthenticated State -> Sign in / Log in form
  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🍳</div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100">LetMeCook</h1>
          <p className="text-xs text-neutral-400 mt-1">Temporary real-world coordination network</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-neutral-950 p-1 rounded-xl mb-6 border border-neutral-800">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              isLogin ? 'bg-amber-500 text-neutral-950 shadow' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              !isLogin ? 'bg-amber-500 text-neutral-950 shadow' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
            {error}
          </div>
        )}

        {isLogin ? (
          // Log In Form
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Email or Username
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="chef_arjun or arjun@example.com"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-lg text-sm transition disabled:opacity-50 cursor-pointer mt-2"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          // Sign Up Form
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. chef_arjun"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arjun Sharma"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arjun@example.com"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+919876543210"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-lg text-sm transition disabled:opacity-50 cursor-pointer mt-2"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
