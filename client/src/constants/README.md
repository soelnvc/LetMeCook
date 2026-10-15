# App Constants & Design Tokens (`client/src/constants/`)

> Immutable domain constants, activity category definitions, default avatar lists, and navigation enums.

---

## 1. Architecture & Role in System
Centralized constants prevent magic strings and values across frontend components. Any addition of an activity genre or default asset must be registered here.

---

## 2. Directory Inventory & Module Responsibilities

| File | Responsibility | Primary Exports |
| :--- | :--- | :--- |
| [`index.js`](file:///Users/nvc/Documents/LetMeCook/client/src/constants/index.js) | Domain genre configurations, icon mappings, status badges, default avatar URLs. | `DISH_GENRES`, `DEFAULT_AVATARS`, `NAV_ITEMS` |

---

## 3. Key Enums & Structures

### Dish Activity Genres (`DISH_GENRES`)
```javascript
export const DISH_GENRES = [
  { id: 'Sports', label: 'Sports', icon: 'Trophy' },
  { id: 'Food', label: 'Dine / Food', icon: 'Coffee' },
  { id: 'Study', label: 'Study Group', icon: 'BookOpen' },
  { id: 'Gaming', label: 'Gaming', icon: 'Gamepad2' },
  { id: 'Hangout', label: 'Campus Hangout', icon: 'Users' },
  { id: 'Travel', label: 'Cab Share / Travel', icon: 'Car' }
];
```
