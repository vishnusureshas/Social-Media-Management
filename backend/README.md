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