# REST API Route Definitions (`server/src/routes/`)

> Endpoint declarations mapping URL paths, HTTP methods, route guards, validation schemas, and controller bindings.

---

## 1. Architecture & Role in System
The `routes/` layer serves as the API gateway specification for the Express server. Each domain has a dedicated router file that binds middleware (authentication, rate limiting, validation) to controller actions.

---

## 2. Directory Inventory & Endpoint Catalog

| Route File | Base Path | Primary Endpoints | Auth Requirement |
| :--- | :--- | :--- | :--- |
| [`auth.routes.js`](file:///Users/nvc/Documents/LetMeCook/server/src/routes/auth.routes.js) | `/api/auth` | `POST /register`, `POST /login`, `GET /me`, `POST /verify-email` | Public (`/me` requires JWT) |
| [`dish.routes.js`](file:///Users/nvc/Documents/LetMeCook/server/src/routes/dish.routes.js) | `/api/dishes` | `GET /`, `POST /`, `GET /:id`, `POST /:id/join`, `POST /:id/leave`, `POST /:id/cook` | Bearer JWT required |
| [`connection.routes.js`](file:///Users/nvc/Documents/LetMeCook/server/src/routes/connection.routes.js) | `/api/connections`| `GET /`, `POST /request`, `PUT /:id/accept`, `PUT /:id/reject`, `DELETE /:id` | Bearer JWT required |
| [`message.routes.js`](file:///Users/nvc/Documents/LetMeCook/server/src/routes/message.routes.js) | `/api/messages` | `GET /conversations`, `GET /:userId`, `POST /:userId`, `PUT /:id/read` | Bearer JWT required |
| [`notification.routes.js`](file:///Users/nvc/Documents/LetMeCook/server/src/routes/notification.routes.js) | `/api/notifications` | `GET /`, `PUT /mark-all-read`, `PUT /:id/read` | Bearer JWT required |
| [`recipe.routes.js`](file:///Users/nvc/Documents/LetMeCook/server/src/routes/recipe.routes.js) | `/api/recipes` | `GET /`, `POST /`, `DELETE /:id` | Bearer JWT required |
| [`safety.routes.js`](file:///Users/nvc/Documents/LetMeCook/server/src/routes/safety.routes.js) | `/api/safety` | `POST /report`, `POST /block`, `GET /blocked` | Bearer JWT required |
| [`user.routes.js`](file:///Users/nvc/Documents/LetMeCook/server/src/routes/user.routes.js) | `/api/users` | `GET /search`, `GET /:id`, `PUT /profile`, `PUT /avatar` | Bearer JWT required |

---

## 3. Route Mounting in `server.js`

```javascript
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/dishes', require('./routes/dish.routes'));
app.use('/api/connections', require('./routes/connection.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/recipes', require('./routes/recipe.routes'));
app.use('/api/safety', require('./routes/safety.routes'));
app.use('/api/users', require('./routes/user.routes'));
```

---

## 4. How-To: Declaring a New Route with Schema Validation

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validator.middleware');
const { body } = require('express-validator');
const exampleController = require('../controllers/example.controller');

// POST /api/example/action
router.post(
  '/action',
  authenticateToken,
  [
    body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be >= 1')
  ],
  validateRequest,
  exampleController.handleAction
);

module.exports = router;
```
