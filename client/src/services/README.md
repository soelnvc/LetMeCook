# Frontend API Gateway Services (`client/src/services/`)

> Typed client-side API adapters communicating with backend REST endpoints, normalizing payloads, and catching HTTP errors.

---

## 1. Architecture & Role in System
This directory decouples UI components from raw HTTP requests. Instead of calling `fetch()` or `axios()` inside components, views invoke typed domain methods from these service modules.

---

## 2. Directory Inventory & Module Responsibilities

| Service File | Backend Route Target | Primary Domain Functions |
| :--- | :--- | :--- |
| [`auth.service.js`](file:///Users/nvc/Documents/LetMeCook/client/src/services/auth.service.js) | `/api/auth` | `login(email, pass)`, `register(payload)`, `getMe()`, `verifyEmail(token)` |
| [`dish.service.js`](file:///Users/nvc/Documents/LetMeCook/client/src/services/dish.service.js) | `/api/dishes` | `getDishes(filters)`, `createDish(payload)`, `joinDish(id)`, `leaveDish(id)`, `finishCooking(id)` |
| [`connection.service.js`](file:///Users/nvc/Documents/LetMeCook/client/src/services/connection.service.js) | `/api/connections`| `getConnections()`, `sendRequest(userId)`, `acceptRequest(id)`, `rejectRequest(id)` |
| [`message.service.js`](file:///Users/nvc/Documents/LetMeCook/client/src/services/message.service.js) | `/api/messages` | `getConversations()`, `getMessages(peerId)`, `sendMessage(peerId, text)`, `getDishMessages(dishId)` |
| [`user.service.js`](file:///Users/nvc/Documents/LetMeCook/client/src/services/user.service.js) | `/api/users` | `searchUsers(query)`, `getUserProfile(id)`, `updateProfile(data)`, `updateAvatar(url)` |

---

## 3. How-To: Consuming Services in React Components

```javascript
import { useState, useEffect } from 'react';
import * as dishService from '@/services/dish.service';
import { useToast } from '@/context/ToastContext';

export function DishList() {
  const [dishes, setDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const data = await dishService.getDishes({ category: 'Sports' });
        setDishes(data);
      } catch (err) {
        showToast(err.message || 'Failed to load dishes', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // render ...
}
```
