'use client';

import React, { useState, useEffect, useRef } from 'react';
import GlassContainer from '@/components/ui/GlassContainer';

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys',
    icon: '😊',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
      '🥲', '🥹', '😊', '😇', '🙂', '🙃', '😉', '😌',
      '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
      '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸',
      '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕',
      '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢',
      '😭', '😮‍💨', '😤', '😠', '😡', '🤬', '🤯', '😳',
      '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
      '🤔', '🫣', '🤭', '🫢', '🫡', '🤫', '🫠', '🤤'
    ]
  },
  {
    id: 'food',
    name: 'Cooking & Food',
    icon: '🍳',
    emojis: [
      '🍳', '🧑‍🍳', '🥘', '🍲', '🍜', '🍝', '🍕', '🍔',
      '🍟', '🌭', '🥪', '🌮', '🌯', '🥙', '🥗', '🍙',
      '🍚', '🍛', '🍣', '🍱', '🥟', '🍤', '🥩', '🥓',
      '🍗', '🍖', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀',
      '🥞', '🧇', '🍰', '🎂', '🧁', '🍦', '🍨', '🍧',
      '🍩', '🍪', '🍫', '🍿', '☕', '🍵', '🧋', '🥤',
      '🍷', '🍻', '🥑', '🍅', '🌶️', '🌽', '🥕', '🧄',
      '🧅', '🥔', '🍠', '🍎', '🍓', '🍋', '🍇', '🍉'
    ]
  },
  {
    id: 'gestures',
    name: 'Gestures',
    icon: '👋',
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏',
      '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉',
      '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊',
      '🤛', '🤜', '👏', '🙌', '🫶', '👐', '🤲', '🤝',
      '🙏', '✍️', '💪', '🦾', '🫂', '💅', '🫡', '🙇‍♂️'
    ]
  },
  {
    id: 'vibes',
    name: 'Hearts & Vibes',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
      '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💖', '💗', '💓', '💞',
      '💕', '💘', '💌', '🔥', '✨', '⭐', '🌟', '💫',
      '⚡', '💥', '💯', '🎉', '🎊', '🎈', '🚀', '💡',
      '🏆', '🥇', '🥈', '🥉', '🎯', '👑', '💎', '🌈'
    ]
  },
  {
    id: 'campus',
    name: 'Campus Life',
    icon: '🏃‍♂️',
    emojis: [
      '🏃‍♂️', '🏃‍♀️', '🚴‍♂️', '🚴‍♀️', '🏸', '⚽', '🏀', '🏈',
      '🎾', '🏐', '🏉', '🏓', '🏊‍♂️', '🏋️‍♂️', '🧘‍♂️', '🧗‍♂️',
      '📚', '📖', '💻', '🖥️', '🎒', '🎓', '🎨', '🎵',
      '🎶', '🎸', '🎹', '🎤', '🎧', '🎮', '🕹️', '🎲'
    ]
  }
];

export default function EmojiPicker({
  isOpen,
  onClose,
  onSelectEmoji,
  position = 'bottom-left'
}) {
  const [activeCategory, setActiveCategory] = useState('smileys');
  const [search, setSearch] = useState('');
  const pickerRef = useRef(null);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter emojis if search query present
  const currentCategoryObj =
    EMOJI_CATEGORIES.find((c) => c.id === activeCategory) || EMOJI_CATEGORIES[0];
  const query = search.trim().toLowerCase();

  const displayedEmojis = query
    ? EMOJI_CATEGORIES.flatMap((c) => c.emojis).filter((emoji) => emoji.includes(query))
    : currentCategoryObj.emojis;

  return (
    <div
      ref={pickerRef}
      style={{
        position: 'absolute',
        bottom: position === 'top' ? 'auto' : 58,
        top: position === 'top' ? 48 : 'auto',
        left: 12,
        zIndex: 1000,
        width: 320,
        maxHeight: 380,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeInScale 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Header: Search + Close */}
      <div
        style={{
          padding: '12px 14px 8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            borderRadius: 9999,
            padding: '6px 12px'
          }}
        >
          <span style={{ fontSize: 13, color: '#888' }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emojis..."
            autoFocus
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 13,
              width: '100%',
              color: '#000000',
              fontFamily: 'inherit'
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 12,
                color: '#666'
              }}
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 15,
            color: '#666',
            padding: '4px 6px',
            borderRadius: '50%'
          }}
          title="Close emoji picker"
        >
          ✕
        </button>
      </div>

      {/* Category Tabs */}
      {!query && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 10px',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
          }}
        >
          {EMOJI_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                title={cat.name}
                style={{
                  border: 'none',
                  background: isActive ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                  borderRadius: 10,
                  fontSize: 17,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  transition: 'all 0.15s ease',
                  transform: isActive ? 'scale(1.15)' : 'scale(1)'
                }}
              >
                {cat.icon}
              </button>
            );
          })}
        </div>
      )}

      {/* Emoji Grid */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 6,
          maxHeight: 220
        }}
      >
        {displayedEmojis.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '24px 8px',
              color: '#888',
              fontSize: 13
            }}
          >
            No emojis found for &quot;{search}&quot;
          </div>
        ) : (
          displayedEmojis.map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              onClick={() => {
                onSelectEmoji(emoji);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: 22,
                cursor: 'pointer',
                borderRadius: 8,
                padding: '3px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.12s ease, background 0.12s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.transform = 'scale(1.22)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {emoji}
            </button>
          ))
        )}
      </div>

      {/* Footer shortcut tip */}
      <div
        style={{
          padding: '6px 12px',
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
          fontSize: 11,
          color: '#71717a',
          textAlign: 'center',
          fontWeight: 500
        }}
      >
        💡 Tip: Press <strong style={{ color: '#09090b' }}>Ctrl + ⌘ + Space</strong> for macOS system palette
      </div>
    </div>
  );
}
