# Static Public Assets (`client/public/`)

> Static media, illustrations, icons, and hero artwork served directly by Next.js at the root `/` path.

---

## 1. Architecture & Role in System
Files in `client/public/` are served statically by Next.js without bundling or build processing. They can be referenced anywhere in client code starting from the root URL (e.g. `/images/campus-hero.jpg`).

---

## 2. Directory Inventory & Module Responsibilities

| Subfolder | Description |
| :--- | :--- |
| [`images/`](file:///Users/nvc/Documents/LetMeCook/client/public/images) | High-resolution photography, banner illustrations, and glassmorphic lighting flares. |

---

## 3. Usage Guidelines
- Reference static assets using absolute root paths: `<img src="/images/campus-hero.jpg" alt="Hero" />`.
- Compress large images using WebP or optimized JPEG to maintain fast initial page load times.
