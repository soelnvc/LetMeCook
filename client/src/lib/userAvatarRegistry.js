'use client';

import { useState, useEffect } from 'react';

/**
 * userAvatarRegistry.js
 * Global reactive avatar/DP state manager for LetMeCook.
 * Ensures user profile pictures (DPs) are universally synchronized across
 * all surfaces: messages, conversation list, header, profiles, dishes, and connections.
 */

const STORAGE_KEY = 'letmecook_global_avatars';
const EVENT_NAME = 'letmecook_avatar_update';

// In-memory avatar map: key -> avatar URL / data URI
const avatarMap = new Map();

// Hydrate from localStorage on client
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        for (const [k, v] of Object.entries(parsed)) {
          if (k && v && typeof v === 'string') {
            avatarMap.set(k.toLowerCase().trim(), v);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Failed to load global avatar cache:', err);
  }
}

const persistMap = () => {
  if (typeof window === 'undefined') return;
  try {
    const obj = {};
    for (const [k, v] of avatarMap.entries()) {
      obj[k] = v;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (err) {
    // Quota safety or storage disabled
  }
};

const normalizeKey = (key) => {
  if (!key) return null;
  return String(key).toLowerCase().replace(/^@/, '').trim();
};

/**
 * Register a user and their avatar into global state.
 */
export const setGlobalUser = (user) => {
  if (!user || typeof user !== 'object') return;
  const avatar = user.avatar;
  if (!avatar || typeof avatar !== 'string' || !avatar.trim()) return;

  let updated = false;

  if (user.username) {
    const uKey = normalizeKey(user.username);
    if (avatarMap.get(uKey) !== avatar) {
      avatarMap.set(uKey, avatar);
      updated = true;
    }
  }

  const id = user._id || user.id;
  if (id) {
    const idKey = String(id).trim();
    if (avatarMap.get(idKey) !== avatar) {
      avatarMap.set(idKey, avatar);
      updated = true;
    }
  }

  if (updated) {
    persistMap();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(EVENT_NAME, {
          detail: {
            username: user.username ? normalizeKey(user.username) : null,
            id: id ? String(id).trim() : null,
            avatar
          }
        })
      );
    }
  }
};

/**
 * Set avatar for a specific key (username or userId).
 */
export const setGlobalAvatar = (key, avatar) => {
  if (!key || !avatar || typeof avatar !== 'string' || !avatar.trim()) return;
  const nKey = normalizeKey(key);
  if (avatarMap.get(nKey) === avatar) return;

  avatarMap.set(nKey, avatar);
  avatarMap.set(String(key).trim(), avatar);
  persistMap();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: { key: nKey, avatar }
      })
    );
  }
};

/**
 * Retrieve the avatar for a user object, username, or userId.
 */
export const getGlobalAvatar = (userOrKey) => {
  if (!userOrKey) return null;

  // Direct avatar property check
  if (typeof userOrKey === 'object') {
    if (userOrKey.avatar && typeof userOrKey.avatar === 'string' && userOrKey.avatar.trim()) {
      return userOrKey.avatar;
    }
    const uname = userOrKey.username ? normalizeKey(userOrKey.username) : null;
    const uid = userOrKey._id || userOrKey.id ? String(userOrKey._id || userOrKey.id).trim() : null;

    if (uname && avatarMap.has(uname)) return avatarMap.get(uname);
    if (uid && avatarMap.has(uid)) return avatarMap.get(uid);
    return null;
  }

  const nKey = normalizeKey(userOrKey);
  if (nKey && avatarMap.has(nKey)) {
    return avatarMap.get(nKey);
  }

  const rawKey = String(userOrKey).trim();
  if (rawKey && avatarMap.has(rawKey)) {
    return avatarMap.get(rawKey);
  }

  return null;
};

/**
 * React hook to reactively get avatar and re-render if updated elsewhere in the app.
 */
export const useGlobalAvatar = (userOrKey, initialAvatar = null) => {
  const [avatar, setAvatar] = useState(() => {
    return initialAvatar || getGlobalAvatar(userOrKey) || null;
  });

  useEffect(() => {
    const current = initialAvatar || getGlobalAvatar(userOrKey);
    if (current && current !== avatar) {
      setAvatar(current);
    }

    if (typeof window === 'undefined') return;

    const handleUpdate = (e) => {
      const detail = e.detail || {};
      const targetKey = typeof userOrKey === 'object'
        ? normalizeKey(userOrKey.username || userOrKey._id || userOrKey.id)
        : normalizeKey(userOrKey);

      if (
        detail.key === targetKey ||
        detail.username === targetKey ||
        detail.id === targetKey
      ) {
        setAvatar(detail.avatar);
      }
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(EVENT_NAME, handleUpdate);
  }, [userOrKey, initialAvatar, avatar]);

  return avatar;
};
