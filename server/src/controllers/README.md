# HTTP Controllers Layer (`server/src/controllers/`)

> Request payload extraction, HTTP parameter parsing, error status mapping, and standardized JSON response framing.

---

## 1. Architecture & Role in System
Controllers act as the HTTP boundary in the 3-tier architecture. They are intentionally thin:
1. Extract and sanitize input parameters (`req.body`, `req.params`, `req.query`, `req.user`).
2. Delegate business logic execution to corresponding services in `src/services/`.
3. Wrap returned data in standardized JSON success envelopes (`{ success: true, data }`) or catch errors and pass them to Express error handlers.

---

## 2. Directory Inventory & Module Responsibilities

| Controller File | Responsibilities | Key Actions Handled |
| :--- | :--- | :--- |
| [`auth.controller.js`](file:///Users/nvc/Documents/LetMeCook/server/src/controllers/auth.controller.js) | Registration, credential login, password hashing, JWT issue, university domain validation | `register`, `login`, `getMe`, `verifyEmail` |
| [`dish.controller.js`](file:///Users/nvc/Documents/LetMeCook/server/src/controllers/dish.controller.js) | Dish creation, radar feed querying, joining, leaving, cooking, muting, kicking | `createDish`, `getDishes`, `joinDish`, `leaveDish`, `finishCooking` |
| [`connection.controller.js`](file:///Users/nvc/Documents/LetMeCook/server/src/controllers/connection.controller.js) | Peer connection requests, accepts, rejections, active peers list | `getConnections`, `sendRequest`, `acceptRequest`, `rejectRequest` |
| [`message.controller.js`](file:///Users/nvc/Documents/LetMeCook/server/src/controllers/message.controller.js) | 1-on-1 thread messages, conversation list, unread indicators, dish room chat | `getConversations`, `getMessages`, `sendMessage`, `getDishMessages` |
| [`notification.controller.js`](file:///Users/nvc/Documents/LetMeCook/server/src/controllers/notification.controller.js) | Notification list fetching, unread counting, bulk mark-as-read | `getNotifications`, `markAllAsRead`, `markAsRead` |
| [`recipe.controller.js`](file:///Users/nvc/Documents/LetMeCook/server/src/controllers/recipe.controller.js) | Saved recipe templates CRUD | `getRecipes`, `saveRecipe`, `deleteRecipe` |
| [`safety.controller.js`](file:///Users/nvc/Documents/LetMeCook/server/src/controllers/safety.controller.js) | User report submissions, blocking, moderation flags | `reportUser`, `blockUser`, `getBlockedUsers` |
| [`user.controller.js`](file:///Users/nvc/Documents/LetMeCook/server/src/controllers/user.controller.js) | Peer profile search, profile details retrieval, profile updates, avatar changes | `searchUsers`, `getUserProfile`, `updateProfile`, `updateAvatar` |

---

## 3. Standard Response Envelope Standard

Every controller method enforces consistent return schemas:

```javascript
// HTTP 200 / 201 OK
res.status(200).json({
  success: true,
  data: result
});

// HTTP 400 / 403 / 404 Failure
res.status(400).json({
  success: false,
  message: 'Descriptive human-readable error string'
});
```

---

## 4. How-To: Writing a Controller Action

```javascript
exports.myAction = async (req, res, next) => {
  try {
    const { paramOne } = req.body;
    const userId = req.user.id; // From auth.middleware

    const result = await myDomainService.executeAction(userId, paramOne);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error); // Passes to error.middleware.js
  }
};
```
