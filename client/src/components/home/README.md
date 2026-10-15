# Home Dashboard (`client/src/components/home/`)

> Home screen hub displaying personalized campus greetings, 3D activity hero banners, stats overview, and saved recipe templates.

---

## 1. Architecture & Role in System
`HomeDashboard.jsx` is the default landing tab (`activeTab === 'home'`). It gives students an immediate overview of their coordination history, provides a 1-click CTA to create a dish, and displays saved recipe templates.

---

## 2. Directory Inventory & Module Responsibilities

| Component File | Role | Key Props |
| :--- | :--- | :--- |
| [`HomeDashboard.jsx`](file:///Users/nvc/Documents/LetMeCook/client/src/components/home/HomeDashboard.jsx) | Master home view: greeting, campus 3D banner, stats metrics (Cooked, Joined, Connections), and saved recipes carousel. | `user`, `dishes`, `onOpenKitchen`, `onViewDish`, `onOpenRecipe` |

---

## 3. UI Hierarchy
1. **Greeting Header**: Dynamic time-of-day greeting (e.g., "Good evening, Sid.") + "Cook a Dish" shortcut button.
2. **Hero Banner**: High-resolution 3D campus banner (`campus-hero.jpg`) with headline "Start the chaos on campus" and "Drop a Dish Now" CTA.
3. **Coordination Stat Cards**: 3-column metric cards showing:
   - **Cooked**: Number of hosted campus tickets.
   - **Joined**: Number of sessions participated in.
   - **Connections**: Total campus peer network count.
4. **Saved Recipes**: Horizontal glassmorphic carousel allowing 1-tap re-cooking of favorite coordination activities.
