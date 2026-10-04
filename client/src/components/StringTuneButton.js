'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

/**
 * StringTuneButton
 * Faithfully reproduces the button style and interaction from https://string-tune.fiddle.digital/
 * 
 * Features:
 * - Capsule / Pill shape (or circular icon) with exact CSS tokens from StringTune
 * - Translucent glass background with backdrop blur and inner edge vignette
 * - 1px mask-composite border with dynamic 360° cursor spotlight angle & distance tracking
 * - Smooth spring-bounce scale on hover (cubic-bezier(0.6, 0.5, 0, 3))
 * - Flashing specular glare shine animation on hover
 * - Responsive press/active scale compression
 * - Dynamic --skX and --skY elastic expansion based on button dimensions
 */
export default function StringTuneButton({
  children,
  onClick,
  className = '',
  style = {},
  variant = 'pill', // 'pill' | 'icon' | 'circle'
  disabled = false,
  type = 'button',
  as: Component = 'button',
  ...restProps
}) {
  const btnRef = useRef(null);
  const [skX, setSkX] = useState(0.05);
  const [skY, setSkY] = useState(0.12);
  const currentAngleRef = useRef(-45);
  const targetAngleRef = useRef(-45);
  const currentDistRef = useRef(500);
  const targetDistRef = useRef(500);
  const isHoveredRef = useRef(false);
  const animFrameRef = useRef(null);

  // Measure button dimensions to compute StringTune bubbleSize ratios (--skX, --skY)
  const updateMetrics = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const bubbleSize = 3.6; // px (~0.2rem)
    const newSkX = (rect.width + bubbleSize * 2) / (rect.width || 1) - 1;
    const newSkY = (rect.height + bubbleSize * 2) / (rect.height || 1) - 1;
    setSkX(Number.isFinite(newSkX) ? Math.max(0.02, Math.min(newSkX, 0.25)) : 0.05);
    setSkY(Number.isFinite(newSkY) ? Math.max(0.04, Math.min(newSkY, 0.35)) : 0.12);
  }, []);

  useEffect(() => {
    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, [updateMetrics]);

  // Smooth lerp loop for spotlight angle & distance
  const tick = useCallback(() => {
    if (!btnRef.current) return;

    // Shortest angular distance interpolation
    const curA = currentAngleRef.current;
    const tgtA = targetAngleRef.current;
    let diffA = ((tgtA - curA + 180) % 360) - 180;
    
    // Lerp angle (15% per frame as in StringTune's adaptiveLerp)
    currentAngleRef.current = curA + diffA * 0.15;
    
    // Lerp distance
    currentDistRef.current += (targetDistRef.current - currentDistRef.current) * 0.15;

    const angleDeg = Math.round(currentAngleRef.current * 10) / 10;
    const distPx = Math.round(currentDistRef.current * 10) / 10;

    btnRef.current.style.setProperty('--spotlight-angle', `${angleDeg}`);
    btnRef.current.style.setProperty('--spotlight-distance', `${distPx}`);

    // Continue loop if not settled
    if (Math.abs(diffA) > 0.1 || Math.abs(targetDistRef.current - currentDistRef.current) > 1 || isHoveredRef.current) {
      animFrameRef.current = requestAnimationFrame(tick);
    } else {
      animFrameRef.current = null;
    }
  }, []);

  const startAnimIfNeeded = useCallback(() => {
    if (!animFrameRef.current) {
      animFrameRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  // Window pointer tracker for spotlight border effect (StringTune spotlights track cursor across viewport)
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      // StringTune: Math.atan2(dy, dx) converted to degrees with -90° offset
      const rad = Math.atan2(dy, dx);
      targetAngleRef.current = rad * (180 / Math.PI) - 90;
      targetDistRef.current = Math.hypot(dx, dy);

      startAnimIfNeeded();
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [startAnimIfNeeded]);

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    startAnimIfNeeded();
  };

  const handleMouseMove = (e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    // Normalized cursor coordinate inside button for inner glare position
    const relX = (e.clientX - rect.left) / (rect.width || 1) - 0.5;
    const relY = (e.clientY - rect.top) / (rect.height || 1) - 0.5;
    btnRef.current.style.setProperty('--x', `${Math.round(relX * 100) / 100}`);
    btnRef.current.style.setProperty('--y', `${Math.round(relY * 100) / 100}`);
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    targetAngleRef.current = -45; // return smoothly to resting spotlight angle
    targetDistRef.current = 500;
    startAnimIfNeeded();
  };

  const isIcon = variant === 'icon' || variant === 'circle';

  return (
    <Component
      ref={btnRef}
      type={Component === 'button' ? type : undefined}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`st-btn ${isIcon ? 'st-btn-icon' : ''} ${className}`}
      style={{
        '--skX': skX,
        '--skY': skY,
        ...style
      }}
      {...restProps}
    >
      <span className="st-glare" />
      <span className="st-content">
        {children}
      </span>
    </Component>
  );
}
