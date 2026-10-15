# Global Discovery & Age Gating (`client/src/components/global/`)

> Cross-campus inter-university discovery feed protected by age gating (18+) safeguards.

---

## 1. Architecture & Role in System
While `LetMeCook` defaults to local university coordination, `GlobalPage.jsx` provides an inter-campus discovery radar allowing adult students (18+) to connect with peers and dishes hosted across neighboring institutions.

---

## 2. Directory Inventory & Module Responsibilities

| Component File | Role | Key Props |
| :--- | :--- | :--- |
| [`GlobalPage.jsx`](file:///Users/nvc/Documents/LetMeCook/client/src/components/global/GlobalPage.jsx) | Global discovery feed: age verification checkpoint (18+), cross-campus tickets list, and university filter badges. | `user`, `onSelectDish`, `onOpenKitchen` |

---

## 3. Safety & Age-Gating Policy
- **Age Restriction**: Access requires `user.age >= 18`. Underage student accounts are prohibited from opening the global radar.
- **Verification Badges**: Dishes from verified university accounts display institutional checkmarks to prevent spoofing.
