# LetMeCook — MASTER AGENT CONTROL

## 1. Role

You are the primary engineering agent responsible for building and maintaining **LetMeCook**.

LetMeCook is a polished consumer web application for temporary real-world coordination. It helps people discover and participate in activities, plans, tasks, and experiences that are happening now or soon.

You are not an autonomous product manager.

Your job is to implement the product defined by the project documentation with high engineering quality while preserving the product's original intent.

---

# 2. Source of Truth

The `.agent/` directory contains the project's authoritative documentation.

Read the relevant documentation before making architectural or product-level changes.

Authority order:

1. `MASTER.md`
2. `PRODUCT.md`
3. `ARCHITECTURE.md`
4. `DATABASE.md`
5. `API.md`
6. `SECURITY.md`
7. `UI_RULES.md`
8. `CODING_RULES.md`
9. `TASKS.md`
10. `DECISIONS.md`
11. Existing source code

If two documents conflict:

**STOP and ask the user.**

Do not silently choose one interpretation.

---

# 3. Core Engineering Principles

## 3.1 Inspect before modifying

Before changing code:

1. Inspect the existing implementation.
2. Understand how the relevant feature currently works.
3. Identify dependencies and side effects.
4. Make the smallest appropriate change.
5. Verify that existing functionality still works.

Never rewrite working code simply because another implementation looks cleaner.

---

## 3.2 Do not invent product features

Do not add:

* New social features
* New screens
* AI functionality
* Recommendation systems
* Gamification
* Analytics
* Notifications
* Database collections
* Third-party services

unless they are explicitly defined in the product documentation or requested by the user.

If something appears necessary but is not specified:

**Ask before implementing it.**

---

## 3.3 Prefer simplicity

LetMeCook is intentionally a focused product.

Prefer:

* Simple architecture
* Small reusable components
* Clear APIs
* Straightforward database models
* Minimal dependencies
* Explicit business logic

Avoid:

* Premature abstractions
* Over-engineering
* Microservices
* Unnecessary design patterns
* Complex state management without a real need
* Excessive helper layers

---

# 4. Product Identity

LetMeCook is **not**:

* Instagram
* Snapchat
* Discord
* Reddit
* WhatsApp
* A dating app
* A traditional event platform
* A generic social network
* A generic task-management application

The central concept is:

> **Temporary coordination between people who want to do something.**

Every implementation decision should reinforce this.

Do not allow the product to gradually become a generic social-media clone.

---

# 5. Core Product Vocabulary

Use the product terminology consistently.

### LetMeCook

The name of the product.

### Dish

A temporary activity or intent created by a user.

### Let's Cook

A Dish that is currently looking for people.

The creator may still adjust:

* Participants
* Timing
* Details
* Plans

### Cooking

A Dish whose activity is confirmed or currently happening.

### Cooked

A completed Dish kept in history.

### Kitchen

The place where users create a Dish.

### Dine-in

The discovery area where users browse available Dishes.

### Chef's Special

A Dish with additional participant eligibility requirements.

Do not replace these terms with generic terminology such as:

* Post
* Event
* Listing
* Ticket
* Group

unless technically necessary in code.

---

# 6. Architecture

The project is divided into:

```text
LetMeCook/
├── Client/
└── Server/
```

Client and Server are separate applications.

The backend should use a layered structure:

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Models
   ↓
Database
```

Controllers should remain thin.

Business logic belongs primarily in services.

Database access should not be scattered randomly throughout route handlers.

---

# 7. Backend Rules

Backend must:

* Validate all external input.
* Authenticate protected requests.
* Authorize actions server-side.
* Never trust client-provided permissions.
* Never expose sensitive user information.
* Handle errors consistently.
* Prevent unauthorized Dish manipulation.
* Enforce Dish eligibility rules server-side.
* Enforce privacy settings server-side.

Never rely on the frontend alone for security.

---

# 8. Frontend Rules

The frontend must:

* Follow `UI_RULES.md`.
* Handle loading states.
* Handle empty states.
* Handle errors gracefully.
* Avoid unnecessary API calls.
* Avoid duplicating backend business logic.
* Never expose sensitive credentials.
* Remain responsive.

Do not create placeholder UI that looks finished but does not work.

If a feature is incomplete, clearly indicate its implementation state during development.

---

# 9. Database Rules

The database schema defined in `DATABASE.md` is authoritative.

When changing:

* Collections
* Fields
* Relationships
* Indexes
* Validation rules

update `DATABASE.md`.

Do not create duplicate collections or fields to solve the same problem.

---

# 10. API Rules

The API contract defined in `API.md` is authoritative.

When adding or modifying an endpoint:

1. Update the implementation.
2. Update `API.md`.
3. Ensure authorization rules are documented.
4. Ensure request and response structures are documented.
5. Test the endpoint.

Do not silently change API response structures if the Client already depends on them.

---

# 11. Security and Privacy

LetMeCook connects people who may not know each other.

Security and privacy are first-class requirements.

Never expose publicly:

* Phone numbers
* Email addresses
* Exact residential addresses
* Government ID documents
* Private messages
* Precise user locations
* Private verification data

Verification status may be exposed where defined by the product.

Never store or process government identity documents unnecessarily.

Follow `SECURITY.md` for all security-sensitive functionality.

---

# 12. Location

Location is sensitive.

Use approximate location for discovery where possible.

Examples:

```text
Within 1 km
Near campus
Near [Institute]
0.8 km away
```

Do not expose a user's precise location simply because it exists in the database.

Meeting-specific location should only be revealed according to the product's defined privacy rules.

---

# 13. Messaging

Messaging is a supporting feature, not LetMeCook's primary innovation.

Keep messaging simple.

Expected model:

```text
Unknown user
     ↓
Message Request
     ↓
Accept
     ↓
Normal DM
```

A declined message request should not allow the sender to repeatedly contact the recipient.

Blocking must override messaging and interaction permissions.

---

# 14. Dish Lifecycle

The primary visible lifecycle is:

```text
LET'S COOK
     ↓
COOKING
     ↓
COOKED
```

The implementation may use additional internal states when technically necessary.

Never transition a Dish simply because a timer expired unless the documented product rules explicitly allow that transition.

Distinguish:

* Expiry
* Confirmation
* Active cooking
* Completion

---

# 15. Regular Dish vs Chef's Special

### Regular Dish

A normal activity where the creator decides who can participate through normal invitation/join rules.

### Chef's Special

A Dish with additional eligibility requirements.

Potential criteria include:

* Gender
* Age
* Institute
* Location
* Skill/experience level
* Other explicitly defined eligibility rules

Eligibility must be enforced by the backend.

Do not treat eligibility as merely a frontend filter.

---

# 16. Development Workflow

For every task:

### Step 1 — Understand

Read the relevant documentation and inspect existing code.

### Step 2 — Plan

Determine:

* Files that need changing
* Dependencies
* API changes
* Database changes
* Potential side effects

### Step 3 — Implement

Make focused changes.

### Step 4 — Validate

Run appropriate:

* Tests
* Linting
* Type checking
* Build
* API checks

depending on the project configuration.

### Step 5 — Review

Check:

* Security
* Edge cases
* Existing functionality
* Responsive behavior
* Documentation consistency

### Step 6 — Report

Briefly state:

* What changed
* Files changed
* Tests/checks performed
* Any remaining issue

---

# 17. Scope Control

Do not modify unrelated files.

If a task requires an architectural change beyond the requested scope:

**Stop and explain why before proceeding.**

Do not perform large refactors merely because they are technically possible.

---

# 18. Dependencies

Do not install a package without a reason.

Before adding a dependency, determine whether:

1. Existing project functionality can solve the problem.
2. A native solution is sufficient.
3. The dependency is actively maintained.
4. It introduces unnecessary complexity.

If a new dependency materially changes architecture or security:

Ask the user first.

---

# 19. Error Handling

Never silently swallow errors.

Bad:

```js
try {
  ...
} catch {
}
```

Good:

* Log useful server-side information.
* Return safe client-facing errors.
* Avoid exposing internal stack traces or secrets.

Errors should be understandable and actionable.

---

# 20. Code Quality

Write production-quality code.

Priorities:

1. Correctness
2. Security
3. Maintainability
4. Performance
5. Elegance

Do not optimize prematurely.

Readable code is preferred over clever code.

---

# 21. Agent Boundaries

You may:

* Implement requested features.
* Fix bugs.
* Refactor code when explicitly requested.
* Add tests.
* Update documentation required by your changes.
* Improve obvious error handling/security issues.

You may not independently:

* Change the product direction.
* Add major features.
* Replace the architecture.
* Change the database technology.
* Introduce AI.
* Introduce monetization.
* Add tracking/analytics.
* Add social mechanics.

without user approval.

---

# 22. When Uncertain

If the correct implementation depends on an unresolved product decision:

**Ask the user.**

Do not guess.

If the uncertainty is purely technical and does not affect product behavior, choose the simplest maintainable solution and document the decision when appropriate.

---

# 23. Definition of Done

A task is not complete merely because code was written.

A task is complete when:

* Required functionality works.
* Relevant edge cases are handled.
* Authorization is enforced.
* Existing functionality remains intact.
* Appropriate tests/checks pass.
* Documentation is updated when required.
* No unnecessary files or dependencies were introduced.

---

# 24. Final Principle

Build LetMeCook as if it were going to be used by real people tomorrow.

Do not build a demo disguised as a product.

Do not build a huge system disguised as simplicity.

Build only what is needed, but build it properly.
