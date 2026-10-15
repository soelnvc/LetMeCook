# Dine-In Radar & Activity Discovery (`client/src/components/dinein/`)

> Campus activity discovery radar featuring category filter pills, scope toggles, and live ticket grids.

---

## 1. Architecture & Role in System
`DineInFeed.jsx` represents the active coordination feed (`activeTab === 'dine-in'`). It queries active campus tickets, filters by categories (`Sports`, `Food`, `Study`, `Gaming`, `Hangout`, `Travel`), and renders responsive grid layouts.

---

## 2. Directory Inventory & Module Responsibilities

| Component File | Role | Key Props |
| :--- | :--- | :--- |
| [`DineInFeed.jsx`](file:///Users/nvc/Documents/LetMeCook/client/src/components/dinein/DineInFeed.jsx) | Master discovery view: segmented category selector, scope toggles (`Campus` vs `Global`), ticket grid, and empty states. | `currentUser`, `onSelectDish`, `onOpenKitchen`, `onViewProfile` |

---

## 3. Data Flow & Filter State

```mermaid
graph LR
  User[Student Interaction] --> Filter[Select Category Filter: Sports / Food / etc.]
  Filter --> Fetch[dishService.getDishes({ category, scope })]
  Fetch --> State[Update dishes array state]
  State --> Render[Render DishCard grid with skeleton loading]
```

---

## 4. Responsive Layout Guidelines
- **Grid Layout**: Uses `.dinein-grid` (`grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`) on desktop, collapsing to 1 full-width column on mobile screens (`<= 768px`).
- **Horizontal Scrollbar**: Category pills use `.mobile-horiz-scroll` with `scrollbar-width: none` for smooth touch scrolling on smartphones.
