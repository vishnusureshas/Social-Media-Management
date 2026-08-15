# Backend

Express + MongoDB (Mongoose) + Socket.IO backend for the Social Media Platform.

## Setup

1. Install dependencies: `npm install`
2. Create `.env` from `.env.example` and fill in your credentials (MongoDB Atlas URI, JWT secrets, Cloudinary, SMTP).
3. Start dev server: `npm run dev`

## Scripts

- `npm run dev` — dev server with nodemon + cross-env
- `npm start` — production start
- `npm test` — test suite (Jest)
- `npm run seed:admins` — upsert demo `admin` + `superadmin` accounts (idempotent)

## Demo admin accounts (seed only — do not use in production)

Run `npm run seed:admins` to create/refresh these accounts in the configured DB:

| Role       | Username    | Email                  | Password    |
|------------|-------------|------------------------|-------------|
| admin      | admin       | `admin@nexus-demo.com` | `Admin@123` |
| superadmin | superadmin  | `superadmin@nexus-demo.com`| `Super@123` |

Sign in at `/admin/login` (or the normal login). Promotes on re-run, so it will
reset these accounts to admin/superadmin if roles were changed.

> Use a REAL valid email TLD (`.com`) here — Joi's `string().email()` rejects
> reserved TLDs like `.test`, so accounts seeded with `@nexus.test` log in with
> a "Please provide a valid email" validation error.

## Structure

```
src/
├── index.js           # entry (Express + Socket.IO)
├── app.js             # express app + middleware + health route
├── config/            # env, db, jwt, cloudinary
├── middlewares/       # auth, errorHandler, validate, upload, rateLimit
├── models/            # mongoose schemas
├── controllers/       # route handlers
├── routes/            # route definitions
├── services/          # business logic
├── sockets/           # socket handlers (chat, notifications)
├── utils/             # helpers, mailer, response wrapper
└── validations/       # joi schemas
```

## API

Health check: `GET /api/v1/health`