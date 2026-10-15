# UI Design System & Primitives (`client/src/components/ui/`)

> Atomic design primitives implementing the frosted glassmorphism visual system, fluid interactive buttons, and modal dialogs.

---

## 1. Architecture & Role in System
`components/ui/` contains reusable, unopinionated UI primitives. They have no domain knowledge of dishes, users, or messages. They provide visual consistency, tactile spring physics, and frosted glass aesthetics across the entire application.

---

## 2. Directory Inventory & Module Responsibilities

| Component File | Role & Visual Style | Key Props |
| :--- | :--- | :--- |
| [`GlassContainer.jsx`](file:///Users/nvc/Documents/LetMeCook/client/src/components/ui/GlassContainer.jsx) | Multi-layered frosted glass panel featuring dual borders, backdrop blur, and specular glare overlays. | `radius`, `borderWidth`, `style`, `innerStyle`, `onClick` |
| [`FluidButton.jsx`](file:///Users/nvc/Documents/LetMeCook/client/src/components/ui/FluidButton.jsx) | Fluid spring-animated button with subtle scale transform, tactile press state, and icon support. | `variant` (`primary`, `secondary`, `icon`), `disabled`, `onClick`, `style` |
| [`CustomConfirmModal.jsx`](file:///Users/nvc/Documents/LetMeCook/client/src/components/ui/CustomConfirmModal.jsx) | Centered frosted confirmation modal used by `ConfirmContext`. | `isOpen`, `title`, `message`, `confirmText`, `cancelText`, `onConfirm`, `onCancel` |
| [`ResponseToast.jsx`](file:///Users/nvc/Documents/LetMeCook/client/src/components/ui/ResponseToast.jsx) | Floating toast notification pill with slide-down spring animation. | `message`, `type` (`success`, `error`, `info`), `onClose` |

---

## 3. How-To: Using Design Primitives

### Creating a Glassmorphic Card
```jsx
import GlassContainer from '@/components/ui/GlassContainer';
import FluidButton from '@/components/ui/FluidButton';

export function StatCard({ label, value }) {
  return (
    <GlassContainer radius={16} innerStyle={{ padding: '16px 20px' }}>
      <span style={{ fontSize: 11.5, color: '#71717a', textTransform: 'uppercase' }}>
        {label}
      </span>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#09090b', marginTop: 4 }}>
        {value}
      </div>
      <FluidButton style={{ marginTop: 12, padding: '6px 14px', fontSize: 12 }}>
        View History
      </FluidButton>
    </GlassContainer>
  );
}
```
