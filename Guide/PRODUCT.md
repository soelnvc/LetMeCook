# LetMeCook — PRODUCT SPECIFICATION

## 1. Product Overview

**LetMeCook** is a temporary real-world coordination network.

It helps people discover and participate in activities, plans, tasks, and experiences that are happening now or soon.

The core problem:

> People often want to do something but don't have someone available to do it with.

Examples:

* Finding a badminton partner
* Splitting a cab
* Finding people for a cricket game
* Studying together
* Going for coffee
* Finding someone to teach React
* Finding someone to join a trip
* Gaming together
* Splitting food
* Asking for help
* Organizing a temporary activity

Instead of sending messages across multiple WhatsApp groups, Discord servers, DMs or friend groups, a user creates a **Dish**.

Other users can discover and join it.

---

# 2. Core Philosophy

LetMeCook is not primarily a social network.

It is a:

> **Temporary coordination network.**

The product helps users answer:

> "Who wants to do this with me?"

and:

> "What can I join right now?"

The product should improve an existing behavior rather than manufacture artificial social interaction.

---

# 3. Target Users

Initial focus:

## Institute Communities

Examples:

* Colleges
* Universities
* Student communities
* Hostels
* Residential communities

Users can verify their institute using an institute email or supported verification process.

## Global Users

Users can also discover Dishes outside their institute.

Global discovery should exist but should not expose unnecessary personal information.

---

# 4. Discovery Scopes

LetMeCook has two major discovery contexts.

## Institute

Users discover Dishes associated with their institute/community.

Institute discovery may use:

* Institute verification
* Approximate location
* Institute identity

## Global

Users discover Dishes outside their institute.

Global discovery may include people from:

* Other colleges
* Other cities
* Other communities

Global interaction should have appropriate privacy and trust indicators.

---

# 5. Core Object — Dish

A **Dish** is a temporary activity or intent created by a user.

Examples:

```text
Badminton at 6 PM
Looking for 2 more people
```

```text
Booking a cab to campus
Looking for 2 people to split
```

```text
DSA study session
Looking for someone to study with
```

```text
I know React
Happy to teach 2 beginners
```

A Dish is not a permanent post.

It has a lifecycle and eventually becomes history.

---

# 6. Dish Lifecycle

The visible lifecycle is:

```text
LET'S COOK
      ↓
COOKING
      ↓
COOKED
```

## Let's Cook

The creator is looking for people.

The plan may still change.

The creator can potentially modify:

* Timing
* Participants
* Details
* Adjustments

Users can discover and join/request to join depending on the Dish's rules.

---

## Cooking

The activity is confirmed or currently happening.

The creator may optionally allow users to join during the activity.

A Cooking Dish should clearly communicate:

* Activity
* Current status
* Participants
* Whether joining is still allowed

---

## Cooked

The activity has finished.

Cooked Dishes become part of the creator's and participants' history.

Cooked Dishes are not active discovery objects.

---

# 7. Regular Dish

A Regular Dish is the default Dish type.

It contains:

* Description
* Category
* Participant capacity
* Invite/join method
* Cook time
* Cooking time
* Location scope
* Relevant visibility settings

The creation experience should be fast.

It should feel like expressing an intention, not completing a complicated form.

---

# 8. Chef's Special

Chef's Special is a Dish with additional participant eligibility requirements.

Possible criteria include:

* Gender
* Age
* Institute
* Location
* Skill/experience level
* Other approved eligibility criteria

Chef's Special exists for cases where the creator has a legitimate participant requirement.

Eligibility must be visible and understandable.

Example:

```text
Women Only
```

Eligible users should see the Dish and its eligibility tag.

Users who are not eligible should not see the Dish in discovery.

---

# 9. Dish Joining Modes

A Dish may use one of the following:

### Auto Join

Eligible users can join automatically if capacity permits.

### Request Approval

Users request to join.

The creator approves or rejects requests.

### Invite Only

Only explicitly invited users can participate.

---

# 10. Dish Categories

Initial categories may include:

* Sport
* Study
* Travel
* Food
* Gaming
* Social
* Help
* Learning
* Other

Categories are primarily used for discovery and filtering.

Do not create excessive categories.

---

# 11. Location

Location is used to make Dishes locally discoverable.

The system should prefer approximate location.

Examples:

```text
Within 1 km
Near campus
Near [Institute]
0.8 km away
```

Exact residential addresses must never be publicly exposed.

Meeting-specific location may be shared according to privacy and Dish rules.

---

# 12. Main Navigation

The primary application structure is:

```text
Home
Dine-in
Kitchen
Messages
Profile
```

Settings is accessible from Profile or the appropriate account UI.

---

# 13. Home

Home is a personalized dashboard.

It should **not** become another endless feed.

Its purpose is to answer:

1. What's happening for me?
2. What can I join?
3. What have I done?
4. Who have I cooked with?

## Home Components

### Personalized Welcome

Examples:

```text
Evening, Arjun. What's cooking?
```

```text
Friday night. Surely you're not studying. 👀
```

```text
The kitchen is suspiciously quiet today.
```

The tone should be witty, human and contextual.

Avoid meaningless AI-generated messages.

---

### Current Cooking

If the user has an active Dish:

```text
You're Cooking

Badminton
6:00 PM
3/4 joined
1 spot left
```

If no active Dish:

```text
Nothing cooking yet.

Someone has to start the chaos.
```

Provide a clear action to create a Dish.

---

### Top 3 Dishes

Home should recommend approximately three relevant Dishes.

Relevance can consider:

* Distance
* Timing
* User interests
* Institute
* Category
* Availability
* Previous activity
* Current status

This is a personalized summary, not a duplicate of Dine-in.

---

### Dish History

Show:

```text
Created
Joined
```

Example:

```text
18 Dishes · 16 Joined
```

Users can open their history to see completed Dishes.

---

### Good Company

Show people the user has previously cooked with.

This encourages repeat interactions without creating a follower system.

---

### Cooking Stats

Possible statistics:

```text
18 Dishes
16 Joined
27 People
4 Achievements
```

Stats should remain lightweight.

---

# 14. Dine-in

Dine-in is the primary discovery experience.

Users browse active Dishes.

It should contain:

* Let's Cook
* Cooking
* Global/local scope
* Categories
* Relevant filters

Dine-in is where exploration happens.

Home should not duplicate the entire Dine-in experience.

---

# 15. Kitchen

Kitchen is the Dish creation area.

The creation flow should be quick and intuitive.

Users choose:

```text
Regular Dish
Chef's Special
```

Then configure the Dish.

The product should avoid making spontaneous activities feel like administrative forms.

---

# 16. Messages

Messages contain private one-to-one conversations.

Messaging is a supporting feature rather than the core product differentiator.

## Message Requests

A user may send an initial message to another user.

The receiver sees it as a Message Request.

If accepted:

```text
Message Request
      ↓
DM
```

If declined:

The sender cannot repeatedly send another request.

Users can block other users.

---

# 17. Dish Chat

Dish conversations are separate from private DMs.

A Dish can have a contextual group conversation for its participants.

Example:

```text
Badminton — 6 PM

Arjun:
I'm leaving in 10 mins.

Riya:
I'll be there.
```

The Dish context should remain attached to the conversation.

---

# 18. Profile

The profile is:

> **Identity + trust + activity.**

Example:

```text
[DP]

@arjun
Arjun Sharma

42 Connections

18 Dishes · 16 Joined

"gym, code & bad coffee"

🎧 Music
🏋 Gym
💻 CS Nerd
🎬 Movies
☕ Coffee

🎓 Institute Verified
Computer Science · 2nd Year

🔥 Currently
"Looking for badminton partners"

Achievements
Chef
MasterChef
Night Chef
Good Company

[Message]
[Connect]
```

The profile should not become an Instagram feed.

---

# 19. Connections

Connections are people the user has established a relationship with through the platform.

LetMeCook does not use a follower/following model.

There is no influencer mechanic.

Connections should support:

* Discovery
* Messaging
* Repeat coordination

---

# 20. Achievements

Achievements are earned through actual activity.

Examples:

### Chef

Created 10+ Dishes.

### MasterChef

Created 25+ successful Dishes.

### Night Chef

Created multiple Dishes during late-night hours.

### Good Company

Joined multiple Dishes with other users.

Achievements should represent meaningful behavior.

Do not create arbitrary badges simply to increase gamification.

---

# 21. Verification

Every account requires:

* Mobile number
* Email

Institute verification is additional.

Verification can produce:

```text
🎓 Institute Verified
```

Government ID verification may optionally exist for additional trust.

Verification must not be presented as a guarantee that another user is safe.

---

# 22. Privacy

Users should control:

### Bio Visibility

Possible options:

* Everyone
* Institute
* Connections
* Nobody

### Institute Visibility

Possible options:

* Everyone
* Institute
* Nobody

### DP Visibility

Possible options:

* Everyone
* Institute
* Connections
* Nobody

### Who Can Invite

Possible options:

* Everyone
* Institute
* Connections
* Nobody

### Who Can Message

Possible options:

* Everyone
* Institute
* Connections
* Nobody

### Global Discovery

Users can control whether their profile participates in Global discovery.

### Current Cooking

Users can control whether their active Cooking appears on their profile where supported.

---

# 23. Settings

Settings should contain:

## Privacy

* Bio visibility
* Institute visibility
* DP visibility
* Who can invite
* Who can message
* Profile discovery
* Activity visibility

## Safety

* Blocked users
* Reports
* Location privacy
* Safety information

## Notifications

* Dish activity
* Join requests
* Approvals
* Messages
* Connections
* Cooking reminders
* Verification updates

## Appearance

* Light
* Dark
* System

## Credentials & Verification

* Mobile
* Email
* Age
* Gender
* Institute verification
* Government ID verification
* Address

## Account Management

* Data
* Deactivate
* Delete
* Logout

---

# 24. Trust & Safety

LetMeCook connects people who may be strangers.

The product should provide:

* Block
* Report
* Message request controls
* Dish reporting/removal
* Account moderation
* Privacy controls
* Verification indicators

Safety mechanisms should be built into the architecture rather than added later.

---

# 25. What LetMeCook Should NOT Become

Do not introduce features that turn LetMeCook into:

## Instagram

No:

* Followers
* Likes
* Reels
* Influencer mechanics
* Endless content feed

## Discord

No:

* Permanent servers
* Permanent channels as the primary interaction model

## Reddit

No:

* Karma-based discussion ecosystem
* Permanent communities as the core object

## Dating App

LetMeCook may facilitate meeting new people, but dating is not the core product.

## Event Platform

Dishes are temporary and lightweight, not formal event-management systems.

---

# 26. Product Design Principles

### Temporary over permanent

Dishes exist because something is happening now or soon.

### Intent over content

Users create Dishes because they want something to happen.

### People over popularity

The product should optimize for useful coordination, not popularity.

### Privacy over exposure

Users should share only what is necessary.

### Action over engagement

The goal is for users to actually do something together.

### Simplicity over feature count

A small number of strong mechanics is preferable to a large collection of generic features.

---

# 27. Core Product Loop

The fundamental loop is:

```text
User wants to do something
          ↓
Creates a Dish
          ↓
Other users discover it
          ↓
Users join / request to join
          ↓
Dish becomes Cooking
          ↓
People actually do the activity
          ↓
Dish becomes Cooked
          ↓
History / Connections / Achievements
          ↓
User returns for the next Dish
```

This loop is the heart of LetMeCook.

Every major feature should strengthen this loop or provide necessary infrastructure around it.
