# LetMeCook — API SPECIFICATION

## 1. Purpose

This document defines the API contract for LetMeCook.

The API must be:

* RESTful
* Predictable
* Explicit
* Secure by default
* Consistent across resources
* Independent of frontend implementation

The backend is the source of truth for authentication, authorization, validation, privacy, eligibility, Dish state, and participant capacity.

---

# 2. Base URL

All API routes use:

```text
/api
```

Resource routes should follow:

```text
/api/<resource>
```

Examples:

```text
/api/auth
/api/users
/api/dishes
/api/connections
/api/messages
/api/notifications
/api/verifications
/api/reports
```

---

# 3. HTTP Methods

Use standard HTTP methods:

| Method | Purpose                                            |
| ------ | -------------------------------------------------- |
| GET    | Retrieve resources                                 |
| POST   | Create resources / perform actions                 |
| PATCH  | Partially update resources                         |
| DELETE | Delete/remove resources where explicitly supported |

Do not use GET requests for state-changing operations.

---

# 4. Authentication

Protected endpoints require authentication.

Preferred mechanism:

```text
Authorization: Bearer <token>
```

The exact token/session implementation must be defined before production authentication is implemented.

Authentication middleware must:

1. Validate credentials/token.
2. Identify the user.
3. Reject invalid/expired credentials.
4. Attach authenticated user information to the request.
5. Never trust user identity supplied in request bodies for authorization.

Example:

```text
GET /api/users/me
Authorization: Bearer <token>
```

---

# 5. Authorization

Authentication answers:

> Who are you?

Authorization answers:

> Are you allowed to do this?

Every protected operation must perform server-side authorization.

Examples:

* A user can edit only their own profile.
* A user can edit/cancel only their own Dish.
* A Dish creator can approve/reject join requests.
* A user cannot approve their own join request.
* A user cannot access private messages belonging to another user.
* A user cannot access another person's private verification information.
* A user cannot bypass Chef's Special eligibility restrictions.

Never rely on frontend visibility as authorization.

---

# 6. Response Convention

Successful responses:

```json
{
  "success": true,
  "data": {}
}
```

For lists:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasNext": true
  }
}
```

Errors:

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

Do not expose:

* stack traces
* database errors
* internal file paths
* secrets
* tokens
* sensitive implementation details

---

# 7. HTTP Status Codes

Use appropriate status codes.

| Status | Meaning                                  |
| ------ | ---------------------------------------- |
| 200    | Successful request                       |
| 201    | Resource created                         |
| 204    | Successful request with no response body |
| 400    | Invalid request                          |
| 401    | Authentication required/invalid          |
| 403    | Authenticated but not authorized         |
| 404    | Resource not found                       |
| 409    | Conflict                                 |
| 422    | Validation failure                       |
| 429    | Rate limit exceeded                      |
| 500    | Unexpected server error                  |

Do not return `200` for failed operations.

---

# 8. Validation

Every request containing user-controlled data must be validated server-side.

Validate:

* type
* required fields
* string length
* enum values
* numeric ranges
* dates
* IDs
* nested objects
* arrays
* capacity
* eligibility fields

Never assume frontend validation is sufficient.

Validation should occur before business logic.

---

# 9. Authentication Routes

Base:

```text
/api/auth
```

Initial endpoints:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/verify-mobile
POST /api/auth/verify-email
POST /api/auth/refresh
GET  /api/auth/me
```

Exact OTP/password/session flows must follow the authentication implementation defined by the project.

Do not create additional authentication flows without updating this document.

---

# 10. User Routes

Base:

```text
/api/users
```

Initial endpoints:

```text
GET   /api/users/me
PATCH /api/users/me
GET   /api/users/:username
GET   /api/users/search
```

Users must only receive fields permitted by privacy rules.

Private fields such as email, mobile number, address, and verification metadata must not be returned through public profile endpoints unless explicitly authorized.

---

# 11. Dish Routes

Base:

```text
/api/dishes
```

Initial endpoints:

```text
POST  /api/dishes
GET   /api/dishes
GET   /api/dishes/:id
PATCH /api/dishes/:id
DELETE /api/dishes/:id
```

Actions:

```text
POST /api/dishes/:id/join
POST /api/dishes/:id/leave

POST /api/dishes/:id/requests/:requestId/approve
POST /api/dishes/:id/requests/:requestId/reject

POST /api/dishes/:id/invite
POST /api/dishes/:id/start
POST /api/dishes/:id/complete
```

The exact endpoint set may change as implementation is finalized, but any change must update this document.

---

# 12. Dish Creation

Creating a Dish must validate:

* Dish type
* Description
* Category
* Capacity
* Join mode
* Cook time
* Cooking time
* Location scope
* Visibility
* Eligibility
* Creator permissions

Chef's Special eligibility must be validated server-side.

The client must never be able to create an invalid eligibility configuration by bypassing UI restrictions.

---

# 13. Dish Discovery

```text
GET /api/dishes
```

Discovery may support filters such as:

```text
scope
category
status
timing
location
capacity
```

Example:

```text
GET /api/dishes?scope=institute&category=sport&status=lets_cook
```

The backend must automatically enforce:

* visibility
* privacy
* eligibility
* institute restrictions
* location restrictions
* blocked-user rules
* Dish status
* capacity rules

Users must never receive a Dish they are not eligible to view.

---

# 14. Dish Joining

```text
POST /api/dishes/:id/join
```

The backend must verify:

1. User is authenticated.
2. Dish exists.
3. Dish is joinable.
4. User is not blocked.
5. User satisfies eligibility.
6. User is not already a participant.
7. Capacity is available.
8. Join mode permits the requested action.

For `auto`:

```text
User → Participant
```

For `approval`:

```text
User → Pending Request
```

For `invite_only`:

```text
User → Rejected unless invited
```

Capacity checks must be atomic enough to prevent race-condition overbooking.

---

# 15. Dish Requests

Creator-only actions:

```text
POST /api/dishes/:id/requests/:requestId/approve
POST /api/dishes/:id/requests/:requestId/reject
```

The server must verify that the authenticated user owns the Dish.

Rejected requests must not automatically be treated as accepted later.

---

# 16. Dish Lifecycle

Visible lifecycle:

```text
LET'S COOK
      ↓
COOKING
      ↓
COOKED
```

State transitions must be controlled by backend business logic.

Do not automatically change state merely because a timestamp has passed unless the product specification explicitly defines that behavior.

Invalid transitions must return an appropriate error.

---

# 17. Connection Routes

Base:

```text
/api/connections
```

Initial endpoints:

```text
POST   /api/connections/:userId
GET    /api/connections
POST   /api/connections/:id/accept
POST   /api/connections/:id/reject
DELETE /api/connections/:id
POST   /api/connections/:id/block
```

The backend must prevent:

* duplicate relationships
* self-connections
* unauthorized modification
* blocked users from bypassing restrictions

---

# 18. Messaging Routes

Base:

```text
/api/messages
```

Initial endpoints:

```text
GET  /api/messages/conversations
GET  /api/messages/conversations/:conversationId
POST /api/messages
POST /api/messages/requests/:id/accept
POST /api/messages/requests/:id/reject
```

Message flow:

```text
Unknown user
     ↓
Message Request
     ↓
Accepted
     ↓
DM
```

If a request is rejected, the sender must not be able to repeatedly send new requests to bypass that decision.

Blocking overrides messaging permissions.

---

# 19. Dish Chat

Dish chat is separate from private DMs.

Only eligible Dish participants should have access to its chat.

The backend must verify Dish membership before allowing:

* reading messages
* sending messages
* accessing chat history

When a user leaves or loses access to a Dish, their chat permissions must follow the defined Dish-chat policy.

---

# 20. Notifications

Base:

```text
/api/notifications
```

Initial endpoints:

```text
GET   /api/notifications
PATCH /api/notifications/:id/read
POST  /api/notifications/read-all
```

Notifications should be generated through centralized notification logic.

Possible notification types:

```text
dish_join_request
dish_join_approved
dish_invite
new_message
message_request
connection_request
connection_accepted
dish_status_change
verification_update
```

Do not create notification types without a corresponding product requirement.

---

# 21. Verification Routes

Base:

```text
/api/verifications
```

Initial endpoints:

```text
POST /api/verifications/institute
POST /api/verifications/identity
GET  /api/verifications/me
```

Sensitive verification information must never be returned through public APIs.

Only verification status and explicitly approved public information may be exposed.

---

# 22. Report Routes

Base:

```text
/api/reports
```

Initial endpoint:

```text
POST /api/reports
```

A report may reference:

* User
* Dish
* Message

Users must not be able to modify or resolve their own reports through public endpoints.

Administrative moderation endpoints are outside the initial public API unless explicitly specified.

---

# 23. Pagination

Any endpoint that may return a large collection must support pagination.

Preferred parameters:

```text
?page=1&limit=20
```

The server must enforce a maximum limit.

Never allow clients to request unlimited records.

---

# 24. Sorting

Sorting must be explicitly supported by each endpoint.

Do not allow arbitrary database field sorting from clients.

Example:

```text
?sort=createdAt
```

Allowed sort fields must be whitelisted.

---

# 25. Search

Search inputs are user-controlled and must be:

* validated
* length-limited
* safely queried
* rate-limited where appropriate

Do not directly interpolate raw user input into database queries.

---

# 26. Rate Limiting

Rate-limit sensitive endpoints such as:

* authentication
* OTP verification
* password operations
* messaging
* connection requests
* Dish creation
* reports
* search/discovery where abuse is possible

Exact limits belong in implementation/configuration rather than being hardcoded throughout controllers.

---

# 27. File Uploads

Uploaded files must be validated for:

* MIME type
* file extension
* size
* storage destination

Never trust the client-provided MIME type alone.

Uploads must not expose arbitrary filesystem paths.

---

# 28. API Versioning

Initial API:

```text
/api
```

Do not introduce versioning such as `/api/v1` unless required by deployment or compatibility needs.

If versioning becomes necessary, update this document and maintain backward compatibility where required.

---

# 29. API Design Rules

Controllers must remain thin.

Preferred flow:

```text
Route
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

Controllers should:

* read request data
* call services
* return responses

Services should contain:

* business rules
* authorization decisions requiring domain context
* Dish logic
* participant logic
* matching logic
* state transitions

Routes should not contain business logic.

---

# 30. API Contract Rule

Whenever an endpoint is added, removed, renamed, or materially changed:

1. Update this document.
2. Update relevant frontend calls.
3. Update validation.
4. Update tests.
5. Check authorization.
6. Check privacy implications.

The API documentation and implementation must not silently diverge.

---

# 31. Final Principle

The API should make invalid states difficult to create.

The client may request an action.

The server decides whether that action is valid.
