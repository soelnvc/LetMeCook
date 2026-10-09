'use client';

import React, { useState, useMemo } from 'react';
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';

export default function HomeDashboard({
  user,
  dishes = [],
  connections = [],
  recipes = [],
  onDeleteRecipe,
  onOpenKitchenModal,
  onJoinDish,
  onExploreDineIn,
  onNavigateTab,
  onViewProfile
}) {
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'hosted' | 'joined'

  // Category vector icon helper for Saved Recipes
  const getCategoryIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat === 'sport') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24" />
        </svg>
      );
    }
    if (cat === 'study') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    }
    if (cat === 'travel') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 3c-.1.2-.1.4-.1.6v4.5c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      );
    }
    if (cat === 'food') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2v20" />
          <path d="M6 2v7a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V2" />
          <path d="M9 12v10" />
        </svg>
      );
    }
    if (cat === 'gaming') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="6" />
          <path d="M6 12h4m-2-2v4m9-2h.01m3-2h.01" />
        </svg>
      );
    }
    if (cat === 'social') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        </svg>
      );
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="12 6 15 11 20 12 16 16 17 21 12 18 7 21 8 16 4 12 9 11 12 6" />
      </svg>
    );
  };

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const displayName = user?.name?.split(' ')[0] || user?.username || 'Sid';
  const instituteName = user?.institute?.name || '';

  // Top Picks for the user: "Things you might actually want to do."
  const topPicks = useMemo(() => {
    const active = dishes.filter((d) => d.status !== 'cooked');
    return active.slice(0, 3).map((d, idx) => ({
      ...d,
      badgeText:
        idx === 0
          ? `${d.creator?.institute?.name || instituteName || 'Campus'} • Starts soon`
          : idx === 1
          ? `${d.creator?.institute?.name || instituteName || 'Campus'} • Interacted before`
          : `${d.creator?.institute?.name || instituteName || 'Campus'} • Close to you`
    }));
  }, [dishes, instituteName]);

  // Network Dishes (institution verified peers)
  const networkDishes = useMemo(() => {
    const active = dishes.filter((d) => d.status !== 'cooked');
    return active.filter(
      (d) => d.visibility !== 'global' && d.location?.scope !== 'nearby'
    );
  }, [dishes]);

  // Cooking History: Completed / previous dishes (own or joined)
  const completedDishes = useMemo(() => {
    const realCooked = (dishes || []).filter((d) => d.status === 'cooked');

    const source = realCooked.map((d) => ({
      ...d,
      isOwner: (d.creator?._id || d.creator) === user?._id,
      completedAt: d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : 'Completed'
    }));

    return source.filter((item) => {
      if (historyFilter === 'hosted') return item.isOwner;
      if (historyFilter === 'joined') return !item.isOwner;
      return true;
    });
  }, [dishes, user, historyFilter]);

  // Helper to render normal dish card without any lifting/jumping effect
  const renderDishCard = (dish) => {
    const creatorName = dish.creator?.name || 'Peer';
    const creatorUsername = dish.creator?.username || 'user';
    const isCreator =
      (dish.creator?._id && String(dish.creator._id) === String(user?._id)) ||
      (dish.creator?.username && dish.creator.username === user?.username) ||
      String(dish.creator) === String(user?._id);
    const creatorAvatar = isCreator ? (user?.avatar || dish.creator?.avatar) : dish.creator?.avatar;
    const isParticipant = dish.participants?.some(
      (p) => (p.user?._id || p.user) === user?._id
    );
    const spotsLeft = dish.capacity?.unlimited
      ? '∞'
      : Math.max(0, (dish.capacity?.max || 4) - (dish.participants?.length || 0));

    const badgeLabel = dish.badgeText || `${dish.creator?.institute?.name || instituteName} • Verified`;

    // Affiliation source badge text
    const creatorInst = dish.creator?.institute?.name || dish.institute?.name || '';
    const userInst = user?.institute?.name || instituteName || '';
    const displayInst = creatorInst || userInst || 'Campus';
    const isSameInstitute = Boolean(
      userInst && creatorInst && userInst.toLowerCase() === creatorInst.toLowerCase()
    );
    const isFriend = Boolean(
      !isCreator &&
      connections &&
      connections.some((c) => {
        const u = c.user || c;
        const targetId = dish.creator?._id || dish.creator?.id || dish.creator;
        const targetUsername = dish.creator?.username;
        return (
          (u._id && targetId && String(u._id) === String(targetId)) ||
          (u.username && targetUsername && u.username.toLowerCase() === targetUsername.toLowerCase())
        );
      })
    );

    let sourceText = '';
    if (isFriend && isSameInstitute) {
      sourceText = `a friend from ${displayInst}`;
    } else if (isFriend) {
      sourceText = 'from Connections';
    } else if (isSameInstitute || creatorInst) {
      sourceText = `From ${displayInst}`;
    } else if (isCreator) {
      sourceText = `From ${displayInst}`;
    }

    return (
      <GlassContainer
        key={dish._id}
        radius={22}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
        innerStyle={{
          padding: '20px 22px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 16,
          height: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div>
          {/* Top: Creator Info + Category Pill */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div
              onClick={() => {
                if (onViewProfile) {
                  onViewProfile({
                    ...dish.creator,
                    avatar: creatorAvatar,
                    name: creatorName,
                    username: creatorUsername
                  });
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: onViewProfile ? 'pointer' : 'default'
              }}
              title={onViewProfile ? `View @${creatorUsername}'s profile` : ''}
            >
              {creatorAvatar ? (
                <img
                  src={creatorAvatar}
                  alt={creatorName}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                    border: '1px solid rgba(0, 0, 0, 0.08)'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    backgroundColor: '#f97316',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  {creatorName[0].toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '3px 6px', lineHeight: 1.2 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: '#09090b' }}>
                    {creatorName}
                  </span>
                  {sourceText && (
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#71717a' }}>
                      • {sourceText}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: '#71717a', marginTop: 1 }}>
                  @{creatorUsername}
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: 9999,
                backgroundColor: 'rgba(0, 0, 0, 0.06)',
                color: '#3f3f46'
              }}
            >
              {dish.category || 'ACTIVITY'}
            </span>
          </div>

          {/* Badge: Minimized color in text */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 9999, backgroundColor: 'rgba(0, 0, 0, 0.05)', marginBottom: 10 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#0095f6">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#3f3f46' }}>
              {badgeLabel}
            </span>
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: 14,
              color: '#18181b',
              margin: '0 0 12px 0',
              lineHeight: 1.45,
              fontWeight: 500,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {dish.description}
          </p>
        </div>

        {/* Meta & Actions */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 12,
              borderTop: '1px solid rgba(0, 0, 0, 0.06)',
              fontSize: 12,
              color: '#71717a',
              fontWeight: 500,
              marginBottom: 12
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {dish.participants?.length || 1}/{dish.capacity?.max || 4} spots ({spotsLeft} left)
            </span>

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {dish.joinMode === 'auto' ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Auto-join
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Approval
                </>
              )}
            </span>
          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {isCreator ? (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#ea580c',
                  backgroundColor: 'rgba(249, 115, 22, 0.1)',
                  padding: '6px 14px',
                  borderRadius: 9999
                }}
              >
                You are Hosting
              </span>
            ) : isParticipant ? (
              <FluidButton
                onClick={() => onNavigateTab && onNavigateTab('messages')}
                style={{ padding: '5px 16px', fontSize: 12.5, fontWeight: 600 }}
              >
                Chat & Joined
              </FluidButton>
            ) : (
              <FluidButton
                onClick={() => onJoinDish && onJoinDish(dish._id)}
                style={{
                  padding: '6px 18px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                Join Dish
              </FluidButton>
            )}
          </div>
        </div>
      </GlassContainer>
    );
  };

  return (
    <div style={{ width: '100%', maxWidth: 940, margin: '0 auto', color: '#000000', fontFamily: "'Inter', sans-serif" }}>
      
      {/* ========================================================= */}
      {/* 1. TOP HEADER                                             */}
      {/* ========================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 18, marginBottom: 26 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.7px', color: '#09090b', lineHeight: 1.15 }}>
            {greeting}, {displayName}.
          </h1>
          <p style={{ fontSize: 14.5, color: '#71717a', margin: 0, fontWeight: 500 }}>
            What are we coordinating today?
          </p>
        </div>

        {/* Right Action: Cook a Dish */}
        <div>
          <FluidButton
            onClick={() => onOpenKitchenModal && onOpenKitchenModal()}
            style={{
              padding: '8px 22px',
              fontSize: 13.5,
              fontWeight: 600,
              color: '#000000',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Cook a Dish
          </FluidButton>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CAMPUS COORDINATION HERO BANNER (3D Visual Asset)      */}
      {/* Always shown, clean, original real-world coordination     */}
      {/* ========================================================= */}
      <div style={{ marginBottom: 32 }}>
        <GlassContainer
          radius={28}
          style={{
            overflow: 'hidden',
            position: 'relative',
            color: '#ffffff'
          }}
          innerStyle={{
            padding: 0,
            minHeight: 220,
            display: 'flex',
            position: 'relative',
            backgroundColor: '#09090b'
          }}
        >
          {/* Visual Background Asset */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60%',
              height: '100%',
              backgroundImage: 'url(/images/campus-hero.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center right',
              opacity: 0.78,
              maskImage: 'linear-gradient(to right, transparent, black 40%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)'
            }}
          />

          {/* Left Content Column */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              padding: '34px 36px',
              maxWidth: 480,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 12
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: '#f97316'
              }}
            >
              Real-World Coordination
            </span>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 800,
                margin: 0,
                letterSpacing: '-0.4px',
                lineHeight: 1.25,
                color: '#ffffff'
              }}
            >
              Start the chaos on campus.
            </h2>
            <p
              style={{
                fontSize: 13.5,
                color: 'rgba(255, 255, 255, 0.72)',
                margin: 0,
                lineHeight: 1.45
              }}
            >
              Looking for a badminton partner, late-night study room group, or cafe run? Drop a dish in 30 seconds.
            </p>

            <div style={{ marginTop: 6 }}>
              <FluidButton
                onClick={() => onOpenKitchenModal && onOpenKitchenModal()}
                style={{
                  padding: '8px 22px',
                  fontSize: 13.5,
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  color: '#09090b',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Drop a Dish Now
              </FluidButton>
            </div>
          </div>
        </GlassContainer>
      </div>

      {/* ========================================================= */}
      {/* 3. MONOCHROMATIC METRICS BAR                              */}
      {/* ========================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 34 }}>
        {[
          {
            label: 'COOKED',
            value: user?.stats?.dishesCreated ?? 0,
            desc: 'Hosted activities'
          },
          {
            label: 'JOINED',
            value: user?.stats?.dishesJoined ?? 0,
            desc: 'Participated sessions'
          },
          {
            label: 'CONNECTIONS',
            value: user?.stats?.connections ?? user?.stats?.peopleCookedWith ?? 0,
            desc: 'Active connections'
          }
        ].map((metric, idx) => (
          <GlassContainer
            key={idx}
            radius={20}
            innerStyle={{
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', color: '#71717a' }}>
              {metric.label}
            </span>
            <span style={{ fontSize: 26, fontWeight: 800, color: '#09090b', letterSpacing: '-0.5px' }}>
              {metric.value}
            </span>
            <span style={{ fontSize: 11.5, color: '#a1a1aa', fontWeight: 500 }}>
              {metric.desc}
            </span>
          </GlassContainer>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 4. SAVED RECIPES (Quick-Use Templates)                     */}
      {/* ========================================================= */}
      <div style={{ marginBottom: 38 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#71717a', margin: 0 }}>
              Saved Recipes
            </h3>
            {recipes && recipes.length > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 9999,
                  backgroundColor: 'rgba(0, 0, 0, 0.06)',
                  color: '#52525b'
                }}
              >
                {recipes.length}
              </span>
            )}
          </div>
          {recipes && recipes.length > 0 && (
            <button
              onClick={() => onOpenKitchenModal && onOpenKitchenModal()}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                color: '#09090b',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              + New Recipe
            </button>
          )}
        </div>

        {!recipes || recipes.length === 0 ? (
          <GlassContainer
            radius={20}
            style={{ width: '100%' }}
            innerStyle={{
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 12
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#18181b'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <line x1="12" y1="6" x2="12" y2="12" />
                <line x1="9" y1="9" x2="15" y2="9" />
              </svg>
            </div>
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px 0', color: '#09090b' }}>
                No saved recipes yet
              </h4>
              <p style={{ fontSize: 13, color: '#71717a', margin: 0, maxWidth: 360, lineHeight: 1.4 }}>
                Save your favorite activities as recipes to quickly launch them on campus anytime with one click.
              </p>
            </div>
            <FluidButton
              onClick={() => onOpenKitchenModal && onOpenKitchenModal()}
              style={{
                padding: '8px 22px',
                fontSize: 13,
                fontWeight: 600,
                marginTop: 4,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Let's make your First Recipe
            </FluidButton>
          </GlassContainer>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
            {recipes.map((recipe) => (
              <GlassContainer
                key={recipe._id}
                as="div"
                radius={18}
                onClick={() => onOpenKitchenModal && onOpenKitchenModal(recipe.category, recipe)}
                innerStyle={{
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  cursor: 'pointer',
                  position: 'relative',
                  height: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#09090b'
                    }}
                  >
                    {getCategoryIcon(recipe.category)}
                  </div>
                  {onDeleteRecipe && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete saved recipe "${recipe.name}"?`)) {
                          onDeleteRecipe(recipe._id);
                        }
                      }}
                      title="Delete recipe"
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 4,
                        cursor: 'pointer',
                        color: '#a1a1aa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 6,
                        transition: 'color 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#a1a1aa')}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#09090b', lineHeight: 1.25 }}>
                    {recipe.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#71717a', marginTop: 3 }}>
                    {recipe.location?.areaName || 'Campus Court'} • <span style={{ textTransform: 'capitalize' }}>{recipe.category}</span>
                  </div>
                  {recipe.description && (
                    <div
                      style={{
                        fontSize: 12,
                        color: '#52525b',
                        marginTop: 6,
                        lineHeight: 1.35,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {recipe.description}
                    </div>
                  )}
                </div>

                <div style={{ paddingTop: 4, borderTop: '1px solid rgba(0, 0, 0, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#71717a' }}>
                    {recipe.capacity?.unlimited ? '∞ spots' : `${recipe.capacity?.max || 4} spots`}
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: '#09090b', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    Cook <span>→</span>
                  </span>
                </div>
              </GlassContainer>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. TOP PICKS: “Things you might actually want to do.”     */}
      {/* Normal dish cards representing top picks for the user     */}
      {/* ========================================================= */}
      <div style={{ marginBottom: 44 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#09090b', letterSpacing: '-0.4px', lineHeight: 1.25 }}>
            Things you might actually want to do.
          </h2>
        </div>

        {/* Top Picks Dish Cards or Clean Empty State */}
        {topPicks.length === 0 ? (
          <GlassContainer radius={22} innerStyle={{ padding: '36px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: '#71717a' }}>
              No active dishes near you right now.
            </div>
            <div style={{ marginTop: 14 }}>
              <FluidButton
                onClick={() => onOpenKitchenModal && onOpenKitchenModal()}
                style={{ padding: '7px 20px', fontSize: 13, fontWeight: 600, color: '#000000' }}
              >
                Let&apos;s Cook
              </FluidButton>
            </div>
          </GlassContainer>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))', gap: 16 }}>
            {topPicks.map(renderDishCard)}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 6. HAPPENING IN YOUR NETWORK (Institution Based)          */}
      {/* ========================================================= */}
      <div style={{ marginBottom: 44 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#09090b', letterSpacing: '-0.4px' }}>
                Happening in Your Network
              </h3>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 9999,
                  fontSize: 11.5,
                  fontWeight: 700,
                  backgroundColor: 'rgba(0, 0, 0, 0.06)',
                  color: '#52525b'
                }}
              >
                {networkDishes.length}
              </span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: 12.5, color: '#71717a' }}>
              Verified peers from {instituteName} & affiliated tuition, coaching, and campus network
            </p>
          </div>

          <FluidButton
            onClick={() => onExploreDineIn && onExploreDineIn()}
            style={{
              padding: '6px 16px',
              fontSize: 12.5,
              fontWeight: 600,
              color: '#09090b',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>Explore Dine-In</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </FluidButton>
        </div>

        {/* Network Cards Grid or Clean Empty State */}
        {networkDishes.length === 0 ? (
          <GlassContainer radius={22} innerStyle={{ padding: '36px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: '#71717a' }}>
              No campus network dishes right now.
            </div>
          </GlassContainer>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))', gap: 16 }}>
            {networkDishes.map(renderDishCard)}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 7. COOKING HISTORY (Completed Dishes at bottom)           */}
      {/* ========================================================= */}
      <div id="cooking-history" style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#09090b', letterSpacing: '-0.4px' }}>
                Cooking History
              </h3>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 9999,
                  fontSize: 11.5,
                  fontWeight: 700,
                  backgroundColor: 'rgba(0, 0, 0, 0.06)',
                  color: '#52525b'
                }}
              >
                {completedDishes.length}
              </span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: 12.5, color: '#71717a' }}>
              All previous dishes you hosted or participated in
            </p>
          </div>

          {/* History Sub-Filter (All / Hosted / Joined) with Dine In solid black selector style */}
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
              { id: 'all', label: 'All History' },
              { id: 'hosted', label: 'Hosted' },
              { id: 'joined', label: 'Joined' }
            ].map((tab) => {
              const isActive = historyFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setHistoryFilter(tab.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 16px',
                    borderRadius: 9999,
                    border: 'none',
                    fontSize: 12.5,
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    background: isActive ? '#09090b' : 'transparent',
                    color: isActive ? '#ffffff' : '#52525b',
                    boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.16)' : 'none',
                    transition: 'all 0.18s ease',
                    fontFamily: 'inherit'
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
                  {tab.label}
                </button>
              );
            })}
          </GlassContainer>
        </div>

        {/* Cooking History List */}
        {completedDishes.length === 0 ? (
          <GlassContainer radius={20} innerStyle={{ padding: '36px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#71717a' }}>
              No completed dishes found in this filter.
            </div>
          </GlassContainer>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {completedDishes.map((dish) => {
              const isOwner = dish.isOwner;
              const participantCount = dish.participants?.length || 1;

              return (
                <GlassContainer
                  key={dish._id}
                  radius={18}
                  innerStyle={{
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Role Pill */}
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 9999,
                          backgroundColor: isOwner ? 'rgba(249, 115, 22, 0.12)' : 'rgba(0, 0, 0, 0.06)',
                          color: isOwner ? '#ea580c' : '#3f3f46',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5
                        }}
                      >
                        {isOwner ? (
                          <>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            Hosted by You
                          </>
                        ) : (
                          <>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                            </svg>
                            Joined
                          </>
                        )}
                      </span>

                      {/* Category */}
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          letterSpacing: '0.4px',
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: 9999,
                          backgroundColor: 'rgba(0, 0, 0, 0.05)',
                          color: '#71717a'
                        }}
                      >
                        {dish.category}
                      </span>
                    </div>

                    {/* Status: Cooked Completed */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#16a34a' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <span>Cooked</span>
                      <span style={{ color: '#a1a1aa', fontWeight: 400 }}>• {dish.completedAt || 'Finished'}</span>
                    </div>
                  </div>

                  {/* Activity Description */}
                  <div style={{ fontSize: 14, color: '#18181b', fontWeight: 500, lineHeight: 1.4 }}>
                    {dish.description}
                  </div>

                  {/* Footer Meta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid rgba(0, 0, 0, 0.05)', fontSize: 12, color: '#71717a' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      {participantCount} {participantCount === 1 ? 'peer participated' : 'peers participated'}
                    </span>

                    {!isOwner && dish.creator?.name && (
                      <span
                        onClick={() => onViewProfile && onViewProfile(dish.creator)}
                        style={{
                          fontSize: 11.5,
                          color: '#71717a',
                          cursor: onViewProfile ? 'pointer' : 'default'
                        }}
                        title={onViewProfile ? `View @${dish.creator.username || 'user'}'s profile` : ''}
                      >
                        Host: <strong style={{ color: '#09090b', textDecoration: onViewProfile ? 'underline' : 'none' }}>{dish.creator.name}</strong>
                      </span>
                    )}
                  </div>
                </GlassContainer>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
