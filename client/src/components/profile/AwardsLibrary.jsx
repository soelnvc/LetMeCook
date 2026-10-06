'use client';

import React from 'react';
import GlassContainer from '@/components/ui/GlassContainer';

export default function AwardsLibrary({ user, isSelf = true }) {
  const username = user?.username || 'user';
  const name = user?.name || username;

  // Derive stats for this specific person
  const dishesCreated = Number(user?.stats?.dishesCreated ?? 0);
  const dishesJoined = Number(user?.stats?.dishesJoined ?? 0);
  const connectionsCount = Number(
    user?.stats?.connections ?? (Array.isArray(user?.connections) ? user.connections.length : 0)
  );
  const interestsCount = Array.isArray(user?.interests) ? user.interests.length : 3;

  // Master definitions of awards with personalized progress
  const allAwards = [
    {
      id: 'chef',
      title: 'Chef',
      desc: 'Created 10+ Dishes (Activities) for the community.',
      isUnlocked: dishesCreated >= 10,
      progress: `${Math.min(dishesCreated, 10)} / 10 Dishes`,
      progressPercent: Math.min(100, Math.round((dishesCreated / 10) * 100)),
      colorBg: 'rgba(254, 243, 199, 0.7)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      tagColor: '#b45309',
      tagBg: 'rgba(245, 158, 11, 0.12)',
      icon: (
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.8" />
          <path d="M12 6.5l1.6 3.8 4.1.4-3.1 2.8.9 4-3.5-2.1-3.5 2.1.9-4-3.1-2.8 4.1-.4z" fill="#f59e0b" />
        </svg>
      )
    },
    {
      id: 'good-company',
      title: 'Good Company',
      desc: 'Joined and participated in 15+ community Dishes.',
      isUnlocked: dishesJoined >= 15,
      progress: `${Math.min(dishesJoined, 15)} / 15 Dishes`,
      progressPercent: Math.min(100, Math.round((dishesJoined / 15) * 100)),
      colorBg: 'rgba(209, 250, 229, 0.7)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      tagColor: '#047857',
      tagBg: 'rgba(16, 185, 129, 0.12)',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      id: 'night-chef',
      title: 'Night Chef',
      desc: 'Organized late-night study or gaming activities past 11 PM.',
      isUnlocked: dishesCreated >= 8,
      progress: `${Math.min(dishesCreated, 8)} / 8 sessions`,
      progressPercent: Math.min(100, Math.round((dishesCreated / 8) * 100)),
      colorBg: 'rgba(254, 240, 138, 0.6)',
      borderColor: 'rgba(202, 138, 4, 0.3)',
      tagColor: '#ca8a04',
      tagBg: 'rgba(234, 179, 8, 0.12)',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#fde047" stroke="#ca8a04" strokeWidth="1.8" />
          <path d="M19 5l.5 1.2 1.3.3-1.1.9.3 1.3-1-.7-1 .7.3-1.3-1.1-.9 1.3-.3z" fill="#ca8a04" />
        </svg>
      )
    },
    {
      id: 'campus-connector',
      title: 'Campus Connector',
      desc: 'Coordinated activities with 20+ distinct campus students.',
      isUnlocked: connectionsCount >= 20,
      progress: `${Math.min(connectionsCount, 20)} / 20 students`,
      progressPercent: Math.min(100, Math.round((connectionsCount / 20) * 100)),
      colorBg: 'rgba(224, 231, 255, 0.7)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      tagColor: '#4338ca',
      tagBg: 'rgba(99, 102, 241, 0.12)',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <polyline points="17 11 19 13 23 9" />
        </svg>
      )
    },
    {
      id: 'master-chef',
      title: 'MasterChef',
      desc: 'Create 25+ successful campus Dishes.',
      isUnlocked: dishesCreated >= 25,
      progress: `${dishesCreated} / 25 Dishes`,
      progressPercent: Math.min(100, Math.round((dishesCreated / 25) * 100)),
      colorBg: 'rgba(255, 237, 213, 0.7)',
      borderColor: 'rgba(249, 115, 22, 0.3)',
      tagColor: '#c2410c',
      tagBg: 'rgba(249, 115, 22, 0.12)',
      icon: (
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    },
    {
      id: 'activity-explorer',
      title: 'Activity Explorer',
      desc: 'Host across 4 categories (Study, Sports, Gym, Social).',
      isUnlocked: interestsCount >= 4,
      progress: `${Math.min(interestsCount, 4)} / 4 categories`,
      progressPercent: Math.min(100, Math.round((Math.min(interestsCount, 4) / 4) * 100)),
      colorBg: 'rgba(237, 233, 254, 0.7)',
      borderColor: 'rgba(139, 92, 246, 0.3)',
      tagColor: '#6d28d9',
      tagBg: 'rgba(139, 92, 246, 0.12)',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      )
    },
    {
      id: 'early-bird',
      title: 'Early Bird',
      desc: 'Host an early morning activity (Gym / Run) before 8:30 AM.',
      isUnlocked: false,
      progress: '0 / 1 hosted',
      progressPercent: 0,
      icon: (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4" />
          <path d="M4.93 10.93l2.83 2.83" />
          <path d="M2 18h20" />
          <path d="M20 18a8 8 0 0 0-16 0" />
          <path d="M19.07 10.93l-2.83 2.83" />
        </svg>
      )
    },
    {
      id: 'squad-leader',
      title: 'Squad Leader',
      desc: 'Host a coordination ticket with a full squad of 6+ participants.',
      isUnlocked: false,
      progress: '0 / 1 squad',
      progressPercent: 0,
      icon: (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    }
  ];

  const unlockedAwards = allAwards.filter((a) => a.isUnlocked);
  const lockedAwards = allAwards.filter((a) => !a.isUnlocked);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div>
        <h3 style={{ fontSize: 19, fontWeight: 800, margin: '0 0 4px 0', color: '#000000', letterSpacing: '-0.3px' }}>
          {isSelf ? 'Award Library' : `@${username}'s Award Library`}
        </h3>
        <p style={{ fontSize: 12.5, color: '#6b7280', margin: 0 }}>
          {isSelf
            ? 'Your verified campus milestones & badges'
            : `Verified campus achievements and activity milestones for ${name}`}
        </p>
      </div>

      {/* 1. UNLOCKED ACHIEVEMENTS (Top Section - Full Color) */}
      {unlockedAwards.length > 0 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {unlockedAwards.map((award) => (
              <GlassContainer
                key={award.id}
                radius={22}
                innerStyle={{
                  padding: '22px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 12,
                  boxSizing: 'border-box'
                }}
              >
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: '50%',
                    backgroundColor: award.colorBg || 'rgba(254, 243, 199, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1.5px solid ${award.borderColor || 'rgba(245, 158, 11, 0.3)'}`
                  }}
                >
                  {award.icon}
                </div>
                <div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      color: award.tagColor || '#b45309',
                      backgroundColor: award.tagBg || 'rgba(245, 158, 11, 0.12)',
                      padding: '2px 8px',
                      borderRadius: 9999,
                      marginBottom: 5
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Unlocked
                  </div>
                  <h4 style={{ fontSize: 15.5, fontWeight: 800, margin: '0 0 3px 0', color: '#000000' }}>
                    {award.title}
                  </h4>
                  <p style={{ fontSize: 12, color: '#4b5563', margin: 0, lineHeight: 1.4 }}>
                    {award.desc}
                  </p>
                </div>
              </GlassContainer>
            ))}
          </div>
        </div>
      )}

      {/* 2. YET TO BE UNLOCKED (Down the line - Grayscale with personalized progress) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <h4 style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#6b7280', margin: 0 }}>
            {isSelf ? 'Yet to unlock' : `@${username}'s In-Progress Milestones`}
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {lockedAwards.map((locked) => (
            <GlassContainer
              key={locked.id}
              radius={22}
              style={{
                filter: 'grayscale(100%)',
                opacity: 0.72,
                transition: 'opacity 0.2s ease'
              }}
              innerStyle={{
                padding: '22px 18px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 12,
                boxSizing: 'border-box'
              }}
            >
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px dashed rgba(0, 0, 0, 0.25)'
                }}
              >
                {locked.icon}
              </div>

              <div style={{ width: '100%' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#4b5563',
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    padding: '2px 8px',
                    borderRadius: 9999,
                    marginBottom: 5
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Locked
                </div>
                <h4 style={{ fontSize: 15.5, fontWeight: 800, margin: '0 0 3px 0', color: '#000000' }}>
                  {locked.title}
                </h4>
                <p style={{ fontSize: 12, color: '#4b5563', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                  {locked.desc}
                </p>

                {/* Progress bar with that person's exact numbers */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', fontWeight: 600 }}>
                    <span>Progress</span>
                    <span>{locked.progress}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 9999, backgroundColor: 'rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
                    <div style={{ width: `${locked.progressPercent}%`, height: '100%', backgroundColor: '#000000', borderRadius: 9999 }} />
                  </div>
                </div>
              </div>
            </GlassContainer>
          ))}
        </div>
      </div>
    </div>
  );
}
