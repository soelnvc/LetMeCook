'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';
import DishCard from '@/components/dish/DishCard';
import { useTheme } from '@/context/ThemeContext';

export default function DineInFeed({
  user,
  dishes = [],
  connections = [],
  fetchDishes,
  onJoinDish,
  onLeaveDish,
  onStartCooking,
  onMarkCooked,
  onApproveRequest,
  onRejectRequest,
  onOpenKitchenModal,
  onViewProfile,
  onOpenDishDetail,
  initialTab = 'join_to_cook',
  initialCategory = ''
}) {
  const { isDark } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState(initialTab); // 'join_to_cook' | 'cooking' | 'my_dishes'
  const [feedScope, setFeedScope] = useState('all'); // 'all' | 'institution' | 'connections'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [autoJoinOnly, setAutoJoinOnly] = useState(false);
  const [openSpotsOnly, setOpenSpotsOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const genreDropdownRef = useRef(null);

  // Close genre dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target)) {
        setShowGenreDropdown(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowGenreDropdown(false);
      }
    };
    if (showGenreDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showGenreDropdown]);

  // Institution and connection matching helpers
  const getInstName = (inst) => {
    if (!inst) return '';
    if (typeof inst === 'string') return inst.trim();
    if (typeof inst === 'object' && inst.name) return String(inst.name).trim();
    return '';
  };

  const isUserInstituteVerified = Boolean(
    user?.institute?.verified ||
    user?.verification?.institute ||
    (Array.isArray(user?.verifiedInstitutes) && user.verifiedInstitutes.length > 0)
  );
  const userInstituteName = isUserInstituteVerified ? getInstName(user?.institute) : '';

  const isDishFromSameInstitute = (dish) => {
    const creatorInst = getInstName(dish.creator?.institute || dish.institute);
    if (!userInstituteName) return Boolean(creatorInst);
    return creatorInst.toLowerCase() === userInstituteName.toLowerCase();
  };

  const isDishFromConnections = (dish) => {
    const creatorId = dish.creator?._id || dish.creator?.id || dish.creator;
    const creatorUsername = dish.creator?.username;
    return connections.some((c) => {
      const u = c.user || c;
      return (
        (u._id && creatorId && String(u._id) === String(creatorId)) ||
        (u.username && creatorUsername && u.username.toLowerCase() === creatorUsername.toLowerCase())
      );
    });
  };

  // Tab count badges calculated dynamically from the full dishes feed
  const counts = useMemo(() => {
    let joinCount = 0;
    let cookingCount = 0;
    let myCount = 0;
    let sameInstCount = 0;
    let connCount = 0;

    dishes.forEach((dish) => {
      if (dish.status === 'lets_cook') joinCount++;
      if (dish.status === 'cooking') cookingCount++;

      const isCreator = (dish.creator?._id || dish.creator) === user?._id;
      const isParticipant = dish.participants?.some(
        (p) => (p.user?._id || p.user) === user?._id
      );
      if (isCreator || isParticipant) myCount++;

      if (isDishFromSameInstitute(dish)) sameInstCount++;
      if (isDishFromConnections(dish)) connCount++;
    });

    return {
      join_to_cook: joinCount,
      cooking: cookingCount,
      my_dishes: myCount,
      allFeed: dishes.length,
      sameInstFeed: sameInstCount,
      connFeed: connCount
    };
  }, [dishes, user, connections, userInstituteName]);

  // Categories list with custom clean SVGs (strictly zero emojis)
  const categories = [
    {
      id: '',
      label: 'All Vibes',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      )
    },
    {
      id: 'sport',
      label: 'Sports & Fitness',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 1 9 9" />
          <path d="M12 21a9 9 0 0 1-9-9" />
          <path d="m3.6 9 16.8 6" />
          <path d="m3.6 15 16.8-6" />
        </svg>
      )
    },
    {
      id: 'study',
      label: 'Study & Code',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="9" y1="7" x2="15" y2="7" />
          <line x1="9" y1="11" x2="13" y2="11" />
        </svg>
      )
    },
    {
      id: 'gaming',
      label: 'Gaming',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="4" />
          <line x1="6" y1="12" x2="10" y2="12" />
          <line x1="8" y1="10" x2="8" y2="14" />
          <circle cx="15.5" cy="11.5" r="1" fill="currentColor" />
          <circle cx="17.5" cy="13.5" r="1" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 'social',
      label: 'Cafe & Social',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="2" x2="6" y2="4" />
          <line x1="10" y1="2" x2="10" y2="4" />
          <line x1="14" y1="2" x2="14" y2="4" />
        </svg>
      )
    },
    {
      id: 'food',
      label: 'Food & Dining',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2v20" />
          <path d="M6 2v7a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V2" />
          <path d="M9 12v10" />
          <path d="M18 2a3 3 0 0 1 3 3v7h-6V5a3 3 0 0 1 3-3z" />
        </svg>
      )
    },
    {
      id: 'travel',
      label: 'Travel & Cabs',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 3c-.1.2-.1.4-.1.6v4.5c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      )
    },
    {
      id: 'learning',
      label: 'Learning',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="12 6 15 11 20 12 16 16 17 21 12 18 7 21 8 16 4 12 9 11 12 6" />
        </svg>
      )
    }
  ];

  const currentCategoryObj = useMemo(() => {
    return categories.find((c) => c.id === selectedCategory) || categories[0];
  }, [categories, selectedCategory]);

  // Refresh trigger with smooth micro-animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (fetchDishes) {
      await fetchDishes();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Filtered dishes pipeline
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      // 1. Feed Scope filtering: Same Institution vs The Connections vs All
      if (feedScope === 'institution' && !isDishFromSameInstitute(dish)) {
        return false;
      }
      if (feedScope === 'connections' && !isDishFromConnections(dish)) {
        return false;
      }

      // 2. Sub-tab filtering
      if (activeSubTab === 'join_to_cook' && dish.status !== 'lets_cook') {
        return false;
      }
      if (activeSubTab === 'cooking' && dish.status !== 'cooking') {
        return false;
      }
      if (activeSubTab === 'my_dishes') {
        const isCreator = (dish.creator?._id || dish.creator) === user?._id;
        const isParticipant = dish.participants?.some(
          (p) => (p.user?._id || p.user) === user?._id
        );
        if (!isCreator && !isParticipant) return false;
      }

      // 3. Category filtering
      if (selectedCategory && (dish.category || '').toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // 4. Quick toggles
      if (autoJoinOnly && dish.joinMode !== 'auto') {
        return false;
      }
      if (openSpotsOnly) {
        const spotsLeft = dish.capacity?.unlimited
          ? 999
          : (dish.capacity?.max || 4) - (dish.participants?.length || 0);
        if (spotsLeft <= 0) return false;
      }

      // 5. Instant search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const desc = (dish.description || '').toLowerCase();
        const cat = (dish.category || '').toLowerCase();
        const cName = (dish.creator?.name || '').toLowerCase();
        const cUser = (dish.creator?.username || '').toLowerCase();
        const title = (dish.title || '').toLowerCase();
        const matches = desc.includes(q) || cat.includes(q) || cName.includes(q) || cUser.includes(q) || title.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [dishes, feedScope, activeSubTab, selectedCategory, autoJoinOnly, openSpotsOnly, searchQuery, user, connections, userInstituteName]);

  const hasActiveFilters = Boolean(searchQuery || selectedCategory || autoJoinOnly || openSpotsOnly || feedScope !== 'all');

  const resetFilters = () => {
    setFeedScope('all');
    setSearchQuery('');
    setSelectedCategory('');
    setAutoJoinOnly(false);
    setOpenSpotsOnly(false);
  };

  return (
    <section style={{ width: '100%', maxWidth: 960, margin: '0 auto', color: '#09090b', paddingBottom: 60 }}>
      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* 1. TOP HEADER & APP-BAR (Head-Sub head on top left, reload & drop a dish on top right) */}
      {/* ========================================================= */}
      <div
        className="dinein-header-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 16
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              margin: '0 0 3px 0',
              color: isDark ? '#ffffff' : '#09090b'
            }}
          >
            Dine In
          </h1>
          <p
            style={{
              fontSize: 12.5,
              color: isDark ? '#a1a1aa' : '#71717a',
              margin: 0,
              lineHeight: 1.35,
              fontWeight: 400
            }}
          >
            Explore open tickets, hop into ongoing sessions, or create your own dish.
          </p>
        </div>

        {/* Action Button Cluster on Top Right Next to Head-Subhead */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Refresh Button using FluidButton design */}
          <FluidButton
            variant="icon"
            onClick={handleRefresh}
            title="Refresh live tickets"
            style={{
              width: 36,
              height: 36,
              minWidth: 36,
              minHeight: 36,
              padding: 0
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)',
                transition: isRefreshing ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
              }}
            >
              <path d="M21.5 2v6h-6" />
              <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </FluidButton>

          {/* "+ Drop a Dish" Primary CTA */}
          <FluidButton
            onClick={() => onOpenKitchenModal && onOpenKitchenModal()}
            style={{
              padding: '7px 14px',
              fontSize: 12.5,
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              whiteSpace: 'nowrap'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Drop a Dish</span>
          </FluidButton>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FEED TYPE SELECTOR (Reduced in size to fit horizontally) */}
      {/* ========================================================= */}
      <div style={{ marginBottom: 10, width: '100%', maxWidth: 540 }}>
        <GlassContainer
          radius={9999}
          className="dinein-scope-container"
          style={{ width: '100%' }}
          innerStyle={{
            display: 'flex',
            padding: 3,
            gap: 3,
            boxSizing: 'border-box',
            width: '100%'
          }}
        >
          {[
            {
              id: 'all',
              label: 'All Dine In',
              shortLabel: 'All',
              count: counts.allFeed
            },
            {
              id: 'institution',
              label: userInstituteName ? `Same Institution (${userInstituteName})` : 'Same Institution',
              shortLabel: 'Campus',
              fullLabel: userInstituteName ? `Same Institution (${userInstituteName})` : 'Same Institution',
              count: counts.sameInstFeed
            },
            {
              id: 'connections',
              label: 'The Connections',
              shortLabel: 'Connections',
              count: counts.connFeed
            }
          ].map((feed) => {
            const isSelected = feedScope === feed.id;
            return (
              <button
                key={feed.id}
                onClick={() => setFeedScope(feed.id)}
                title={feed.fullLabel || feed.label}
                className="dinein-pill-btn"
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  padding: '5px 8px',
                  borderRadius: 9999,
                  border: isSelected ? (isDark ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.08)') : '1px solid transparent',
                  fontSize: 11.5,
                  fontWeight: isSelected ? 500 : 400,
                  cursor: 'pointer',
                  background: isSelected ? (isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.95)') : 'transparent',
                  color: isSelected ? (isDark ? '#ffffff' : '#101214') : (isDark ? '#d4d4d8' : '#52525b'),
                  boxShadow: isSelected ? (isDark ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(84, 77, 86, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.8)') : 'none',
                  transition: 'background 0.18s ease, border-color 0.18s ease',
                  whiteSpace: 'nowrap',
                  minWidth: 0
                }}
              >
                <span className="desktop-only" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{feed.label}</span>
                <span className="mobile-only">{feed.shortLabel || feed.label}</span>
                <span
                  style={{
                    padding: '1.5px 6px',
                    borderRadius: 9999,
                    fontSize: 10,
                    fontWeight: 500,
                    background: isSelected ? (isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.08)') : (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)'),
                    color: isDark ? '#ffffff' : (isSelected ? '#101214' : '#71717a'),
                    lineHeight: 1.2
                  }}
                >
                  {feed.count}
                </span>
              </button>
            );
          })}
        </GlassContainer>
      </div>

      {/* ========================================================= */}
      {/* 3. SEGMENTED SUB-TAB SWITCHER (Reduced in size to fit horizontally) */}
      {/* ========================================================= */}
      <div style={{ width: '100%', maxWidth: 540, marginBottom: 14 }}>
        <GlassContainer
          radius={9999}
          className="dinein-subtabs-glass"
          style={{ width: '100%' }}
          innerStyle={{
            display: 'flex',
            padding: 3,
            gap: 3,
            boxSizing: 'border-box',
            width: '100%'
          }}
        >
          {[
            {
              key: 'join_to_cook',
              label: 'Join to Cook',
              shortLabel: 'Join to Cook',
              count: counts.join_to_cook,
              icon: (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              )
            },
            {
              key: 'cooking',
              label: 'Cooking Now',
              shortLabel: 'Cooking',
              count: counts.cooking,
              isLive: counts.cooking > 0,
              icon: (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              )
            },
            {
              key: 'my_dishes',
              label: 'My Dishes',
              shortLabel: 'My Dishes',
              count: counts.my_dishes,
              icon: (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              )
            }
          ].map((tab) => {
            const isActive = activeSubTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSubTab(tab.key)}
                className="dinein-pill-btn"
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  padding: '6px 8px',
                  borderRadius: 9999,
                  border: isActive ? (isDark ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.08)') : '1px solid transparent',
                  fontSize: 11.5,
                  fontWeight: isActive ? 500 : 400,
                  cursor: 'pointer',
                  background: isActive ? (isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.95)') : 'transparent',
                  color: isActive ? (isDark ? '#ffffff' : '#101214') : (isDark ? '#d4d4d8' : '#52525b'),
                  boxShadow: isActive ? (isDark ? '0 2px 10px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(84, 77, 86, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.8)') : 'none',
                  transition: 'background 0.18s ease, border-color 0.18s ease',
                  whiteSpace: 'nowrap',
                  minWidth: 0
                }}
              >
                {tab.icon}
                <span className="desktop-only">{tab.label}</span>
                <span className="mobile-only">{tab.shortLabel || tab.label}</span>

                {/* Live pulsing dot for Cooking tab */}
                {tab.isLive && (
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      backgroundColor: '#f97316',
                      boxShadow: '0 0 5px #f97316',
                      flexShrink: 0
                    }}
                  />
                )}

                {/* Badge count */}
                <span
                  style={{
                    padding: '1.5px 6px',
                    borderRadius: 9999,
                    fontSize: 10,
                    fontWeight: 500,
                    background: isActive ? (isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.08)') : (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)'),
                    color: isDark ? '#ffffff' : (isActive ? '#101214' : '#52525b'),
                    lineHeight: 1.2
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </GlassContainer>
      </div>

      {/* ========================================================= */}
      {/* 4. SEARCH & FILTER ROW (Auto-Join, Spots Available, Genre Dropdown) */}
      {/* ========================================================= */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginBottom: 16
        }}
      >
        {/* Search Input using our GlassContainer design */}
        <GlassContainer
          radius={9999}
          style={{ width: '100%' }}
          innerStyle={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            height: 42,
            position: 'relative'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              color: '#71717a',
              marginRight: 10,
              flexShrink: 0
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities by topic, @creator, keyword..."
            style={{
              width: '100%',
              height: '100%',
              fontSize: 13,
              background: 'transparent',
              border: 'none',
              color: isDark ? '#ffffff' : '#09090b',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />

          {/* Clear search icon button */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: isDark ? '#d4d4d8' : '#71717a',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </GlassContainer>

        {/* Beneath search bar: Auto-Join, Spots Available, and Genre Dropdown Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%'
          }}
        >
          {/* Auto-join only toggle button */}
          <FluidButton
            onClick={() => setAutoJoinOnly((prev) => !prev)}
            style={{
              flex: 1,
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: autoJoinOnly ? 500 : 400,
              color: autoJoinOnly ? (isDark ? '#ffffff' : '#101214') : (isDark ? '#d4d4d8' : '#52525b'),
              backgroundColor: autoJoinOnly ? (isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.95)') : 'transparent',
              boxShadow: autoJoinOnly ? (isDark ? '0 2px 8px rgba(0, 0, 0, 0.25)' : '0 2px 8px rgba(84, 77, 86, 0.14), inset 0 0 0 1px rgba(255, 255, 255, 0.9)') : 'none',
              transition: 'all 0.18s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 12 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill={autoJoinOnly ? (isDark ? '#ffffff' : '#101214') : 'currentColor'} stroke="none">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>Auto-Join</span>
            </span>
          </FluidButton>

          {/* Spots available only toggle button */}
          <FluidButton
            onClick={() => setOpenSpotsOnly((prev) => !prev)}
            style={{
              flex: 1,
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: openSpotsOnly ? 500 : 400,
              color: openSpotsOnly ? (isDark ? '#ffffff' : '#101214') : (isDark ? '#d4d4d8' : '#52525b'),
              backgroundColor: openSpotsOnly ? (isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.95)') : 'transparent',
              boxShadow: openSpotsOnly ? (isDark ? '0 2px 8px rgba(0, 0, 0, 0.25)' : '0 2px 8px rgba(84, 77, 86, 0.14), inset 0 0 0 1px rgba(255, 255, 255, 0.9)') : 'none',
              transition: 'all 0.18s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 12 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={openSpotsOnly ? '2.2' : '1.8'} strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <polyline points="16 11 18 13 22 9" />
              </svg>
              <span>Spots Available</span>
            </span>
          </FluidButton>

          {/* Genre Dropdown Button on the Right */}
          <div ref={genreDropdownRef} style={{ position: 'relative', flex: 1 }}>
            <FluidButton
              onClick={() => setShowGenreDropdown((prev) => !prev)}
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: 12,
                fontWeight: selectedCategory ? 500 : 400,
                color: selectedCategory ? (isDark ? '#ffffff' : '#101214') : (isDark ? '#d4d4d8' : '#52525b'),
                backgroundColor: selectedCategory ? (isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.95)') : (showGenreDropdown ? (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)') : 'transparent'),
                boxShadow: selectedCategory ? (isDark ? '0 2px 8px rgba(0, 0, 0, 0.25)' : '0 2px 8px rgba(84, 77, 86, 0.14), inset 0 0 0 1px rgba(255, 255, 255, 0.9)') : 'none',
                transition: 'all 0.18s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 12, width: '100%' }}>
                <span style={{ display: 'flex', flexShrink: 0 }}>
                  {currentCategoryObj.icon}
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                  {selectedCategory ? currentCategoryObj.label : 'Genre'}
                </span>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: showGenreDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    flexShrink: 0,
                    marginLeft: 1
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </FluidButton>

            {/* Customized Genre Dropdown Menu */}
            {showGenreDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  zIndex: 999,
                  minWidth: 205,
                  maxWidth: '90vw',
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: isDark ? 'rgba(24, 24, 27, 0.94)' : 'rgba(255, 255, 255, 0.96)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: isDark
                    ? '0 12px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 12px 28px rgba(84, 77, 86, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                  padding: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  animation: 'fadeSlideDown 0.16s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div
                  style={{
                    padding: '6px 10px 4px 10px',
                    fontSize: 10.5,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    color: isDark ? '#a1a1aa' : '#71717a'
                  }}
                >
                  Select Genre
                </div>
                {categories.map((cat) => {
                  const isCatSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id || 'all'}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setShowGenreDropdown(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        background: isCatSelected
                          ? (isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.06)')
                          : 'transparent',
                        color: isCatSelected
                          ? (isDark ? '#ffffff' : '#09090b')
                          : (isDark ? '#d4d4d8' : '#52525b'),
                        fontSize: 12.5,
                        fontWeight: isCatSelected ? 500 : 400,
                        transition: 'background 0.15s ease, color 0.15s ease',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                      onMouseEnter={(e) => {
                        if (!isCatSelected) {
                          e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCatSelected) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: isCatSelected ? (isDark ? '#ffffff' : '#09090b') : (isDark ? '#a1a1aa' : '#71717a'), display: 'flex' }}>
                          {cat.icon}
                        </span>
                        <span>{cat.label}</span>
                      </span>
                      {isCatSelected && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: isDark ? '#ffffff' : '#09090b' }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. ACTIVE FILTER BADGES (Shows only when filtered) */}
      {/* ========================================================= */}
      {hasActiveFilters && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 16,
            fontSize: 12,
            color: '#52525b',
            fontWeight: 500
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {selectedCategory && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  background: 'rgba(0, 0, 0, 0.06)',
                  color: '#09090b',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}
              >
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    color: '#52525b'
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </span>
            )}
            {searchQuery && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  background: 'rgba(0, 0, 0, 0.06)',
                  color: '#09090b',
                  fontSize: 11,
                  fontWeight: 600
                }}
              >
                "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    color: '#52525b'
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </span>
            )}
          </div>

          <button
            onClick={resetFilters}
            style={{
              background: 'none',
              border: 'none',
              color: '#09090b',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0
            }}
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. DISH TICKETS GRID / EMPTY STATE */}
      {/* ========================================================= */}
      {filteredDishes.length === 0 ? (
        <GlassContainer
          radius={28}
          style={{ width: '100%' }}
          innerStyle={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14
          }}
        >
          {/* Sleek Empty Illustration Icon */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#71717a'
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>

          <div>
            <h3
              style={{
                fontSize: 17,
                fontWeight: 700,
                margin: '0 0 6px 0',
                color: isDark ? '#ffffff' : '#09090b'
              }}
            >
              No activities found
            </h3>
            <p
              style={{
                fontSize: 13,
                color: isDark ? '#e4e4e7' : '#71717a',
                margin: 0,
                maxWidth: 420,
                lineHeight: 1.45
              }}
            >
              {hasActiveFilters
                ? 'No tickets match your active search or filters. Try clearing them to see other activities.'
                : activeSubTab === 'cooking'
                ? 'No activities are currently live in the Cooking stage on campus. Check Join to Cook to hop into an upcoming session!'
                : activeSubTab === 'my_dishes'
                ? "You haven't created or joined any dishes yet. Explore the feed or drop your first dish!"
                : 'No open tickets available in this category right now. Be the first to start an activity!'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {hasActiveFilters && (
              <FluidButton
                onClick={resetFilters}
                style={{ padding: '6px 18px', fontSize: 12, fontWeight: 600 }}
              >
                Reset Filters
              </FluidButton>
            )}
            <FluidButton
              onClick={() => onOpenKitchenModal && onOpenKitchenModal()}
              style={{ padding: '6px 18px', fontSize: 12, fontWeight: 600 }}
            >
              + Drop a Dish
            </FluidButton>
          </div>
        </GlassContainer>
      ) : (
        <div
          className="mobile-single-column"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))',
            gap: 20,
            alignItems: 'start',
            width: '100%'
          }}
        >
          {filteredDishes.map((dish) => (
            <DishCard
              key={dish._id}
              dish={dish}
              currentUser={user}
              connections={connections}
              onJoin={onJoinDish}
              onLeave={onLeaveDish}
              onStartCooking={onStartCooking}
              onMarkCooked={onMarkCooked}
              onApproveRequest={onApproveRequest}
              onRejectRequest={onRejectRequest}
              onViewProfile={onViewProfile}
              onOpenDetail={onOpenDishDetail}
            />
          ))}
        </div>
      )}
    </section>
  );
}
