# Next.js App Router & Global Styling (`client/src/app/`)

> Application shell, root document wrapper, global glassmorphic design system tokens, and main state conductor.

---

## 1. Architecture & Role in System
This directory contains the Next.js App Router entrypoints:
- `layout.js` defines the root HTML document, font loading (`Inter`), meta headers, and global context providers.
- `page.js` acts as the master tab conductor, controlling active tabs (`home`, `dine-in`, `messages`, `profile`, `notifications`, `settings`), and managing modal states.
- `globals.css` defines responsive layout utilities, scrollbar styling, glassmorphism tokens, and mobile media queries.

---

## 2. Directory Inventory & Module Responsibilities

| File | Responsibility |
| :--- | :--- |
| [`layout.js`](file:///Users/nvc/Documents/LetMeCook/client/src/app/layout.js) | Root document wrapper, title/metadata configuration, font setup, Toast and Confirm provider injection. |
| [`page.js`](file:///Users/nvc/Documents/LetMeCook/client/src/app/page.js) | Central UI conductor: user session initialization, active tab switching, modal state triggers, socket/polling loops. |
| [`globals.css`](file:///Users/nvc/Documents/LetMeCook/client/src/app/globals.css) | Core CSS system: custom scrollbars, glass utilities (`.glass-panel`, `.fluid-btn`), responsive desktop/mobile classes. |

---

## 3. Responsive Layout Strategy (`globals.css`)

```css
/* Mobile Viewport: <= 768px */
@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-flex   { display: flex !important; }
  .main-content-layout {
    padding: calc(56px + env(safe-area-inset-top, 0px)) 12px calc(76px + env(safe-area-inset-bottom, 12px)) 12px !important;
  }
}

/* Desktop Viewport: >= 769px */
@media (min-width: 769px) {
  .mobile-only  { display: none !important; }
  .mobile-flex  { display: none !important; }
  .desktop-only { display: block !important; }
}
```

---

## 4. Master Tab Conductor (`page.js`)

`page.js` orchestrates navigation across 6 distinct views:
1. `'home'`: Renders [`HomeDashboard`](file:///Users/nvc/Documents/LetMeCook/client/src/components/home/HomeDashboard.jsx).
2. `'dine-in'`: Renders [`DineInFeed`](file:///Users/nvc/Documents/LetMeCook/client/src/components/dinein/DineInFeed.jsx).
3. `'messages'`: Renders 1-on-1 chats via [`ConversationList`](file:///Users/nvc/Documents/LetMeCook/client/src/components/messaging/ConversationList.jsx) & [`MessageArea`](file:///Users/nvc/Documents/LetMeCook/client/src/components/messaging/MessageArea.jsx).
4. `'profile'`: Renders [`ProfileHeader`](file:///Users/nvc/Documents/LetMeCook/client/src/components/profile/ProfileHeader.jsx) and user dish history.
5. `'notifications'`: Renders [`NotificationsView`](file:///Users/nvc/Documents/LetMeCook/client/src/components/notifications/NotificationsView.jsx).
6. `'settings'`: Renders [`SettingsPage`](file:///Users/nvc/Documents/LetMeCook/client/src/components/settings/SettingsPage.jsx).
