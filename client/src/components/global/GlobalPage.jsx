'use client';

import React, { useState, useMemo } from 'react';
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';

export default function GlobalPage({
  user,
  dishes = [],
  onJoinDish,
  onOpenKitchenModal,
  onNavigateTab,
  onViewProfile
}) {
  const isAdult = Boolean(user && user.age !== undefined && user.age !== null && Number(user.age) >= 18);

  const [distanceFilter, setDistanceFilter] = useState('all'); // 'all' | '1km' | '3km' | '5km'
  const [categoryFilter, setCategoryFilter] = useState('all');

  if (!isAdult) {
    return (
      <div style={{ width: '100%', maxWidth: 720, margin: '40px auto', padding: '0 16px', boxSizing: 'border-box' }}>
        <GlassContainer
          radius={24}
          innerStyle={{
            padding: '36px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#71717a'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>

          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px 0', color: '#09090b', letterSpacing: '-0.02em' }}>
              Global Discovery is Restricted (18+ Only)
            </h3>
            <p style={{ fontSize: 13, color: '#71717a', maxWidth: 440, margin: 0, lineHeight: 1.55 }}>
              Global broadcasted activities and 5km discovery are reserved for verified adult students (18+). You can continue chatting, connecting, and participating in activities within your verified campus network.
            </p>
          </div>

          <FluidButton
            onClick={() => onNavigateTab && onNavigateTab('dine-in')}
            style={{ padding: '8px 22px', fontSize: 13, fontWeight: 700, marginTop: 4 }}
          >
            Return to Campus Feed
          </FluidButton>
        </GlassContainer>
      </div>
    );
  }

  // Filter global dishes (< 5km radius)
  const globalDishes = useMemo(() => {
    const active = dishes.filter((d) => d.status !== 'cooked');
    const fromDb = active.filter(
      (d) => d.visibility === 'global' || d.location?.scope === 'nearby'
    );

    const defaultGlobal = [
      {
        _id: 'global-item-1',
        title: 'WEEKEND 5KM RUN',
        description: 'Weekend 5km endurance run around Lake Promenade. Pace ~5:45/km. Everyone welcome!',
        category: 'sport',
        timing: 'Saturday · 6:30 AM',
        status: 'lets_cook',
        joinMode: 'auto',
        distanceKm: 1.2,
        distance: '~1.2 km away',
        locationName: 'Lake Promenade Public Park',
        creator: {
          name: 'Vikram Joshi',
          username: 'vikramj',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
        },
        capacity: { max: 5 },
        participants: [{ user: '1' }, { user: '2' }]
      },
      {
        _id: 'global-item-2',
        title: 'CO-WORKING & COLD BREW',
        description: 'Co-working on side projects & cold brew coffee session at Blue Tokai Cafe.',
        category: 'social',
        timing: 'Today · 3:00 PM',
        status: 'lets_cook',
        joinMode: 'approval',
        distanceKm: 2.4,
        distance: '~2.4 km away',
        locationName: 'Blue Tokai Coffee Roasters',
        creator: {
          name: 'Ananya Roy',
          username: 'ananyar',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        },
        capacity: { max: 4 },
        participants: [{ user: '1' }]
      },
      {
        _id: 'global-item-3',
        title: 'RAPID CHESS ROUNDS',
        description: 'Rapid chess matches (10+0) & tactics review at Central Public Library Cafe.',
        category: 'gaming',
        timing: 'Tonight · 7:30 PM',
        status: 'lets_cook',
        joinMode: 'auto',
        distanceKm: 3.1,
        distance: '~3.1 km away',
        locationName: 'City Library Hub',
        creator: {
          name: 'Karthik Rao',
          username: 'karthikr',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        },
        capacity: { max: 4 },
        participants: [{ user: '1' }, { user: '2' }, { user: '3' }]
      },
      {
        _id: 'global-item-4',
        title: 'EVENING BASKETBALL 3V3',
        description: 'Casual half-court 3v3 basketball runs under floodlights at Marina Sports Complex.',
        category: 'sport',
        timing: 'Tonight · 8:00 PM',
        status: 'lets_cook',
        joinMode: 'auto',
        distanceKm: 4.2,
        distance: '~4.2 km away',
        locationName: 'Marina Sports Arena',
        creator: {
          name: 'Dev Sharma',
          username: 'devs',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
        },
        capacity: { max: 6 },
        participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }]
      },
      {
        _id: 'global-item-5',
        title: 'WEEKEND TREK & HIKE',
        description: 'Morning trail hike to Hills View Point. Carrying light packs and water bottles.',
        category: 'travel',
        timing: 'Sunday · 5:30 AM',
        status: 'lets_cook',
        joinMode: 'approval',
        distanceKm: 4.8,
        distance: '~4.8 km away',
        locationName: 'North Trail Foothills',
        creator: { name: 'Rohan Sen', username: 'rohans' },
        capacity: { max: 8 },
        participants: [{ user: '1' }, { user: '2' }, { user: '3' }]
      }
    ];

    const source = fromDb.length > 0 ? fromDb : defaultGlobal;

    return source.filter((item) => {
      // Distance filter
      if (distanceFilter === '1km' && (item.distanceKm || 2) > 1.5) return false;
      if (distanceFilter === '3km' && (item.distanceKm || 2) > 3.0) return false;
      if (distanceFilter === '5km' && (item.distanceKm || 2) > 5.0) return false;

      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

      return true;
    });
  }, [dishes, distanceFilter, categoryFilter]);

  return (
    <section style={{ width: '100%', maxWidth: 940, margin: '0 auto', color: '#000000', fontFamily: "'Inter', sans-serif" }}>
      {/* ========================================================= */}
      {/* 1. HEADER                                                 */}
      {/* ========================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 9999, backgroundColor: 'rgba(249, 115, 22, 0.12)', marginBottom: 8 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Location-Based • 5 km Perimeter
            </span>
          </div>

          <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.7px', color: '#09090b', lineHeight: 1.15 }}>
            Global Dishes
          </h1>
          <p style={{ fontSize: 14.5, color: '#71717a', margin: 0, fontWeight: 500 }}>
            Open real-world activities from students and peers within a 5 km radius
          </p>
        </div>

        <FluidButton
          onClick={() => onOpenKitchenModal && onOpenKitchenModal()}
          style={{
            padding: '8px 22px',
            fontSize: 13.5,
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Drop a Global Dish
        </FluidButton>
      </div>

      {/* ========================================================= */}
      {/* 2. CAUTION WARNING BANNER (Strictly zero emojis)           */}
      {/* ========================================================= */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          padding: '16px 20px',
          borderRadius: 18,
          backgroundColor: 'rgba(249, 115, 22, 0.08)',
          border: '1.5px solid rgba(249, 115, 22, 0.32)',
          marginBottom: 28,
          boxShadow: '0 4px 16px rgba(249, 115, 22, 0.04)'
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: 'rgba(249, 115, 22, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ea580c',
            flexShrink: 0,
            marginTop: 2
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#c2410c', marginBottom: 3 }}>
            Caution: Global Coordination Safety Notice
          </div>
          <div style={{ fontSize: 12.5, color: '#7c2d12', lineHeight: 1.5 }}>
            Activities in Global Discovery are broadcasted to peers within a 5 km radius outside your verified campus network. Always coordinate and meet in well-lit public spots (cafes, sports centers, libraries, campus gates) and verify peer profiles beforehand.
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. FILTERS BAR (Distance & Category)                      */}
      {/* ========================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        {/* Distance Range Filter */}
        <div style={{ display: 'inline-flex', padding: 3, backgroundColor: 'rgba(0, 0, 0, 0.05)', borderRadius: 9999 }}>
          {[
            { id: 'all', label: 'All (< 5 km)' },
            { id: '1km', label: '< 1.5 km' },
            { id: '3km', label: '< 3.0 km' },
            { id: '5km', label: '< 5.0 km' }
          ].map((tab) => {
            const isActive = distanceFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setDistanceFilter(tab.id)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: isActive ? '#09090b' : 'transparent',
                  color: isActive ? '#ffffff' : '#71717a',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#71717a' }}>Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '5px 12px',
              fontSize: 12.5,
              fontWeight: 600,
              color: '#09090b',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            <option value="all">All Categories</option>
            <option value="sport">Sports & Fitness</option>
            <option value="social">Cafe & Social</option>
            <option value="gaming">Gaming</option>
            <option value="study">Study & Deep Work</option>
            <option value="travel">Travel & Outdoors</option>
          </select>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. DISHES GRID                                            */}
      {/* ========================================================= */}
      {globalDishes.length === 0 ? (
        <GlassContainer radius={22} innerStyle={{ padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#09090b', marginBottom: 6 }}>
            No global dishes found within this radius filter.
          </div>
          <div style={{ fontSize: 13, color: '#71717a', marginBottom: 16 }}>
            Expand your distance range or be the first to drop an activity in this area.
          </div>
          <FluidButton
            onClick={() => onOpenKitchenModal && onOpenKitchenModal()}
            style={{ padding: '7px 20px', fontSize: 13, fontWeight: 600 }}
          >
            Drop a Dish
          </FluidButton>
        </GlassContainer>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))', gap: 16 }}>
          {globalDishes.map((dish) => {
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
                  {/* Top: Distance & Category */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#ea580c',
                        backgroundColor: 'rgba(249, 115, 22, 0.1)',
                        padding: '2px 8px',
                        borderRadius: 9999
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {dish.distance || '~2.0 km away'}
                    </span>

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
                      {dish.category || 'GLOBAL'}
                    </span>
                  </div>

                  {/* Public Venue & Time */}
                  <div style={{ fontSize: 11.5, color: '#71717a', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span>{dish.locationName || dish.location?.areaName || 'Public Venue'}</span>
                    {(() => {
                      const timingText = typeof dish.timing === 'string'
                        ? dish.timing
                        : (dish.timing?.cookStart || dish.timing?.cookingStart || '');
                      return timingText ? (
                        <>
                          <span>•</span>
                          <span>{timingText}</span>
                        </>
                      ) : null;
                    })()}
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: 14,
                      color: '#18181b',
                      margin: '0 0 14px 0',
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
                  {/* Host info line */}
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
                      gap: 6,
                      marginBottom: 12,
                      fontSize: 12,
                      color: '#71717a',
                      cursor: onViewProfile ? 'pointer' : 'default',
                      width: 'fit-content'
                    }}
                    title={onViewProfile ? `View @${creatorUsername}'s profile` : ''}
                  >
                    {creatorAvatar ? (
                      <img
                        src={creatorAvatar}
                        alt={creatorName}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          flexShrink: 0
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: '#09090b',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 700
                        }}
                      >
                        {creatorName[0].toUpperCase()}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontWeight: 700, color: '#09090b' }}>{creatorName}</span>
                      <span style={{ fontWeight: 500, color: '#71717a' }}>@{creatorUsername}</span>
                    </div>
                    <span>•</span>
                    <span style={{ fontSize: 11 }}>Non-campus Peer</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 10,
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
                      {spotsLeft} spots left
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
          })}
        </div>
      )}
    </section>
  );
}
