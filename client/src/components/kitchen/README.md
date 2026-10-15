# Kitchen Modal & Ticket Creator (`client/src/components/kitchen/`)

> Multi-step interactive dish ticket builder with category selection, capacity sliders, approval mode toggles, and location picker.

---

## 1. Architecture & Role in System
`KitchenModal.jsx` is the primary creation engine in `LetMeCook`. Triggered from the desktop sidebar ("Cook") or mobile top bar ("+"), it guides students through a rapid creation flow to launch a new activity ticket in under 30 seconds.

---

## 2. Directory Inventory & Module Responsibilities

| Component File | Role | Key Props |
| :--- | :--- | :--- |
| [`KitchenModal.jsx`](file:///Users/nvc/Documents/LetMeCook/client/src/components/kitchen/KitchenModal.jsx) | Modal dialog with step-by-step dish attributes: Genre, Description, Capacity, Mode, Duration, Location. | `isOpen`, `onClose`, `onDishCreated`, `initialData` |

---

## 3. Creation Wizard Steps

```
Step 1: Activity Genre Selection
  [ Sports ]  [ Dine / Food ]  [ Study Group ]  [ Gaming ]  [ Hangout ]  [ Cab Share ]
                           |
                           v
Step 2: Description & Quick Details
  "Late night badminton session at Campus Court 2"
                           |
                           v
Step 3: Capacity & Access Configuration
  Capacity: [ 2 / 4 / 6 / 8 ] Spots
  Access:   [ Instant Join ]  vs  [ Host Approval Required ]
                           |
                           v
Step 4: Location Specifier & Expiration Timer
  Location: "Campus Court 2"
  Duration: [ 1 Hour ]  [ 2 Hours ]  [ 4 Hours ]
                           |
                           v
CTA: "Drop Dish Now" -> POST /api/dishes
```

---

## 4. Key Design & UX Considerations
- **High-Contrast Interactive Pills**: Selectors use dark charcoal `#18181b` for active states and subtle glass backgrounds for inactive states.
- **Glass Glare Integrity**: The modal inner container spans 100% of the backdrop without distorted fixed-height cutoffs.
