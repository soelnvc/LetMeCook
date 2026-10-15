# Navigation Layouts & App Shells (`client/src/components/layout/`)

> Responsive desktop sidebar and mobile navigation bars governing view switching and modal triggers.

---

## 1. Architecture & Role in System
This directory houses the persistent application shells that wrap the content area:
- **Desktop (`Sidebar.jsx`)**: Left fixed sidebar expanding from 64px to 210px on hover.
- **Mobile (`MobileNav.jsx`)**: Fixed top brand bar with quick actions + fixed bottom 5-tab navigation bar.

---

## 2. Directory Inventory & Module Responsibilities

| Component File | Platform Target | Visual Structure & Features |
| :--- | :--- | :--- |
| [`Sidebar.jsx`](file:///Users/nvc/Documents/LetMeCook/client/src/components/layout/Sidebar.jsx) | Desktop (`min-width: 769px`) | Pinned Brand on top (`height: 72px`), vertically centered nav items (`Home`, `Dine in`, `Messages`, `Search`, `Notifications`, `Cook`, `Profile`), and bottom-pinned "More" popup menu. |
| [`MobileNav.jsx`](file:///Users/nvc/Documents/LetMeCook/client/src/components/layout/MobileNav.jsx) | Mobile (`max-width: 768px`) | Top bar: `+` Cook button (left), `LetMeCook` centered, Heart Notifications (right). Bottom bar: 5 tabs (`Home`, `Dine in`, `Messages`, `Search`, `Profile`). |

---

## 3. Desktop vs Mobile Layout Coordination

```
Desktop Layout:                               Mobile Layout:
+------+------------------------------+       +------------------------------+
| Logo |                              |       | (+)        LetMeCook      (♥)| (Top Bar)
|------|                              |       +------------------------------+
| Home |                              |       |                              |
| Dine |                              |       |                              |
| Msg  |                              |       |         Content View         |
| Srch |         Content View         |       |                              |
| Notf |                              |       |                              |
| Cook |                              |       +------------------------------+
| Prof |                              |       | [Home] [Dine] [Msg] [Srch] [P]| (Bottom Bar)
|------|                              |       +------------------------------+
| More |                              |
+------+------------------------------+
```

---

## 4. Key Gotchas & Layout Rules
- **Desktop Flex Integrity**: The `<aside>` in `Sidebar.jsx` relies on `display: flex; flex-direction: column; justify-content: space-between; height: 100vh;`. Never apply `.desktop-only` to the `<aside>` element itself (apply it only to the outer wrapper), as `.desktop-only` overrides `display` with `block !important`.
- **Safe Area Insets**: `MobileNav.jsx` uses `calc(env(safe-area-inset-bottom, 6px))` for seamless iPhone notch / home bar support.
