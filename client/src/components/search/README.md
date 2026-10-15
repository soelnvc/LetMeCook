# Global Peer Search Modal (`client/src/components/search/`)

> Instant debounced search modal for finding campus peers, university classmates, and sending connection requests.

---

## 1. Architecture & Role in System
`GlobalSearchModal.jsx` is accessible via the desktop sidebar ("Search") or mobile navigation. It provides debounced, real-time student discovery queried against the backend `/api/users/search` endpoint.

---

## 2. Directory Inventory & Module Responsibilities

| Component File | Role | Key Props |
| :--- | :--- | :--- |
| [`GlobalSearchModal.jsx`](file:///Users/nvc/Documents/LetMeCook/client/src/components/search/GlobalSearchModal.jsx) | Centered glass search modal with auto-focusing input, search history chips, live student result rows, and 1-tap Connect triggers. | `isOpen`, `onClose`, `currentUser`, `onViewProfile` |

---

## 3. Search & Connect Lifecycle

```mermaid
sequenceDiagram
  autonumber
  actor Student as User
  participant Modal as GlobalSearchModal.jsx
  participant Svc as user.service.js
  participant Backend as /api/users/search

  Student->>Modal: Type peer name or @handle (e.g. "Sid")
  Modal->>Modal: Debounce input (250ms)
  Modal->>Svc: searchUsers("Sid")
  Svc->>Backend: GET /api/users/search?q=Sid
  Backend-->>Svc: Array of matching campus users
  Svc-->>Modal: Update searchResults state
  Modal->>Student: Render peer rows with "Connect" buttons
  Student->>Modal: Click "Connect" on Peer
  Modal->>Backend: POST /api/connections/request
  Modal->>Student: Button updates to "Requested"
```
