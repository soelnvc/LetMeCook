/**
 * messageStorage.js
 * Persistent client-side storage engine for LetMeCook messaging.
 * Strictly isolated per user account to prevent account bleed.
 * Guarantees zero-flicker hydration on page reloads (Cmd+R / F5)
 * and strictly ensures ONE single conversation thread per person
 * like Instagram & WhatsApp.
 */

// Purge any legacy global storage keys to avoid polluting new accounts
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('letmecook_conversations_cache');
    localStorage.removeItem('letmecook_messages_cache');
    localStorage.removeItem('letmecook_active_conv');
    localStorage.removeItem('letmecook_messages_tab');
  } catch {}
}

const getStorageKey = (type, userId) => {
  const uid = userId ? String(userId).trim() : 'guest';
  return `letmecook_${uid}_${type}`;
};

export const getUserKey = (userOrConv) => {
  if (!userOrConv) return null;
  const user = userOrConv.user || userOrConv;

  if (user && user.username) {
    return String(user.username).toLowerCase().replace(/^@/, '').trim();
  }
  if (user && user._id) {
    return String(user._id);
  }
  if (user && user.id) {
    return String(user.id);
  }
  if (userOrConv.conversationId) {
    const cid = String(userOrConv.conversationId);
    if (cid.startsWith('conv-')) {
      return cid.replace('conv-', '').toLowerCase().replace(/^@/, '').trim();
    }
  }
  if (userOrConv.requestSender) {
    return String(userOrConv.requestSender).toLowerCase().replace(/^@/, '').trim();
  }
  return null;
};

export const migrateConversationId = (oldConvId, newConvId, userId) => {
  if (!oldConvId || !newConvId || oldConvId === newConvId) return;
  if (typeof window === 'undefined') return;
  try {
    const map = loadLocalMessagesMap(userId);
    const oldMsgs = Array.isArray(map[oldConvId]) ? map[oldConvId] : [];
    const newMsgs = Array.isArray(map[newConvId]) ? map[newConvId] : [];

    if (oldMsgs.length > 0 || newMsgs.length > 0) {
      const combined = [...oldMsgs, ...newMsgs];
      const seen = new Set();
      const mergedMsgs = [];
      for (const msg of combined) {
        if (!msg) continue;
        const msgKey =
          msg._id ||
          `${msg.sender?._id || msg.sender?.username || msg.sender}_${msg.content}_${msg.createdAt}`;
        if (!seen.has(msgKey)) {
          seen.add(msgKey);
          mergedMsgs.push(msg);
        }
      }
      mergedMsgs.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      map[newConvId] = mergedMsgs;
      delete map[oldConvId];
      saveLocalMessagesMap(map, userId);
    }

    const active = loadActiveConvId(userId);
    if (active === oldConvId) {
      saveActiveConvId(newConvId, userId);
    }
  } catch (err) {
    console.error('Failed to migrate conversation ID:', err);
  }
};

/**
 * Deduplicate conversations so there is strictly ONE conversation per person.
 */
export const deduplicateConversations = (conversations = []) => {
  if (!Array.isArray(conversations)) return [];
  const map = new Map();

  for (const c of conversations) {
    if (!c) continue;
    if (String(c.conversationId).startsWith('demo-') || String(c.user?._id).startsWith('demo-')) continue;
    const userKey = getUserKey(c) || String(c.conversationId);

    if (!map.has(userKey)) {
      map.set(userKey, c);
    } else {
      const existing = map.get(userKey);
      // Prefer real server conversation ID (containing '_' without 'conv-' or 'demo-')
      const isServerId = (id) =>
        id && !String(id).startsWith('conv-') && !String(id).startsWith('demo-');

      let preferredId = existing.conversationId;
      if (isServerId(c.conversationId) && !isServerId(existing.conversationId)) {
        preferredId = c.conversationId;
      } else if (isServerId(existing.conversationId) && !isServerId(c.conversationId)) {
        preferredId = existing.conversationId;
      } else {
        preferredId = c.conversationId || existing.conversationId;
      }

      // Determine which item has newer message/timestamp
      const existingTime = new Date(
        existing.updatedAt || existing.lastMessage?.createdAt || 0
      ).getTime();
      const cTime = new Date(
        c.updatedAt || c.lastMessage?.createdAt || 0
      ).getTime();
      const newer = cTime >= existingTime ? c : existing;

      // Pending requests must remain pending until explicitly accepted
      const isPending =
        newer.requestStatus === 'pending' ||
        existing.requestStatus === 'pending' ||
        (newer.isRequest && newer.requestStatus !== 'accepted') ||
        (existing.isRequest && existing.requestStatus !== 'accepted');

      const isAccepted = !isPending && (newer.requestStatus === 'accepted' || existing.requestStatus === 'accepted');

      map.set(userKey, {
        ...existing,
        ...newer,
        conversationId: preferredId,
        user: { ...(existing.user || {}), ...(c.user || {}) },
        isRequest: isPending,
        requestStatus: isPending ? 'pending' : (isAccepted ? 'accepted' : 'none'),
        needsResponse: isPending ? Boolean(newer.needsResponse || existing.needsResponse) : false
      });
    }
  }

  const list = Array.from(map.values());
  list.sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.lastMessage?.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.lastMessage?.createdAt || 0).getTime();
    return timeB - timeA;
  });
  return list;
};

export const loadLocalConversations = (userId) => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey('conversations', userId));
    return raw ? deduplicateConversations(JSON.parse(raw)) : [];
  } catch (err) {
    console.error('Failed to load local conversations:', err);
    return [];
  }
};

export const saveLocalConversations = (conversations, userId) => {
  if (typeof window === 'undefined' || !Array.isArray(conversations)) return;
  try {
    const cleaned = deduplicateConversations(conversations);
    localStorage.setItem(getStorageKey('conversations', userId), JSON.stringify(cleaned));
  } catch (err) {
    console.error('Failed to save local conversations:', err);
  }
};

export const loadLocalMessagesMap = (userId) => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(getStorageKey('messages', userId));
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Failed to load local messages map:', err);
    return {};
  }
};

export const saveLocalMessagesMap = (map, userId) => {
  if (typeof window === 'undefined' || !map) return;
  try {
    localStorage.setItem(getStorageKey('messages', userId), JSON.stringify(map));
  } catch (err) {
    console.error('Failed to save local messages map:', err);
  }
};

export const saveLocalMessagesForConv = (convId, messages, userId) => {
  if (typeof window === 'undefined' || !convId) return;
  try {
    const currentMap = loadLocalMessagesMap(userId);
    currentMap[convId] = messages;
    saveLocalMessagesMap(currentMap, userId);
  } catch (err) {
    console.error('Failed to save local messages for conv:', err);
  }
};

export const loadActiveConvId = (userId) => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(getStorageKey('active_conv', userId)) || null;
  } catch {
    return null;
  }
};

export const saveActiveConvId = (convId, userId) => {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKey('active_conv', userId);
    if (convId) {
      localStorage.setItem(key, convId);
    } else {
      localStorage.removeItem(key);
    }
  } catch {}
};

export const loadMessagesTab = (userId) => {
  if (typeof window === 'undefined') return 'message';
  try {
    return localStorage.getItem(getStorageKey('messages_tab', userId)) || 'message';
  } catch {
    return 'message';
  }
};

export const saveMessagesTab = (tab, userId) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey('messages_tab', userId), tab || 'message');
  } catch {}
};
