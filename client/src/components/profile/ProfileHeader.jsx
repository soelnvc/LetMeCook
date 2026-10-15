'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import FluidButton from '@/components/ui/FluidButton';
import GlassContainer from '@/components/ui/GlassContainer';
import { useTheme } from '@/context/ThemeContext';

export default function ProfileHeader({
  user,
  isSelf = true,
  pronouns = '',
  instituteName = '',
  instituteYear = '',
  bio = '',
  interests = [],
  connectionsCount = 0,
  dishesCreatedCount,
  dishesJoinedCount,
  onEditProfile,
  onOpenSettings,
  onTabChange,
  onTagClick,
  onUpdateUser,
  onViewConnections,
  // 2nd person specific props:
  isConnected = false,
  isRequested = false,
  onToggleConnect,
  onMessage,
  onBlockUser,
  onReportUser
}) {
  const { isDark } = useTheme();
  const [bioExpanded, setBioExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showDpOptionsModal, setShowDpOptionsModal] = useState(false);
  const [isViewingLargeDp, setIsViewingLargeDp] = useState(false);
  const [showRemoveConfirmModal, setShowRemoveConfirmModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [cropImageObj, setCropImageObj] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSavingCrop, setIsSavingCrop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard navigation & lock background scroll when any modal/viewer is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowDpOptionsModal(false);
        setIsViewingLargeDp(false);
        setShowRemoveConfirmModal(false);
        setShowCropModal(false);
      }
    };
    if (showDpOptionsModal || isViewingLargeDp || showRemoveConfirmModal || showCropModal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showDpOptionsModal, isViewingLargeDp, showRemoveConfirmModal, showCropModal]);

  // Window drag listeners for DP Crop Tool
  useEffect(() => {
    if (!isDragging) return;
    const onWindowMove = (e) => {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    };
    const onWindowUp = () => {
      setIsDragging(false);
    };
    window.addEventListener('mousemove', onWindowMove);
    window.addEventListener('mouseup', onWindowUp);
    return () => {
      window.removeEventListener('mousemove', onWindowMove);
      window.removeEventListener('mouseup', onWindowUp);
    };
  }, [isDragging]);

  const handleDpClick = () => {
    if (isSelf) {
      setShowDpOptionsModal(true);
    } else {
      setIsViewingLargeDp(true);
    }
  };

  const handleUpdatePhoto = () => {
    setShowDpOptionsModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleInitiateRemove = () => {
    setShowDpOptionsModal(false);
    setShowRemoveConfirmModal(true);
  };

  const handleConfirmRemove = async () => {
    setShowRemoveConfirmModal(false);
    if (!onUpdateUser) return;
    try {
      setIsUploading(true);
      await Promise.resolve(onUpdateUser({ avatar: null }));
    } catch (err) {
      console.error('Failed to remove avatar:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    if (!isSelf) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setCropImageObj(img);
        setCropImageSrc(event.target.result);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setRotation(0);
        setShowCropModal(true);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCrop = async () => {
    if (!cropImageObj) return;
    try {
      setIsSavingCrop(true);
      const exportDim = 500;
      const canvas = document.createElement('canvas');
      canvas.width = exportDim;
      canvas.height = exportDim;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const circleRadius = 130; // 260px circle in 320px viewport
      const canvasMultiplier = (exportDim / 2) / circleRadius; // 250 / 130 ≈ 1.923

      const isRotated90 = (rotation % 180) !== 0;
      const effectiveW = isRotated90 ? cropImageObj.naturalHeight : cropImageObj.naturalWidth;
      const effectiveH = isRotated90 ? cropImageObj.naturalWidth : cropImageObj.naturalHeight;
      const minDim = Math.min(effectiveW, effectiveH) || 260;
      const baseScale = 260 / minDim;

      const baseDrawW = cropImageObj.naturalWidth * baseScale;
      const baseDrawH = cropImageObj.naturalHeight * baseScale;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Move to canvas center
      ctx.translate(exportDim / 2, exportDim / 2);

      // Apply pan
      ctx.translate(pan.x * canvasMultiplier, pan.y * canvasMultiplier);

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply zoom
      ctx.scale(zoom * canvasMultiplier, zoom * canvasMultiplier);

      // Draw centered
      ctx.drawImage(
        cropImageObj,
        -baseDrawW / 2,
        -baseDrawH / 2,
        baseDrawW,
        baseDrawH
      );

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      if (onUpdateUser) {
        await Promise.resolve(onUpdateUser({ avatar: dataUrl }));
      }
      setShowCropModal(false);
      setCropImageSrc(null);
      setCropImageObj(null);
    } catch (err) {
      console.error('Failed to crop and save avatar:', err);
    } finally {
      setIsSavingCrop(false);
    }
  };

  const handleFit = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleResetCrop = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  const rawBio = user?.bio || bio || '';
  const isLong = rawBio.length > 90;
  const displayBio = isLong && !bioExpanded ? rawBio.slice(0, 90) + '...' : rawBio;
  const bioParts = displayBio ? displayBio.split(/(#[a-zA-Z0-9_]+)/g) : [];

  const hasAvatar = Boolean(
    user && (user.avatar || user.profilePhoto || user.profilePicture || user.avatarUrl)
  );
  const avatarUrl = user
    ? user.avatar || user.profilePhoto || user.profilePicture || user.avatarUrl
    : null;

  const displayInterests =
    (user?.interests && user.interests.length > 0)
      ? user.interests
      : (interests && interests.length > 0 ? interests : []);

  const isCampusVerified = Boolean(
    user?.institute?.verified ||
    user?.verification?.institute ||
    (Array.isArray(user?.verifiedInstitutes) && user.verifiedInstitutes.length > 0)
  );
  const displayInstitute = isCampusVerified
    ? (user?.institute?.name || (typeof user?.institute === 'string' ? user.institute : instituteName) || '')
    : '';
  const displayYear = isCampusVerified ? (user?.institute?.year || instituteYear || '') : '';

  return (
    <>
      <div className="profile-ig-header-desktop" style={{ display: 'flex', gap: 64, alignItems: 'flex-start', marginBottom: 44, position: 'relative' }}>
      {/* Profile Picture Column */}
      <div style={{ flexShrink: 0 }}>
        {isSelf && (
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        )}
        <div
          onClick={handleDpClick}
          onMouseEnter={() => {
            if (isSelf) setIsHovered(true);
          }}
          onMouseLeave={() => {
            if (isSelf) setIsHovered(false);
          }}
          title={isSelf ? 'Change profile photo' : `@${user?.username || 'user'}`}
          style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden',
            border: '2px solid rgba(0, 0, 0, 0.08)',
            boxShadow: isHovered
              ? '0 12px 28px rgba(0, 0, 0, 0.12)'
              : '0 8px 24px rgba(0, 0, 0, 0.06)',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
            transform: isHovered && !isSelf ? 'scale(1.02)' : 'scale(1)',
            userSelect: 'none'
          }}
        >
          {hasAvatar ? (
            <img
              src={avatarUrl}
              alt={user?.name || user?.username || 'Profile'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 54,
                fontWeight: 800,
                userSelect: 'none'
              }}
            >
              {(user?.name || user?.username || 'S')[0].toUpperCase()}
            </div>
          )}

          {/* Hover overlay (ONLY for self) - Camera vertically over Eye, NO container */}
          {isSelf && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                color: '#ffffff',
                opacity: isHovered || isUploading ? 1 : 0,
                transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2px)',
                pointerEvents: isHovered ? 'auto' : 'none'
              }}
            >
              {isUploading ? (
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: 'dpSpin 0.9s linear infinite' }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <>
                  {/* Camera Icon on top (opens Options Popup) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDpOptionsModal(true);
                    }}
                    title="Change profile photo"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 4,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      opacity: 0.88,
                      transition: 'transform 0.18s ease, opacity 0.18s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scale(1.22)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.88';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </button>

                  {/* Eye Icon below (opens View Feature) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsViewingLargeDp(true);
                    }}
                    title="View profile photo"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 4,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      opacity: 0.88,
                      transition: 'transform 0.18s ease, opacity 0.18s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scale(1.22)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.88';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Information Column */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Row 1: Username + Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2
              style={{
                fontSize: 21,
                fontWeight: 600,
                margin: 0,
                color: isDark ? '#ffffff' : '#000000',
                letterSpacing: '-0.3px'
              }}
            >
              {user?.username || 'user'}
            </h2>
            {/* Verified badge (Only when institute is verified) */}
            {isCampusVerified && (
              <span
                title="Verified Campus Peer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0095f6'
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#0095f6">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </span>
            )}
          </div>

          {/* Action Buttons: Self vs 2nd Person */}
          {isSelf ? (
            <>
              <FluidButton
                onClick={onEditProfile}
                style={{
                  padding: '7px 20px',
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: isDark ? '#ffffff' : '#000000'
                }}
              >
                Edit Profile
              </FluidButton>

              <FluidButton
                variant="icon"
                onClick={onOpenSettings}
                title="Settings & Privacy"
                style={{
                  width: 34,
                  height: 34,
                  minWidth: 34,
                  minHeight: 34,
                  color: isDark ? '#ffffff' : '#000000'
                }}
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </FluidButton>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Connect / Following Button */}
              <FluidButton
                onClick={onToggleConnect}
                style={{
                  padding: '7px 22px',
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: isConnected ? (isDark ? '#4ade80' : '#16a34a') : isRequested ? '#38bdf8' : (isDark ? '#ffffff' : '#000000')
                }}
              >
                {isConnected ? 'Connected' : isRequested ? 'Requested' : 'Connect'}
              </FluidButton>

              {/* Message Button */}
              <FluidButton
                onClick={onMessage}
                style={{
                  padding: '7px 22px',
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: isDark ? '#ffffff' : '#000000'
                }}
              >
                Message
              </FluidButton>

              {/* Options '...' menu */}
              <div style={{ position: 'relative' }}>
                <FluidButton
                  variant="icon"
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  title="More options"
                  style={{
                    width: 34,
                    height: 34,
                    minWidth: 34,
                    minHeight: 34,
                    color: isDark ? '#ffffff' : '#000000'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="19" cy="12" r="1.5" />
                    <circle cx="5" cy="12" r="1.5" />
                  </svg>
                </FluidButton>

                {showOptionsMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '120%',
                      right: 0,
                      zIndex: 120,
                      width: 200
                    }}
                  >
                    <GlassContainer
                      radius={18}
                      borderWidth={1.5}
                      style={{ width: '100%', boxShadow: '0 16px 40px rgba(0, 0, 0, 0.16)' }}
                      innerStyle={{
                        padding: '8px 6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        color: '#000000'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          if (onBlockUser) onBlockUser(user?.username);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '9px 12px',
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#dc2626',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: 10,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.08)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                        </svg>
                        Block @{user?.username}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          if (onReportUser) onReportUser(user?.username);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '9px 12px',
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#b91c1c',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: 10,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(185, 28, 28, 0.08)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                          <line x1="4" y1="22" x2="4" y2="15" />
                        </svg>
                        Report @{user?.username}
                      </button>
                      <div style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.08)', margin: '3px 6px' }} />
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          if (typeof navigator !== 'undefined' && navigator.clipboard) {
                            navigator.clipboard.writeText(`${window.location.origin}/@${user?.username || 'user'}`);
                            setLinkCopied(true);
                            setTimeout(() => setLinkCopied(false), 2000);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '9px 12px',
                          fontSize: 13,
                          fontWeight: 500,
                          color: '#09090b',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: 10,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        {linkCopied ? 'Link Copied!' : 'Copy Profile Link'}
                      </button>
                    </GlassContainer>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Row 2: Stats Row */}
        <div style={{ display: 'flex', gap: 36, fontSize: 15.5, color: isDark ? '#ffffff' : '#000000' }}>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => onTabChange && onTabChange('dishes')}
          >
            <strong>{dishesCreatedCount ?? user?.stats?.dishesCreated ?? 0}</strong> cooked
          </span>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => onTabChange && onTabChange('joined')}
          >
            <strong>{dishesJoinedCount ?? user?.stats?.dishesJoined ?? 0}</strong> joined
          </span>
          <span
            style={{ cursor: isSelf ? 'pointer' : 'default' }}
            onClick={() => {
              if (isSelf) {
                if (onViewConnections) onViewConnections();
                else if (onOpenSettings) onOpenSettings();
              }
            }}
          >
            <strong>{connectionsCount ?? 0}</strong> connections
          </span>
        </div>

        {/* Row 3: Name, Pronouns, Verified Institute, Bio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, lineHeight: 1.45 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: isDark ? '#ffffff' : '#000000' }}>
              {user?.name || user?.username || ''}
            </span>
            {(pronouns || user?.pronouns) && (
              <span style={{ fontSize: 13, color: isDark ? '#d4d4d8' : '#6b7280', fontWeight: 500 }}>
                {user?.pronouns || pronouns}
              </span>
            )}
          </div>

          {/* Institute with Verified Tick Badge & SVG Cap Icon (Only when institute exists) */}
          {displayInstitute && (
            <div
              style={{
                fontSize: 13.5,
                color: isDark ? '#e4e4e7' : '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexWrap: 'wrap'
              }}
            >
              <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                {displayInstitute}
              </span>
              {user?.institute?.verified && (
                <span
                  title="Verified Institute Student"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0095f6'
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#0095f6">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </span>
              )}
              {displayYear && (
                <span style={{ color: isDark ? '#d4d4d8' : '#6b7280', fontWeight: 500 }}>
                  • Batch of {displayYear}
                </span>
              )}
            </div>
          )}

          {/* Bio with Blue Hashtags Inside */}
          {rawBio ? (
            <div style={{ color: isDark ? '#f4f4f5' : '#111827', marginTop: 4, maxWidth: 540 }}>
              <span>
                {bioParts.map((part, i) => {
                  if (part.startsWith('#')) {
                    return (
                      <span
                        key={i}
                        style={{
                          color: '#0095f6',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'opacity 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        {part}
                      </span>
                    );
                  }
                  return part;
                })}
              </span>
              {isLong && (
                <button
                  onClick={() => setBioExpanded(!bioExpanded)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isDark ? '#d4d4d8' : '#6b7280',
                    fontWeight: 600,
                    fontSize: 13,
                    marginLeft: 6,
                    padding: 0
                  }}
                >
                  {bioExpanded ? 'show less' : 'more'}
                </button>
              )}
            </div>
          ) : (
            isSelf && (
              <div style={{ color: isDark ? '#a1a1aa' : '#9ca3af', fontStyle: 'italic', fontSize: 13, marginTop: 4 }}>
                No bio added yet.
              </div>
            )
          )}

          {/* Tags using FluidButton aesthetics */}
          {displayInterests && displayInterests.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {displayInterests.map((tag, idx) => (
                <FluidButton
                  key={idx}
                  onClick={() => onTagClick && onTagClick(tag)}
                  style={{
                    padding: '5px 14px',
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: isDark ? '#ffffff' : '#111827'
                  }}
                >
                  {tag.startsWith('#') ? tag.slice(1) : tag}
                </FluidButton>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE INSTAGRAM PROFILE HEADER (<= 768px)                */}
      {/* ========================================================= */}
      <div className="profile-ig-header-mobile" style={{ display: 'none', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
        {/* Row 1: Profile Photo (80px) on left + Stats (3 columns) on right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, width: '100%' }}>
          {/* Avatar (80px) */}
          <div
            onClick={handleDpClick}
            title={isSelf ? 'Change profile photo' : `@${user?.username || 'user'}`}
            style={{
              width: 80,
              height: 80,
              minWidth: 80,
              minHeight: 80,
              borderRadius: '50%',
              position: 'relative',
              cursor: 'pointer',
              overflow: 'hidden',
              border: '2px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
              flexShrink: 0
            }}
          >
            {hasAvatar ? (
              <img
                src={avatarUrl}
                alt={user?.name || user?.username || 'Profile'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  fontWeight: 800
                }}
              >
                {(user?.name || user?.username || 'S')[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Stats on the right (Cooked, Joined, Connections) */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 8 }}>
            <div
              style={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={() => onTabChange && onTabChange('dishes')}
            >
              <div style={{ fontSize: 17, fontWeight: 700, color: '#09090b', lineHeight: 1.2 }}>
                {dishesCreatedCount ?? user?.stats?.dishesCreated ?? 0}
              </div>
              <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>cooked</div>
            </div>

            <div
              style={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={() => onTabChange && onTabChange('joined')}
            >
              <div style={{ fontSize: 17, fontWeight: 700, color: '#09090b', lineHeight: 1.2 }}>
                {dishesJoinedCount ?? user?.stats?.dishesJoined ?? 0}
              </div>
              <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>joined</div>
            </div>

            <div
              style={{ textAlign: 'center', cursor: isSelf ? 'pointer' : 'default' }}
              onClick={() => {
                if (isSelf) {
                  if (onViewConnections) onViewConnections();
                  else if (onOpenSettings) onOpenSettings();
                }
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 700, color: '#09090b', lineHeight: 1.2 }}>
                {connectionsCount ?? 0}
              </div>
              <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>connections</div>
            </div>
          </div>
        </div>

        {/* Row 2: Name + Username + Pronouns + Campus Verification */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#09090b' }}>
              {user?.name || user?.username || ''}
            </span>
            {isCampusVerified && (
              <span title="Verified Campus Peer" style={{ display: 'inline-flex', color: '#0095f6' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#0095f6">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </span>
            )}
            {(pronouns || user?.pronouns) && (
              <span style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>
                ({user?.pronouns || pronouns})
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: '#71717a' }}>
            @{user?.username || 'user'}
          </div>

          {displayInstitute && (
            <div style={{ fontSize: 12.5, color: '#374151', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              <span style={{ fontWeight: 600 }}>{displayInstitute}</span>
              {displayYear && <span style={{ color: '#71717a' }}>• Batch of {displayYear}</span>}
            </div>
          )}
        </div>

        {/* Row 3: Bio & Interests */}
        {rawBio && (
          <div style={{ color: '#111827', fontSize: 13.5, lineHeight: 1.4 }}>
            <span>
              {bioParts.map((part, i) => {
                if (part.startsWith('#')) {
                  return (
                    <span key={i} style={{ color: '#0095f6', fontWeight: 600 }}>
                      {part}
                    </span>
                  );
                }
                return part;
              })}
            </span>
          </div>
        )}

        {displayInterests && displayInterests.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
            {displayInterests.map((tag, idx) => (
              <FluidButton
                key={idx}
                onClick={() => onTagClick && onTagClick(tag)}
                style={{
                  padding: '4px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#111827'
                }}
              >
                {tag.startsWith('#') ? tag.slice(1) : tag}
              </FluidButton>
            ))}
          </div>
        )}

        {/* Row 4: Full-width Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, width: '100%' }}>
          {isSelf ? (
            <>
              <FluidButton
                onClick={onEditProfile}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#000000',
                  textAlign: 'center'
                }}
              >
                Edit profile
              </FluidButton>

              <FluidButton
                variant="icon"
                onClick={onOpenSettings}
                title="Settings & Privacy"
                style={{
                  width: 38,
                  height: 38,
                  minWidth: 38,
                  minHeight: 38,
                  color: '#000000'
                }}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </FluidButton>
            </>
          ) : (
            <>
              <FluidButton
                onClick={onToggleConnect}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: isConnected ? '#16a34a' : isRequested ? '#2563eb' : '#000000'
                }}
              >
                {isConnected ? 'Connected' : isRequested ? 'Requested' : 'Connect'}
              </FluidButton>

              <FluidButton
                onClick={onMessage}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                Message
              </FluidButton>

              <FluidButton
                variant="icon"
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                title="More options"
                style={{ width: 38, height: 38, minWidth: 38, minHeight: 38, color: '#000000' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="19" cy="12" r="1.5" />
                  <circle cx="5" cy="12" r="1.5" />
                </svg>
              </FluidButton>
            </>
          )}
        </div>
      </div>

      {/* 1. App-Styled DP Options Modal (GlassContainer + FluidButton) */}
      {mounted && showDpOptionsModal && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDpOptionsModal(false);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            animation: 'dpFadeIn 0.18s ease-out'
          }}
        >
          <GlassContainer
            radius={28}
            borderWidth={1.5}
            style={{
              maxWidth: 390,
              width: '100%',
              boxShadow: 'none',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}
            innerStyle={{
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              textAlign: 'center',
              animation: 'dpModalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Header Titles */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#000000', margin: 0, letterSpacing: '-0.3px' }}>
                Change Profile Photo
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0', fontWeight: 500 }}>
                Upload a new photo or manage your display picture
              </p>
            </div>

            {/* Action Buttons using default customized FluidButton */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              {/* Upload Action */}
              <FluidButton
                onClick={handleUpdatePhoto}
                style={{
                  width: '100%',
                  padding: '11px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload Photo
              </FluidButton>

              {/* Remove Action */}
              <FluidButton
                onClick={handleInitiateRemove}
                disabled={!hasAvatar}
                style={{
                  width: '100%',
                  padding: '11px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: hasAvatar ? '#000000' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: hasAvatar ? 1 : 0.5,
                  cursor: hasAvatar ? 'pointer' : 'not-allowed'
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                Remove Current Photo
              </FluidButton>

              {/* Cancel Button */}
              <FluidButton
                onClick={() => setShowDpOptionsModal(false)}
                style={{
                  width: '100%',
                  padding: '11px 20px',
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: '#64748b'
                }}
              >
                Cancel
              </FluidButton>
            </div>
          </GlassContainer>
        </div>,
        document.body
      )}

      {/* 2. Remove Confirmation Modal */}
      {mounted && showRemoveConfirmModal && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRemoveConfirmModal(false);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            animation: 'dpFadeIn 0.18s ease-out'
          }}
        >
          <GlassContainer
            radius={28}
            borderWidth={1.5}
            style={{
              maxWidth: 390,
              width: '100%',
              boxShadow: 'none',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}
            innerStyle={{
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              textAlign: 'center',
              alignItems: 'center',
              animation: 'dpModalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#000000', margin: 0, letterSpacing: '-0.3px' }}>
                Remove Profile Photo?
              </h3>
              <p style={{ fontSize: 13.5, color: '#64748b', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                Are you sure you want to remove your profile photo? Your profile will revert to your default initial avatar.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 4 }}>
              <FluidButton
                onClick={() => setShowRemoveConfirmModal(false)}
                style={{
                  flex: 1,
                  padding: '11px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#64748b'
                }}
              >
                Keep Photo
              </FluidButton>

              <FluidButton
                onClick={handleConfirmRemove}
                style={{
                  flex: 1,
                  padding: '11px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                Yes, Remove
              </FluidButton>
            </div>
          </GlassContainer>
        </div>,
        document.body
      )}

      {/* 3. Proper DP Setting / Crop & Zoom Tool (LinkedIn / Instagram inspired) */}
      {mounted && showCropModal && cropImageSrc && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSavingCrop) {
              setShowCropModal(false);
              setCropImageSrc(null);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 18,
            animation: 'dpFadeIn 0.2s ease-out'
          }}
        >
          <GlassContainer
            radius={28}
            borderWidth={1.5}
            style={{
              maxWidth: 460,
              width: '100%',
              boxShadow: 'none',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}
            innerStyle={{
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              animation: 'dpModalPop 0.24s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: isDark ? '#ffffff' : '#000000', margin: 0, letterSpacing: '-0.3px' }}>
                  Set Profile Photo
                </h3>
                <p style={{ fontSize: 12.5, color: isDark ? '#d4d4d8' : '#64748b', margin: '3px 0 0 0', fontWeight: 500 }}>
                  Drag to reposition • Scroll or slider to zoom
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isSavingCrop) {
                    setShowCropModal(false);
                    setCropImageSrc(null);
                  }
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isDark ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Interactive Crop Viewport */}
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDragging(true);
                dragStartRef.current = {
                  x: e.clientX - pan.x,
                  y: e.clientY - pan.y
                };
              }}
              onTouchStart={(e) => {
                if (e.touches.length === 1) {
                  setIsDragging(true);
                  dragStartRef.current = {
                    x: e.touches[0].clientX - pan.x,
                    y: e.touches[0].clientY - pan.y
                  };
                }
              }}
              onTouchMove={(e) => {
                if (!isDragging || e.touches.length !== 1) return;
                setPan({
                  x: e.touches[0].clientX - dragStartRef.current.x,
                  y: e.touches[0].clientY - dragStartRef.current.y
                });
              }}
              onTouchEnd={() => setIsDragging(false)}
              onWheel={(e) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.06 : 0.06;
                setZoom((z) => Number(Math.max(0.6, Math.min(3.5, z + delta)).toFixed(2)));
              }}
              style={{
                width: '100%',
                height: 320,
                backgroundColor: '#0c1017',
                borderRadius: 20,
                position: 'relative',
                overflow: 'hidden',
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.7)'
              }}
            >
              {/* Dynamic Image Canvas/Element */}
              {cropImageObj && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: cropImageObj.naturalWidth * (260 / (Math.min(
                      (rotation % 180 !== 0 ? cropImageObj.naturalHeight : cropImageObj.naturalWidth),
                      (rotation % 180 !== 0 ? cropImageObj.naturalWidth : cropImageObj.naturalHeight)
                    ) || 260)),
                    height: cropImageObj.naturalHeight * (260 / (Math.min(
                      (rotation % 180 !== 0 ? cropImageObj.naturalHeight : cropImageObj.naturalWidth),
                      (rotation % 180 !== 0 ? cropImageObj.naturalWidth : cropImageObj.naturalHeight)
                    ) || 260)),
                    transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) rotate(${rotation}deg) scale(${zoom})`,
                    transformOrigin: 'center center',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={cropImageSrc}
                    alt="Crop preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                    draggable={false}
                  />
                </div>
              )}

              {/* Instagram / LinkedIn Style Circle Cutout Mask */}
              <svg
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none'
                }}
              >
                <defs>
                  <mask id="dpCircleMask">
                    <rect width="100%" height="100%" fill="white" />
                    <circle cx="50%" cy="50%" r="130" fill="black" />
                  </mask>
                </defs>
                {/* Darkened backdrop outside avatar circle */}
                <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.65)" mask="url(#dpCircleMask)" />

                {/* Subtle Inner Crosshair Grid Guides */}
                <line x1="50%" y1="calc(50% - 130px)" x2="50%" y2="calc(50% + 130px)" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="calc(50% - 130px)" y1="50%" x2="calc(50% + 130px)" y2="50%" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" strokeDasharray="3 3" />

                {/* Circle Boundary Guide Ring */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="130"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.9)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.8))' }}
                />
              </svg>
            </div>

            {/* Zoom Slider Control Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 6px' }}>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))}
                title="Zoom Out"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#ffffff',
                  color: isDark ? '#ffffff' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 700
                }}
              >
                −
              </button>

              <input
                type="range"
                min="0.6"
                max="3.5"
                step="0.02"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{
                  flex: 1,
                  cursor: 'pointer',
                  accentColor: isDark ? '#ffffff' : '#101214'
                }}
              />

              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3.5, Number((z + 0.1).toFixed(2))))}
                title="Zoom In"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#ffffff',
                  color: isDark ? '#ffffff' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 700
                }}
              >
                +
              </button>

              <span style={{ fontSize: 12.5, fontWeight: 600, color: isDark ? '#d4d4d8' : '#64748b', minWidth: 42, textAlign: 'right' }}>
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Secondary Toolbar: Fit, Rotate, Reset */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <FluidButton
                onClick={handleFit}
                style={{
                  padding: '6px 14px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: isDark ? '#ffffff' : '#101214',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
                Fit Circle
              </FluidButton>

              <FluidButton
                onClick={handleRotate}
                style={{
                  padding: '6px 14px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: isDark ? '#ffffff' : '#101214',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                Rotate 90°
              </FluidButton>

              <FluidButton
                onClick={handleResetCrop}
                style={{
                  padding: '6px 14px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: isDark ? '#d4d4d8' : '#64748b'
                }}
              >
                Reset
              </FluidButton>
            </div>

            {/* Footer Modal Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <FluidButton
                onClick={() => {
                  if (!isSavingCrop) {
                    setShowCropModal(false);
                    setCropImageSrc(null);
                  }
                }}
                disabled={isSavingCrop}
                style={{
                  flex: 1,
                  padding: '11px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: isDark ? '#d4d4d8' : '#64748b'
                }}
              >
                Cancel
              </FluidButton>

              <FluidButton
                onClick={handleApplyCrop}
                disabled={isSavingCrop}
                style={{
                  flex: 1.4,
                  padding: '11px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: isDark ? '#ffffff' : '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {isSavingCrop ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'dpSpin 0.9s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Apply Photo'
                )}
              </FluidButton>
            </div>
          </GlassContainer>
        </div>,
        document.body
      )}

      {/* 4. Full-Screen Instagram-style Large DP Viewer (With Blurred Background) */}
      {mounted && isViewingLargeDp && createPortal(
        <div
          onClick={(e) => {
            // Dismiss whenever clicking on the background backdrop
            if (e.target === e.currentTarget) {
              setIsViewingLargeDp(false);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            animation: 'dpFadeIn 0.2s ease-out'
          }}
        >
          {/* Top Close Button (X) */}
          <button
            type="button"
            onClick={() => setIsViewingLargeDp(false)}
            title="Close (Esc)"
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.14)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10001,
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.28)';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.14)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Center Card with Large DP */}
          <div
            onClick={(e) => {
              // Clicking inside the center card itself does not propagate to backdrop if clicking directly on elements
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'dpViewerPop 0.26s cubic-bezier(0.16, 1, 0.3, 1)',
              maxWidth: 420,
              width: '100%',
              pointerEvents: 'auto'
            }}
          >
            {/* Large Circular DP */}
            <div
              style={{
                width: 'min(340px, 80vw)',
                height: 'min(340px, 80vw)',
                borderRadius: '50%',
                position: 'relative',
                overflow: 'hidden',
                border: '4px solid rgba(255, 255, 255, 0.28)',
                boxShadow: '0 30px 80px -10px rgba(0, 0, 0, 0.8)',
                backgroundColor: '#1e293b'
              }}
            >
              {hasAvatar ? (
                <img
                  src={avatarUrl}
                  alt={user?.name || user?.username || 'Profile'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 120,
                    fontWeight: 800,
                    userSelect: 'none'
                  }}
                >
                  {(user?.name || user?.username || 'S')[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Identity Details below photo */}
            <div
              style={{
                marginTop: 24,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6
              }}
            >
              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '-0.3px',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
                }}
              >
                {user?.name || user?.username || 'Campus Peer'}
              </h3>
              <span
                style={{
                  fontSize: 14.5,
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.72)',
                  letterSpacing: '0.1px'
                }}
              >
                @{user?.username || 'user'}
              </span>

              {/* Sub-pills (Institute / pronouns) */}
              {(displayInstitute || pronouns) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {displayInstitute && (
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: 12,
                        fontWeight: 500
                      }}
                    >
                      {displayInstitute} {displayYear ? `· ${displayYear}` : ''}
                    </span>
                  )}
                  {pronouns && (
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        color: 'rgba(255, 255, 255, 0.75)',
                        fontSize: 12,
                        fontWeight: 500
                      }}
                    >
                      {pronouns}
                    </span>
                  )}
                </div>
              )}

              {/* If self, provide convenient quick options right in viewer */}
              {isSelf && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsViewingLargeDp(false);
                      setShowDpOptionsModal(true);
                    }}
                    style={{
                      padding: '7px 18px',
                      borderRadius: 20,
                      backgroundColor: 'rgba(255, 255, 255, 0.16)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.28)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    Manage Photo
                  </button>
                </div>
              )}

              {/* Background dismissal hint */}
              <span
                style={{
                  fontSize: 12,
                  color: 'rgba(255, 255, 255, 0.42)',
                  marginTop: 12,
                  letterSpacing: '0.2px',
                  userSelect: 'none'
                }}
              >
                Click anywhere on background to dismiss
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Dynamic Keyframes for modals & viewer */}
      <style>{`
        @keyframes dpFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes dpModalPop {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes dpViewerPop {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes dpSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

