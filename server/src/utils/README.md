# Pure Server Utilities & Seeders (`server/src/utils/`)

> Stateless helper functions, regex validation rules, and mock database seeders.

---

## 1. Architecture & Role in System
This directory contains pure, reusable helper functions that have zero coupling to HTTP contexts or business services.

---

## 2. Directory Inventory & Module Responsibilities

| File | Purpose | Primary Exports |
| :--- | :--- | :--- |
| [`validators.js`](file:///Users/nvc/Documents/LetMeCook/server/src/utils/validators.js) | Pure regex validation patterns and verification rules. | `isValidEmail`, `isValidUsername`, `isValidPassword` |
| [`seedPeers.js`](file:///Users/nvc/Documents/LetMeCook/server/src/utils/seedPeers.js) | Standalone script populating mock campus peers and dishes for local development and demos. | Executable seeder script |

---

## 3. How-To: Running the Peer Seeder

To populate mock peers and active dishes for your local campus network:

```bash
cd server
node src/utils/seedPeers.js
```
*(Ensure `.env` contains a valid `MONGO_URI` before executing).*
