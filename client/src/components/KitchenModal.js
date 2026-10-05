'use client';

import React, { useState, useEffect, useRef } from 'react';
import GlassContainer from './GlassContainer';
import FluidButton from './FluidButton';

// Minimal monochrome SVG icons for Step 2
const CATEGORY_ICONS = {
  sport: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20M2 12a14.5 14.5 0 0 0 20 0" />
    </svg>
  ),
  study: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  travel: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m17.8 19.2 1.7-2.9a2 2 0 0 0-.5-2.6l-5.6-3.8 2.2-7.5a1 1 0 0 0-1.6-.9l-3.2 2.3-3.6-2.5a1 1 0 0 0-1.4.3L4.2 4.1a1 1 0 0 0 .3 1.4l3.6 2.5-2.3 3.2a1 1 0 0 0 .9 1.6l7.5-2.2 3.8 5.6a2 2 0 0 0 2.6.5z" />
    </svg>
  ),
  food: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  ),
  gaming: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="4" />
      <path d="M6 12h4m-2-2v4m7-2h.01m3 0h.01" />
    </svg>
  ),
  social: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  help: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  learning: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
    </svg>
  ),
  other: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  )
};

const CATEGORIES = [
  { id: 'sport', label: 'Sport' },
  { id: 'study', label: 'Study' },
  { id: 'travel', label: 'Travel' },
  { id: 'food', label: 'Food' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'social', label: 'Social' },
  { id: 'help', label: 'Help' },
  { id: 'learning', label: 'Learning' },
  { id: 'other', label: 'Other' }
];

const JOIN_MODES = [
  { id: 'auto', label: 'Auto Join', tooltip: 'Instant access for anyone' },
  { id: 'approval', label: 'Request Approval', tooltip: 'Creator reviews and approves each request' },
  { id: 'invite_only', label: 'Invite Only', tooltip: 'Only invited members can join' }
];

const SKILL_LEVELS = ['Any Level', 'Beginner', 'Intermediate', 'Advanced'];

// Minimal Tooltip "i" Icon Component with Grey Styling & Smooth Hover Reveal
function InfoTooltip({ text }) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        marginLeft: 7,
        cursor: 'default'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        style={{
          width: 15,
          height: 15,
          borderRadius: '50%',
          border: '1px solid #9ca3af',
          color: '#9ca3af',
          fontSize: 10,
          fontFamily: 'serif',
          fontStyle: 'italic',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          transition: 'all 0.2s ease',
          transform: hovered ? 'scale(1.08)' : 'scale(1)'
        }}
      >
        i
      </span>
      <span
        style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: hovered ? 'translateX(-50%) translateY(0) scale(1)' : 'translateX(-50%) translateY(5px) scale(0.96)',
          opacity: hovered ? 1 : 0,
          pointerEvents: 'none',
          transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          backgroundColor: '#18181b',
          color: '#f4f4f5',
          padding: '6px 12px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          zIndex: 1100,
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.22)',
          letterSpacing: 'normal'
        }}
      >
        {text}
        {/* Downward triangle indicator */}
        <span
          style={{
            position: 'absolute',
            bottom: -4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: '4px solid #18181b'
          }}
        />
      </span>
    </span>
  );
}

export default function KitchenModal({
  isOpen,
  onClose,
  onSubmitDish,
  isSubmitting = false
}) {
  // Form State
  const [dishType, setDishType] = useState('regular'); // 'regular' | 'chefs_special'
  const [category, setCategory] = useState('');
  const [joinMode, setJoinMode] = useState('auto');
  const [capacity, setCapacity] = useState(4);
  const [unlimitedCapacity, setUnlimitedCapacity] = useState(false);
  const [areaName, setAreaName] = useState('Campus Court');
  
  // Chef's Special Customizations
  const [gender, setGender] = useState('any'); // 'any' | 'men' | 'women'
  const [instituteOnly, setInstituteOnly] = useState(false);
  const [ageMode, setAgeMode] = useState('any'); // 'any' | '18_plus' | 'under_18' | 'custom'
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [skillLevel, setSkillLevel] = useState('Any Level');

  // Description
  const [description, setDescription] = useState('');

  // Sequential Step & Sub-Step State
  // mainStep: 1..5, subStep: 1..N
  const [mainStep, setMainStep] = useState(1);
  const [subStep, setSubStep] = useState(1);
  const [direction, setDirection] = useState('forward');
  const [animating, setAnimating] = useState(false);
  const [animStage, setAnimStage] = useState('idle');
  const nextTimerRef = useRef(null);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setMainStep(1);
      setSubStep(1);
      setDirection('forward');
      setAnimating(false);
      setAnimStage('idle');
      setDishType('regular');
      setCategory('');
      setJoinMode('auto');
      setCapacity(4);
      setUnlimitedCapacity(false);
      setAreaName('Campus Court');
      setGender('any');
      setInstituteOnly(false);
      setAgeMode('any');
      setAgeMin('');
      setAgeMax('');
      setSkillLevel('Any Level');
      setDescription('');
    }
    return () => {
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isChefsSpecial = dishType === 'chefs_special';
  const totalSteps = isChefsSpecial ? 5 : 4;

  const goToSubStep = (targetMainStep, targetSubStep, dir = 'forward') => {
    if (animating || (targetMainStep === mainStep && targetSubStep === subStep)) return;
    setAnimating(true);
    setDirection(dir);
    setAnimStage('leaving');

    setTimeout(() => {
      setMainStep(targetMainStep);
      setSubStep(targetSubStep);
      setAnimStage('entering');
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimStage('idle');
          setAnimating(false);
        });
      });
    }, 140);
  };

  const handleNext = () => {
    if (mainStep === 1) {
      goToSubStep(2, 1, 'forward');
    } else if (mainStep === 2) {
      if (!category) return;
      goToSubStep(3, 1, 'forward');
    } else if (mainStep === 3) {
      if (subStep === 1) {
        goToSubStep(3, 2, 'forward');
      } else if (subStep === 2) {
        goToSubStep(3, 3, 'forward');
      } else if (subStep === 3) {
        if (isChefsSpecial) {
          goToSubStep(4, 1, 'forward');
        } else {
          goToSubStep(5, 1, 'forward');
        }
      }
    } else if (mainStep === 4) {
      if (subStep === 1) {
        goToSubStep(4, 2, 'forward');
      } else if (subStep === 2) {
        goToSubStep(4, 3, 'forward');
      } else if (subStep === 3) {
        goToSubStep(4, 4, 'forward');
      } else if (subStep === 4) {
        goToSubStep(5, 1, 'forward');
      }
    }
  };

  const handleBack = () => {
    if (mainStep === 2) {
      goToSubStep(1, 1, 'backward');
    } else if (mainStep === 3) {
      if (subStep === 1) {
        goToSubStep(2, 1, 'backward');
      } else if (subStep === 2) {
        goToSubStep(3, 1, 'backward');
      } else if (subStep === 3) {
        goToSubStep(3, 2, 'backward');
      }
    } else if (mainStep === 4) {
      if (subStep === 1) {
        goToSubStep(3, 3, 'backward');
      } else if (subStep === 2) {
        goToSubStep(4, 1, 'backward');
      } else if (subStep === 3) {
        goToSubStep(4, 2, 'backward');
      } else if (subStep === 4) {
        goToSubStep(4, 3, 'backward');
      }
    } else if (mainStep === 5) {
      if (isChefsSpecial) {
        goToSubStep(4, 4, 'backward');
      } else {
        goToSubStep(3, 3, 'backward');
      }
    }
  };

  const handleSelectCustomization = (type) => {
    setDishType(type);
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    nextTimerRef.current = setTimeout(() => {
      goToSubStep(2, 1, 'forward');
    }, 180);
  };

  const handleSelectCategory = (catId) => {
    setCategory(catId);
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    nextTimerRef.current = setTimeout(() => {
      goToSubStep(3, 1, 'forward');
    }, 180);
  };

  const handleSelectJoinMode = (modeId) => {
    setJoinMode(modeId);
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    nextTimerRef.current = setTimeout(() => {
      goToSubStep(3, 2, 'forward');
    }, 200);
  };

  const handleSelectGender = (genderId) => {
    setGender(genderId);
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    nextTimerRef.current = setTimeout(() => {
      goToSubStep(4, 2, 'forward');
    }, 200);
  };

  const handleSelectSkill = (skill) => {
    setSkillLevel(skill);
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    nextTimerRef.current = setTimeout(() => {
      goToSubStep(4, 4, 'forward');
    }, 200);
  };

  const handleSelectAgeMode = (mode) => {
    setAgeMode(mode);
    if (mode === '18_plus') {
      setAgeMin('18');
      setAgeMax('');
    } else if (mode === 'under_18') {
      setAgeMin('');
      setAgeMax('17');
    } else if (mode === 'any') {
      setAgeMin('');
      setAgeMax('');
    }
    if (mode !== 'custom') {
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
      nextTimerRef.current = setTimeout(() => {
        goToSubStep(5, 1, 'forward');
      }, 220);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!description.trim()) return;

    let computedAgeMin = null;
    let computedAgeMax = null;
    if (ageMode === '18_plus') {
      computedAgeMin = 18;
    } else if (ageMode === 'under_18') {
      computedAgeMax = 17;
    } else if (ageMode === 'custom') {
      computedAgeMin = ageMin ? Number(ageMin) : null;
      computedAgeMax = ageMax ? Number(ageMax) : null;
    }

    const payload = {
      description: description.trim(),
      category: category || 'other',
      type: dishType,
      joinMode,
      capacity: {
        max: unlimitedCapacity ? 50 : Number(capacity) || 4,
        unlimited: Boolean(unlimitedCapacity)
      },
      location: { areaName: areaName.trim() || 'Nearby' },
      eligibility: isChefsSpecial
        ? {
            gender,
            age: {
              min: computedAgeMin,
              max: computedAgeMax
            },
            instituteOnly: Boolean(instituteOnly),
            skillLevel: skillLevel === 'Any Level' ? null : skillLevel
          }
        : { gender: 'any', instituteOnly: false }
    };

    onSubmitDish(payload);
  };

  const getTransitionStyle = () => {
    const isForward = direction === 'forward';
    
    if (animStage === 'leaving') {
      return {
        opacity: 0,
        transform: isForward ? 'translateY(-10px)' : 'translateY(10px)',
        transition: 'transform 0.14s cubic-bezier(0.4, 0, 1, 1), opacity 0.14s ease-out'
      };
    }
    
    if (animStage === 'entering') {
      return {
        opacity: 0,
        transform: isForward ? 'translateY(12px)' : 'translateY(-12px)',
        transition: 'none'
      };
    }

    return {
      opacity: 1,
      transform: 'translateY(0)',
      transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease-in'
    };
  };

  // Sub-step subtitle indicator
  const getSubStepLabel = () => {
    if (mainStep === 1) return 'Choose Customization';
    if (mainStep === 2) return 'Category';
    if (mainStep === 3) {
      if (subStep === 1) return 'Join Mode';
      if (subStep === 2) return 'Capacity';
      return 'Location';
    }
    if (mainStep === 4) {
      if (subStep === 1) return 'Gender';
      if (subStep === 2) return 'Institute';
      if (subStep === 3) return 'Skill Level';
      return 'Age';
    }
    return 'Description';
  };

  const canGoBack = !(mainStep === 1 && subStep === 1);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.52)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
      onClick={onClose}
    >
      {/* Sized Main Container (580px x 470px) - Spacious, zero scrolling */}
      <GlassContainer
        radius={28}
        style={{
          width: 580,
          maxWidth: '94vw',
          height: 470,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column'
        }}
        innerStyle={{
          padding: '24px 32px',
          color: '#101214',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Step Indicator & Close */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {canGoBack && (
              <button
                type="button"
                onClick={handleBack}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  fontSize: 16,
                  color: '#4b5563',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Back"
              >
                ←
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase', color: '#6b7280' }}>
                Step {mainStep} of {totalSteps}
              </span>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>•</span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: '#101214' }}>
                {getSubStepLabel()}
              </span>
              <div style={{ display: 'flex', gap: 4, marginLeft: 6 }}>
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i + 1 === mainStep ? 18 : 6,
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: i + 1 <= mainStep ? '#101214' : 'rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.25s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <FluidButton
            variant="icon"
            onClick={onClose}
            style={{ width: 28, height: 28, minWidth: 28, minHeight: 28 }}
            title="Close"
          >
            ✕
          </FluidButton>
        </div>

        {/* Dynamic Guided Flow Body - Centered Viewport */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <div style={{ ...getTransitionStyle(), width: '100%', maxWidth: 460 }}>
            
            {/* STEP 1: CHOOSE CUSTOMIZATION */}
            {mainStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ fontSize: 23, fontWeight: 800, margin: '0 0 32px 0', letterSpacing: '-0.3px', color: '#101214', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  Choose Customization
                  <InfoTooltip text="Select the type of Dish you'd like to cook." />
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleSelectCustomization('regular')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: dishType === 'regular' ? 700 : 500,
                        color: '#101214',
                        borderBottom: dishType === 'regular' ? '2px solid #101214' : '2px solid transparent',
                        paddingBottom: 2,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Regular
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectCustomization('chefs_special')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 0',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 10
                    }}
                  >
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: dishType === 'chefs_special' ? 700 : 500,
                        color: '#101214',
                        borderBottom: dishType === 'chefs_special' ? '2px solid #101214' : '2px solid transparent',
                        paddingBottom: 2,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Chef's Special
                    </span>
                    <span style={{ fontSize: 13, color: '#71717a', fontStyle: 'italic' }}>
                      more customization
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CATEGORY */}
            {mainStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ fontSize: 23, fontWeight: 800, margin: '0 0 24px 0', letterSpacing: '-0.3px', color: '#101214', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  What are we cooking?
                  <InfoTooltip text="Pick the category that best fits your activity." />
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px 20px', width: '100%' }}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 4px',
                          color: '#101214',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        <span style={{ color: '#101214' }}>
                          {CATEGORY_ICONS[cat.id]}
                        </span>
                        <span
                          style={{
                            fontSize: 13.5,
                            fontWeight: isSelected ? 700 : 500,
                            color: '#101214',
                            borderBottom: isSelected ? '2px solid #101214' : '2px solid transparent',
                            paddingBottom: 2
                          }}
                        >
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3.1: JOIN MODE */}
            {mainStep === 3 && subStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ fontSize: 23, fontWeight: 800, margin: '0 0 32px 0', letterSpacing: '-0.3px', color: '#101214', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  Join Mode
                  <InfoTooltip text="Control who can join your dish." />
                </h2>

                <div style={{ display: 'flex', gap: 26, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                  {JOIN_MODES.map((m) => {
                    const isSelected = joinMode === m.id;
                    return (
                      <div key={m.id} style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleSelectJoinMode(m.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: 16,
                            fontWeight: isSelected ? 700 : 500,
                            color: '#101214',
                            borderBottom: isSelected ? '2px solid #101214' : '2px solid transparent',
                            paddingBottom: 2,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {m.label}
                        </button>
                        <InfoTooltip text={m.tooltip} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3.2: CAPACITY */}
            {mainStep === 3 && subStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ fontSize: 23, fontWeight: 800, margin: '0 0 24px 0', letterSpacing: '-0.3px', color: '#101214', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  Capacity
                  <InfoTooltip text="Choose the number of seats or allow unlimited." />
                </h2>

                {/* Animated Segmented Switch for Limited vs Unlimited */}
                <div
                  style={{
                    display: 'inline-flex',
                    background: 'rgba(0, 0, 0, 0.06)',
                    borderRadius: 9999,
                    padding: 3,
                    marginBottom: 28,
                    border: '1px solid rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setUnlimitedCapacity(false)}
                    style={{
                      background: !unlimitedCapacity ? '#ffffff' : 'transparent',
                      color: '#101214',
                      border: 'none',
                      borderRadius: 9999,
                      padding: '6px 18px',
                      fontSize: 13,
                      fontWeight: !unlimitedCapacity ? 700 : 500,
                      cursor: 'pointer',
                      boxShadow: !unlimitedCapacity ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    Fixed Seats
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnlimitedCapacity(true)}
                    style={{
                      background: unlimitedCapacity ? '#ffffff' : 'transparent',
                      color: '#101214',
                      border: 'none',
                      borderRadius: 9999,
                      padding: '6px 18px',
                      fontSize: 13,
                      fontWeight: unlimitedCapacity ? 700 : 500,
                      cursor: 'pointer',
                      boxShadow: unlimitedCapacity ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    Unlimited ∞
                  </button>
                </div>

                {/* Switch Content with Smooth Transition */}
                {!unlimitedCapacity ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <button
                      type="button"
                      onClick={() => setCapacity((c) => Math.max(2, c - 1))}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 24,
                        fontWeight: 700,
                        color: '#101214',
                        padding: '4px 12px',
                        lineHeight: 1
                      }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: 26, fontWeight: 700, minWidth: 44, textAlign: 'center', color: '#101214' }}>
                      {capacity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCapacity((c) => Math.min(50, c + 1))}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 24,
                        fontWeight: 700,
                        color: '#101214',
                        padding: '4px 12px',
                        lineHeight: 1
                      }}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#101214', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 20 }}>∞</span> Open to Any Number
                  </div>
                )}
              </div>
            )}

            {/* STEP 3.3: LOCATION */}
            {mainStep === 3 && subStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ fontSize: 23, fontWeight: 800, margin: '0 0 24px 0', letterSpacing: '-0.3px', color: '#101214', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  Location
                  <InfoTooltip text="Specify where participants should meet." />
                </h2>

                <div style={{ width: '100%', maxWidth: 320 }}>
                  <input
                    type="text"
                    autoFocus
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleNext();
                      }
                    }}
                    placeholder="e.g. Campus Court"
                    style={{
                      width: '100%',
                      border: 'none',
                      borderBottom: '1.5px solid #101214',
                      backgroundColor: 'transparent',
                      padding: '0 0 2px 0',
                      fontSize: 18,
                      fontWeight: 600,
                      color: '#101214',
                      textAlign: 'center',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            {/* STEP 4.1: GENDER ELIGIBILITY */}
            {mainStep === 4 && subStep === 1 && isChefsSpecial && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ fontSize: 23, fontWeight: 800, margin: '0 0 32px 0', letterSpacing: '-0.3px', color: '#101214', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  Gender Eligibility
                  <InfoTooltip text="Filter by participant gender preference." />
                </h2>

                <div style={{ display: 'flex', gap: 26, justifyContent: 'center', alignItems: 'center' }}>
                  {[
                    { id: 'any', label: 'Any' },
                    { id: 'men', label: 'Men Only' },
                    { id: 'women', label: 'Women Only' }
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleSelectGender(g.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: 16,
                        fontWeight: gender === g.id ? 700 : 500,
                        color: '#101214',
                        borderBottom: gender === g.id ? '2px solid #101214' : '2px solid transparent',
                        paddingBottom: 2,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4.2: INSTITUTE RESTRICTION */}
            {mainStep === 4 && subStep === 2 && isChefsSpecial && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ fontSize: 23, fontWeight: 800, margin: '0 0 32px 0', letterSpacing: '-0.3px', color: '#101214', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  Institute Restriction
                  <InfoTooltip text="Limit dish joining to members of your verified institute." />
                </h2>

                {/* Better Custom Animated Tick Box */}
                <div
                  onClick={() => setInstituteOnly(!instituteOnly)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      border: '1.5px solid #101214',
                      backgroundColor: instituteOnly ? '#101214' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    {instituteOnly && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#101214' }}>
                    Institute Students Only
                  </span>
                </div>
              </div>
            )}

            {/* STEP 4.3: SKILL SELECTION */}
            {mainStep === 4 && subStep === 3 && isChefsSpecial && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ fontSize: 23, fontWeight: 800, margin: '0 0 32px 0', letterSpacing: '-0.3px', color: '#101214', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  Skill Level
                  <InfoTooltip text="Set expected skill or experience level." />
                </h2>

                <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                  {SKILL_LEVELS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSelectSkill(s)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: 16,
                        fontWeight: skillLevel === s ? 700 : 500,
                        color: '#101214',
                        borderBottom: skillLevel === s ? '2px solid #101214' : '2px solid transparent',
                        paddingBottom: 2,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4.4: AGE SELECTION */}
            {mainStep === 4 && subStep === 4 && isChefsSpecial && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ fontSize: 23, fontWeight: 800, margin: '0 0 28px 0', letterSpacing: '-0.3px', color: '#101214', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  Age Requirement
                  <InfoTooltip text="Directly pick 18+, under 18, or custom range." />
                </h2>

                {/* Direct quick choices */}
                <div style={{ display: 'flex', gap: 22, justifyContent: 'center', alignItems: 'center', marginBottom: ageMode === 'custom' ? 24 : 0 }}>
                  {[
                    { id: 'any', label: 'Any Age' },
                    { id: '18_plus', label: '18+' },
                    { id: 'under_18', label: 'Under 18' },
                    { id: 'custom', label: 'Custom' }
                  ].map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => handleSelectAgeMode(a.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: 16,
                        fontWeight: ageMode === a.id ? 700 : 500,
                        color: '#101214',
                        borderBottom: ageMode === a.id ? '2px solid #101214' : '2px solid transparent',
                        paddingBottom: 2,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>

                {/* Custom range input with text sitting on the line */}
                {ageMode === 'custom' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="number"
                      placeholder="Min"
                      min={12}
                      max={99}
                      value={ageMin}
                      onChange={(e) => setAgeMin(e.target.value)}
                      style={{
                        width: 50,
                        border: 'none',
                        borderBottom: '1.5px solid #101214',
                        backgroundColor: 'transparent',
                        padding: '0 0 2px 0',
                        fontSize: 16,
                        fontWeight: 600,
                        textAlign: 'center',
                        color: '#101214',
                        outline: 'none'
                      }}
                    />
                    <span style={{ color: '#101214', fontWeight: 600 }}>—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      min={12}
                      max={99}
                      value={ageMax}
                      onChange={(e) => setAgeMax(e.target.value)}
                      style={{
                        width: 50,
                        border: 'none',
                        borderBottom: '1.5px solid #101214',
                        backgroundColor: 'transparent',
                        padding: '0 0 2px 0',
                        fontSize: 16,
                        fontWeight: 600,
                        textAlign: 'center',
                        color: '#101214',
                        outline: 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: DESCRIBE YOUR DISH */}
            {mainStep === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <h2 style={{ fontSize: 23, fontWeight: 800, margin: '0 0 20px 0', letterSpacing: '-0.3px', color: '#101214', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  Describe your Dish
                  <InfoTooltip text="Tell others what you're planning and what to expect." />
                </h2>

                <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 420 }}>
                  {/* Single line sitting right on bottom border */}
                  <textarea
                    autoFocus
                    required
                    rows={2}
                    maxLength={500}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Badminton doubles match at 6 PM near campus court..."
                    style={{
                      width: '100%',
                      border: 'none',
                      borderBottom: '1.5px solid #101214',
                      backgroundColor: 'transparent',
                      padding: '0 0 2px 0',
                      fontSize: 16,
                      fontWeight: 500,
                      color: '#101214',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      lineHeight: 1.45,
                      textAlign: 'center',
                      resize: 'none',
                      outline: 'none',
                      transition: 'border-color 0.15s ease'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                    <div style={{ fontSize: 11.5, color: '#71717a' }}>
                      {description.length} / 500
                    </div>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>

        {/* Navigation Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 14,
            paddingTop: 14,
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            flexShrink: 0
          }}
        >
          {/* Cancel button is always on the left */}
          <FluidButton
            type="button"
            onClick={onClose}
            style={{ padding: '6px 16px', fontSize: 13, fontWeight: 600, color: '#4b5563' }}
          >
            Cancel
          </FluidButton>

          {/* Right Action Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {mainStep < 5 ? (
              <>
                {canGoBack && (
                  <FluidButton
                    type="button"
                    onClick={handleBack}
                    style={{ padding: '6px 16px', fontSize: 13, fontWeight: 600 }}
                  >
                    Back
                  </FluidButton>
                )}

                <FluidButton
                  type="button"
                  onClick={handleNext}
                  disabled={mainStep === 2 && !category}
                  style={{
                    padding: '6px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    opacity: mainStep === 2 && !category ? 0.45 : 1,
                    cursor: mainStep === 2 && !category ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </FluidButton>
              </>
            ) : (
              <>
                <FluidButton
                  type="button"
                  onClick={handleBack}
                  style={{ padding: '6px 16px', fontSize: 13, fontWeight: 600 }}
                >
                  Back
                </FluidButton>
                <FluidButton
                  type="button"
                  onClick={handleSubmit}
                  disabled={!description.trim() || isSubmitting}
                  style={{
                    padding: '7px 24px',
                    fontSize: 13.5,
                    fontWeight: 700,
                    opacity: !description.trim() || isSubmitting ? 0.45 : 1,
                    cursor: !description.trim() || isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? 'Cooking...' : "Let's Cook"}
                </FluidButton>
              </>
            )}
          </div>
        </div>
      </GlassContainer>
    </div>
  );
}

