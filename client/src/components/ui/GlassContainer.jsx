'use client';

import React, { useState, useRef, useEffect } from 'react';

/**
 * GlassContainer
 * - Curved corners (default radius 28px)
 * - Translucent frosted glass fill with backdrop blur
 * - Subtle inner vignette (inset shadows that softly darken the perimeter)
 * - Border with 2 opposite side placed white light highlights that dynamically respond to mouse
 * - Smooth transition back to canonical angle (135° = top-left & bottom-right) when idle/mouse leaves
 */
export default function GlassContainer({
  children,
  radius = 28,
  borderWidth = 1.5,
  restingAngle = 135,
  style = {},
  innerStyle = {},
  className = '',
  innerClassName = '',
  as = 'div',
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  ...restProps
}) {
  const containerRef = useRef(null);
  const [angle, setAngle] = useState(restingAngle);
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(false);
  const animFrameRef = useRef(null);
  const currentAngleRef = useRef(restingAngle);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    const deg = (Math.atan2(dy, dx) * (180 / Math.PI) + 90 + 360) % 360;

    currentAngleRef.current = deg;
    setAngle(deg);
    if (onMouseMove) onMouseMove(e);
  };

  const handleMouseEnter = (e) => {
    isHoveredRef.current = true;
    setIsHovered(true);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (onMouseEnter) onMouseEnter(e);
  };

  const handleMouseLeave = (e) => {
    isHoveredRef.current = false;
    setIsHovered(false);
    const animateReturn = () => {
      if (isHoveredRef.current) return;
      const cur = currentAngleRef.current;
      const target = restingAngle;
      let diff = ((target - cur + 180) % 360) - 180;
      if (Math.abs(diff) < 0.6) {
        currentAngleRef.current = target;
        setAngle(target);
        return;
      }
      currentAngleRef.current = (cur + diff * 0.14 + 360) % 360;
      setAngle(currentAngleRef.current);
      animFrameRef.current = requestAnimationFrame(animateReturn);
    };
    animFrameRef.current = requestAnimationFrame(animateReturn);
    if (onMouseLeave) onMouseLeave(e);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const Component = as;
  const isPill = radius === 9999 || radius === '9999px';
  const outerRadius = isPill ? '9999px' : `${radius}px`;
  const innerRadius = isPill ? '9999px' : `${Math.max(0, radius - borderWidth)}px`;

  const borderBackground = `conic-gradient(from ${angle}deg at 50% 50%,
    rgba(255, 255, 255, 0.98) 0deg,
    rgba(255, 255, 255, 0.35) 45deg,
    rgba(255, 255, 255, 0.04) 90deg,
    rgba(255, 255, 255, 0.35) 135deg,
    rgba(255, 255, 255, 0.98) 180deg,
    rgba(255, 255, 255, 0.35) 225deg,
    rgba(255, 255, 255, 0.04) 270deg,
    rgba(255, 255, 255, 0.35) 315deg,
    rgba(255, 255, 255, 0.98) 360deg)`;

  const vignetteShadow = isPill
    ? 'inset 0 0 12px rgba(0, 0, 0, 0.04), inset 0 0 4px rgba(0, 0, 0, 0.02)'
    : 'inset 0 0 24px rgba(0, 0, 0, 0.045), inset 0 0 8px rgba(0, 0, 0, 0.02)';

  return (
    <Component
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      style={{
        position: 'relative',
        borderRadius: outerRadius,
        padding: `${borderWidth}px`,
        background: borderBackground,
        boxSizing: 'border-box',
        ...(as === 'button'
          ? {
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left'
            }
          : {}),
        ...style
      }}
      {...restProps}
    >
      <div
        className={innerClassName}
        style={{
          borderRadius: innerRadius,
          backgroundColor: '#e6dfe4',
          boxShadow: vignetteShadow,
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          ...innerStyle
        }}
      >
        {children}
      </div>
    </Component>
  );
}
