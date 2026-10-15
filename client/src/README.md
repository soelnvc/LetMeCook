# Frontend Source Root (`client/src/`)

> Application architecture, state conductor, component hierarchy, and client service integrations.

---

## 1. Architecture & Role in System
`client/src/` contains all React source code. State flows top-down from the root conductor (`app/page.js`), with decoupled side-effects managed by Context Providers (`ToastContext`, `ConfirmContext`) and pub/sub registries (`userAvatarRegistry`).

```
+-------------------------------------------------------------+
|                          app/page.js                        |  (Root State Conductor)
+-------------------------------------------------------------+
         |                                           |
         v                                           v
+-----------------------+                 +---------------------+
|   layout/Sidebar      | (Desktop)       |  Domain Feature     |
|   layout/MobileNav    | (Mobile)        |  Components & Modals|
+-----------------------+                 +---------------------+
         |                                           |
         +-------------------+-----------------------+
                             |
                             v
+-------------------------------------------------------------+
|                     services/ + lib/                        |  (REST API Client & Storage)
+-------------------------------------------------------------+
```

---

## 2. Directory Inventory & Module Responsibilities

| Subfolder | Architectural Layer | Primary Responsibility |
| :--- | :--- | :--- |
| [`app/`](file:///Users/nvc/Documents/LetMeCook/client/src/app) | Routing & Styling | Root layout, tab conductor, global glassmorphic CSS rules. |
| [`components/`](file:///Users/nvc/Documents/LetMeCook/client/src/components) | UI Presentation & Modals | Pure design primitives, navigation layouts, and domain feature modals. |
| [`constants/`](file:///Users/nvc/Documents/LetMeCook/client/src/constants) | Static Tokens | Activity genres, default avatar collections, campus categories. |
| [`context/`](file:///Users/nvc/Documents/LetMeCook/client/src/context) | React Context | Global Toast messaging and Confirm dialog providers. |
| [`hooks/`](file:///Users/nvc/Documents/LetMeCook/client/src/hooks) | Custom React Hooks | Reusable stateful logic (`useAuth.js`). |
| [`lib/`](file:///Users/nvc/Documents/LetMeCook/client/src/lib) | Client Infrastructure | HTTP network client, reactive avatar event bus, local message cache. |
| [`services/`](file:///Users/nvc/Documents/LetMeCook/client/src/services) | API Gateway | Typed async functions executing backend REST endpoints. |

---

## 3. Core Development Principles
1. **Monochrome / Glass Aesthetic**: Use frosted glass panels (`GlassContainer`), subtle borders (`rgba(0, 0, 0, 0.08)`), dark charcoal pills (`#18181b`), and fluid buttons (`FluidButton`).
2. **Prop Transparency**: Avoid unnecessary prop-drilling by utilizing React Context for global toasts and confirmations.
3. **No Unstyled Flash**: Ensure skeleton loading states render during async data fetches.
