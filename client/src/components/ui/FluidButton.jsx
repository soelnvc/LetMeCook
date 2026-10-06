'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

/**
 * FluidButton
 * Interactive glassmorphic button with elastic physics, edge vignette,
 * and 360-degree specular spotlight border tracking.
 */
export default function FluidButton({
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

  const updateMetrics = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const bubbleSize = 3.6;
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

  const tick = useCallback(() => {
    if (!btnRef.current) return;

    const curA = currentAngleRef.current;
    const tgtA = targetAngleRef.current;
    const diffA = ((tgtA - curA + 180) % 360) - 180;
    
    currentAngleRef.current = curA + diffA * 0.15;
    currentDistRef.current += (targetDistRef.current - currentDistRef.current) * 0.15;

    const angleDeg = Math.round(currentAngleRef.current * 10) / 10;
    const distPx = Math.round(currentDistRef.current * 10) / 10;

    btnRef.current.style.setProperty('--spotlight-angle', `${angleDeg}`);
    btnRef.current.style.setProperty('--spotlight-distance', `${distPx}`);

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

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

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
    const relX = (e.clientX - rect.left) / (rect.width || 1) - 0.5;
    const relY = (e.clientY - rect.top) / (rect.height || 1) - 0.5;
    btnRef.current.style.setProperty('--x', `${Math.round(relX * 100) / 100}`);
    btnRef.current.style.setProperty('--y', `${Math.round(relY * 100) / 100}`);
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    targetAngleRef.current = -45;
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
      className={`btn-fluid ${isIcon ? 'btn-fluid-icon' : ''} ${className}`}
      style={{
        '--skX': skX,
        '--skY': skY,
        ...style
      }}
      {...restProps}
    >
      <span className="btn-glare" />
      <span className="btn-label" style={{ fontWeight: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
        {children}
      </span>
    </Component>
  );
}
