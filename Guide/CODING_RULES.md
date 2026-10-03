# LetMeCook — CODING RULES

## 1. Purpose

This document defines the coding standards for LetMeCook.

The goal is not to enforce unnecessary style rules.

The goal is to keep the codebase:

* Minimal
* Sleek
* Readable
* Maintainable
* Consistent
* Practical
* Easy to understand
* Easy to modify

Code should solve the actual problem without creating additional problems.

---

# 2. Language Rule — JavaScript Only

## STRICT RULE

LetMeCook uses:

```text
JavaScript
JSX
```

Do **NOT** use:

```text
TypeScript
.ts
.tsx
```

Do not introduce TypeScript even if a library, tutorial, example, or generated code commonly uses it.

Frontend:

```text
.js
.jsx
```

Backend:

```text
.js
```

If a dependency provides TypeScript examples, translate the implementation into JavaScript.

---

# 3. Frontend Framework

The frontend uses:

```text
Next.js
React
JavaScript / JSX
```

Use Next.js according to the project's existing architecture and configuration.

Do not introduce another frontend framework.

Do not migrate the application to another framework without explicit approval.

---

# 4. Core Coding Philosophy

### Write the smallest amount of code that correctly solves the problem.

Prefer:

```text
Simple implementation
```

over:

```text
Abstract implementation
```

Prefer:

```text
One clear function
```

over:

```text
Five utility layers
```

Prefer:

```text
A small reusable component
```

over:

```text
A generic component system nobody needs
```

Code should be optimized for **clarity and usefulness**, not cleverness.

---

# 5. No Over-Engineering

Do not introduce architecture simply because it is technically possible.

Avoid unnecessary:

* Abstraction layers
* Design patterns
* Generic wrappers
* Factory patterns
* Repository layers
* Service layers on the frontend
* Custom frameworks
* Configuration systems
* State-management libraries
* Utility libraries
* Component libraries
* Helper functions
* Hooks
* Context providers

unless they solve an actual project requirement.

The backend may use the documented service layer because it is part of the approved architecture.

Do not create additional layers beyond the architecture specification without approval.

---

# 6. No Speculative Code

Do not write code for features that do not currently exist in the product specification.

Do not create:

```text
Future AI systems
Future recommendation engines
Future payment systems
Future analytics
Future admin systems
Future social features
Future notification types
Future abstractions
```

just because they might eventually be useful.

Build what is required **now**.

---

# 7. No Random or Unused Code

The codebase must not contain:

* Unused imports
* Unused variables
* Unused functions
* Unused components
* Unused hooks
* Unused API routes
* Unused models
* Dead code
* Placeholder functions with no purpose
* Duplicate implementations
* Random utility files
* Commented-out abandoned code

If code is no longer needed, remove it.

Do not leave code behind "just in case."

---

# 8. No Fake Implementations

Do not create fake functionality merely to make a screen appear complete.

Avoid:

```text
Hardcoded users
Hardcoded notifications
Fake API responses
Fake authentication
Fake database records
Fake statistics
Fake recommendation results
```

unless explicitly required for a development/test task.

If a feature is not implemented yet, do not pretend that it is.

---

# 9. Existing Code First

Before modifying code:

1. Inspect the existing implementation.
2. Understand how the relevant feature currently works.
3. Reuse existing patterns where appropriate.
4. Modify the smallest necessary surface.
5. Check for side effects.

Do not rewrite working code simply because another implementation looks cleaner.

---

# 10. Components

React components should have one clear responsibility.

Good:

```text
DishCard
DishFilters
ProfileHeader
MessageList
```

Avoid giant components containing the entire page and all business logic.

Also avoid breaking every tiny HTML fragment into a component.

Create a component when it provides:

* Reuse
* Meaningful separation
* Significant complexity isolation
* Clear maintainability benefits

Not merely because a component could technically be extracted.

---

# 11. Component Size

There is no arbitrary line-count rule.

A component is too large when it becomes difficult to:

* Understand
* Debug
* Modify
* Reason about

Split components based on responsibility, not an arbitrary number of lines.

---

# 12. React State

Use the simplest state mechanism that satisfies the requirement.

Preferred progression:

```text
Local state
    ↓
Props
    ↓
Context
    ↓
Dedicated state library
```

Do not introduce global state unless the problem genuinely requires it.

Do not add Zustand, Redux, or another state-management library simply because it is popular.

---

# 13. Hooks

Use React hooks when they solve an actual problem.

Avoid:

* unnecessary custom hooks
* hooks that only wrap one line
* duplicated data-fetching hooks
* hooks created purely for abstraction

Custom hooks should have a clear reusable responsibility.

---

# 14. Data Fetching

Follow the existing Next.js architecture.

Do not create multiple competing data-fetching patterns without a documented reason.

API calls should be:

* Explicit
* Easy to locate
* Easy to debug
* Consistent

Do not scatter duplicated API logic throughout components.

If a shared API utility genuinely reduces duplication, it may be created.

Do not create an abstraction merely for one request.

---

# 15. Business Logic

Business logic must not be trusted to the frontend.

The client may:

* display information
* collect input
* provide UX validation
* request actions

The server must enforce:

* authorization
* eligibility
* privacy
* Dish state
* capacity
* permissions
* security rules

Never assume the UI prevents a malicious request.

---

# 16. Validation

Frontend validation exists for user experience.

Backend validation exists for correctness and security.

Always validate important data on the server even if the frontend already validates it.

Do not duplicate complicated business rules unnecessarily on the client.

---

# 17. Naming

Use clear conventional naming.

### Variables and functions

```text
camelCase
```

Example:

```javascript
const dishCount = 10;

function createDish() {}
```

### React components

```text
PascalCase
```

Example:

```javascript
function DishCard() {}
```

### Constants

Use clear names. Uppercase is appropriate for true application-wide constants.

```javascript
const MAX_DISH_CAPACITY = 20;
```

Do not turn every variable into an uppercase constant.

---

# 18. File Naming

Use consistent descriptive names.

Examples:

```text
DishCard.jsx
ProfileHeader.jsx
dish.service.js
auth.controller.js
Dish.js
```

Do not create vague filenames such as:

```text
stuff.js
helpers2.js
newComponent.jsx
temp.js
misc.js
```

---

# 19. Functions

Functions should do one understandable job.

Avoid functions that:

* perform unrelated operations
* contain excessive branching
* silently mutate unrelated state
* depend on hidden global state

Prefer readable code over clever one-liners.

This:

```javascript
const availableSpots = capacity - participants.length;
```

is preferable to an unnecessarily abstract helper for a trivial calculation.

---

# 20. Comments

Do not comment obvious code.

Bad:

```javascript
// Increment the count by one
count++;
```

Good comments explain:

* Why something unusual exists
* Why a non-obvious decision was made
* Important security considerations
* Important business rules
* Temporary constraints

Comments should explain **why**, not narrate **what** the code obviously does.

---

# 21. Error Handling

Handle errors intentionally.

Do not:

```javascript
catch (error) {}
```

without a reason.

Do not silently swallow errors.

Errors should either:

* be handled
* be transformed into an appropriate application error
* be passed to centralized error handling

Do not expose internal errors to users.

---

# 22. API Errors

Frontend code should handle expected API failures gracefully.

Examples:

```text
Unauthorized
Forbidden
Not found
Validation error
Conflict
Rate limited
Server error
```

Do not assume every API request succeeds.

---

# 23. Database Code

Database access belongs in the backend.

Never connect to MongoDB directly from the browser/client.

Do not place database queries inside React components.

Follow the documented architecture:

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

---

# 24. Controllers

Controllers should remain thin.

A controller should generally:

1. Receive the request.
2. Extract validated information.
3. Call the appropriate service.
4. Return the response.

Do not put large business workflows inside controllers.

---

# 25. Services

Services contain domain/business logic where the architecture requires it.

Examples:

```text
dish.service.js
auth.service.js
matching.service.js
notification.service.js
```

Do not create a service for every trivial function.

A service should exist because there is meaningful business logic to organize.

---

# 26. Models

Models define database structure and persistence behavior.

Do not turn models into giant business-logic containers.

Keep domain workflows in services where appropriate.

---

# 27. Dependencies

Every dependency must have a reason.

Before adding a package, ask:

> Can this be solved cleanly with the existing stack?

If yes, prefer the existing stack.

Do not add packages merely because they are popular or convenient.

Avoid multiple packages that solve the same problem.

---

# 28. UI Libraries

UI libraries are optional.

Do not introduce a component library solely to avoid writing a small component.

LetMeCook's visual identity should remain intentional and controlled.

If an existing design system or component library is introduced later, it must serve a clear purpose and remain consistent with the product's UI rules.

---

# 29. Styling

Keep styling clean and intentional.

Do not create unnecessary styling abstractions.

Avoid:

* duplicated styles
* arbitrary magic values everywhere
* unused CSS
* abandoned styles
* unnecessary animation
* decorative effects without a UX purpose

Visual complexity must not become code complexity.

---

# 30. Responsive Design

UI should work across the intended supported screen sizes.

Do not create separate duplicated versions of the same page for every breakpoint unless genuinely necessary.

Prefer responsive layouts and reusable components.

---

# 31. Accessibility

Interactive UI should have appropriate:

* semantic HTML
* labels
* keyboard behavior
* accessible names
* focus states
* alternative text where applicable

Do not sacrifice basic accessibility merely for visual appearance.

---

# 32. Security

Follow `SECURITY.md`.

Never:

* trust client authorization
* expose sensitive fields
* expose secrets
* log private data
* bypass authentication during normal implementation
* disable security checks to make development easier

If a security requirement conflicts with a feature implementation, stop and resolve the conflict rather than silently weakening security.

---

# 33. Environment Configuration

Environment-specific values must come from environment configuration.

Never hardcode:

* database credentials
* API keys
* secrets
* production URLs when they should be configurable
* authentication secrets

Never commit `.env`.

Maintain `.env.example` with placeholder values where required.

---

# 34. Git Hygiene

Do not commit:

```text
.env
node_modules/
build artifacts
temporary files
debug dumps
personal credentials
generated junk
```

Keep commits focused where practical.

Do not mix unrelated refactors with feature implementation unless necessary.

---

# 35. Refactoring

Refactor when it improves the code being actively worked on.

Do not perform large unrelated refactors while implementing a feature.

Avoid:

```text
"I was already here, so I rewrote the entire folder."
```

A feature should not become an excuse for unrelated architectural changes.

---

# 36. Performance

Prefer sensible performance without premature optimization.

Do not introduce:

* caching systems
* complex memoization
* advanced state architecture
* background workers
* queues
* microservices
* elaborate database optimizations

unless the actual application requirement justifies them.

First make the implementation correct and clear.

Then optimize measurable problems.

---

# 37. Testing

Tests should focus on meaningful behavior.

Prioritize:

* authentication
* authorization
* Dish lifecycle
* joining/capacity
* Chef's Special eligibility
* messaging permissions
* privacy
* important business rules

Do not write meaningless tests that simply increase test count.

---

# 38. Development Process

For every implementation task:

### Step 1

Read the relevant `.agent` documentation.

### Step 2

Inspect existing code.

### Step 3

Identify the smallest required change.

### Step 4

Implement it.

### Step 5

Remove unused code created during development.

### Step 6

Run appropriate checks/tests.

### Step 7

Review:

```text
Does it work?
Is it secure?
Is authorization correct?
Is anything unnecessary?
Did I introduce unused code?
Did I accidentally change unrelated behavior?
Do the docs still match the implementation?
```

---

# 39. When Requirements Are Unclear

Do not invent behavior.

If the requirement is ambiguous and the decision materially affects:

* architecture
* database schema
* API behavior
* security
* product behavior

ask for clarification.

For small implementation details, choose the simplest reasonable approach consistent with the existing documentation.

---

# 40. No Silent Product Decisions

The coding agent must not independently decide to add:

* AI
* recommendation systems
* social mechanics
* monetization
* analytics
* tracking
* new verification methods
* new user roles
* new database collections
* new major dependencies
* new architectural patterns

unless explicitly approved or already defined in the project documentation.

---

# 41. Definition of Clean Code

Code is considered clean when:

* It is easy to understand.
* It contains only necessary logic.
* Names explain intent.
* Responsibilities are clear.
* There is little duplication.
* There is no dead code.
* There are no unnecessary abstractions.
* Errors are handled properly.
* Security rules are respected.
* Another developer can modify it without reverse-engineering the entire system.

Clean code does **not** mean:

> More files + more abstractions + more patterns.

---

# 42. The LetMeCook Rule

When choosing between two valid implementations:

> Choose the simpler one.

When choosing between a clever implementation and an obvious implementation:

> Choose the obvious one.

When tempted to build something for a possible future requirement:

> Don't, unless that requirement already exists.

When a piece of code is no longer needed:

> Delete it.

When a library can be avoided without making the code worse:

> Avoid it.

When the implementation becomes unnecessarily complex:

> Stop and simplify.

---

# 43. Final Principle

LetMeCook should feel like a carefully built product, not a code-generation experiment.

The codebase should be:

**minimal, sleek, intentional, and boring where it needs to be.**

No over-engineering.

No random unused code.

No speculative architecture.

No unnecessary dependencies.

No cleverness for its own sake.

Build only what LetMeCook currently needs — and build that properly.
