# Custom React Hooks (`client/src/hooks/`)

> Encapsulated reusable stateful hooks for authentication, network sync, and browser integrations.

---

## 1. Architecture & Role in System
Hooks extract complex lifecycle and storage side-effects into reusable primitives, keeping UI components focused purely on presentation and event dispatching.

---

## 2. Directory Inventory & Module Responsibilities

| Hook File | Primary Export | Responsibility |
| :--- | :--- | :--- |
| [`useAuth.js`](file:///Users/nvc/Documents/LetMeCook/client/src/hooks/useAuth.js) | `useAuth()` | Manages JWT token storage in `localStorage`, user session hydration, login/logout transitions, and auth state checks. |

---

## 3. `useAuth()` Contract & Usage

```javascript
import useAuth from '@/hooks/useAuth';

function Header() {
  const { user, token, isAuthenticated, login, logout, updateUser } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={() => setShowAuthModal(true)}>Log in</button>;
  }

  return <div>Welcome back, {user.name}!</div>;
}
```

---

## 4. Security & Storage Gotchas
- **Token Hydration**: Tokens stored in `localStorage` under key `letmecook_token` are automatically injected into outgoing HTTP calls via [`lib/api.js`](file:///Users/nvc/Documents/LetMeCook/client/src/lib/api.js).
- **Session Expiry**: When backend returns `401 Unauthorized`, `api.js` automatically triggers `logout()`, clearing the token and redirecting to the auth modal.
