'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';
import { apiFetch } from '@/lib/api';

const RECENT_SEARCHES_KEY = 'letmecook_recent_searches';

export default function GlobalSearchModal({
  isOpen,
  onClose,
  onViewProfile,
  currentUser,
  demoProfiles = {}
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  const inputRef = useRef(null);
  const closingTimeoutRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed.slice(0, 5));
          }
        }
      } catch (err) {
        console.error('Failed to parse recent searches:', err);
      }
    }
  }, []);

  // Handle open / close animations
  useEffect(() => {
    if (isOpen) {
      if (closingTimeoutRef.current) {
        clearTimeout(closingTimeoutRef.current);
        closingTimeoutRef.current = null;
      }
      setIsMounted(true);
      // Small tick for smooth CSS transition
      const timer = setTimeout(() => {
        setIsVisible(true);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 20);
      return () => clearTimeout(timer);
    } else if (isMounted) {
      setIsVisible(false);
      closingTimeoutRef.current = setTimeout(() => {
        setIsMounted(false);
        setQuery('');
        setResults([]);
        setIsSearching(false);
      }, 240);
    }
  }, [isOpen, isMounted]);

  // Smooth close action
  const handleClose = useCallback(() => {
    setIsVisible(false);
    closingTimeoutRef.current = setTimeout(() => {
      setIsMounted(false);
      setQuery('');
      setResults([]);
      setIsSearching(false);
      if (onClose) onClose();
    }, 240);
  }, [onClose]);

  // Escape key listener
  useEffect(() => {
    if (!isMounted) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMounted, handleClose]);

  // Save item to recent searches (up to 5 items, newest first)
  const saveToRecentSearches = (userItem) => {
    if (!userItem || !userItem.username) return;
    const item = {
      _id: userItem._id || null,
      username: userItem.username,
      name: userItem.name || userItem.username,
      avatar: userItem.avatar || null,
      institute: userItem.institute?.name || (typeof userItem.institute === 'string' ? userItem.institute : null),
      pronouns: userItem.pronouns || null
    };

    const updated = [
      item,
      ...recentSearches.filter(
        (s) => s.username?.toLowerCase() !== item.username.toLowerCase()
      )
    ].slice(0, 5);

    setRecentSearches(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save recent search:', err);
      }
    }
  };

  // Remove individual recent search item
  const removeRecentSearch = (usernameToRemove, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const updated = recentSearches.filter(
      (s) => s.username?.toLowerCase() !== usernameToRemove.toLowerCase()
    );
    setRecentSearches(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to update recent searches:', err);
      }
    }
  };

  // Clear all recent searches
  const clearAllRecent = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(RECENT_SEARCHES_KEY);
      } catch (err) {
        console.error('Failed to clear recent searches:', err);
      }
    }
  };

  // Debounced search query
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        // Query backend search API
        const res = await apiFetch(`/users/search?q=${encodeURIComponent(trimmed)}`);
        let apiUsers = res?.data || [];

        // Also search in demo peer profiles if any are available client-side
        if (demoProfiles && typeof demoProfiles === 'object') {
          const lowerQ = trimmed.toLowerCase();
          const demoMatches = Object.entries(demoProfiles)
            .filter(([uname, profile]) => {
              const matchesUser = uname.toLowerCase().includes(lowerQ);
              const matchesName = profile.name && profile.name.toLowerCase().includes(lowerQ);
              return matchesUser || matchesName;
            })
            .map(([uname, profile]) => ({
              username: uname,
              name: profile.name || uname,
              avatar: profile.avatar || null,
              institute: profile.institute || null,
              pronouns: profile.pronouns || null,
              bio: profile.bio || null,
              interests: profile.interests || []
            }));

          // Merge without duplicates
          const seen = new Set(apiUsers.map((u) => u.username?.toLowerCase()));
          for (const d of demoMatches) {
            if (!seen.has(d.username.toLowerCase())) {
              apiUsers.push(d);
              seen.add(d.username.toLowerCase());
            }
          }
        }

        // Filter out current logged in user if desired
        if (currentUser?.username) {
          const myU = currentUser.username.toLowerCase();
          apiUsers = apiUsers.filter((u) => u.username?.toLowerCase() !== myU);
        }

        setResults(apiUsers);
      } catch (err) {
        console.error('User search failed:', err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timeout);
  }, [query, currentUser, demoProfiles]);

  // Select user and navigate
  const handleSelectUser = (userItem) => {
    saveToRecentSearches(userItem);
    handleClose();
    if (onViewProfile) {
      onViewProfile(userItem);
    }
  };

  if (!isMounted) return null;

  const isQueryActive = query.trim().length > 0;

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.42)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Central Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 540,
          marginTop: '11vh',
          display: 'flex',
          flexDirection: 'column',
          gap: 12, // Small gap between search bar and history container
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-14px) scale(0.97)',
          transition: 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'auto'
        }}
      >
        {/* ========================================================= */}
        {/* 1. TOP SEARCH BAR CONTAINER                               */}
        {/* ========================================================= */}
        <GlassContainer
          radius={22}
          innerStyle={{
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxSizing: 'border-box',
            height: 56
          }}
        >
          {/* Lens Icon */}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isQueryActive ? '#09090b' : '#71717a',
              flexShrink: 0,
              transition: 'color 0.18s ease'
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or name..."
            style={{
              flex: 1,
              minWidth: 0,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 15,
              fontWeight: 500,
              color: '#09090b',
              fontFamily: "'Inter', sans-serif"
            }}
          />

          {/* Clear Button (shown when query exists) */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                if (inputRef.current) inputRef.current.focus();
              }}
              title="Clear search"
              style={{
                background: 'rgba(0, 0, 0, 0.07)',
                border: 'none',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#52525b',
                padding: 0,
                flexShrink: 0,
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.14)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.07)')}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          {/* ESC Shortcut Badge */}
          <button
            type="button"
            onClick={handleClose}
            title="Close (Esc)"
            style={{
              padding: '3px 8px',
              borderRadius: 8,
              background: 'rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.4px',
              color: '#71717a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.color = '#09090b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.06)';
              e.currentTarget.style.color = '#71717a';
            }}
          >
            ESC
          </button>
        </GlassContainer>

        {/* ========================================================= */}
        {/* 2. LOWER HISTORY / SEARCH RESULTS CONTAINER               */}
        {/* ========================================================= */}
        <GlassContainer
          radius={22}
          innerStyle={{
            padding: '16px 14px',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            maxHeight: 380,
            overflowY: 'auto'
          }}
          className="custom-scrollbar"
        >
          {/* HEADER ROW */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 8px 10px 8px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
              marginBottom: 8
            }}
          >
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: '#71717a'
              }}
            >
              {isQueryActive ? 'Search Results' : 'Recent Searches'}
            </span>

            {/* Clear All action (only when in Recent Searches mode with items) */}
            {!isQueryActive && recentSearches.length > 0 && (
              <button
                type="button"
                onClick={clearAllRecent}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#71717a',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: 6,
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#71717a')}
              >
                Clear all
              </button>
            )}

            {/* Live searching indicator */}
            {isQueryActive && isSearching && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#71717a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  style={{ animation: 'spin 0.8s linear infinite' }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Searching...
              </span>
            )}
          </div>

          {/* ======================================================= */}
          {/* MODE A: RECENT SEARCHES LIST (Last 5 searches)          */}
          {/* ======================================================= */}
          {!isQueryActive && (
            <>
              {recentSearches.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '36px 16px',
                    textAlign: 'center',
                    gap: 10
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'rgba(0, 0, 0, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#a1a1aa'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#09090b' }}>
                      No recent searches
                    </div>
                    <div style={{ fontSize: 12.5, color: '#71717a', marginTop: 3 }}>
                      Search for students and campus peers by name or username
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {recentSearches.map((item) => (
                    <div
                      key={item.username}
                      onClick={() => handleSelectUser(item)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: 14,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                        userSelect: 'none'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        {/* Avatar */}
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            backgroundColor: '#f97316',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: 15,
                            flexShrink: 0,
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)'
                          }}
                        >
                          {item.avatar ? (
                            <img
                              src={item.avatar}
                              alt={item.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            (item.name || item.username || 'U')[0]?.toUpperCase()
                          )}
                        </div>

                        {/* Name & username */}
                        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                          <span
                            style={{
                              fontSize: 13.5,
                              fontWeight: 700,
                              color: '#09090b',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {item.name || item.username}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              color: '#71717a',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            @{item.username}
                            {item.institute ? ` • ${item.institute}` : ''}
                          </span>
                        </div>
                      </div>

                      {/* Remove from history button */}
                      <button
                        type="button"
                        onClick={(e) => removeRecentSearch(item.username, e)}
                        title="Remove from recent searches"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#a1a1aa',
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                          flexShrink: 0,
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#09090b';
                          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#a1a1aa';
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ======================================================= */}
          {/* MODE B: LIVE SEARCH RESULTS                             */}
          {/* ======================================================= */}
          {isQueryActive && (
            <>
              {results.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {results.map((userItem) => (
                    <div
                      key={userItem.username}
                      onClick={() => handleSelectUser(userItem)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 10px',
                        borderRadius: 14,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                        userSelect: 'none'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        {/* Avatar */}
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            backgroundColor: '#f97316',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: 15,
                            flexShrink: 0,
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)'
                          }}
                        >
                          {userItem.avatar ? (
                            <img
                              src={userItem.avatar}
                              alt={userItem.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            (userItem.name || userItem.username || 'U')[0]?.toUpperCase()
                          )}
                        </div>

                        {/* Name, Username & Institute */}
                        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span
                            style={{
                              fontSize: 13.5,
                              fontWeight: 700,
                              color: '#09090b',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {userItem.name || userItem.username}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              color: '#71717a',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            @{userItem.username}
                            {userItem.institute?.name
                              ? ` • ${userItem.institute.name}`
                              : (typeof userItem.institute === 'string' && userItem.institute
                                ? ` • ${userItem.institute}`
                                : '')}
                          </span>
                        </div>
                      </div>

                      {/* Profile Arrow indicator */}
                      <span
                        style={{
                          color: '#a1a1aa',
                          display: 'flex',
                          alignItems: 'center',
                          paddingRight: 4
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                !isSearching && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '36px 16px',
                      textAlign: 'center',
                      gap: 8
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#a1a1aa'
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#09090b' }}>
                        No people found
                      </div>
                      <div style={{ fontSize: 12.5, color: '#71717a', marginTop: 3 }}>
                        No users matching &quot;{query}&quot;
                      </div>
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </GlassContainer>
      </div>
    </div>
  );
}
