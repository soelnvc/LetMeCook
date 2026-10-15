# React Context State Providers (`client/src/context/`)

> Global UI side-effect managers: floating feedback toasts and programmatic confirmation dialogs.

---

## 1. Architecture & Role in System
This layer exposes React Context hooks that allow any deeply-nested UI component to trigger floating feedback toasts or confirmation modals without local state plumbing or prop-drilling.

---

## 2. Directory Inventory & Module Responsibilities

| File | Context Provider & Hook | Responsibility |
| :--- | :--- | :--- |
| [`ToastContext.jsx`](file:///Users/nvc/Documents/LetMeCook/client/src/context/ToastContext.jsx) | `ToastProvider`, `useToast()` | Displays auto-dismissing toast notifications (`success`, `error`, `info`). |
| [`ConfirmContext.jsx`](file:///Users/nvc/Documents/LetMeCook/client/src/context/ConfirmContext.jsx) | `ConfirmProvider`, `useConfirm()` | Displays an Apple/Linear-style glass confirmation dialog with customized confirm/cancel buttons. |

---

## 3. How-To: Using Context Hooks in Components

### Triggering Toasts
```javascript
import { useToast } from '@/context/ToastContext';

function MyComponent() {
  const { showToast } = useToast();

  const handleAction = () => {
    showToast('Dish cooked successfully!', 'success');
  };
}
```

### Triggering Confirmations
```javascript
import { useConfirm } from '@/context/ConfirmContext';

function KickButton({ memberId }) {
  const { confirm } = useConfirm();

  const handleKick = async () => {
    const agreed = await confirm({
      title: 'Kick Participant?',
      message: 'This user will be removed from the dish room immediately.',
      confirmText: 'Kick Member',
      destructive: true
    });
    if (agreed) {
      // Execute kick logic
    }
  };
}
```
