# Notifications & Invitations Hub (`client/src/components/notifications/`)

> Campus peer connection requests, activity invites, and notification feed.

---

## 1. Architecture & Role in System
`NotificationsView.jsx` (`activeTab === 'notifications'`) is the coordination inbox. It displays incoming campus peer requests, connection approvals, and invitations to join dishes.

---

## 2. Directory Inventory & Module Responsibilities

| Component File | Role | Key Props |
| :--- | :--- | :--- |
| [`NotificationsView.jsx`](file:///Users/nvc/Documents/LetMeCook/client/src/components/notifications/NotificationsView.jsx) | Master notification panel: category tabs (`All`, `Requests`, `Connections`), pending connection cards with Accept/Reject buttons, and mark-all-read action. | `currentUser`, `onViewProfile`, `onNavigateToMessages` |

---

## 3. Notification Card Specifications
- **Avatar & Overlay Badge**: 38px circular avatar with a 17px overlay icon indicating action type (green check for connection accepted, blue peer for connection added, dark ticket for dish invite).
- **Interactive Action Buttons**:
  - `Accept`: Normal grey glass `FluidButton` (`padding: 5px 14px`, `fontSize: 12px`, `fontWeight: 600`).
  - `Reject`: Compact decline button (`padding: 5px 11px`, `fontSize: 12px`, `fontWeight: 500`).
  - `Message`: Direct shortcut to launch 1-on-1 chat once connected.
- **Mark All Read**: Pinned to the top header (`fontSize: 12px`, `fontWeight: 500`), triggering bulk status update on `/api/notifications/mark-all-read`.
