# LetMeCook — Backend Engineering Manual (`server/`)

<div align="center">

```
  ____                                  _   _ ___ 
 / ___|  ___ _ ____   _____ _ __       | | | |_ _|
 \___ \ / _ \ '__\ \ / / _ \ '__|_____ | | | || | 
  ___) |  __/ |   \ V /  __/ | |_____| | |_| || | 
 |____/ \___|_|    \_/ \___|_|          \___/|___|
```

**Express.js REST API Server Engine for Ephemeral Real-World Campus Coordination**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-5.2-black?style=flat&logo=express)](https://expressjs.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-9.10-red?style=flat&logo=mongodb)](https://mongoosejs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_6.0+-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/atlas)
[![JWT](https://img.shields.io/badge/Auth-JWT_Bearer-000000?style=flat&logo=json-web-tokens)](https://jwt.io/)
[![Nodemailer](https://img.shields.io/badge/Mailer-Nodemailer_10.1-blue?style=flat)](https://nodemailer.com/)

</div>

---

## Table of Contents
1. [Backend Architecture Overview](#1-backend-architecture-overview)
2. [Layered Request Pipeline & Execution Flow](#2-layered-request-pipeline--execution-flow)
3. [Core Subsystems & Business Engines](#3-core-subsystems--business-engines)
4. [Master Mongoose Schemas & Indexing Strategy](#4-master-mongoose-schemas--indexing-strategy)
5. [Complete REST API Route Directory](#5-complete-rest-api-route-directory)
6. [Security, Middleware & Rate Limiting](#6-security-middleware--rate-limiting)
7. [Environment Configuration Matrix](#7-environment-configuration-matrix)
8. [DevOps, Seeding & Server Lifecycle](#8-devops-seeding--server-lifecycle)
9. [Backend Troubleshooting & Diagnostics Runbook](#9-backend-troubleshooting--diagnostics-runbook)

---

## 1. Backend Architecture Overview

The `server/` application powers the LetMeCook platform. It is an enterprise-grade RESTful API built on **Express.js (v5)** and **Mongoose (v9)**, managing the ephemeral lifecycle of campus activity coordination tickets ("Dishes"), real-time ephemeral messaging, user reputations (Michelin Stars), and academic university verification.

### Core Architectural Principles
- **Layered Clean Architecture**: Strict separation of concerns where Routes dispatch to Middleware, Controllers translate HTTP to domain objects, Services execute transactional business logic, and Models encapsulate MongoDB queries.
- **Server-Authoritative Validation**: The frontend is considered untrusted. All permissions, capacity ceilings, age protections, and campus domain matching are strictly verified by backend services.
- **Sub-Millisecond University Domain Verification**: Houses an in-memory hash index of over 10,000+ global colleges and universities (`data/world_universities.json`), supporting subdomain walk-up resolution.
- **Automatic TTL Document Expiration**: Leverages native MongoDB TTL indexes for auto-expiring academic OTP codes and temporary activity tickets.

---

## 2. Layered Request Pipeline & Execution Flow

Every HTTP request to the LetMeCook backend traverses a rigorous 8-stage processing pipeline:

```
+----------------------------------------------------------------------------------------------------+
|                                    HTTP Client (Next.js / Mobile)                                   |
|                                    Headers: Authorization: Bearer <jwt>                             |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
| STAGE 1: Global Security & Body Parsing (server.js)                                                |
| - cors(): Validates origin against CLIENT_ORIGIN (http://localhost:3000)                           |
| - express.json({ limit: '1mb' }): Parses incoming JSON payloads and prevents body flooding          |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
| STAGE 2: Global Rate Limiting (generalLimiter)                                                     |
| - Sliding window check: 2,500 req/15m in prod; bypasses chat polling and dev IPs                   |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
| STAGE 3: Route Dispatching & Dedicated Limiting (src/routes/)                                      |
| - Matches route pattern (e.g. POST /api/dishes/:id/join)                                            |
| - Applies route-specific limiters (e.g. authLimiter for login/register, messageLimiter for DMs)     |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
| STAGE 4: Authentication & User Hydration (auth.middleware.js)                                      |
| - Extracts Bearer JWT from Authorization header                                                    |
| - Verifies signature against JWT_SECRET                                                            |
| - Queries MongoDB for User document and populates req.user context                                |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
| STAGE 5: Input Validation & Sanitization (validator.middleware.js)                                 |
| - Executes express-validator rules (e.g. createDishValidator, loginValidator)                      |
| - Returns 400 Bad Request if fields are invalid or malicious                                       |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
| STAGE 6: Controller Layer (src/controllers/)                                                       |
| - Unpacks req.params, req.query, req.body, and req.user                                            |
| - Delegates execution to target Service method                                                     |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
| STAGE 7: Transactional Service Layer (src/services/)                                               |
| - Enforces business rules: capacity checks, underage safety, status transitions, notifications    |
| - Executes Mongoose atomic operations against MongoDB Atlas                                        |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
| STAGE 8: Centralized Error Handler (error.middleware.js)                                           |
| - Catches rejections and formats uniform envelope: { success: false, message: ... }               |
| - Masks internal stack traces in production environment                                            |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Core Subsystems & Business Engines

### 3.1 Database Connection Engine (`src/config/db.js`)
MongoDB Atlas requires reliable DNS resolution for SRV seedlists. `db.js` implements a hardened connection manager:
- **Custom DNS Resolvers**: Automatically binds Google Public DNS (`8.8.8.8`) and Cloudflare DNS (`1.1.1.1`, `1.0.0.1`) to eliminate `ENOTFOUND` errors common on local ISP networks.
- **Connection Retry Loop**: If Atlas rejects the connection due to an unwhitelisted dynamic IP, it sets an auto-reconnect timer for 5 seconds without crashing the server process.
- **Auto-Seeder Hook**: On initial boot, triggers `seedPeers()` to ensure default campus personas and demo dishes exist for instant development testing.

### 3.2 Academic University Verification Service (`src/services/university.service.js`)
To guarantee campus isolation without requiring third-party API dependencies:
- Loads [`data/world_universities.json`](file:///Users/nvc/Documents/LetMeCook/server/src/data/world_universities.json) into a high-performance in-memory `Map` on server boot.
- **Subdomain Walk-Up Resolution**: Handles multi-tier collegiate email subdomains:
  $$\text{student@smail.iitm.ac.in} \longrightarrow \text{Walk up to: } \text{iitm.ac.in} \longrightarrow \text{"IIT Madras"}$$
- **Academic TLD Heuristic Fallback**: Recognizes `.edu`, `.ac.in`, `.edu.in`, `.ac.uk`, and `.edu.au` institutions even if omitted from the static dataset.
- **Autocomplete Engine**: Exposes `searchUniversities(query, limit)` allowing the frontend search modal to query colleges with sub-2ms response times.

### 3.3 Dish Lifecycle & Capacity Engine (`src/services/dish.service.js`)
Manages the real-world coordination state machine:
- **Capacity Lock**: Enforces atomic capacity constraints (`participants.length < capacity.max`) preventing over-subscription when multiple users join simultaneously.
- **Underage Safety Protection**: If a student's age is under 18, their created dishes are automatically restricted from `global` visibility and locked to `institute` only.
- **Join Modes**:
  - `auto`: Instant slot reservation and member insertion.
  - `approval`: Creates a pending request in the `requests` array and dispatches an instant notification to the host.
  - `invite_only`: Requires the student's ID to exist in `dish.invitedUsers`.
- **Ephemeral Group Chat**: Maintains isolated group messaging inside the dish ticket with host moderation tools (`kickParticipant`, `toggleMuteParticipant`).

### 3.4 Direct Messaging Engine (`src/services/message.service.js`)
- Enforces an Instagram/WhatsApp-style single conversation thread between any two users.
- Separates mutual connection messages from inbound message requests from unverified users.

---

## 4. Master Mongoose Schemas & Indexing Strategy

LetMeCook maintains 9 tightly modeled Mongoose collections in [`src/models/`](file:///Users/nvc/Documents/LetMeCook/server/src/models):

### 4.1 Schema Field Map

| Model | Primary Fields & Types | Indexing Strategy |
| :--- | :--- | :--- |
| [`User.js`](file:///Users/nvc/Documents/LetMeCook/server/src/models/User.js) | `username` (Str, unique), `email` (Str, unique), `mobile` (Str, unique), `passwordHash` (Str, `select: false`), `emailVerified` (Bool), `avatar` (Str), `bio` (Str), `interests` ([Str]), `institute` (Obj: name, domain, verified), `privacy` (Obj), `stats` (Obj: dishesCreated, dishesJoined, michelinStars) | Unique on `username`, `email`, `mobile`. Index on `institute.domain`. |
| [`Dish.js`](file:///Users/nvc/Documents/LetMeCook/server/src/models/Dish.js) | `creator` (Ref: User), `description` (Str), `category` (Enum: sport, study, travel, food, gaming, social, help, learning, other), `status` (Enum: lets_cook, cooking, cooked), `timing` (cookStart, cookEnd, cookingStart, cookingEnd), `capacity` (max, unlimited), `joinMode` (auto, approval, invite_only), `participants` ([{ user, joinedAt, role }]), `location` (scope, areaName) | Compound index `{ category: 1, status: 1 }`. Index on `creator`, `timing.cookEnd`. |
| [`Message.js`](file:///Users/nvc/Documents/LetMeCook/server/src/models/Message.js) | `conversationId` (Str), `sender` (Ref: User), `recipient` (Ref: User), `content` (Str), `status` (sent, delivered, read), `isRequest` (Bool), `createdAt` (Date) | Compound index `{ conversationId: 1, createdAt: 1 }`. Index on `sender`, `recipient`. |
| [`DishMessage.js`](file:///Users/nvc/Documents/LetMeCook/server/src/models/DishMessage.js)| `dish` (Ref: Dish), `sender` (Ref: User), `content` (Str), `createdAt` (Date) | Compound index `{ dish: 1, createdAt: 1 }`. |
| [`Connection.js`](file:///Users/nvc/Documents/LetMeCook/server/src/models/Connection.js) | `requester` (Ref: User), `recipient` (Ref: User), `status` (pending, accepted, rejected, blocked), `createdAt` (Date) | Compound unique index `{ requester: 1, recipient: 1 }`. |
| [`Notification.js`](file:///Users/nvc/Documents/LetMeCook/server/src/models/Notification.js)| `recipient` (Ref: User), `sender` (Ref: User), `type` (Enum: dish_invite, join_request, dish_status, connection_request, michelin_star), `dish` (Ref: Dish), `isRead` (Bool), `createdAt` (Date) | Compound index `{ recipient: 1, isRead: 1, createdAt: -1 }`. |
| [`Verification.js`](file:///Users/nvc/Documents/LetMeCook/server/src/models/Verification.js)| `email` (Str, lowercase), `code` (Str, hashed OTP), `type` (institute_email, password_reset), `attempts` (Num), `expiresAt` (Date) | **TTL Index**: `{ expiresAt: 1 }` with `expireAfterSeconds: 0`. |
| [`Report.js`](file:///Users/nvc/Documents/LetMeCook/server/src/models/Report.js) | `reporter` (Ref: User), `targetType` (user, dish, message), `targetId` (ObjectId), `reason` (Enum: harassment, spam, safety, other), `status` (open, resolved) | Index on `status`, `targetId`. |
| [`Recipe.js`](file:///Users/nvc/Documents/LetMeCook/server/src/models/Recipe.js) | `user` (Ref: User), `title` (Str), `category` (Str), `defaultCapacity` (Num), `durationMinutes` (Num) | Index on `user`. |

---

## 5. Complete REST API Route Directory

All routes are mounted under the base `/api` path:

### 5.1 Auth Router (`/api/auth`)
- `POST /api/auth/register`
  - **Middleware**: `validate(registerValidator)`
  - **Payload**: `{ username, name, email, mobile, password }`
  - **Action**: Hashes password using bcrypt (work factor 10), initializes default Michelin stars (0), returns signed JWT.
- `POST /api/auth/login`
  - **Middleware**: `authLimiter`, `validate(loginValidator)`
  - **Payload**: `{ emailOrUsername, password }`
  - **Action**: Validates credentials, updates last active timestamp, returns JWT and user profile.
- `GET /api/auth/me`
  - **Middleware**: `authMiddleware`
  - **Action**: Hydrates user context from token.
- `POST /api/auth/change-password`
  - **Middleware**: `authMiddleware`
  - **Payload**: `{ oldPassword, newPassword }`

### 5.2 Dishes Router (`/api/dishes`)
- `GET /api/dishes`
  - **Access**: Public / Authenticated Hybrid
  - **Query Params**: `category`, `status`, `scope` (`institute` or `global`), `search`
- `GET /api/dishes/:id`
  - **Action**: Retrieves full dish details, populating host and joined participants.
- `POST /api/dishes`
  - **Middleware**: `authMiddleware`, `validate(createDishValidator)`
  - **Payload**: `{ description, category, capacity: { max }, joinMode, timing: { cookStart, cookEnd }, location }`
- `POST /api/dishes/:id/join`
  - **Middleware**: `authMiddleware`
  - **Action**: Automatically joins dish if `auto`, or files join request if `approval`.
- `POST /api/dishes/:id/leave`
  - **Middleware**: `authMiddleware`
  - **Action**: Removes participant from `participants` array and frees capacity slot.
- `PATCH /api/dishes/:id/status`
  - **Middleware**: `authMiddleware` (Host only)
  - **Payload**: `{ status: 'cooking' | 'cooked' }`
- `DELETE /api/dishes/:id`
  - **Middleware**: `authMiddleware` (Host only)
- `GET /api/dishes/:id/chat`
  - **Middleware**: `authMiddleware` (Participants only)
- `POST /api/dishes/:id/chat/messages`
  - **Middleware**: `authMiddleware` (Participants only)
  - **Payload**: `{ content: String }`
- `POST /api/dishes/:id/kick`
  - **Middleware**: `authMiddleware` (Host only)
  - **Payload**: `{ userId: ObjectId }`
- `POST /api/dishes/:id/mute`
  - **Middleware**: `authMiddleware` (Host only)
  - **Payload**: `{ userId: ObjectId }`

### 5.3 Direct Messaging Router (`/api/messages`)
- `GET /api/messages/conversations`
  - **Middleware**: `authMiddleware`
  - **Action**: Retrieves all conversations sorted by latest message timestamp with unread counts.
- `GET /api/messages/conversations/:conversationId`
  - **Middleware**: `authMiddleware`
  - **Action**: Returns paginated message list for target conversation thread.
- `POST /api/messages`
  - **Middleware**: `authMiddleware`, `messageLimiter`, `validate(messageValidator)`
  - **Payload**: `{ recipientId, content }`
- `POST /api/messages/requests/:conversationId/respond`
  - **Middleware**: `authMiddleware`
  - **Payload**: `{ action: 'accept' | 'reject' }`

### 5.4 Safety, Verifications & Reports (`/api/safety`)
- `GET /api/safety/verifications/institute/lookup`
  - **Query**: `?query=domain_or_name`
  - **Action**: Autocompletes university against in-memory registry.
- `POST /api/safety/verifications/institute/request-otp`
  - **Middleware**: `authMiddleware`
  - **Payload**: `{ email: 'student@campus.ac.in' }`
  - **Action**: Matches email domain to verified university, creates TTL verification record, and dispatches email via Nodemailer.
- `POST /api/safety/verifications/institute/verify-otp`
  - **Middleware**: `authMiddleware`
  - **Payload**: `{ email, code }`
  - **Action**: Validates 6-digit code, marks `emailVerified: true`, links university name and domain to user record.
- `POST /api/safety/reports`
  - **Middleware**: `authMiddleware`
  - **Payload**: `{ targetType, targetId, reason, description }`
- `GET /api/safety/my-reports`
  - **Middleware**: `authMiddleware`

### 5.5 Connections Router (`/api/connections`)
- `GET /api/connections`: List mutual connections.
- `GET /api/connections/requests`: List incoming requests.
- `GET /api/connections/sent`: List outgoing requests.
- `POST /api/connections/:userId`: Send connection invite.
- `DELETE /api/connections/:userId`: Sever connection.
- `POST /api/connections/:id/respond`: Accept or reject request.
- `POST /api/connections/:userId/block`: Block user.

### 5.6 User Router (`/api/users`)
- `PATCH /api/users/me`: Update profile (bio, interests, avatar, privacy).
- `GET /api/users/search`: Search peers by name/username/interests.
- `GET /api/users/:username`: View sanitized profile.
- `POST /api/users/me/block`: Add user to personal blocklist.
- `DELETE /api/users/me/block/:username`: Remove user from blocklist.

---

## 6. Security, Middleware & Rate Limiting

### 6.1 Authentication (`auth.middleware.js`)
Protected routes require the HTTP header:
```
Authorization: Bearer <json_web_token>
```
The middleware decodes the token using `jwt.verify()`, extracts the `userId`, queries MongoDB for the user document (excluding `passwordHash`), and attaches it to `req.user`. If token is absent, malformed, or expired, it returns:
```json
{ "success": false, "message": "Access denied. Invalid or expired token." }
```

### 6.2 Tiered Rate Limiters (`rateLimit.middleware.js`)
Configured using `express-rate-limit` with intelligent development environment bypass:
- **`generalLimiter`**: 2,500 requests per 15-minute window for general API operations.
- **`authLimiter`**: 30 requests per 15-minute window for `/api/auth/login` and `/api/auth/register` to prevent brute-force attacks.
- **`messageLimiter`**: 60 messages per minute on `/api/messages` to prevent automated messaging spam.

### 6.3 Centralized Error Handling (`error.middleware.js`)
All thrown errors or unhandled asynchronous promise rejections are channeled into `error.middleware.js`:
- Formats errors into standard JSON envelope.
- Parses Mongoose validation errors (returns concise human-readable messages).
- Handles MongoDB duplicate key errors (code `11000`) returning clean conflict notifications.
- Strips stack traces in production to prevent leaking server directory paths.

---

## 7. Environment Configuration Matrix

The backend requires the following keys in `server/.env`:

| Variable | Type | Required | Default | Description | Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `PORT` | Number | No | `5001` | Local port on which Express server listens | `5001` |
| `NODE_ENV` | String | No | `development` | Server runtime mode (`development`, `production`) | `development` |
| `MONGO_URI` | String | **Yes** | — | MongoDB Atlas SRV connection string | `mongodb+srv://user:pass@cluster.mongodb.net/letmecook` |
| `JWT_SECRET` | String | **Yes** | — | Cryptographic secret for signing Bearer JWTs | `a9f82d4e8c1b...` |
| `CLIENT_ORIGIN` | String | No | `http://localhost:3000` | Whitelisted origin for CORS headers | `http://localhost:3000` |
| `SMTP_HOST` | String | No | `smtp.gmail.com`| SMTP server host for academic OTP delivery | `smtp.gmail.com` |
| `SMTP_PORT` | Number | No | `587` | SMTP communication port (TLS) | `587` |
| `SMTP_USER` | String | No | — | Authorized campus email sender account | `verify@letmecook.app` |
| `SMTP_PASS` | String | No | — | SMTP application-specific password | `xxxx xxxx xxxx xxxx` |

---

## 8. DevOps, Seeding & Server Lifecycle

### 8.1 Local Startup & Hot Reloading
```bash
cd server
npm install
npm run dev
# Launches nodemon watching src/ directory
```

### 8.2 Production Startup
```bash
npm start
# Launches directly via node src/server.js
```

### 8.3 Starter Peer Seeding (`src/utils/seedPeers.js`)
When MongoDB connects, `seedPeers()` runs automatically to verify database health. If the `users` collection has fewer than 3 users, it populates realistic campus personas (with diverse interests such as badminton, chess, study groups, and coding) so that developers can test feed interactions immediately without manual account creation.

### 8.4 Health Check Endpoint
```bash
curl http://localhost:5001/api/health
# Returns: { "success": true, "message": "LetMeCook server running" }
```

---

## 9. Backend Troubleshooting & Diagnostics Runbook

### 1. MongoDB Atlas DNS SRV Resolution Failure
**Symptom**: `querySrv ENOTFOUND _mongodb._tcp.cluster0.xxxx.mongodb.net`  
**Cause**: The local WiFi or ISP DNS server does not support recursive SRV or TXT DNS record queries.  
**Resolution**: `db.js` automatically binds Google (`8.8.8.8`) and Cloudflare (`1.1.1.1`) DNS. If the issue persists, switch your machine's system DNS settings to `8.8.8.8` or use the standard non-SRV connection string format (`mongodb://host1,host2...`).

### 2. MongoDB Atlas Network Access Denied (`MongooseServerSelectionError`)
**Symptom**: `Could not connect to any servers in your MongoDB Atlas cluster`  
**Resolution**:
1. Log in to [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. Navigate to **Network Access** under Security.
3. Click **Add IP Address** $\rightarrow$ **Add Current IP Address** (or `0.0.0.0/0` for development).
4. The server's auto-reconnect loop will automatically establish the connection once whitelisted.

### 3. SMTP Verification Email Delivery Failures
**Symptom**: `Error sending verification email: Invalid login`  
**Resolution**:
- If using Gmail SMTP, you must use an **App Password**, not your raw Google password. Generate one under Google Account $\rightarrow$ Security $\rightarrow$ 2-Step Verification $\rightarrow$ App Passwords.

---

<div align="center">
  <sub>LetMeCook Server Engineering • Scalable, secure, and ephemeral backend core.</sub>
</div>
