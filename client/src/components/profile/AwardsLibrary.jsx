'use client';

import React from 'react';
import GlassContainer from '@/components/ui/GlassContainer';

export default function AwardsLibrary() {
  const lockedAwards = [
    {
      id: 'master-chef',
      title: 'MasterChef',
      desc: 'Create 25+ successful campus Dishes.',
      progress: '17 / 25 Dishes',
      progressPercent: 68,
      icon: (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    },
    {
      id: 'campus-connector',
      title: 'Campus Connector',
      desc: 'Coordinate activities with 20 distinct campus students.',
      progress: '14 / 20 students',
      progressPercent: 70,
      icon: (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <polyline points="17 11 19 13 23 9" />
        </svg>
      )
    },
    {
      id: 'activity-explorer',
      title: 'Activity Explorer',
      desc: 'Host across 4 categories (Study, Sports, Gym, Social).',
      progress: '3 / 4 categories',
      progressPercent: 75,
      icon: (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      )
    },
    {
      id: 'early-bird',
      title: 'Early Bird',
      desc: 'Host an early morning activity (Gym / Run) before 8:30 AM.',
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
      progress: '0 / 1 squad',
      progressPercent: 0,
      icon: (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 19, fontWeight: 800, margin: '0 0 4px 0', color: '#000000', letterSpacing: '-0.3px' }}>
            Award Library
          </h3>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
            Earned through real-world community coordination and activities on campus.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, fontSize: 12, fontWeight: 700 }}>
          <span style={{ padding: '4px 12px', borderRadius: 9999, backgroundColor: 'rgba(34, 197, 94, 0.12)', color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            3 Unlocked
          </span>
          <span style={{ padding: '4px 12px', borderRadius: 9999, backgroundColor: 'rgba(0, 0, 0, 0.06)', color: '#4b5563', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            5 to Unlock
          </span>
        </div>
      </div>

      {/* 1. UNLOCKED ACHIEVEMENTS (Top Section - Full Color) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
            <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
            <path d="M4 3h16v7a8 8 0 0 1-16 0V3z" />
            <path d="M12 17v4" />
            <path d="M8 21h8" />
          </svg>
          <h4 style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#15803d', margin: 0 }}>
            Unlocked Achievements
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {/* Chef */}
          <GlassContainer
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
            <div style={{ width: 76, height: 76, borderRadius: '50%', backgroundColor: 'rgba(254, 243, 199, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(245, 158, 11, 0.3)' }}>
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.8" />
                <path d="M12 6.5l1.6 3.8 4.1.4-3.1 2.8.9 4-3.5-2.1-3.5 2.1.9-4-3.1-2.8 4.1-.4z" fill="#f59e0b" />
              </svg>
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#b45309', backgroundColor: 'rgba(245, 158, 11, 0.12)', padding: '2px 8px', borderRadius: 9999, marginBottom: 5 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Unlocked
              </div>
              <h4 style={{ fontSize: 15.5, fontWeight: 800, margin: '0 0 3px 0', color: '#000000' }}>Chef</h4>
              <p style={{ fontSize: 12, color: '#4b5563', margin: 0, lineHeight: 1.4 }}>
                Created 10+ Dishes (Activities) for the community.
              </p>
            </div>
          </GlassContainer>

          {/* Good Company */}
          <GlassContainer
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
            <div style={{ width: 76, height: 76, borderRadius: '50%', backgroundColor: 'rgba(209, 250, 229, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(16, 185, 129, 0.3)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#047857', backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: 9999, marginBottom: 5 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Unlocked
              </div>
              <h4 style={{ fontSize: 15.5, fontWeight: 800, margin: '0 0 3px 0', color: '#000000' }}>Good Company</h4>
              <p style={{ fontSize: 12, color: '#4b5563', margin: 0, lineHeight: 1.4 }}>
                Joined and participated in 15+ community Dishes.
              </p>
            </div>
          </GlassContainer>

          {/* Night Chef */}
          <GlassContainer
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
            <div style={{ width: 76, height: 76, borderRadius: '50%', backgroundColor: 'rgba(254, 240, 138, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(202, 138, 4, 0.3)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#fde047" stroke="#ca8a04" strokeWidth="1.8" />
                <path d="M19 5l.5 1.2 1.3.3-1.1.9.3 1.3-1-.7-1 .7.3-1.3-1.1-.9 1.3-.3z" fill="#ca8a04" />
              </svg>
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#ca8a04', backgroundColor: 'rgba(234, 179, 8, 0.12)', padding: '2px 8px', borderRadius: 9999, marginBottom: 5 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Unlocked
              </div>
              <h4 style={{ fontSize: 15.5, fontWeight: 800, margin: '0 0 3px 0', color: '#000000' }}>Night Chef</h4>
              <p style={{ fontSize: 12, color: '#4b5563', margin: 0, lineHeight: 1.4 }}>
                Organized late-night study or gaming activities past 11 PM.
              </p>
            </div>
          </GlassContainer>
        </div>
      </div>

      {/* 2. YET TO BE UNLOCKED (Down the line - Black & White Grayscale) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <h4 style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#6b7280', margin: 0 }}>
            Yet to Unlock (Award Library)
          </h4>
        </div>
        <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 14px 0' }}>
          These badges remain in black & white until activity milestones are achieved.
        </p>

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
              <div style={{ width: 76, height: 76, borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px dashed rgba(0, 0, 0, 0.25)' }}>
                {locked.icon}
              </div>

              <div style={{ width: '100%' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#4b5563', backgroundColor: 'rgba(0, 0, 0, 0.08)', padding: '2px 8px', borderRadius: 9999, marginBottom: 5 }}>
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

                {/* Progress bar */}
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
