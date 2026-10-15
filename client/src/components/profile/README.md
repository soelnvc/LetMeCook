# Profile & Awards Library (`client/src/components/profile/`)

> Student campus identity header, avatar customizer modal, coordination history, and gamified awards showcase.

---

## 1. Architecture & Role in System
This directory manages student profile presentation (`activeTab === 'profile'`). It renders student university credentials, connection statistics, hosted dish history, and gamified coordination awards.

---

## 2. Directory Inventory & Module Responsibilities

| Component File | Role | Key Props |
| :--- | :--- | :--- |
| [`ProfileHeader.jsx`](file:///Users/nvc/Documents/LetMeCook/client/src/components/profile/ProfileHeader.jsx) | Instagram-style campus profile header: avatar click-to-change options modal, name, college tag, connection count, bio, and Edit Profile CTA. | `user`, `isOwnProfile`, `onEditProfile`, `onViewAwards` |
| [`AwardsLibrary.jsx`](file:///Users/nvc/Documents/LetMeCook/client/src/components/profile/AwardsLibrary.jsx) | Gamified badge showcase displaying campus coordination achievements ("First Dish Cooked", "Team Captain", "Campus Legend"). | `awards`, `user` |

---

## 3. Responsive Card Layout Strategy
- **Dish History Grid**: Uses `.profile-history-grid`, displaying 3 square cards per row on desktop and collapsing to 1 full-width card on mobile screens (`<= 768px`).
- **Awards Grid**: Uses `.profile-awards-grid`, rendering 3 columns on desktop and 2 columns on mobile.
- **Instant DP Sync**: When the user changes their photo in `ProfileHeader.jsx`, `userAvatarRegistry` notifies the rest of the application immediately with zero page reloading.
