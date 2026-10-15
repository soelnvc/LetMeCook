# Client Web Application (`client/`)

> Next.js 16 (React 19) frontend application providing an ephemeral, glassmorphic user interface for real-time campus activity coordination.

---

## 1. Architecture & Role in System
The `client/` directory contains the modern Single Page Application (SPA) built with Next.js App Router, Tailwind CSS v4, Vanilla CSS tokens, and Lucide React iconography.

- **Port**: Default `3000` (`http://localhost:3000`).
- **Rendering Model**: Client-side reactive rendering (`'use client'`) with Turbopack for lightning-fast HMR.
- **Design Language**: Custom Glassmorphism (frosted backgrounds, backdrop filters, fluid interactive buttons, micro-animations, and minimal typography).

---

## 2. Directory Inventory & Module Responsibilities

| Subfolder | Domain Responsibility |
| :--- | :--- |
| [`public/`](file:///Users/nvc/Documents/LetMeCook/client/public) | Static graphics, default avatars, dish hero banners, and favicon assets. |
| [`src/app/`](file:///Users/nvc/Documents/LetMeCook/client/src/app) | Next.js App Router entrypoints (`layout.js`, `page.js`) and global styles (`globals.css`). |
| [`src/components/`](file:///Users/nvc/Documents/LetMeCook/client/src/components) | UI primitives, design system elements, navigation layouts, and domain feature modals. |
| [`src/constants/`](file:///Users/nvc/Documents/LetMeCook/client/src/constants) | Campus genre types, status pills, default avatars, and app-wide constants. |
| [`src/context/`](file:///Users/nvc/Documents/LetMeCook/client/src/context) | React Context state managers (`ToastContext`, `ConfirmContext`). |
| [`src/hooks/`](file:///Users/nvc/Documents/LetMeCook/client/src/hooks) | Custom reusable hooks (`useAuth.js`). |
| [`src/lib/`](file:///Users/nvc/Documents/LetMeCook/client/src/lib) | HTTP client (`api.js`), persistent message storage, avatar update bus, date helpers. |
| [`src/services/`](file:///Users/nvc/Documents/LetMeCook/client/src/services) | Client-side API gateways communicating with the backend REST endpoints. |

---

## 3. Scripts & Developer Workflows

```bash
# 1. Install dependencies
cd client
npm install

# 2. Start local Turbopack development server
npm run dev

# 3. Compile and validate production bundle
npm run build

# 4. Lint code for style and Next.js best practices
npm run lint
```

---

## 4. Key Performance & Responsive Breakpoints
- **Mobile Breakpoint**: `max-width: 768px` (Activates fixed mobile header, bottom 5-tab nav, and 1-column cards).
- **Desktop Breakpoint**: `min-width: 769px` (Activates expanding 64px-to-210px sidebar, multi-column feeds, and desktop modals).
- **Zero-Flicker DP Sync**: Uses `userAvatarRegistry.js` custom pub/sub to update all avatar references instantly across the DOM when a user updates their profile photo.
