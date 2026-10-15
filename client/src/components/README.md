# Component System Index (`client/src/components/`)

> Presentation component library organizing design primitives, navigation shells, domain feeds, and interactive coordination modals.

---

## 1. Architecture & Component Hierarchy

The components library follows Atomic Design principles adapted for single-page applications:

```
               +----------------------------------+
               |     Domain Views & Modals        |
               |  (home/, dish/, dinein/, etc.)   |
               +-----------------+----------------+
                                 |
                                 v
               +----------------------------------+
               |         Layout Shells            |
               |   (Sidebar.jsx, MobileNav.jsx)   |
               +-----------------+----------------+
                                 |
                                 v
               +----------------------------------+
               |         UI Primitives            |
               |  (GlassContainer, FluidButton)   |
               +----------------------------------+
```

---

## 2. Directory Inventory & Module Responsibilities

| Subfolder | Responsibility | Primary Exports |
| :--- | :--- | :--- |
| [`ui/`](file:///Users/nvc/Documents/LetMeCook/client/src/components/ui) | Atomic design system primitives: glass panels, fluid buttons, confirm dialogs, toasts. | `GlassContainer`, `FluidButton`, `CustomConfirmModal` |
| [`layout/`](file:///Users/nvc/Documents/LetMeCook/client/src/components/layout) | Responsive desktop sidebar and mobile fixed top/bottom app navigation bars. | `Sidebar`, `MobileNav` |
| [`home/`](file:///Users/nvc/Documents/LetMeCook/client/src/components/home) | Home dashboard: campus greeting, hero banner, coordination statistics, recipe shortcuts. | `HomeDashboard` |
| [`dish/`](file:///Users/nvc/Documents/LetMeCook/client/src/components/dish) | Ticket card rendering, capacity indicators, dual-tab dish details & live chat modal. | `DishCard`, `DishDetailModal` |
| [`dinein/`](file:///Users/nvc/Documents/LetMeCook/client/src/components/dinein) | Campus Dine-In discovery radar, activity category filter tabs, active ticket feed. | `DineInFeed` |
| [`kitchen/`](file:///Users/nvc/Documents/LetMeCook/client/src/components/kitchen) | Multi-step interactive dish ticket creator wizard. | `KitchenModal` |
| [`messaging/`](file:///Users/nvc/Documents/LetMeCook/client/src/components/messaging) | 1-on-1 direct peer chat, message thread history, emoji picker. | `ConversationList`, `MessageArea`, `EmojiPicker` |
| [`notifications/`](file:///Users/nvc/Documents/LetMeCook/client/src/components/notifications) | Campus peer requests, connection approvals, activity feed, mark-all-read. | `NotificationsView` |
| [`profile/`](file:///Users/nvc/Documents/LetMeCook/client/src/components/profile) | Student identity header, avatar customizer, connection counts, gamified awards. | `ProfileHeader`, `AwardsLibrary` |
| [`search/`](file:///Users/nvc/Documents/LetMeCook/client/src/components/search) | Global peer search modal with debounced live querying and direct connect buttons. | `GlobalSearchModal` |
| [`settings/`](file:///Users/nvc/Documents/LetMeCook/client/src/components/settings) | Account management, profile editing, student ID verification, security & logout. | `SettingsPage` |
| [`global/`](file:///Users/nvc/Documents/LetMeCook/client/src/components/global) | Cross-campus activity discovery feed with 18+ age gating. | `GlobalPage` |

---

## 3. Styling & Aesthetic Guidelines
1. **Glassmorphism**: Wrap content cards and modals in `<GlassContainer radius={...}>`.
2. **Tactile Interactivity**: Use `<FluidButton>` for all primary buttons, pills, and icon triggers to maintain smooth scale and hover transitions.
3. **Typography**: Inter / Outfit fonts, tight negative tracking on headings (`letter-spacing: -0.02em`), semibold weights (`600`) for titles.
