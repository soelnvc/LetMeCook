'use client';

import React, { useState, useMemo } from 'react';
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';

export default function HomeDashboard({
  user,
  dishes = [],
  onOpenKitchenModal,
  onJoinDish,
  onExploreDineIn,
  onNavigateTab
}) {
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'hosted' | 'joined'

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const displayName = user?.name?.split(' ')[0] || user?.username || 'Chef';
  const instituteName = user?.institute?.name || 'IIT Madras';

  // Check if current user is active in any dish
  const activeUserDish = useMemo(() => {
    if (!dishes || dishes.length === 0 || !user?._id) return null;
    return dishes.find(
      (d) =>
        d.status !== 'cooked' &&
        ((d.creator?._id || d.creator) === user._id ||
          d.participants?.some((p) => (p.user?._id || p.user) === user._id))
    );
  }, [dishes, user]);

  // Curated Selection of around 3 Top Dishes: "Things you might actually want to do."
  // Prioritizes: ACTIVITY -> TIME -> AVAILABILITY -> LOCATION -> PEOPLE
  // The activity itself visually dominates, not the user's profile.
  const topCuratedDishes = useMemo(() => {
    return [
      {
        _id: 'top-curated-1',
        activity: 'BADMINTON',
        time: 'Tonight · 7:00 PM',
        spotsLeft: 2,
        capacity: 4,
        distance: '~1.2 km away',
        locationName: 'Indoor Court 2',
        pitch: '“Looking for two people for doubles.”',
        creator: { name: 'Arjun', username: 'arjun' },
        category: 'sport',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24" />
          </svg>
        )
      },
      {
        _id: 'top-curated-2',
        activity: 'DSA STUDY SESSION',
        time: 'Tonight · 8:30 PM',
        spotsLeft: 1,
        capacity: 4,
        distance: '~0.4 km away',
        locationName: 'Central Library Room 4',
        pitch: '“Dynamic Programming & Graphs mock interview whiteboarding.”',
        creator: { name: 'Meera', username: 'meera' },
        category: 'study',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        )
      },
      {
        _id: 'top-curated-3',
        activity: 'CAB TO CAMPUS',
        time: 'Tonight · 9:15 PM',
        spotsLeft: 2,
        capacity: 4,
        distance: '~2.8 km away',
        locationName: 'Airport / Central Station',
        pitch: '“Sharing Uber Premier to campus main gate. Splitting fare.”',
        creator: { name: 'Kabir', username: 'kabir' },
        category: 'travel',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <circle cx="8" cy="16" r="1.5" />
            <circle cx="16" cy="16" r="1.5" />
            <path d="M5 10h14" />
          </svg>
        )
      }
    ];
  }, []);

  // Network Dishes (institution verified peers)
  const networkDishes = useMemo(() => {
    const active = dishes.filter((d) => d.status !== 'cooked');
    const networkFromDb = active.filter(
      (d) => d.visibility !== 'global' && d.location?.scope !== 'nearby'
    );

    const defaultNetwork = [
      {
        _id: 'net-fallback-1',
        description: 'DSA Trees & Graphs mock technical interview session in Central Library Study Room 4.',
        category: 'study',
        status: 'lets_cook',
        joinMode: 'auto',
        visibility: 'institute',
        creator: { name: 'Aman Sharma', username: 'amans', institute: { name: instituteName } },
        capacity: { max: 4 },
        participants: [{ user: '1' }, { user: '2' }]
      },
      {
        _id: 'net-fallback-2',
        description: 'Casual badminton doubles rally followed by protein smoothies at campus indoor court.',
        category: 'sport',
        status: 'lets_cook',
        joinMode: 'approval',
        visibility: 'institute',
        creator: { name: 'Priya Patel', username: 'priyap', institute: { name: instituteName } },
        capacity: { max: 4 },
        participants: [{ user: '1' }]
      },
      {
        _id: 'net-fallback-3',
        description: 'Hostel 4 lounge FIFA 24 & Smash Ultimate chill session after evening lectures.',
        category: 'gaming',
        status: 'cooking',
        joinMode: 'auto',
        visibility: 'institute',
        creator: { name: 'Rohan Verma', username: 'rohanv', institute: { name: instituteName } },
        capacity: { max: 6 },
        participants: [{ user: '1' }, { user: '2' }, { user: '3' }]
      }
    ];

    return networkFromDb.length > 0 ? networkFromDb : defaultNetwork;
  }, [dishes, instituteName]);

  // Cooking History: Completed / previous dishes (own or joined)
  const completedDishes = useMemo(() => {
    const realCooked = (dishes || []).filter((d) => d.status === 'cooked');

    const fallbackHistory = [
      {
        _id: 'history-1',
        description: 'Late night Super Smash Bros Ultimate mini-tournament in student center lounge.',
        category: 'gaming',
        status: 'cooked',
        isOwner: true,
        creator: { name: user?.name || 'Sid G', username: user?.username || 'soelnvc' },
        capacity: { max: 6 },
        participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }, { user: '5' }, { user: '6' }],
        completedAt: 'Yesterday'
      },
      {
        _id: 'history-2',
        description: 'Deep work study session: preparing for System Design & distributed consensus algorithms.',
        category: 'study',
        status: 'cooked',
        isOwner: false,
        creator: { name: 'Maya Lin', username: 'mayachef' },
        capacity: { max: 3 },
        participants: [{ user: '1' }, { user: user?._id }, { user: '3' }],
        completedAt: '3 days ago'
      },
      {
        _id: 'history-3',
        description: 'Evening walk to Campus Cafe for iced coffee & casual chit-chat after classes.',
        category: 'social',
        status: 'cooked',
        isOwner: true,
        creator: { name: user?.name || 'Sid G', username: user?.username || 'soelnvc' },
        capacity: { max: 4 },
        participants: [{ user: '1' }, { user: '2' }, { user: '3' }, { user: '4' }],
        completedAt: '5 days ago'
      },
      {
        _id: 'history-4',
        description: 'Casual badminton doubles match followed by protein shakes at campus indoor court.',
        category: 'sport',
        status: 'cooked',
        isOwner: false,
        creator: { name: 'Priya Patel', username: 'priyabakes' },
        capacity: { max: 4 },
        participants: [{ user: '1' }, { user: user?._id }, { user: '3' }, { user: '4' }],
        completedAt: '1 week ago'
      }
    ];

    const source = realCooked.length > 0
      ? realCooked.map((d) => ({
          ...d,
          isOwner: (d.creator?._id || d.creator) === user?._id,
          completedAt: d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : 'Completed'
        }))
      : fallbackHistory;

    return source.filter((item) => {
      if (historyFilter === 'hosted') return item.isOwner;
      if (historyFilter === 'joined') return !item.isOwner;
      return true;
    });
  }, [dishes, user, historyFilter]);

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
      {/* 2. HERO SPOTLIGHT CARD (Featured Banner)                  */}
      {/* ========================================================= */}
      <div style={{ marginBottom: 32 }}>
        {activeUserDish ? (
          /* State A: Currently Cooking Live Spotlight */
          <GlassContainer
            radius={28}
            style={{
              overflow: 'hidden',
              border: '1.5px solid rgba(249, 115, 22, 0.35)',
              boxShadow: '0 12px 32px rgba(249, 115, 22, 0.08)'
            }}
            innerStyle={{
              padding: '26px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            {/* Header: Beacon + Category */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '3px 10px',
                    borderRadius: 9999,
                    backgroundColor: 'rgba(249, 115, 22, 0.12)',
                    color: '#ea580c',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase'
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: '#ea580c'
                    }}
                  />
                  Live Cooking Session
                </span>
                <span style={{ fontSize: 12, color: '#71717a', fontWeight: 600 }}>
                  • {activeUserDish.category?.toUpperCase() || 'ACTIVITY'}
                </span>
              </div>

              <span style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>
                {activeUserDish.timing?.cookStart || 'Starting soon'}
              </span>
            </div>

            {/* Description & Details */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px 0', color: '#09090b', lineHeight: 1.35 }}>
                {activeUserDish.description}
              </h3>
              <div style={{ fontSize: 13, color: '#71717a', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Host: @{activeUserDish.creator?.username || user?.username}</span>
                <span>•</span>
                <span>
                  {activeUserDish.participants?.length || 1}/{activeUserDish.capacity?.max || 4} spots filled
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <FluidButton
                onClick={() => onNavigateTab && onNavigateTab('messages')}
                style={{
                  padding: '7px 20px',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Open Activity Chat
              </FluidButton>

              <FluidButton
                onClick={() => onNavigateTab && onNavigateTab('dine-in')}
                style={{
                  padding: '7px 18px',
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                View Ticket
              </FluidButton>
            </div>
          </GlassContainer>
        ) : (
          /* State B: Aesthetic Campus Hero Banner with 3D Visual Asset */
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
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. MONOCHROMATIC METRICS BAR                              */}
      {/* ========================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 34 }}>
        {[
          {
            label: 'COOKED',
            value: user?.stats?.dishesCreated ?? 17,
            desc: 'Hosted activities'
          },
          {
            label: 'JOINED',
            value: user?.stats?.dishesJoined ?? 19,
            desc: 'Participated sessions'
          },
          {
            label: 'CONNECTIONS',
            value: user?.stats?.peopleCookedWith ?? 42,
            desc: 'Co-cooks met'
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
      {/* 4. QUICK ACTIVITY SHORTCUTS (1-Click Starters)            */}
      {/* ========================================================= */}
      <div style={{ marginBottom: 38 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#71717a', margin: 0 }}>
            Quick Starters
          </h3>
          <span style={{ fontSize: 12, color: '#a1a1aa' }}>1-Click Templates</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            {
              title: 'Badminton Doubles',
              subtitle: 'Indoor Court 2',
              category: 'sport',
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24" />
                </svg>
              )
            },
            {
              title: 'DSA Study Room',
              subtitle: 'Central Library',
              category: 'study',
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              )
            },
            {
              title: 'Cafe Iced Latte Run',
              subtitle: 'Campus Square Cafe',
              category: 'social',
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                </svg>
              )
            },
            {
              title: 'Smash / FIFA Chill',
              subtitle: 'Hostel Lounge',
              category: 'gaming',
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="6" />
                  <path d="M6 12h4m-2-2v4m9-2h.01m3-2h.01" />
                </svg>
              )
            }
          ].map((starter, idx) => (
            <GlassContainer
              key={idx}
              as="button"
              radius={18}
              onClick={() => onOpenKitchenModal && onOpenKitchenModal(starter.category)}
              style={{
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              innerStyle={{
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                cursor: 'pointer'
              }}
            >
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
                {starter.icon}
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#09090b', lineHeight: 1.25 }}>
                  {starter.title}
                </div>
                <div style={{ fontSize: 11.5, color: '#71717a', marginTop: 2 }}>
                  {starter.subtitle}
                </div>
              </div>
            </GlassContainer>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. DISCOVER / TOP DISHES (Most Important Section)         */}
      {/* “Things you might actually want to do.”                    */}
      {/* Hierarchy: ACTIVITY -> TIME -> AVAILABILITY -> LOCATION -> PEOPLE */}
      {/* Activity visually dominates, NOT user's profile           */}
      {/* ========================================================= */}
      <div style={{ marginBottom: 44 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#ea580c' }}>
              DISCOVER / TOP DISHES
            </span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#ea580c' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#71717a' }}>CURATED</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#09090b', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              Things you might actually want to do.
            </h2>
            <span style={{ fontSize: 12.5, color: '#71717a', fontWeight: 500 }}>
              Immediate coordination • High relevance
            </span>
          </div>
        </div>

        {/* 3 Curated Compact Activity Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(275px, 1fr))', gap: 16 }}>
          {topCuratedDishes.map((dish) => (
            <GlassContainer
              key={dish._id}
              radius={22}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                border: '1.5px solid rgba(0, 0, 0, 0.08)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 14px 34px rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              innerStyle={{
                padding: '22px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 16,
                height: '100%',
                boxSizing: 'border-box'
              }}
            >
              <div>
                {/* 1. ACTIVITY (Visually Dominates!) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase',
                      color: '#09090b',
                      margin: 0,
                      lineHeight: 1.2
                    }}
                  >
                    {dish.activity}
                  </h3>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#09090b',
                      flexShrink: 0
                    }}
                  >
                    {dish.icon}
                  </div>
                </div>

                {/* 2. TIME */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#18181b', marginBottom: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{dish.time}</span>
                </div>

                {/* 3. AVAILABILITY & 4. LOCATION */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#52525b', marginBottom: 14, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 8px',
                      borderRadius: 9999,
                      backgroundColor: 'rgba(249, 115, 22, 0.1)',
                      color: '#ea580c',
                      fontWeight: 700
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#ea580c' }} />
                    {dish.spotsLeft} spots left
                  </span>
                  <span>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {dish.distance}
                  </span>
                </div>

                {/* Pitch / Quoted Callout */}
                <p
                  style={{
                    fontSize: 13.5,
                    fontStyle: 'italic',
                    color: '#27272a',
                    lineHeight: 1.45,
                    margin: 0,
                    fontWeight: 500
                  }}
                >
                  {dish.pitch}
                </p>
              </div>

              {/* 5. PEOPLE & CTA (Subtle footer row) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 14,
                  borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                  marginTop: 6
                }}
              >
                {/* Creator info: secondary, institute verified */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#71717a' }}>
                  <span style={{ fontWeight: 600, color: '#09090b' }}>@{dish.creator.username}</span>
                  <span>·</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#0284c7', fontWeight: 600, fontSize: 11.5 }}>
                    Institute Verified
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#0095f6">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </span>
                </div>

                {/* [Join] CTA */}
                <FluidButton
                  onClick={() => onJoinDish && onJoinDish(dish._id)}
                  style={{
                    padding: '6px 18px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#000000'
                  }}
                >
                  Join
                </FluidButton>
              </div>
            </GlassContainer>
          ))}
        </div>
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

          <button
            onClick={() => onExploreDineIn && onExploreDineIn()}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 13,
              fontWeight: 600,
              color: '#09090b',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span>Explore Dine-In</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        {/* Network Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))', gap: 16 }}>
          {networkDishes.map((dish) => {
            const creatorName = dish.creator?.name || 'Peer';
            const creatorUsername = dish.creator?.username || 'user';
            const isCreator = (dish.creator?._id || dish.creator) === user?._id;
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
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.07)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
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
                  {/* Top: Creator Info + Verified Institute Pill */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                          fontWeight: 700
                        }}
                      >
                        {creatorName[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#09090b', lineHeight: 1.2 }}>
                          {creatorName}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#71717a' }}>
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

                  {/* Network Trust Badge */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 9999, backgroundColor: 'rgba(0, 149, 246, 0.08)', marginBottom: 10 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#0095f6">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#0284c7' }}>
                      {dish.creator?.institute?.name || instituteName} • Verified
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
          })}
        </div>
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

          {/* History Sub-Filter (All / Hosted / Joined) */}
          <div style={{ display: 'inline-flex', padding: 3, backgroundColor: 'rgba(0, 0, 0, 0.05)', borderRadius: 9999 }}>
            {[
              { id: 'all', label: 'All History' },
              { id: 'hosted', label: 'Hosted' },
              { id: 'joined', label: 'Joined' }
            ].map((tab) => {
              const isActive = historyFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setHistoryFilter(tab.id)}
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
                  style={{
                    transition: 'transform 0.18s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
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
                      {participantCount} {participantCount === 1 ? 'cook participated' : 'cooks participated'}
                    </span>

                    {!isOwner && dish.creator?.name && (
                      <span style={{ fontSize: 11.5, color: '#71717a' }}>
                        Host: {dish.creator.name}
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
