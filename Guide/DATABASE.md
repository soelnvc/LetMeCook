# LetMeCook — DATABASE SPECIFICATION

## 1. Database

LetMeCook uses **MongoDB** as its primary database.

The application should use a clear schema design despite MongoDB being flexible.

Database schema changes must be reflected in this document.

---

# 2. Collections

Initial collections:

```text
users
dishes
connections
messages
notifications
verifications
reports
```

Do not create additional collections without a documented reason.

---

# 3. User

Collection:

```text
users
```

Purpose:

Stores account, identity, profile, preferences, privacy settings and user activity references.

### Structure

```text
User
├── _id
├── username
├── name
├── email
├── emailVerified
├── mobile
├── mobileVerified
├── passwordHash
├── avatar
├── bio
├── interests[]
├── institute
├── age
├── gender
├── address
├── verification
├── privacy
├── stats
├── currentDish
├── createdAt
└── updatedAt
```

---

## Identity

```text
_id
username
name
```

### `_id`

MongoDB ObjectId.

Primary identifier.

### `username`

Unique public username.

Required.

Should have appropriate validation and normalization.

### `name`

User's display name.

Required.

---

# 4. User Credentials

```text
email
emailVerified
mobile
mobileVerified
passwordHash
```

### Email

Required.

Must be unique.

### Email Verified

Boolean.

Indicates whether email ownership has been verified.

### Mobile

Required.

Must be unique.

### Mobile Verified

Boolean.

Indicates whether mobile ownership has been verified.

### Password Hash

Never store plaintext passwords.

Use an established password hashing algorithm.

---

# 5. User Profile

```text
avatar
bio
interests[]
```

### Avatar

Reference to stored image asset.

Do not store large image binaries directly in MongoDB unless specifically justified.

### Bio

Short user-written description.

### Interests

Array of controlled interest tags.

Examples:

```text
Music
Movies
Anime
Gym
CS Nerd
Coffee
Photography
Football
```

Avoid allowing unlimited arbitrary tags to become uncontrolled database values.

---

# 6. Institute

The User's institute information should be represented as structured data.

Example:

```json
{
  "name": "Example University",
  "emailDomain": "example.edu",
  "course": "Computer Science",
  "year": 2,
  "verified": true
}
```

Potential fields:

```text
name
emailDomain
course
year
designation
verified
verifiedAt
```

Institute visibility is controlled by User privacy settings.

---

# 7. Age and Gender

```text
age
gender
```

These fields are primarily used for:

* Eligibility
* Chef's Special
* User preferences
* Safety/moderation where appropriate

Do not expose these fields publicly unless product privacy rules allow it.

---

# 8. Address

```text
address
```

Optional.

Address is sensitive.

It must never be returned in normal public profile APIs.

If location functionality can work without storing a residential address, do not require an address.

---

# 9. User Verification

Verification status should be represented separately.

Example:

```json
{
  "mobile": true,
  "email": true,
  "institute": true,
  "identity": false
}
```

The exact verification structure may evolve.

Sensitive verification information must never be included in public profile responses.

---

# 10. User Privacy

Example:

```json
{
  "bioVisibility": "everyone",
  "instituteVisibility": "institute",
  "avatarVisibility": "everyone",
  "invitePermission": "everyone",
  "messagePermission": "everyone",
  "globalDiscovery": true,
  "activityVisibility": true
}
```

Possible visibility values:

```text
everyone
institute
connections
nobody
```

The backend must enforce these settings.

---

# 11. User Stats

Stats may include:

```json
{
  "dishesCreated": 18,
  "dishesJoined": 16,
  "peopleCookedWith": 27
}
```

Achievements may be represented separately or derived from activity.

Do not allow clients to directly modify stats.

Stats should be calculated or updated server-side.

---

# 12. Current Dish

A user may have an active Dish.

Example:

```text
currentDish
```

This may reference the user's currently active Dish.

The exact rules around multiple simultaneous Dishes must be defined before allowing them.

Do not assume a user can or cannot create multiple Dishes without a product decision.

---

# 13. Dish

Collection:

```text
dishes
```

Purpose:

Stores temporary activities/intentions created by users.

### Structure

```text
Dish
├── _id
├── creator
├── type
├── description
├── category
├── status
├── timing
├── capacity
├── joinMode
├── participants[]
├── requests[]
├── location
├── visibility
├── eligibility
├── chat
├── createdAt
├── updatedAt
├── cookedAt
└── expiresAt
```

---

# 14. Dish Creator

```text
creator
```

Reference:

```text
User._id
```

The creator owns the Dish.

Only the creator or authorized system operations may modify creator-controlled Dish fields.

---

# 15. Dish Type

```text
type
```

Possible values:

```text
regular
chefs_special
```

---

# 16. Dish Description

```text
description
```

Required.

Contains the primary explanation of what the user wants to do.

Example:

```text
Looking for 2 people to play badminton at 6 PM.
```

---

# 17. Dish Category

```text
category
```

Initial values:

```text
sport
study
travel
food
gaming
social
help
learning
other
```

Categories should remain controlled values.

---

# 18. Dish Status

```text
status
```

Visible states:

```text
lets_cook
cooking
cooked
```

Internal states may be added when necessary.

Clients must not be allowed to arbitrarily set status.

State transitions must be validated by the backend.

---

# 19. Dish Timing

Timing should distinguish between:

### Cook Time

How long the creator is accepting/joining people or organizing the Dish.

### Cooking Time

When the actual activity happens and how long it lasts.

Example:

```json
{
  "cookStart": "2026-10-04T17:00:00",
  "cookEnd": "2026-10-04T18:00:00",
  "cookingStart": "2026-10-04T18:00:00",
  "cookingEnd": "2026-10-04T20:00:00"
}
```

The exact semantics should be finalized before implementation.

---

# 20. Dish Capacity

```text
capacity
```

Should support:

* Maximum participants
* Potential unlimited participation

Example:

```json
{
  "max": 4,
  "unlimited": false
}
```

Do not rely only on frontend checks for capacity.

The server must prevent race-condition overbooking.

---

# 21. Dish Join Mode

```text
joinMode
```

Possible values:

```text
auto
approval
invite_only
```

### Auto

Eligible users join automatically if capacity permits.

### Approval

Users submit a request.

Creator approves or rejects.

### Invite Only

Only invited users can participate.

---

# 22. Dish Participants

Participants should reference users rather than duplicate full user objects.

Example:

```json
{
  "user": "ObjectId",
  "joinedAt": "Date",
  "role": "participant"
}
```

Possible roles:

```text
creator
participant
```

Do not duplicate mutable profile information inside participant records unless there is a documented reason.

---

# 23. Dish Join Requests

Requests may contain:

```json
{
  "user": "ObjectId",
  "status": "pending",
  "createdAt": "Date",
  "respondedAt": "Date"
}
```

Possible statuses:

```text
pending
approved
rejected
cancelled
```

The backend must enforce who can approve/reject requests.

---

# 24. Dish Location

Location should support approximate discovery.

Possible structure:

```json
{
  "scope": "nearby",
  "latitude": 12.0,
  "longitude": 77.0,
  "radius": 2000
}
```

Exact coordinates must never be returned publicly unless explicitly permitted by the product's meeting-location rules.

Alternative location representations may be used if they provide better privacy.

---

# 25. Dish Visibility

Potential values:

```text
institute
global
```

The visibility system may evolve.

A private or restricted Dish must be filtered server-side before results are returned.

---

# 26. Dish Eligibility

Chef's Special may contain:

```json
{
  "gender": "women",
  "age": {
    "min": 18,
    "max": null
  },
  "instituteOnly": false,
  "skillLevel": null
}
```

Possible gender values:

```text
men
women
any
```

Age restrictions must be represented clearly.

Eligibility must be enforced by the backend.

---

# 27. Dish Chat

A Dish may have an associated chat.

Example:

```text
chatId
```

The chat should be accessible only to authorized participants/users.

Do not expose Dish chat content through public Dish APIs.

---

# 28. Connection

Collection:

```text
connections
```

Purpose:

Represents an established connection between users.

Structure:

```text
Connection
├── _id
├── requester
├── recipient
├── status
├── createdAt
└── updatedAt
```

Possible statuses:

```text
pending
accepted
rejected
blocked
```

A connection should be unique between two users.

The database should prevent duplicate relationships.

---

# 29. Message

Collection:

```text
messages
```

Purpose:

Stores private one-to-one messages.

Structure:

```text
Message
├── _id
├── sender
├── receiver
├── conversationId
├── content
├── read
├── createdAt
└── updatedAt
```

Do not duplicate entire user objects inside messages.

---

# 30. Message Requests

A first-contact message should be treated as a request when required by the recipient's privacy rules.

The exact implementation may use a separate collection or a conversation-level state.

Do not create duplicate message systems unless necessary.

The chosen implementation must preserve:

```text
Message Request
       ↓
Accept
       ↓
DM
```

and:

```text
Message Request
       ↓
Decline
       ↓
No repeated request
```

---

# 31. Notification

Collection:

```text
notifications
```

Structure:

```text
Notification
├── _id
├── recipient
├── type
├── actor
├── reference
├── read
├── createdAt
└── metadata
```

Examples:

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

Notification types should be controlled values.

---

# 32. Verification

Collection:

```text
verifications
```

Purpose:

Tracks verification processes.

Possible types:

```text
institute
identity
```

Structure may include:

```text
Verification
├── _id
├── user
├── type
├── status
├── provider
├── submittedAt
├── verifiedAt
└── metadata
```

Possible statuses:

```text
pending
verified
rejected
expired
```

Sensitive verification documents should be stored through secure storage rather than exposed directly through this collection.

---

# 33. Report

Collection:

```text
reports
```

Purpose:

Stores user safety/moderation reports.

Structure:

```text
Report
├── _id
├── reporter
├── reportedUser
├── dish
├── message
├── reason
├── description
├── status
├── createdAt
└── resolvedAt
```

Not every report must contain every reference.

Possible statuses:

```text
open
reviewing
resolved
dismissed
```

---

# 34. Relationships

Core relationships:

```text
User
 ├── creates → Dish
 ├── joins → Dish
 ├── connects → User
 ├── sends → Message
 ├── receives → Notification
 ├── owns → Verification
 └── creates → Report
```

Dish:

```text
Dish
 ├── creator → User
 ├── participants[] → User
 ├── requests[] → User
 └── chat → Dish Chat
```

---

# 35. Indexes

Indexes should exist for frequently queried fields.

Initial candidates:

### User

```text
username
email
mobile
institute.name
```

### Dish

```text
creator
status
category
createdAt
timing.cookingStart
location
visibility
```

### Connection

```text
requester + recipient
recipient + requester
```

### Message

```text
conversationId + createdAt
sender
receiver
```

### Notification

```text
recipient + createdAt
recipient + read
```

Indexes should be added based on actual query patterns.

Do not create unnecessary indexes.

---

# 36. Data Privacy Rules

Never return sensitive fields through normal public user queries.

Sensitive fields include:

```text
passwordHash
mobile
email
address
government identity information
private verification metadata
precise location
```

The API layer should explicitly select fields appropriate for each context.

---

# 37. Data Ownership

Users own/control their:

* Profile
* Privacy settings
* Dishes they created
* Their messages
* Their connections

Creators control their Dishes subject to system rules.

The server always enforces ownership.

---

# 38. Soft Deletion

Where required for moderation, legal, safety or data consistency purposes, use soft deletion rather than immediately removing records.

Potential fields:

```text
deletedAt
deletedBy
deletionReason
```

Do not add soft deletion to every collection automatically.

Use it where there is a real requirement.

---

# 39. Schema Evolution

When changing a schema:

1. Update the model.
2. Update this document.
3. Consider existing records.
4. Add migration/backfill logic if necessary.
5. Verify old records remain usable.

Never assume an empty database in production.

---

# 40. Database Principle

MongoDB provides flexibility, but LetMeCook should still have deliberate schemas.

Prefer:

> **Clear relationships + controlled schemas + simple queries**

over:

> **Everything embedded everywhere because MongoDB allows it.**

The database should support the core product loop:

```text
Create Dish
     ↓
Discover Dish
     ↓
Join Dish
     ↓
Cook
     ↓
Complete
     ↓
History / Connections / Achievements
```

Do not optimize the database for features that LetMeCook does not have.
