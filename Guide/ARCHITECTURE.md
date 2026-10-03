# LetMeCook — ARCHITECTURE

## 1. Purpose

This document defines the technical architecture of LetMeCook.

The architecture should remain:

* Modular
* Maintainable
* Secure
* Easy to understand
* Easy to extend
* Appropriate for a single full-stack application

Do not introduce unnecessary distributed systems or complex infrastructure.

---

# 2. Application Structure

The repository is divided into two independent applications:

```text
LetMeCook/
│
├── Client/
│
└── Server/
```

## Client

Responsible for:

* UI
* User interaction
* Client-side state
* API consumption
* Form handling
* Client-side validation
* Navigation
* Real-time UI updates

## Server

Responsible for:

* Authentication
* Authorization
* Business logic
* Data validation
* Database operations
* Privacy enforcement
* Dish lifecycle
* Messaging
* Notifications
* Verification
* Moderation

The Client must never be considered a trusted environment.

---

# 3. Backend Architecture

Use a layered backend architecture:

```text
Request
   ↓
Routes
   ↓
Middleware
   ↓
Controller
   ↓
Service
   ↓
Model
   ↓
MongoDB
```

## Routes

Routes define:

* HTTP method
* Endpoint
* Middleware
* Controller

Routes should not contain business logic.

Example:

```text
POST /api/dishes
        ↓
authMiddleware
        ↓
dishController.createDish
        ↓
dishService.createDish
```

---

# 4. Controllers

Controllers handle HTTP concerns.

A controller should:

1. Read request data.
2. Validate basic request structure.
3. Call the appropriate service.
4. Return the response.
5. Pass errors to the error middleware.

Controllers should remain thin.

Do not put complex business logic inside controllers.

Bad:

```text
Controller
 ├── authorization logic
 ├── database queries
 ├── eligibility logic
 ├── Dish state transitions
 └── response
```

Preferred:

```text
Controller
      ↓
Service
      ↓
Model
```

---

# 5. Services

Services contain business logic.

Examples:

```text
auth.service.js
dish.service.js
matching.service.js
notification.service.js
verification.service.js
```

Services are responsible for rules such as:

* Can this user join this Dish?
* Is this Dish still joinable?
* Is this user eligible for a Chef's Special?
* Can this user message another user?
* Can this user approve this request?
* Should this Dish move to another state?
* Which users should receive a notification?

Services should not depend on HTTP request/response objects.

---

# 6. Models

Models define MongoDB schemas and database-level behavior.

Initial models:

```text
User
Dish
Connection
Message
Notification
Verification
Report
```

Models should remain focused on data representation.

Complex cross-model business rules belong in services.

---

# 7. Middleware

Initial middleware:

```text
auth.middleware.js
error.middleware.js
upload.middleware.js
rateLimit.middleware.js
```

## Authentication Middleware

Validates the authenticated user.

It should attach the authenticated user's identity to the request.

Example:

```text
req.user
```

Never trust:

```text
req.body.userId
```

as proof of identity.

---

# 8. Authentication

Authentication should use:

* Mobile verification
* Email verification
* Secure authentication tokens/session mechanism

The exact implementation should be defined before coding authentication.

Passwords, tokens and verification credentials must never be stored insecurely.

Protected API endpoints must require authentication.

---

# 9. Authorization

Authentication answers:

> Who is this user?

Authorization answers:

> Is this user allowed to perform this action?

Authorization must happen server-side.

Examples:

A user may:

* Edit their own profile.
* Edit their own Dish.
* Approve participants for their own Dish.
* Delete their own Dish.

A user may not:

* Edit another user's profile.
* Approve another user's Dish request.
* Access another user's private data.
* Read another user's private messages.

---

# 10. Dish Architecture

Dish is the primary domain object.

A Dish contains:

```text
Creator
Description
Category
Type
Status
Timing
Capacity
Participants
Join Mode
Location Scope
Eligibility
Visibility
```

Dish state:

```text
LET'S COOK
     ↓
COOKING
     ↓
COOKED
```

The database may contain additional internal states when required.

---

# 11. Dish State Transitions

State transitions must be controlled by backend services.

Example:

```text
Let's Cook
    ↓
Creator confirms
    ↓
Cooking
    ↓
Activity finishes
    ↓
Cooked
```

Do not allow the client to directly set arbitrary Dish states.

The server determines whether a transition is valid.

---

# 12. Dish Discovery

Dine-in queries the backend for eligible active Dishes.

Discovery should consider:

* Dish status
* Visibility
* Location scope
* User eligibility
* Capacity
* Timing
* Institute
* Category
* User privacy
* Global/local scope

The backend must filter out Dishes the user is not allowed to see.

The frontend must not receive private Dishes and simply hide them.

---

# 13. Matching

Matching/relevance logic should remain modular.

Initial matching signals may include:

```text
Location
Timing
Interest
Category
Institute
Availability
Previous activity
```

Do not introduce machine learning unless explicitly requested.

A deterministic scoring/filtering system is sufficient for the initial product.

---

# 14. Messaging Architecture

There are two interaction types.

## Private DM

One-to-one conversation.

Flow:

```text
User A
  ↓
Message Request
  ↓
User B accepts
  ↓
Private DM
```

## Dish Chat

Contextual conversation associated with a Dish.

Dish chat is available to appropriate Dish participants.

Private DMs and Dish chats should remain logically separate.

---

# 15. Real-Time Communication

Real-time functionality may be used for:

* Messaging
* Dish chat
* Join requests
* Notifications
* Live Dish status

Use WebSockets or an appropriate real-time technology only where real-time behavior is actually required.

Do not make the entire application dependent on persistent sockets.

---

# 16. Notifications

Notifications may be generated by events such as:

```text
Dish invite
Join request
Join approval
Dish status change
Message request
New message
Connection request
Verification result
Dish reminder
```

Notification creation should be handled centrally.

Do not duplicate notification logic across multiple controllers.

---

# 17. Verification

Verification consists of separate concepts:

```text
Account verification
Institute verification
Optional identity verification
```

Verification status should be represented separately from the user's normal profile data.

Sensitive verification documents must never be returned through normal profile APIs.

---

# 18. Privacy Architecture

Privacy settings belong to the User model.

Examples:

```text
bioVisibility
instituteVisibility
dpVisibility
invitePermission
messagePermission
globalDiscovery
activityVisibility
```

Every API returning user information must respect these settings.

Privacy should be enforced at the service/API layer, not merely in the frontend.

---

# 19. Location Architecture

Do not store or expose exact location unnecessarily.

Use approximate geographic information for discovery.

Possible implementation:

```text
latitude
longitude
```

may exist internally for distance calculations, but APIs should return only approved approximate information.

Exact coordinates must never be included in public profile responses.

---

# 20. File Uploads

User-uploaded assets may include:

* Profile pictures
* Verification documents

These should not be stored directly in the public application repository.

Use dedicated storage.

Uploads must have:

* File type validation
* Size limits
* Authentication
* Authorization
* Safe filenames
* Access control

Government identity documents require stricter access control.

---

# 21. Error Architecture

Use centralized error handling.

Expected flow:

```text
Service throws error
        ↓
Controller passes error
        ↓
Error middleware
        ↓
Standard API response
```

Example:

```json
{
  "success": false,
  "message": "You are not eligible to join this Dish."
}
```

Do not expose:

* Stack traces
* Database errors
* Internal file paths
* Secrets
* Tokens

in production responses.

---

# 22. Validation

Validate external input at the server boundary.

Validation is required for:

* Authentication
* Profile updates
* Dish creation
* Dish updates
* Join requests
* Messages
* Connections
* Reports
* Verification data
* File uploads

Client-side validation improves UX.

Server-side validation provides security.

Both may exist.

---

# 23. Rate Limiting

Rate limiting should protect:

* Authentication
* OTP requests
* Message requests
* Messaging
* Dish creation
* Join requests
* Reports
* Verification endpoints

Limits should be introduced according to actual abuse risk.

---

# 24. API Design

Use REST APIs initially.

Base path:

```text
/api
```

Example:

```text
/api/auth
/api/users
/api/dishes
/api/connections
/api/messages
/api/notifications
/api/verification
/api/reports
```

Use consistent HTTP methods and response structures.

---

# 25. API Response Convention

Use a predictable structure.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Something went wrong."
}
```

Additional metadata may be included when necessary.

---

# 26. Pagination

Potentially large resources must use pagination.

Examples:

* Dine-in Dishes
* Messages
* Notifications
* Connections
* Dish history

Do not return unlimited records from the database.

Cursor-based pagination may be introduced when appropriate.

---

# 27. Search

Search should initially remain simple.

Potential search targets:

* Users
* Dishes
* Institutes

Do not introduce a dedicated search engine until MongoDB queries are insufficient.

---

# 28. Configuration

Environment-specific configuration must use environment variables.

Examples:

```text
PORT
MONGO_URI
JWT_SECRET
EMAIL_PROVIDER_KEY
STORAGE_PROVIDER_KEY
```

Never commit secrets.

Provide a safe `.env.example`.

---

# 29. Logging

Production logs should be useful but should never contain sensitive information.

Never log:

* Passwords
* OTPs
* Authentication tokens
* Government ID information
* Private messages
* Exact sensitive addresses

Use structured logging when the application grows.

---

# 30. Testing Strategy

Testing should exist at multiple levels.

## Unit Tests

For isolated business logic.

Examples:

* Dish eligibility
* State transitions
* Privacy rules
* Join rules

## Integration Tests

For:

* API endpoints
* Authentication
* Database interactions
* Authorization

## Frontend Tests

For important UI behavior.

Tests should focus on important business logic rather than chasing arbitrary coverage percentages.

---

# 31. Deployment Philosophy

Initial architecture should support straightforward deployment.

Avoid:

* Microservices
* Kubernetes
* Message queues
* Event buses
* Distributed databases

unless the application's actual scale requires them.

A modular monolith is the preferred initial architecture.

---

# 32. Architectural Principle

LetMeCook should begin as a:

> **Modular monolith with clear domain boundaries.**

The code should be structured well enough that parts can be separated later if necessary.

Do not build distributed infrastructure before there is a real reason to do so.
