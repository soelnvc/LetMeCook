'use client';

import React, { useState, useEffect, useRef } from 'react';
import GlassContainer from './GlassContainer';
import FluidButton from './FluidButton';

const CATEGORIES = [
  { id: 'sport', label: 'Sport', icon: '⚽' },
  { id: 'study', label: 'Study', icon: '📚' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'food', label: 'Food', icon: '🍳' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'social', label: 'Social', icon: '💬' },
  { id: 'help', label: 'Help', icon: '🤝' },
  { id: 'learning', label: 'Learning', icon: '💡' },
  { id: 'other', label: 'Other', icon: '🌐' }
];

const JOIN_MODES = [
  { id: 'auto', label: 'Auto Join', desc: 'Instant access for anyone' },
  { id: 'approval', label: 'Request Approval', desc: 'Creator reviews and approves' },
  { id: 'invite_only', label: 'Invite Only', desc: 'Only invited members can join' }
];

const SKILL_LEVELS = ['Any Level', 'Beginner', 'Intermediate', 'Advanced'];

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
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [skillLevel, setSkillLevel] = useState('Any Level');

  // Description
  const [description, setDescription] = useState('');

  // Step Management: 1: Customization, 2: Category, 3: Join Mode + Capacity, 4: Chef's Special (if applicable), 5: Description
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('forward'); // 'forward' | 'backward'
  const [animating, setAnimating] = useState(false);
  const [animStage, setAnimStage] = useState('idle'); // 'idle' | 'leaving' | 'entering'
  const nextTimerRef = useRef(null);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
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

  // Determine total steps: 4 for Regular (1, 2, 3, 5), 5 for Chef's Special (1, 2, 3, 4, 5)
  const isChefsSpecial = dishType === 'chefs_special';
  const totalSteps = isChefsSpecial ? 5 : 4;
  
  // Display step number for user progress
  const displayStepNumber = () => {
    if (step === 1) return 1;
    if (step === 2) return 2;
    if (step === 3) return 3;
    if (step === 4) return 4;
    return isChefsSpecial ? 5 : 4;
  };

  // Step transition helper
  const goToStep = (nextStep, dir = 'forward') => {
    if (animating || nextStep === step) return;
    setAnimating(true);
    setDirection(dir);
    setAnimStage('leaving');

    setTimeout(() => {
      setStep(nextStep);
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
    if (step === 1) {
      goToStep(2, 'forward');
    } else if (step === 2) {
      if (!category) return;
      goToStep(3, 'forward');
    } else if (step === 3) {
      if (isChefsSpecial) {
        goToStep(4, 'forward');
      } else {
        goToStep(5, 'forward');
      }
    } else if (step === 4) {
      goToStep(5, 'forward');
    }
  };

  const handleBack = () => {
    if (step === 2) {
      goToStep(1, 'backward');
    } else if (step === 3) {
      goToStep(2, 'backward');
    } else if (step === 4) {
      goToStep(3, 'backward');
    } else if (step === 5) {
      if (isChefsSpecial) {
        goToStep(4, 'backward');
      } else {
        goToStep(3, 'backward');
      }
    }
  };

  // Auto advance on selection with subtle delay
  const handleSelectCustomization = (type) => {
    setDishType(type);
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    nextTimerRef.current = setTimeout(() => {
      goToStep(2, 'forward');
    }, 180);
  };

  const handleSelectCategory = (catId) => {
    setCategory(catId);
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    nextTimerRef.current = setTimeout(() => {
      goToStep(3, 'forward');
    }, 180);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!description.trim()) return;

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
              min: ageMin ? Number(ageMin) : null,
              max: ageMax ? Number(ageMax) : null
            },
            instituteOnly: Boolean(instituteOnly),
            skillLevel: skillLevel === 'Any Level' ? null : skillLevel
          }
        : { gender: 'any', instituteOnly: false }
    };

    onSubmitDish(payload);
  };

  // Determine if Step 4 has any active customizations
  const hasChefsSpecialCustomizations =
    gender !== 'any' ||
    instituteOnly ||
    ageMin !== '' ||
    ageMax !== '' ||
    skillLevel !== 'Any Level';

  // Animation inline styles based on animStage and direction
  const getTransitionStyle = () => {
    const isForward = direction === 'forward';
    
    if (animStage === 'leaving') {
      return {
        opacity: 0,
        transform: isForward ? 'translateY(-12px)' : 'translateY(12px)',
        transition: 'transform 0.14s cubic-bezier(0.4, 0, 1, 1), opacity 0.14s ease-out'
      };
    }
    
    if (animStage === 'entering') {
      return {
        opacity: 0,
        transform: isForward ? 'translateY(14px)' : 'translateY(-14px)',
        transition: 'none'
      };
    }

    return {
      opacity: 1,
      transform: 'translateY(0)',
      transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease-in'
    };
  };

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
      <GlassContainer
        radius={28}
        style={{ width: '100%', maxWidth: 540 }}
        innerStyle={{
          padding: '28px 32px',
          color: '#101214',
          position: 'relative',
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
            marginBottom: 20
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px 6px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase', color: '#6b7280' }}>
                Step {displayStepNumber()} of {totalSteps}
              </span>
              <div style={{ display: 'flex', gap: 4, marginLeft: 6 }}>
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i + 1 === displayStepNumber() ? 18 : 6,
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: i + 1 <= displayStepNumber() ? '#101214' : 'rgba(0, 0, 0, 0.15)',
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
            style={{ width: 30, height: 30, minWidth: 30, minHeight: 30 }}
            title="Close"
          >
            ✕
          </FluidButton>
        </div>

        {/* Dynamic Guided Flow Body */}
        <div style={{ minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={getTransitionStyle()}>
            {/* STEP 1: CHOOSE CUSTOMIZATION */}
            {step === 1 && (
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.4px', color: '#101214' }}>
                  Choose Customization
                </h2>
                <p style={{ fontSize: 13.5, color: '#544d56', margin: '0 0 22px 0' }}>
                  Select the type of Dish you'd like to cook.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {/* Regular Card */}
                  <div
                    onClick={() => handleSelectCustomization('regular')}
                    style={{
                      borderRadius: 20,
                      padding: '20px 18px',
                      cursor: 'pointer',
                      border: dishType === 'regular' ? '1.5px solid #101214' : '1.5px solid rgba(0, 0, 0, 0.08)',
                      backgroundColor: dishType === 'regular' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.35)',
                      boxShadow: dishType === 'regular' ? 'inset 0 0 16px rgba(0, 0, 0, 0.05)' : 'none',
                      transition: 'all 0.18s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                  >
                    <div style={{ fontSize: 28 }}>🍽️</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#101214' }}>Regular</div>
                    <div style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.35 }}>
                      Open to all students with standard joining rules.
                    </div>
                  </div>

                  {/* Chef's Special Card */}
                  <div
                    onClick={() => handleSelectCustomization('chefs_special')}
                    style={{
                      borderRadius: 20,
                      padding: '20px 18px',
                      cursor: 'pointer',
                      border: dishType === 'chefs_special' ? '1.5px solid #101214' : '1.5px solid rgba(0, 0, 0, 0.08)',
                      backgroundColor: dishType === 'chefs_special' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.35)',
                      boxShadow: dishType === 'chefs_special' ? 'inset 0 0 16px rgba(0, 0, 0, 0.05)' : 'none',
                      transition: 'all 0.18s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                  >
                    <div style={{ fontSize: 28 }}>⭐</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#101214' }}>Chef's Special</div>
                    <div style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.35 }}>
                      Custom criteria: gender, age, institute, or skill.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CATEGORY */}
            {step === 2 && (
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.4px', color: '#101214' }}>
                  What are we cooking?
                </h2>
                <p style={{ fontSize: 13.5, color: '#544d56', margin: '0 0 18px 0' }}>
                  Pick the category that best fits your activity.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.id)}
                        style={{
                          borderRadius: 16,
                          padding: '12px 10px',
                          cursor: 'pointer',
                          border: isSelected ? '1.5px solid #101214' : '1.5px solid rgba(0, 0, 0, 0.08)',
                          backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.4)',
                          boxShadow: isSelected ? 'inset 0 0 12px rgba(0, 0, 0, 0.05)' : 'none',
                          textAlign: 'center',
                          transition: 'all 0.16s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <span style={{ fontSize: 22 }}>{cat.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 600, color: '#101214' }}>
                          {cat.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: JOIN MODE + CAPACITY */}
            {step === 3 && (
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.4px', color: '#101214' }}>
                  Join Mode & Capacity
                </h2>
                <p style={{ fontSize: 13.5, color: '#544d56', margin: '0 0 16px 0' }}>
                  Control who can join and how many seats are available.
                </p>

                {/* Join Mode Selector */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#4b5563', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Join Mode
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {JOIN_MODES.map((m) => {
                      const isSelected = joinMode === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => setJoinMode(m.id)}
                          style={{
                            borderRadius: 14,
                            padding: '10px 8px',
                            cursor: 'pointer',
                            border: isSelected ? '1.5px solid #101214' : '1.5px solid rgba(0, 0, 0, 0.08)',
                            backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.4)',
                            transition: 'all 0.16s ease',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 600, color: '#101214' }}>
                            {m.label}
                          </div>
                          <div style={{ fontSize: 10.5, color: '#6b7280', marginTop: 2, lineHeight: 1.2 }}>
                            {m.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Capacity + Area */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Capacity
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#4b5563', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={unlimitedCapacity}
                          onChange={(e) => setUnlimitedCapacity(e.target.checked)}
                          style={{ accentColor: '#101214' }}
                        />
                        Unlimited
                      </label>
                    </div>

                    {!unlimitedCapacity ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => setCapacity((c) => Math.max(2, c - 1))}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            border: '1px solid rgba(0, 0, 0, 0.15)',
                            background: '#ffffff',
                            cursor: 'pointer',
                            fontSize: 16,
                            fontWeight: 700
                          }}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={2}
                          max={50}
                          value={capacity}
                          onChange={(e) => setCapacity(Number(e.target.value))}
                          style={{
                            flex: 1,
                            height: 36,
                            textAlign: 'center',
                            borderRadius: 10,
                            border: '1px solid rgba(0, 0, 0, 0.15)',
                            background: 'rgba(255, 255, 255, 0.7)',
                            fontSize: 15,
                            fontWeight: 700,
                            color: '#101214'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setCapacity((c) => Math.min(50, c + 1))}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            border: '1px solid rgba(0, 0, 0, 0.15)',
                            background: '#ffffff',
                            cursor: 'pointer',
                            fontSize: 16,
                            fontWeight: 700
                          }}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <div style={{ height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#15803d', background: 'rgba(255, 255, 255, 0.6)', borderRadius: 10 }}>
                        ∞ Open to Any Number
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#4b5563', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Location / Area
                    </label>
                    <input
                      type="text"
                      value={areaName}
                      onChange={(e) => setAreaName(e.target.value)}
                      placeholder="e.g. Campus Court"
                      style={{
                        width: '100%',
                        height: 36,
                        padding: '0 12px',
                        borderRadius: 10,
                        border: '1px solid rgba(0, 0, 0, 0.15)',
                        background: 'rgba(255, 255, 255, 0.7)',
                        fontSize: 13.5,
                        color: '#101214',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: CHEF'S SPECIAL CUSTOMIZATIONS */}
            {step === 4 && isChefsSpecial && (
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.4px', color: '#101214' }}>
                  Chef's Special Customizations
                </h2>
                <p style={{ fontSize: 13.5, color: '#544d56', margin: '0 0 16px 0' }}>
                  Set eligibility criteria for your exclusive Dish.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Gender Eligibility */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Gender Eligibility
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {[
                        { id: 'any', label: 'Any Gender' },
                        { id: 'men', label: 'Men Only' },
                        { id: 'women', label: 'Women Only' }
                      ].map((g) => (
                        <div
                          key={g.id}
                          onClick={() => setGender(g.id)}
                          style={{
                            padding: '8px 6px',
                            textAlign: 'center',
                            borderRadius: 12,
                            cursor: 'pointer',
                            fontSize: 12.5,
                            fontWeight: gender === g.id ? 700 : 500,
                            border: gender === g.id ? '1.5px solid #101214' : '1px solid rgba(0, 0, 0, 0.1)',
                            backgroundColor: gender === g.id ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {g.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Institute & Skill Level */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Institute Restriction
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: 12, border: '1px solid rgba(0, 0, 0, 0.1)', cursor: 'pointer', fontSize: 13 }}>
                        <input
                          type="checkbox"
                          checked={instituteOnly}
                          onChange={(e) => setInstituteOnly(e.target.checked)}
                          style={{ accentColor: '#101214' }}
                        />
                        <span style={{ fontWeight: 600 }}>Institute Only</span>
                      </label>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Skill / Experience
                      </label>
                      <select
                        value={skillLevel}
                        onChange={(e) => setSkillLevel(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 10px',
                          borderRadius: 12,
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          background: 'rgba(255, 255, 255, 0.5)',
                          fontSize: 13,
                          color: '#101214',
                          fontWeight: 500
                        }}
                      >
                        {SKILL_LEVELS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Age Range */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Age Range (Optional)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="number"
                        placeholder="Min Age"
                        min={16}
                        max={80}
                        value={ageMin}
                        onChange={(e) => setAgeMin(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: 10,
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          background: 'rgba(255, 255, 255, 0.5)',
                          fontSize: 13
                        }}
                      />
                      <span style={{ color: '#6b7280', fontSize: 13 }}>to</span>
                      <input
                        type="number"
                        placeholder="Max Age"
                        min={16}
                        max={80}
                        value={ageMax}
                        onChange={(e) => setAgeMax(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: 10,
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          background: 'rgba(255, 255, 255, 0.5)',
                          fontSize: 13
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: DESCRIPTION */}
            {step === 5 && (
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.4px', color: '#101214' }}>
                  Describe your Dish
                </h2>
                <p style={{ fontSize: 13.5, color: '#544d56', margin: '0 0 16px 0' }}>
                  Tell others what you're planning and what to expect.
                </p>

                <form onSubmit={handleSubmit}>
                  <textarea
                    autoFocus
                    required
                    rows={4}
                    maxLength={500}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Badminton doubles match at 6 PM near campus court. Need 2 more players, rackets provided!"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 16,
                      border: '1.5px solid rgba(0, 0, 0, 0.12)',
                      background: 'rgba(255, 255, 255, 0.7)',
                      fontSize: 14.5,
                      color: '#101214',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      lineHeight: 1.45,
                      resize: 'none',
                      outline: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <div style={{ fontSize: 11.5, color: '#6b7280' }}>
                      {description.length} / 500 characters
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
            marginTop: 22,
            paddingTop: 16,
            borderTop: '1px solid rgba(0, 0, 0, 0.08)'
          }}
        >
          {/* Cancel button is always on the left */}
          <FluidButton
            type="button"
            onClick={onClose}
            style={{ padding: '8px 20px', fontSize: 13.5, fontWeight: 600, color: '#4b5563' }}
          >
            Cancel
          </FluidButton>

          {/* Right Action Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step < 5 ? (
              <>
                {step > 1 && (
                  <FluidButton
                    type="button"
                    onClick={handleBack}
                    style={{ padding: '8px 20px', fontSize: 13.5, fontWeight: 600 }}
                  >
                    Back
                  </FluidButton>
                )}

                {/* Show Skip on Step 4 if optional and no custom filters set, else Next */}
                {step === 4 ? (
                  !hasChefsSpecialCustomizations ? (
                    <FluidButton
                      type="button"
                      onClick={handleNext}
                      style={{ padding: '8px 22px', fontSize: 13.5, fontWeight: 600 }}
                    >
                      Skip
                    </FluidButton>
                  ) : (
                    <FluidButton
                      type="button"
                      onClick={handleNext}
                      style={{ padding: '8px 24px', fontSize: 13.5, fontWeight: 600 }}
                    >
                      Next
                    </FluidButton>
                  )
                ) : (
                  <FluidButton
                    type="button"
                    onClick={handleNext}
                    disabled={step === 2 && !category}
                    style={{
                      padding: '8px 24px',
                      fontSize: 13.5,
                      fontWeight: 600,
                      opacity: step === 2 && !category ? 0.45 : 1,
                      cursor: step === 2 && !category ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Next
                  </FluidButton>
                )}
              </>
            ) : (
              /* Description Step: STRICTLY Cancel | Let's Cook */
              <FluidButton
                type="button"
                onClick={handleSubmit}
                disabled={!description.trim() || isSubmitting}
                style={{
                  padding: '9px 28px',
                  fontSize: 14,
                  fontWeight: 700,
                  opacity: !description.trim() || isSubmitting ? 0.45 : 1,
                  cursor: !description.trim() || isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Cooking...' : "Let's Cook"}
              </FluidButton>
            )}
          </div>
        </div>
      </GlassContainer>
    </div>
  );
}
