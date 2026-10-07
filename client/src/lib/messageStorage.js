/**
 * messageStorage.js
 * Persistent client-side storage engine for LetMeCook messaging.
 * Guarantees zero-flicker hydration on page reloads (Cmd+R / F5)
 * and seamless offline/draft persistence like Instagram & WhatsApp.
 */

const STORAGE_KEYS = {
  CONVERSATIONS: 'letmecook_conversations_cache',
  MESSAGES: 'letmecook_messages_cache',
  ACTIVE_CONV: 'letmecook_active_conv',
  MESSAGES_TAB: 'letmecook_messages_tab'
};

export const loadLocalConversations = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load local conversations:', err);
    return [];
  }
};

export const saveLocalConversations = (conversations) => {
  if (typeof window === 'undefined' || !Array.isArray(conversations)) return;
  try {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
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
