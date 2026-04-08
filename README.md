## Content Moderation Backend

Express + MongoDB backend for content moderation product.

- **Primary use case**: clients send text to `/auth/moderate` with an API key; the backend forwards to an external moderation service and stores an audit log in MongoDB.
- **Dashboard API**: authenticated (JWT) endpoints under `/api/*` for usage stats, API key management, and logs.

---

## Tech stack

- **Runtime**: Node.js
- **Web**: Express (v5)
- **DB**: MongoDB via Mongoose
- **Security**: `helmet`, CORS, request sanitization (`express-mongo-sanitize`)
- **Auth**:
  - **JWT** for user/dashboard endpoints (`Authorization: Bearer <token>`)
  - **API keys** for moderation endpoint (`x-api-key: <key>`)

---

## Project structure

```text
config/          # DB + rate limiting
controller/      # Route handlers
middleware/      # JWT + API key auth
models/          # Mongoose models
routes/          # Express routers
services/        # JWT, hashing, API key helpers
validators/      # express-validator chains
index.js         # App entrypoint
```

---

## Requirements

- **Node.js**: any modern LTS should work
- **MongoDB**: local or remote (Atlas)
- **Moderation service**: an HTTP service with a `POST /moderate` endpoint (see [Moderation service contract](#moderation-service-contract))

---

## Environment variables

Create a `.env` file in the project root:

```dotenv
# Server
PORT=8080

# Database
MONGO_URI= <your_mogno_uri>

# Auth
JWT_KEY= <random_secret>

# Password hashing
SALT_ROUNDS=10

# External moderation service base URL (no trailing slash required)
MODERATION_SERVICE_URL=http://localhost:5000
```

### Notes

- **`SALT_ROUNDS` must be an integer** (it’s parsed with `parseInt`).
- **`JWT_KEY`** is used for signing/verifying tokens (HS256, 2h expiry).

---

## Install & run (local)

Install dependencies:

```bash
npm install
```

Run the server:

```bash
npm start
```

Run in watch mode:

```bash
npm run dev
```

When healthy, the server responds at:

- `GET /` → `Working`

---

## Run with Docker

Build:

```bash
docker build -t content-moderation-backend .
```

Run (pass env vars):

```bash
docker run --env-file <path_to_env_file> <image_name>

```

If you’re on Linux and `host.docker.internal` isn’t available, use `--network=host` (development only) or point at a reachable MongoDB/moderation-service host.

---

## API overview

Base URL (local): `http://localhost:8080`

### Authentication summary

- **Dashboard endpoints** (`/api/*`):
  - Header: **`Authorization: Bearer <JWT>`**
  - Get a JWT from `POST /auth/login`
- **Moderation endpoint** (`/auth/moderate`):
  - Header: **`x-api-key: <raw_api_key>`**
  - Get an API key during `POST /auth/register` (returned once) or via `POST /api/keys` (requires JWT)

---

## Endpoints

### `POST /auth/register`

Create a user and an initial API key.

- **Body**

```json
{
  "email": "you@example.com",
  "password": "secret123",
  "name": "My App",
  "plan": "free"
}
```

- **Response (201)**

```json
{
  "message": "Account successfully created",
  "appId": "uuid",
  "appKey": "dtx_live_...",
  "note": "Copy this key and save it, we won't show it again due to security reasons"
}
```

### `POST /auth/login`

Get a JWT for dashboard endpoints.

- **Body**

```json
{
  "email": "you@example.com",
  "password": "secret123"
}
```

- **Response (200)**

```json
{
  "message": "Login successful",
  "token": "jwt..."
}
```

### `POST /auth/moderate`

Moderate a text string using the external moderation service, then store a log in MongoDB.

- **Headers**
  - `x-api-key: dtx_live_...`
- **Body**

```json
{ "text": "some user input" }
```

Constraints:

- **`text` is required**
- **`text` max length is 300**
- **Rate limiting**: 100 requests per 5 minutes per IP (see `config/rateLimiter.js`)

- **Response (200)**

```json
{
  "text": "some user input",
  "flagged": false,
  "labels": [],
  "scores": { "toxic": 0.01 },
  "confidence": 0.93
}
```

Example:

```bash
curl -X POST "http://localhost:8080/auth/moderate" \
  -H "Content-Type: application/json" \
  -H "x-api-key: dtx_live_REPLACE_ME" \
  -d '{"text":"hello world"}'
```

---

## Dashboard API (`/api/*`)

All endpoints below require:

- Header: `Authorization: Bearer <token>`

### `GET /api/dashboard`

Returns aggregated stats and recent activity for the authenticated user’s `appId`.

Example:

```bash
curl "http://localhost:8080/api/dashboard" \
  -H "Authorization: Bearer REPLACE_ME"
```

### `GET /api/keys`

List API keys (only prefixes + metadata; raw key is not recoverable).

### `POST /api/keys`

Create a new API key (raw key is returned once).

- **Body**

```json
{ "name": "Production Key" }
```

### `PATCH /api/keys/:id/revoke`

Revoke a key (sets `isActive=false`).

### `DELETE /api/keys/:id`

Alias of revoke (also sets `isActive=false`).

### `GET /api/logs`

Returns the most recent 100 moderation logs for the authenticated user’s `appId`.

---

## Moderation service contract

This backend expects the external moderation service to expose:

- **Endpoint**: `POST ${MODERATION_SERVICE_URL}/moderate`
- **Request body**:

```json
{ "text": "..." }
```

- **Response body** (shape expected by this backend):

```json
{
  "flagged": true,
  "labels": ["toxic"],
  "scores": { "toxic": 0.98 },
  "confidence": 0.91
}
```

If the service returns a non-2xx response, this backend forwards the status code with a JSON error payload.

---

## Data model (MongoDB)

- **`User`**: `{ email, password, appId }`
- **`ApiKey`**: `{ appId, name, apiKeyHash, prefix, isActive, lastUsed, createdAt }`
- **`ModerationLog`**: `{ appId, text, labels[], scores: Map<string, number>, confidence, flagged, createdAt }`

---

## Security & operational notes

- **API keys are stored hashed** (SHA-256). Only `prefix` + hash are persisted.
- **User passwords are hashed** via bcrypt with `SALT_ROUNDS`.
- **Input sanitization** is applied to `req.body`, `req.query`, and `req.params` to mitigate operator injection.
- **CORS** is enabled broadly right now; lock this down for production.

---

## Troubleshooting

### MongoDB connection fails

- **Check**: `MONGO_URI` is set and reachable from where the process runs.
- **Symptom**: server exits early with `Connection to DB failed - ...`

### `Invalid or expired token!`

- **Check**: you’re passing `Authorization: Bearer <token>` (not `Token ...`)
- **Check**: `JWT_KEY` matches the one used when the token was issued

### `Invalid API key!`

- **Check**: header name is exactly `x-api-key`
- **Check**: key is the **raw key** (`dtx_live_...`), not the stored hash/prefix

### Moderation service unavailable (503)

- **Check**: `MODERATION_SERVICE_URL` points to a running service
- **Check**: the service implements `POST /moderate`

---

## TODO

- [ ] **API key rotation**: rotate keys without downtime
- [ ] **API key scoping**: limit keys by environment/permissions