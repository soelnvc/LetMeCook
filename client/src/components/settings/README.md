# Settings & Account Management (`client/src/components/settings/`)

> Student account settings, profile editing, university email verification, privacy toggles, and session logout.

---

## 1. Architecture & Role in System
`SettingsPage.jsx` (`activeTab === 'settings'`) implements a 2-column settings portal:
- **Left Column**: Section navigation list (`Edit Profile`, `Account & Verification`, `Privacy & Security`, `Theme & Appearance`).
- **Right Column**: Active form panel with field validation, avatar upload, and save handlers.

---

## 2. Directory Inventory & Module Responsibilities

| Component File | Role | Key Sections Handled |
| :--- | :--- | :--- |
| [`SettingsPage.jsx`](file:///Users/nvc/Documents/LetMeCook/client/src/components/settings/SettingsPage.jsx) | Master settings view: personal credentials, bio, interests, email verification, age, and password management. | `edit_profile`, `verification`, `privacy`, `appearance` |

---

## 3. Responsive Column Stacking
- **Desktop (`>= 769px`)**: 2-column layout (fixed 270px left menu + scrollable right form content).
- **Mobile (`<= 768px`)**: Single-column drilldown. Selecting a section hides the menu and presents the form panel with a "Back to Settings" navigation bar.
