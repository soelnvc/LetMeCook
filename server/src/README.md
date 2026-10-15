# Server Engine Source (`server/src/`)

> Application bootstrapper and core subsystem root containing Express routing, controllers, business services, data models, and database adapters.

---

## 1. Architecture & Role in System
`server/src/` houses the executable backend logic. It initializes infrastructure services, maps API paths to routers, establishes MongoDB database sessions, and coordinates error handling.

### Architectural Layering
```
+--------------------------------------------------------------+
|                        server.js                             |  (Boot & Middleware Mounting)
+--------------------------------------------------------------+
                                |
                                v
+--------------------------------------------------------------+
|                         routes/                              |  (Endpoint declarations)
+--------------------------------------------------------------+
                                |
                                v
+--------------------------------------------------------------+
|                       middleware/                            |  (Auth, RateLimit, Validation)
+--------------------------------------------------------------+
                                |
                                v
+--------------------------------------------------------------+
|                      controllers/                            |  (Payload parsing, Envelope response)
+--------------------------------------------------------------+
                                |
                                v
+--------------------------------------------------------------+
|                       services/                              |  (Domain logic & business transactions)
+--------------------------------------------------------------+
                                |
                                v
+--------------------------------------------------------------+
|                        models/                               |  (Mongoose Schemas & MongoDB collections)
+--------------------------------------------------------------+
```

---

## 2. Directory Inventory & Module Responsibilities

| Subfolder / File | Responsibility |
| :--- | :--- |
| [`server.js`](file:///Users/nvc/Documents/LetMeCook/server/src/server.js) | Server entrypoint: loads env, mounts global middleware, mounts routes, starts HTTP listener. |
| [`config/`](file:///Users/nvc/Documents/LetMeCook/server/src/config) | Database connection establishment and lifecycle tracking. |
| [`controllers/`](file:///Users/nvc/Documents/LetMeCook/server/src/controllers) | HTTP request handlers, parameter validation, response envelope formatting. |
| [`data/`](file:///Users/nvc/Documents/LetMeCook/server/src/data) | Static campus dataset (`world_universities.json`) for domain validation. |
| [`middleware/`](file:///Users/nvc/Documents/LetMeCook/server/src/middleware) | Route guards (JWT authentication, rate limiters, validation checkers, error filters). |
| [`models/`](file:///Users/nvc/Documents/LetMeCook/server/src/models) | Mongoose data schemas, compound indexes, TTL auto-expiry rules. |
| [`routes/`](file:///Users/nvc/Documents/LetMeCook/server/src/routes) | Express router instances mapping URL paths to middleware and controller functions. |
| [`services/`](file:///Users/nvc/Documents/LetMeCook/server/src/services) | Pure business logic, authorization enforcement, and database mutation workflows. |
| [`utils/`](file:///Users/nvc/Documents/LetMeCook/server/src/utils) | Pure helper functions, regex validators, mock seeders. |

---

## 3. Server Startup Lifecycle (`server.js`)

1. **Environment Injection**: `dotenv.config()` loads `.env` values.
2. **University Domain Indexing**: `UniversityService.init()` indexes `10,000+` global university domains into an in-memory hash set.
3. **Database Connection**: `connectDB()` connects to MongoDB Atlas cluster.
4. **Middleware Attachment**: `cors`, `express.json()`, `express.urlencoded()`.
5. **Route Registration**: Mounts the 8 API domain routers on `/api/*`.
6. **Error Interception**: `errorHandler` catches unhandled exceptions and returns standardized error envelopes.
7. **Listener Start**: Binds to `0.0.0.0:${PORT}` and logs readiness.

---

## 4. How-To: Adding a New Feature Domain

1. **Define Schema**: Create `src/models/<Entity>.js`.
2. **Implement Service**: Add business rules in `src/services/<entity>.service.js`.
3. **Create Controller**: Add request handling in `src/controllers/<entity>.controller.js`.
4. **Mount Routes**: Create `src/routes/<entity>.routes.js`.
5. **Attach in `server.js`**:
   ```javascript
   const entityRoutes = require('./routes/<entity>.routes');
   app.use('/api/<entity>', entityRoutes);
   ```
