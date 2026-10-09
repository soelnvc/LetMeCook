'use client';

import React, { useState, useMemo } from 'react';
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';
import DishCard from '@/components/dish/DishCard';

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
  const [activeSubTab, setActiveSubTab] = useState(initialTab); // 'join_to_cook' | 'cooking' | 'my_dishes'
  const [feedScope, setFeedScope] = useState('all'); // 'all' | 'institution' | 'connections'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [autoJoinOnly, setAutoJoinOnly] = useState(false);
  const [openSpotsOnly, setOpenSpotsOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Institution and connection matching helpers
  const getInstName = (inst) => {
    if (!inst) return '';
    if (typeof inst === 'string') return inst.trim();
    if (typeof inst === 'object' && inst.name) return String(inst.name).trim();
    return '';
  };

  const userInstituteName = getInstName(user?.institute);

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
      {/* 1. TOP HEADER & APP-BAR */}
      {/* ========================================================= */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 24
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 800,
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              margin: '0 0 6px 0',
              color: '#09090b'
            }}
          >
            Dine In
          </h1>
          <p
            style={{
              fontSize: 13,
              color: '#52525b',
              margin: 0,
              lineHeight: 1.4,
              fontWeight: 400
            }}
          >
            Explore open tickets, hop into ongoing sessions, or create your own dish.
          </p>
        </div>

        {/* Action Button Cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Refresh Button using FluidButton design */}
          <FluidButton
            variant="icon"
            onClick={handleRefresh}
            title="Refresh live tickets"
            style={{
              width: 42,
              height: 42,
              padding: 0
            }}
          >
            <svg
              width="17"
              height="17"
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
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Drop a Dish
          </FluidButton>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FEED TYPE SELECTOR (Same Institution vs Connections vs All) */}
      {/* ========================================================= */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#71717a'
          }}
        >
          Feed:
        </span>
        <GlassContainer
          radius={9999}
          style={{ display: 'inline-flex' }}
          innerStyle={{
            display: 'inline-flex',
            padding: 4,
            gap: 4,
            boxSizing: 'border-box'
          }}
        >
          {[
            {
              id: 'all',
              label: 'All Dine In',
              count: counts.allFeed
            },
            {
              id: 'institution',
              label: userInstituteName ? `Same Institution (${userInstituteName})` : 'Same Institution',
              count: counts.sameInstFeed
            },
            {
              id: 'connections',
              label: 'The Connections',
              count: counts.connFeed
            }
          ].map((feed) => {
            const isSelected = feedScope === feed.id;
            return (
              <button
                key={feed.id}
                onClick={() => setFeedScope(feed.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 9999,
                  border: 'none',
                  fontSize: 12.5,
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer',
                  background: isSelected ? '#09090b' : 'transparent',
                  color: isSelected ? '#ffffff' : '#52525b',
                  boxShadow: isSelected ? '0 2px 8px rgba(0, 0, 0, 0.16)' : 'none',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.color = '#18181b';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#52525b';
                  }
                }}
              >
                <span>{feed.label}</span>
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: 9999,
                    fontSize: 10.5,
                    fontWeight: 700,
                    background: isSelected ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.07)',
                    color: isSelected ? '#ffffff' : '#71717a'
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
      {/* 3. SEGMENTED SUB-TAB SWITCHER (Wrapped in GlassContainer) */}
      {/* ========================================================= */}
      <div style={{ marginBottom: 20 }}>
        <GlassContainer
          radius={9999}
          style={{ width: '100%', maxWidth: 580 }}
          innerStyle={{
            display: 'flex',
            padding: 4,
            gap: 4,
            boxSizing: 'border-box'
          }}
        >
          {[
            {
              key: 'join_to_cook',
              label: 'Join to Cook',
              count: counts.join_to_cook,
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
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
              count: counts.cooking,
              isLive: counts.cooking > 0,
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              )
            },
            {
              key: 'my_dishes',
              label: 'My Dishes',
              count: counts.my_dishes,
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
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
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  borderRadius: 9999,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  background: isActive ? '#09090b' : 'transparent',
                  color: isActive ? '#ffffff' : '#52525b',
                  boxShadow: isActive ? '0 2px 10px rgba(0, 0, 0, 0.16)' : 'none',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.color = '#18181b';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#52525b';
                  }
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>

                {/* Live pulsing dot for Cooking tab */}
                {tab.isLive && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: '#f97316',
                      boxShadow: '0 0 5px #f97316'
                    }}
                  />
                )}

                {/* Badge count */}
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 700,
                    background: isActive ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.07)',
                    color: isActive ? '#ffffff' : '#52525b'
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
      {/* 3. DISCOVERY & SEARCH BAR (Built with GlassContainer & FluidButtons) */}
      {/* ========================================================= */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 10,
          marginBottom: 14
        }}
      >
        {/* Search Input using our GlassContainer design */}
        <GlassContainer
          radius={9999}
          style={{ flex: '1 1 280px' }}
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
              color: '#09090b',
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
                color: '#71717a',
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

        {/* Quick Filter Toggles using our FluidButton design */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Auto-join only toggle button */}
          <FluidButton
            onClick={() => setAutoJoinOnly((prev) => !prev)}
            style={{
              padding: autoJoinOnly ? '10px 20px' : '7px 15px',
              fontSize: autoJoinOnly ? 13.5 : 12,
              fontWeight: autoJoinOnly ? 800 : 500,
              color: autoJoinOnly ? '#09090b' : '#52525b',
              transition: 'all 0.18s ease'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: autoJoinOnly ? 13.5 : 12, fontWeight: autoJoinOnly ? 800 : 500 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={autoJoinOnly ? '#09090b' : 'currentColor'} stroke="none">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Auto-Join
            </span>
          </FluidButton>

          {/* Open spots only toggle button */}
          <FluidButton
            onClick={() => setOpenSpotsOnly((prev) => !prev)}
            style={{
              padding: openSpotsOnly ? '10px 20px' : '7px 15px',
              fontSize: openSpotsOnly ? 13.5 : 12,
              fontWeight: openSpotsOnly ? 800 : 500,
              color: openSpotsOnly ? '#09090b' : '#52525b',
              transition: 'all 0.18s ease'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: openSpotsOnly ? 13.5 : 12, fontWeight: openSpotsOnly ? 800 : 500 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={openSpotsOnly ? '2.5' : '2'} strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <polyline points="16 11 18 13 22 9" />
              </svg>
              Spots Available
            </span>
          </FluidButton>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. HORIZONTAL CATEGORY PILL CAROUSEL (Built with FluidButtons) */}
      {/* ========================================================= */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 16,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          alignItems: 'center'
        }}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <FluidButton
              key={cat.id || 'all'}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: isSelected ? '10px 20px' : '6px 14px',
                fontSize: isSelected ? 13.5 : 12,
                fontWeight: isSelected ? 800 : 500,
                color: isSelected ? '#09090b' : '#52525b',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.18s ease'
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: isSelected ? 13.5 : 12, fontWeight: isSelected ? 800 : 500 }}>
                {cat.icon}
                <span>{cat.label}</span>
              </span>
            </FluidButton>
          );
        })}
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
                color: '#09090b'
              }}
            >
              No activities found
            </h3>
            <p
              style={{
                fontSize: 13,
                color: '#71717a',
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
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(390px, 1fr))',
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
