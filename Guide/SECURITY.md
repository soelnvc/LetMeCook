 # LetMeCook — SECURITY SPECIFICATION

## 1. Purpose

Security is a core product requirement of LetMeCook.

The application handles:

* personal profiles
* mobile numbers
* email addresses
* institute information
* age/gender information
* approximate location
* private messages
* verification information
* user-generated content

The system must follow a **privacy-first, server-authoritative** model.

---

# 2. Core Security Principles

1. Never trust the client.
2. Validate all user-controlled input.
3. Authorize every protected action.
4. Minimize sensitive data exposure.
5. Store secrets securely.
6. Return only the fields required by the requesting user.
7. Fail safely.
8. Rate-limit abuse-prone operations.
9. Do not expose internal implementation details.
10. Security rules must be enforced on the server.

---

# 3. Authentication

Authentication must use secure mechanisms for:

* account registration
* login
* mobile verification
* email verification
* session/token management
* logout

Passwords must:

* never be stored in plaintext
* never be returned through APIs
* never be logged

Passwords must use a strong password-hashing algorithm such as Argon2id or bcrypt with an appropriate work factor.

---

# 4. Tokens and Sessions

Authentication credentials must:

* be transmitted only over HTTPS in production
* have appropriate expiration
* be invalidated/revoked according to the selected session architecture
* never appear in logs
* never be returned unnecessarily in API responses

If cookies are used, configure appropriate:

```text
HttpOnly
Secure
SameSite
```

If bearer tokens are used, follow secure storage and rotation practices appropriate to the chosen architecture.

Do not invent a token architecture without documenting the decision.

---

# 5. Authorization

Every protected operation must verify authorization server-side.

Examples:

```text
User → Edit own profile
User → Edit own Dish
Creator → Manage Dish requests
Participant → Access Dish chat
User → Access own private messages
```

Never trust:

```text
userId
creatorId
ownerId
role
verified
```

when supplied by the client.

The authenticated identity must come from trusted authentication context.

---

# 6. Object-Level Authorization

Prevent users from accessing resources simply by changing IDs.

Example:

```text
GET /api/messages/conversations/OTHER_USERS_CONVERSATION
```

must not work merely because the requester knows the conversation ID.

The server must verify that the authenticated user is actually a participant.

Apply the same principle to:

* Dishes
* join requests
* connections
* messages
* notifications
* verification records
* reports
* uploaded files

---

# 7. Input Validation

Treat all client input as untrusted.

Validate:

* request bodies
* query parameters
* route parameters
* headers where applicable
* uploaded files

Reject:

* malformed IDs
* unexpected fields where strict validation is appropriate
* invalid enum values
* excessive string lengths
* invalid dates
* impossible numeric values
* malformed nested objects

---

# 8. Injection Protection

Prevent injection attacks by using safe database APIs and validated inputs.

Never construct database queries by blindly inserting raw user input.

Be particularly careful with:

* MongoDB operators
* regular expressions
* search queries
* sorting
* filtering

User-controlled values must not be allowed to inject arbitrary MongoDB operators or query structures.

---

# 9. XSS Protection

User-generated content includes:

* bios
* Dish descriptions
* messages
* profile information

Do not trust user-generated HTML.

The frontend must render user content safely.

Avoid allowing arbitrary HTML unless there is an explicit product requirement and a proper sanitization strategy.

---

# 10. CSRF Protection

If authentication uses cookies, protect state-changing requests against CSRF.

Use appropriate:

* SameSite cookie configuration
* CSRF tokens where required
* origin/referer validation where appropriate

If authentication architecture does not use cookies, document the resulting CSRF model.

---

# 11. CORS

CORS must allow only explicitly approved origins.

Do not use:

```text
Access-Control-Allow-Origin: *
```

for authenticated production APIs unless there is a documented reason.

Allowed origins must be configuration-driven.

---

# 12. Sensitive Data

The following must never be publicly exposed:

* password hashes
* passwords
* authentication tokens
* OTPs
* private email where privacy rules restrict it
* private mobile numbers
* exact residential address
* government ID documents
* private verification metadata
* private messages
* precise location coordinates

Database storage does not imply API visibility.

---

# 13. Email and Mobile Privacy

Email and mobile numbers are required for account trust but are not automatically public profile information.

Public profile responses must use explicit field selection.

Never return complete sensitive fields simply because they exist on the User model.

---

# 14. Government Identity Verification

Government identity information is highly sensitive.

If identity verification is implemented:

* documents must use secure storage
* documents must not be publicly accessible
* verification status should be separated from raw identity data
* raw documents must never appear in normal profile APIs
* access must be tightly authorized
* sensitive metadata must not be logged

The application should store the minimum information necessary to establish verification status.

---

# 15. Institute Verification

Institute verification must not expose private verification mechanisms.

Public profile information may show:

```text
🎓 Institute Verified
```

or another approved verification indicator.

The system must not expose:

* verification tokens
* submitted documents
* private institute emails
* internal verification metadata

unless explicitly required by an authorized workflow.

---

# 16. Location Privacy

Location is sensitive.

The application may use location internally for:

* approximate discovery
* distance calculations
* location-based matching

The API must not expose precise coordinates or exact residential addresses to other users.

Public-facing location should be approximate, such as:

```text
~2 km away
Near campus
Bengaluru
```

Exact location access must require an explicit, documented product reason.

---

# 17. Chef's Special Eligibility

Eligibility restrictions are security-sensitive business rules.

The server must enforce:

* gender restrictions
* age restrictions
* institute restrictions
* location restrictions
* skill/experience restrictions

Frontend filtering is not sufficient.

A malicious client must not be able to bypass eligibility by directly calling the API.

---

# 18. Privacy Settings

Users may configure privacy controls such as:

```text
bioVisibility
instituteVisibility
avatarVisibility
invitePermission
messagePermission
globalDiscovery
activityVisibility
```

The server must enforce these settings.

A privacy setting is not merely a UI preference.

---

# 19. Blocked Users

Blocking must override normal interaction permissions.

A blocked user should not be able to bypass blocking through:

* DMs
* connection requests
* Dish invitations
* repeated message requests
* other interaction endpoints

Blocking logic must be centralized enough to avoid inconsistent enforcement.

---

# 20. Messaging Security

Private messages must only be accessible to authorized conversation participants.

Dish Chat must only be accessible to authorized Dish participants according to the product rules.

Do not expose:

* another user's conversations
* message history through predictable IDs
* private message content in unrelated API responses

Message content must never be written to application logs.

---

# 21. Rate Limiting and Abuse Prevention

Rate limiting must protect against:

* brute-force login attempts
* OTP abuse
* spam messages
* connection spam
* Dish creation spam
* report abuse
* search abuse
* automated scraping where appropriate

Limits should be configurable.

Do not scatter arbitrary rate limits throughout controllers.

---

# 22. Request Size Limits

Set reasonable limits for:

* JSON request bodies
* URL/query length
* uploaded files
* message length
* Dish descriptions
* profile bios

Reject excessive requests before expensive processing.

---

# 23. File Upload Security

Uploaded files must be treated as untrusted.

Validate:

* size
* MIME type
* extension
* content where practical

Never execute uploaded files.

Do not use user-provided filenames as trusted filesystem paths.

Store uploads outside sensitive application code paths where appropriate.

---

# 24. Error Handling

Production errors must not reveal:

* stack traces
* database queries
* internal server paths
* environment variables
* credentials
* collection names where unnecessary
* implementation details

Return safe, human-readable messages.

Detailed errors may be logged internally without exposing them to clients.

---

# 25. Logging

Logs must never contain:

* passwords
* OTPs
* access tokens
* refresh tokens
* government ID data
* private messages
* exact sensitive addresses
* sensitive verification metadata

Logs should contain enough context for debugging without becoming a second database of private user information.

---

# 26. Environment Variables

Secrets must never be committed to Git.

Examples:

```text
MONGODB_URI
JWT_SECRET
SESSION_SECRET
EMAIL_PROVIDER_KEY
SMS_PROVIDER_KEY
```

Use:

```text
.env
```

locally and environment-specific secret management in deployment.

`.env` must be included in `.gitignore`.

Provide a safe `.env.example` containing placeholder values only.

---

# 27. Database Security

MongoDB access must use authenticated credentials.

Production databases must not be publicly exposed unnecessarily.

Use:

* least-privilege database credentials
* encrypted connections
* appropriate network restrictions
* backups
* access monitoring where available

Do not expose MongoDB directly to the frontend.

---

# 28. Database Field Protection

Sensitive fields should be protected through schema design and query selection.

For example:

```text
passwordHash
verification metadata
private location
```

should not accidentally appear in:

```text
User.find()
```

responses used by public endpoints.

Prefer explicit field selection for sensitive models.

---

# 29. Race Conditions

Security-sensitive state changes must account for concurrent requests.

Important examples:

* Dish capacity
* Joining a Dish
* Approving join requests
* Connection creation
* Message requests

The server must prevent a race condition from producing an invalid state such as:

```text
capacity = 4
participants = 5
```

---

# 30. Authentication Enumeration

Authentication and verification flows should avoid unnecessarily revealing whether sensitive account information exists.

Examples:

* account existence
* email existence
* mobile existence

Use generic responses where appropriate.

---

# 31. Security Headers

Production HTTP responses should use appropriate security headers.

Examples may include:

```text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Strict-Transport-Security
```

Exact configuration depends on deployment and frontend architecture.

Do not blindly copy security-header configurations without verifying their effect on the application.

---

# 32. Dependency Security

Keep dependencies minimal.

Before adding a dependency:

1. Confirm it is necessary.
2. Prefer established packages.
3. Check maintenance/security status.
4. Avoid duplicate libraries providing the same functionality.
5. Keep dependencies updated where practical.

Do not add security packages merely for appearance.

---

# 33. Security Testing

Security testing must cover at minimum:

### Authentication

* invalid credentials
* expired credentials
* unauthorized access
* token/session misuse

### Authorization

* accessing another user's resources
* modifying another user's Dish
* accessing another user's messages
* bypassing creator-only actions

### Privacy

* private profile fields
* location
* verification data
* blocked users

### Input

* malformed IDs
* oversized input
* injection attempts
* invalid enum values
* malicious file uploads

### Business Logic

* Dish overbooking
* Chef's Special bypass
* repeated rejected message requests
* unauthorized state transitions

---

# 34. Security Incident Principle

If a security-sensitive bug is discovered:

1. Stop and understand the impact.
2. Fix the underlying authorization/privacy issue.
3. Check for similar vulnerabilities elsewhere.
4. Add regression tests.
5. Update documentation if necessary.

Do not hide security failures behind frontend restrictions.

---

# 35. Agent Security Boundary

The coding agent must not:

* expose secrets
* commit `.env`
* disable authentication to make development easier
* bypass authorization for convenience
* remove privacy checks to fix UI issues
* expose precise location
* expose verification documents
* log sensitive user information
* introduce insecure temporary authentication mechanisms without explicit approval

Development shortcuts must not become production behavior.

---

# 36. Final Principle

Security is not a separate feature added after functionality.

For every feature, ask:

> Who can access this?
>
> What are they allowed to do?
>
> What information are they allowed to see?
>
> What happens if they call the API directly instead of using the UI?

If the server cannot answer those questions clearly, the feature is not complete.
