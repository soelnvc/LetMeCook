/**
 * messageStorage.js
 * Persistent client-side storage engine for LetMeCook messaging.
 * Guarantees zero-flicker hydration on page reloads (Cmd+R / F5)
 * and strictly ensures ONE single conversation thread per person
 * like Instagram & WhatsApp.
 */

const STORAGE_KEYS = {
  CONVERSATIONS: 'letmecook_conversations_cache',
  MESSAGES: 'letmecook_messages_cache',
  ACTIVE_CONV: 'letmecook_active_conv',
  MESSAGES_TAB: 'letmecook_messages_tab'
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

/**
 * Migrates messages from an old conversationId (e.g. conv-amans)
 * to a canonical new conversationId (e.g. MongoDB compound ID).
 */
export const migrateConversationId = (oldConvId, newConvId) => {
  if (!oldConvId || !newConvId || oldConvId === newConvId) return;
  if (typeof window === 'undefined') return;
  try {
    const map = loadLocalMessagesMap();
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
      saveLocalMessagesMap(map);
    }

    const active = loadActiveConvId();
    if (active === oldConvId) {
      saveActiveConvId(newConvId);
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
      let retiredId = null;

      if (isServerId(c.conversationId) && !isServerId(existing.conversationId)) {
        preferredId = c.conversationId;
        retiredId = existing.conversationId;
      } else if (isServerId(existing.conversationId) && !isServerId(c.conversationId)) {
        preferredId = existing.conversationId;
        retiredId = c.conversationId;
      } else {
        preferredId = c.conversationId || existing.conversationId;
      }

      if (retiredId && retiredId !== preferredId) {
        migrateConversationId(retiredId, preferredId);
      }

      // Determine which item has newer message/timestamp
      const existingTime = new Date(
        existing.updatedAt || existing.lastMessage?.createdAt || 0
      ).getTime();
      const cTime = new Date(
        c.updatedAt || c.lastMessage?.createdAt || 0
      ).getTime();
      const newer = cTime >= existingTime ? c : existing;

      // If either conversation is accepted/not request, it's an active chat
      const isAccepted =
        existing.requestStatus === 'accepted' ||
        c.requestStatus === 'accepted' ||
        (!existing.isRequest && existing.requestStatus !== 'pending') ||
        (!c.isRequest && c.requestStatus !== 'pending');

      map.set(userKey, {
        ...existing,
        ...newer,
        conversationId: preferredId,
        user: { ...(existing.user || {}), ...(c.user || {}) },
        isRequest: isAccepted ? false : (newer.isRequest ?? existing.isRequest),
        requestStatus: isAccepted ? 'accepted' : (newer.requestStatus || existing.requestStatus)
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

export const loadLocalConversations = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return raw ? deduplicateConversations(JSON.parse(raw)) : [];
  } catch (err) {
    console.error('Failed to load local conversations:', err);
    return [];
  }
};

export const saveLocalConversations = (conversations) => {
  if (typeof window === 'undefined' || !Array.isArray(conversations)) return;
  try {
    const cleaned = deduplicateConversations(conversations);
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(cleaned));
  } catch (err) {
    console.error('Failed to save local conversations:', err);
  }
};

export const loadLocalMessagesMap = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Failed to load local messages map:', err);
    return {};
  }
};

export const saveLocalMessagesMap = (map) => {
  if (typeof window === 'undefined' || !map) return;
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to save local messages map:', err);
  }
};

export const saveLocalMessagesForConv = (convId, messages) => {
  if (typeof window === 'undefined' || !convId) return;
  try {
    const currentMap = loadLocalMessagesMap();
    currentMap[convId] = messages;
    saveLocalMessagesMap(currentMap);
  } catch (err) {
    console.error('Failed to save local messages for conv:', err);
  }
};

export const loadActiveConvId = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONV) || null;
  } catch {
    return null;
  }
};

export const saveActiveConvId = (convId) => {
  if (typeof window === 'undefined') return;
  try {
    if (convId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CONV, convId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONV);
    }
  } catch {}
};

export const loadMessagesTab = () => {
  if (typeof window === 'undefined') return 'message';
  try {
    return localStorage.getItem(STORAGE_KEYS.MESSAGES_TAB) || 'message';
  } catch {
    return 'message';
  }
};

export const saveMessagesTab = (tab) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES_TAB, tab || 'message');
  } catch {}
};
