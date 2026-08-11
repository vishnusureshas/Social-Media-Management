# Social Media Platform — Backend Design Document

A full-featured Social Media Platform built on the **MERN stack** (MongoDB, Express, React, Node.js).

This document covers:
- Tech Stack & Architecture
- Folder Structure
- Database Design (MongoDB Schemas)
- MongoDB Atlas Setup
- REST API Design
- Real-time features (Socket.IO)
- Admin Panel Design
- Security & Performance considerations
- Feature Coverage Checklist (every social-media module)

---

## 1. Feature Coverage Checklist

All standard social-media functionalities planned for this platform, mapped to their section. ✓ = Fulfilled, 🔑 = planned (design included).

| Category            | Feature                                    | Status | Section          |
|---------------------|--------------------------------------------|--------|------------------|
| Core Profile        | Registration, Login, JWT auth              | ✓      | 7.2 Auth         |
|                     | Email verification, Forgot/Reset password  | ✓      | 7.2 Auth         |
|                     | Profile CRUD, avatar, cover, bio           | ✓      | USER module      |
| Social Graph        | Follow / Unfollow                          | ✓      | USER module      |
|                     | Block / Mute, Privacy controls             | ✓      | PRIVACY module   |
|                     | Suggestions (who-to-follow)                | ✓      | USER module      |
| Content Feed        | Posts (text/image/video)                   | ✓      | POSTS module     |
|                     | Feed, Explore, Hashtag search, Trending    | ✓      | POSTS module     |
|                     | Share/Repost, Save/Bookmark                | ✓      | POSTS module     |
| Engagement          | Like / Unlike                              | ✓      | POSTS module     |
|                     | Multi-emoji Reactions                      | ✓      | REACTIONS module |
|                     | Comments + reply threads                   | ✓      | COMMENTS module  |
|                     | Polls inside posts                         | ✓      | POLLS module     |
| Rich Content        | Stories (24h ephemeral) + views            | ✓      | STORIES module   |
|                     | Reels/Shorts (short-form video)            | ✓      | REELS module     |
|                     | Media upload (image/video/audio)           | ✓      | 9 Media Upload   |
| Messaging           | DM + Group chat, typing/read receipts      | ✓      | CHAT module      |
|                     | Presence (online/offline/last seen)        | ✓      | 8 Socket.IO      |
| Notifications       | Likes, comments, follows, mentions, shares | ✓      | NOTIFICATIONS    |
| Moderation          | Report content                             | ✓      | REPORTS module   |
|                     | Admin ban/user/post/comment management     | ✓      | ADMIN PANEL      |
|                     | Auto-moderation keywords filter            | ✓      | ADMIN PANEL      |
| Search              | Users, posts, hashtags                     | ✓      | 5.4 + modules    |
| Security            | 2FA (TOTP), session management, audit      | ✓      | SECURITY module  |
| Admin               | Dashboard, analytics, reports queue, logs  | ✓      | ADMIN PANEL      |

### Not included (optional / future)
| Feature         | Reason                                        |
|-----------------|-----------------------------------------------|
| Live streaming  | Requires WebRTC media servers (scale cost)     |
| Voice/video calls | Uses WebRTC, out of core scope               |
| Groups / Events / Pages | Added post-MVP as separate modules      |
| Advertisements  | Requires ad-serving + payments integration     |
| Marketplace     | e-Commerce scope, separate product            |

---

## 2. Tech Stack

| Layer      | Technology                              | Purpose                            |
|------------|-----------------------------------------|------------------------------------|
| Runtime    | Node.js (LTS 20+)                       | Server runtime                     |
| Framework  | Express.js (v4+ / v5)                   | REST API                           |
| Database   | MongoDB (Mongoose ODM)                  | Data storage                       |
| Cloud DB   | MongoDB Atlas (M0/M10+ cluster)         | Managed, hosted DB                 |
| Auth       | JWT + bcryptjs + cookie-parser          | Authentication & authorization     |
| Real-time  | Socket.IO                              | Chat, notifications, live feed     |
| Files      | Multer + Cloudinary                     | Media uploads (images/videos)      |
| Validation | Joi / express-validator                 | Request payload validation         |
| Emails     | Nodemailer                         | Email verification, password reset |
| Cache      | (Optional) Redis / Node-cache           | Feed caching, rate limiting        |
| Logging    | Morgan + Winston                        | Request & error logs               |
| Testing    | Jest + Supertest                        | Unit & integration tests           |
| Process    | PM2 / Docker                            | Deployment                         |

---

## 3. High-Level Architecture

```
[React Frontend]
      │  REST (https /api/v1)
      ▼
[Node.js + Express API] ── Socket.IO (websocket) ──► [React Realtime]
      │            │
      ▼            ▼
 [Mongoose]   [JWT Auth Middleware]
      │
      ▼
[MongoDB Atlas Cluster]
```

- Monolith-first backend (fast to build), horizontally scalable later by extracting services (auth-service, feed-service, chat-service).
- JWT used for stateless auth; Socket.IO connections authenticated with the same JWT.
- All media is **not** stored in MongoDB — stored in Cloudinary/S3, with URL + metadata in DB.

---

## 4. Backend Folder Structure

```
backend/
├── src/
│   ├── index.js                 # Entry point (Express + Socket.IO)
│   ├── app.js                   # Express app setup
│   ├── config/
│   │   ├── db.js                # MongoDB connection (Atlas URI)
│   │   ├── cloudinary.js        # Cloudinary config
│   │   ├── jwt.js               # JWT secret & config
│   │   └── env.js               # Environment variable loader (.env)
│   ├── models/                  # Mongoose schemas (see DB Design)
│   ├── controllers/             # Route handlers (business logic)
│   ├── routes/                  # Express route definitions
│   ├── middlewares/
│   │   ├── auth.js              # protect, authorize(roles)
│   │   ├── errorHandler.js      # Central error handler
│   │   ├── validate.js          # Joi validation middleware
│   │   ├── upload.js            # Multer + Cloudinary upload
│   │   └── rateLimit.js         # Rate limiting
│   ├── services/                # Reusable business services
│   ├── utils/                   # Helpers, mailer, response wrapper
│   ├── sockets/                 # Socket.IO event handlers
│   │   ├── index.js
│   │   ├── chat.js
│   │   └── notifications.js
│   └── validations/             # Joi schemas
├── public/
├── .env.example
├── package.json
└── README.md
```

---

## 5. Database Design (MongoDB)

### 5.1 Collections Overview

| Collection        | Description                                     |
|-------------------|-------------------------------------------------|
| `users`           | Profile, auth, followers/following, role        |
| `posts`           | Text/image/video posts, shares                  |
| `stories`         | 24-hour ephemeral stories (+ views)             |
| `reels`           | Short-form vertical video content               |
| `comments`        | Comments on posts                               |
| `reactions`       | Multi-emoji reactions (like, love, haha, ...)   |
| `polls`           | Polls embedded in posts (+ votes)               |
| `blocks`          | Blocked users (two-way visibility cutoff)       |
| `mutes`           | Muted users (feed/notification suppression)     |
| `likes`           | Likes on posts/comments                         |
| `notifications`   | Activity notifications                          |
| `conversations`   | Private 1-on-1 or group chats                   |
| `messages`        | Individual chat messages                        |
| `reports`         | User-submitted content reports                  |
| `saved`           | Saved/bookmarked posts                          |
| `follows`         | Explicit follow relationships (alternative)     |
| `admins`/`accesslogs` | Admin actions & audit trail                 |
| `refreshtokens`/`sessions` | Refresh token + device session storage  |
| `securitylog`     | 2FA, failed logins, login device history       |

---

### 5.2 Mongoose Schemas

#### User

```js
{
  username:    String,      // unique, lowercase, @handle
  email:       String,      // unique, lowercase
  password:    String,      // bcrypt hash (never plain)
  fullName:    String,
  bio:         String,
  avatar:      String,      // Cloudinary URL
  coverPhoto:  String,
  verified:    Boolean, default: false,
  gender:      String,
  dob:         Date,
  location:    String,
  website:     String,
  role:        String,      // enum: ["user", "admin", "superadmin"]
  isActive:    Boolean, default: true,   // account active
  isBanned:    Boolean, default: false,  // banned by admin
  banReason:   String,
  privacy: {
    postsVisibleTo: String, // enum: ["public", "followers", "onlyme"]
    messages: String        // enum: ["everyone", "followers", "nobody"]
  },
  emailVerified: Boolean, default: false,
  otp: { code: String, expiresAt: Date },      // for verification/reset
  refreshToken: String,                        // for refresh token rotation
  twoFA: { enabled: Boolean, secret: String, backupCodes: [String] },
  counts: { posts: Number, stories: Number, followers: Number, following: Number },
  lastSeen: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}

indexes:  username(unique), email(unique)
```

#### Post

```js
{
  author:      ObjectId, ref: 'User',
  content:     String,    // text
  media: [{    type: String, url: String, mediaType: enum["image","video","audio"] }],
  tags:        [String],  // hashtags
  mentions:    [ObjectId, ref: 'User'],
  location:    String,
  visibility:  String,    // enum: ["public", "followers", "onlyme"]
  likesCount:  Number, default: 0,
  commentsCount:Number, default: 0,
  sharesCount: Number, default: 0,
  views:       Number, default: 0,
  isDeleted:   Boolean, default: false,
  isFlagged:   Boolean, default: false,      // reported
  isPinned:    Boolean, default: false,      // admin feature
  originalPost: ObjectId, ref: 'Post',      // if this is a share
  poll:       ObjectId, ref: 'Poll',        // optional embedded poll
  createdAt: Date, updatedAt: Date
}

indexes:  author, createdAt(desc), tags
```

#### Story (24-hour ephemeral)

```js
{
  author:       ObjectId, ref: 'User',
  media:        [{ url: String, mediaType: enum["image","video"] }],
  bgColor:      String,    // for text-only stories
  text:         String,
  mentions:     [ObjectId, ref: 'User'],
  tags:         [String],
  viewers:      [ObjectId, ref: 'User'],      // who viewed (for analytics)
  viewCount:    Number, default: 0,
  replies:      [ObjectId, ref: 'Comment'],   // reaction/reply to story
  isActive:     Boolean, default: true,       // inactive after 24h
  expiresAt:    Date,                         // createdAt + 24h (TTL index for cleanup)
  isFlagged:    Boolean, default: false,
  createdAt:    Date, updatedAt: Date
}
// index: { author, expiresAt } with TTL expiry on expiresAt → auto-deletes story
```

#### Reel (short-form vertical video)

```js
{
  author:       ObjectId, ref: 'User',
  video:        { url: String, thumbnail: String },
  caption:      String,
  audio:        { url: String, name: String, artist: String },
  musicTrack:   ObjectId, ref: 'MusicTrack',   // optional authoring: original audio
  tags:         [String],
  mentions:     [ObjectId, ref: 'User'],
  likesCount:   Number, default: 0,
  commentsCount:Number, default: 0,
  sharesCount:  Number, default: 0,
  views:        Number, default: 0,
  plays:        Number, default: 0,
  durationSec:  Number,                        // max 90s
  isFlagged:    Boolean, default: false,
  isDeleted:    Boolean, default: false,
  createdAt:    Date, updatedAt: Date
}
// index: { createdAt(desc), views }
```

#### Reaction (multi-emoji)

```js
{
  user:       ObjectId, ref: 'User',
  targetType: String,  // enum: ['post','comment','reel','story']
  targetId:   ObjectId,
  emoji:      String,  // enum: ['like','love','haha','wow','sad','angry']
  createdAt:  Date
}
// compound unique index: { user, targetType, targetId } → single reaction, updates on change
```

#### Poll

```js
{
  post:         ObjectId, ref: 'Post',
  question:     String,
  options:      [{ id: ObjectId, text: String, votes: Number }],
  totalVotes:   Number, default: 0,
  voters:       [ObjectId, ref: 'User'],   // prevent double-voting (or counted via votes doc)
  expiresAt:    Date,
  createdAt:    Date
}
```

#### Block / Mute

```js
// Block — full visibility cutoff both ways
{
  blocker:     ObjectId, ref: 'User',
  blocked:     ObjectId, ref: 'User',
  createdAt:   Date
}
// compound unique index: { blocker, blocked }

// Mute — hide from feed/notifications but still follow-able
{
  muter:       ObjectId, ref: 'User',
  muted:       ObjectId, ref: 'User',
  scope:       String,  // enum: ['feed','stories','notifications','all']
  createdAt:   Date
}
// compound unique index: { muter, muted, scope }
```

#### Session (device/refresh token registry)

```js
{
  user:       ObjectId, ref: 'User',
  refreshToken: String,   // hashed
  device:     { name: String, os: String, browser: String },
  ip:         String,
  userAgent:  String,
  expiresAt:  Date,
  revoked:    Boolean, default: false,
  createdAt:  Date, updatedAt: Date
}
```

#### SecurityLog

```js
{
  user:       ObjectId, ref: 'User',
  action:     String,   // enum: login, login_failed, 2fa_changed, password_changed, logout, session_revoked
  ip:         String,
  device:     String,
  success:    Boolean, default: true,
  createdAt:  Date
}
// index: { user, createdAt(desc) }
```

#### Comment

```js
{
  post:       ObjectId, ref: 'Post',
  author:     ObjectId, ref: 'User',
  parent:     ObjectId, ref: 'Comment',  // null = top-level, else reply
  content:    String,
  likes:      [{type: ObjectId, ref:'User'}],
  isDeleted:  Boolean, default: false,
  createdAt:  Date, updatedAt: Date
}
```

#### Like

```js
{
  user:     ObjectId, ref: 'User',
  targetType: String,   // enum: ['post','comment']
  targetId: ObjectId,   // refPath not used; polymorphic target
  createdAt: Date
}
// compound unique index: { user, targetType, targetId }  → prevents duplicate likes
```

#### Notification

```js
{
  recipient:  ObjectId, ref: 'User',
  type:       String,  // enum: like, reaction, comment, follow, mention, share,
                       //       message, story_reply, report_resolved, admin_notice, broadcast
  actor:      ObjectId, ref: 'User',       // who caused it
  post:       ObjectId, ref: 'Post',       // optional context
  read:       Boolean, default: false,
  seenAt:     Date,
  createdAt:  Date
}
// index: { recipient, read, createdAt }
```

#### Conversation

```js
{
  participants: [ObjectId, ref: 'User'],     // 2 for DM, more for group
  type:        String,  // enum: ['direct','group']
  groupName:   String,
  groupAvatar: String,
  admin:       ObjectId, ref: 'User',        // group admin
  lastMessage: ObjectId, ref: 'Message',
  mutedBy:     [ObjectId],
  createdAt:   Date, updatedAt: Date
}
// index: { participants: 1 } (or hash of sorted participant ids)
```

#### Message

```js
{
  conversation: ObjectId, ref: 'Conversation',
  sender:       ObjectId, ref: 'User',
  content:      String,
  media:        [{ url: String, mediaType: String }],
  type:         String,  // enum: ['text','image','video','file']
  readBy:       [ObjectId, ref: 'User'],
  deletedFor:   [ObjectId],                 // delete-for-me
  createdAt:    Date
}
// index: { conversation, createdAt }
```

#### Follow

```js
{
  follower: ObjectId, ref: 'User',   // the one following
  following: ObjectId, ref: 'User',  // the one being followed
  createdAt: Date
}
// compound unique index: { follower, following } → one follow per pair
```

#### Report

```js
{
  reportedBy: ObjectId, ref: 'User',
  targetType: String,   // enum: ['user','post','comment','message']
  targetId:   ObjectId,
  reason:     String,
  description: String,
  status:     String,   // enum: ['pending','reviewing','resolved','dismissed']
  actionTaken: String,  // e.g. 'post_removed', 'user_banned'
  handledBy:  ObjectId, ref: 'User',   // admin
  createdAt:  Date, updatedAt: Date
}
// index: { status, createdAt }
```

#### Saved

```js
{
  user: ObjectId, ref: 'User',
  post: ObjectId, ref: 'Post',
  createdAt: Date
}
// compound unique index: { user, post }
```

#### AdminActionLog (Audit Trail)

```js
{
  admin:     ObjectId, ref: 'User',
  action:    String,   // create, ban, unban, deletePost, resolveReport, changeRole, ...
  targetType:String,   // user/post/report/...
  targetId:  ObjectId,
  metadata:  Object,   // extra details
  ip:        String,
  createdAt: Date
}
```

---

### 5.3 Relationships & Data Integrity

- **Denormalized counters** (`likesCount`, `commentsCount`, `followers` counts) are stored on parent documents to avoid heavy `count()` queries. Updated atomically with `$inc` in the same flow that creates/deletes the child doc.
- Referential integrity is **enforced at the application layer** (MongoDB has no foreign keys). `pre('findOneAndDelete')` hooks remove child docs (e.g., deleting a user deletes posts, likes, comments, followers).
- **Soft deletes** (`isDeleted`, `isActive`, `isBanned`) used for moderation so admins can restore content.

---

### 5.4 Design Decisions

1. **Feed via time-decay score** — store a `score` field (e.g., `likes + 5*comments + views/bonus`) updated periodically, or compute feed with aggregation pipeline. For MVP, feed = posts by `owners` (user + following) sorted by `createdAt` desc with pagination (cursor-based).
2. **Pagination** — use **cursor-based pagination** (`createdAt` / `_id`) for infinite scroll feeds, not `skip()`. `skip` is slow on large collections.
3. **Hashtags & Search** — enable **text index** on `posts.content`, `comments`, and `users.fullName/bio`. Autocomplete from a separate hashtags aggregation.
4. **Notifications fan-out** — for MVP write notifications synchronously (or via a queue/bull later) when like/comment/follow occurs.
5. **Chat** — messages stored in Mongo, emitted with Socket.IO. Mark messages `readBy` incrementally.

---

## 6. MongoDB Atlas Setup

### 6.1 Create the Cluster (UI)
1. Sign up / sign in at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Click **Build a Database** → choose **M0 Free Shared** (or M10 for production).
3. Choose a cloud provider + region near your users (e.g., AWS `us-east-1`, GCP).
4. Set a **Database User** (username + password) — used in the connection string.
5. Add **Network Access**: by default allow all IPs (`0.0.0.0/0`) for dev, or restrict to your server IP for production.
6. **Create the Database** — Atlas auto-creates `test` db. Create your own via UI or let the app create it on first connection.

### 6.2 Connection String
In Atlas → Cluster → **Connect** → **Connect your application** → copy SRV string:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
```

Store it in the backend `.env` file:

```env
# .env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/socialplatform?retryWrites=true&w=majority

JWT_SECRET=super_secret_change_me
JWT_EXPIRES_IN=7d
REFRESH_SECRET=another_secret
REFRESH_EXPIRES_IN=30d

CLIENT_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourapp@gmail.com
SMTP_PASS=app_password
```

### 6.3 Connection Code (`config/db.js`)

```js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`DB Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 6.4 Production Best Practices on Atlas
- Enable **Backup** (M10+), set up a **cloud backup schedule**.
- Use **Database Access limits** — create a minimal-privilege app user.
- Enable **Network Peering** or IP allowlist.
- Create **Performance Advisor** / **Profiler** indexes as flagged.
- Add `mongodb+srv` (TLS-only). Never commit real credentials.

---

## 7. REST API Design

Base URL: `http://localhost:5000/api/v1`

### 7.1 Response Wrapper (consistent API)

```json
// Success
{ "success": true, "message": "...", "data": {} , "pagination": { "cursor": "...", "hasMore": true } }

// Error
{ "success": false, "message": "...", "errors": [] }
```

HTTP codes: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `429 Too Many Requests`, `500 Server Error`.

### 7.2 Authentication Flow
- `POST /register` → creates user → sends email OTP → user verifies OTP.
- `POST /login` → returns **access token (JWT, short-lived)** + **refresh token (long-lived)**.
- Access token sent via `Authorization: Bearer <token>` header.
- `POST /refresh` → exchange refresh token for new pair (rotation, stored in DB).
- `POST /logout` → invalidate refresh token.
- Every restricted route uses `protect` middleware; admin routes use `authorize('admin','superadmin')`.

---

### 7.3 Endpoints by Module

#### AUTH
| Method | Endpoint                  | Auth | Description                            |
|--------|---------------------------|------|----------------------------------------|
| POST   | `/auth/register`          | No   | Register user (email + password)       |
| POST   | `/auth/verify-email`      | No   | Verify email with OTP                 |
| POST   | `/auth/resend-otp`        | No   | Resend verification/reset OTP         |
| POST   | `/auth/login`             | No   | Login, returns tokens                 |
| POST   | `/auth/refresh`           | Yes  | Refresh access token                  |
| POST   | `/auth/logout`            | Yes  | Logout (invalidate refresh token)     |
| POST   | `/auth/forgot-password`   | No   | Send password reset link/OTP           |
| POST   | `/auth/reset-password`    | No   | Reset password with OTP               |
| PUT    | `/auth/change-password`   | Yes  | Change password (logged in)           |
| GET    | `/auth/me`                | Yes  | Current logged-in user profile         |

#### USER
| Method | Endpoint                  | Auth | Description                            |
|--------|---------------------------|------|----------------------------------------|
| GET    | `/users/:username`        | Yes  | Get public profile                     |
| PATCH  | `/users/profile`          | Yes  | Update profile (bio, avatar, cover)    |
| PATCH  | `/users/password`         | Yes  | Change password                        |
| DELETE | `/users/account`          | Yes  | Deactivate/delete own account          |
| GET    | `/users/:username/followers`  | Yes | Paginated followers                 |
| GET    | `/users/:username/following`  | Yes | Paginated following                 |
| POST   | `/users/:username/follow`   | Yes | Follow/unfollow toggle              |
| GET    | `/users/search?q=`        | Yes  | Search users                          |
| GET    | `/users/:username/posts`  | Yes  | User posts + saved tab                |
| GET    | `/users/:username/saved`  | Yes  | Saved posts                           |
| GET    | `/users/suggestions`      | Yes  | Who to follow suggestions            |

#### POSTS
| Method | Endpoint                  | Auth | Description                            |
|--------|---------------------------|------|----------------------------------------|
| POST   | `/posts`                  | Yes  | Create post (text/media)              |
| GET    | `/posts`                  | Yes  | Feed (following + self, cursor pag.)  |
| GET    | `/posts/:id`              | Yes  | Single post + details                |
| PATCH  | `/posts/:id`              | Yes  | Edit own post                         |
| DELETE | `/posts/:id`              | Yes  | Soft-delete own post                  |
| POST   | `/posts/:id/share`        | Yes  | Share/repost                         |
| POST   | `/posts/:id/like`         | Yes  | Like / unlike toggle                  |
| GET    | `/posts/:id/likes`        | Yes  | List users who liked                  |
| GET    | `/posts/:id/comments`     | Yes  | Paginated comments (+replies)         |
| POST   | `/posts/:id/save`         | Yes  | Save / unsave post                    |
| GET    | `/posts/explore`          | Yes  | Explore (popular/public)              |
| GET    | `/posts/tag/:hashtag`     | Yes  | Posts by hashtag                     |
| GET    | `/posts/trending`         | Yes  | Trending hashtags                   |

#### COMMENTS
| Method | Endpoint                  | Auth | Description                            |
|--------|---------------------------|------|----------------------------------------|
| POST   | `/comments`               | Yes  | Add comment to post                   |
| GET    | `/comments/:id/replies`   | Yes  | Get reply thread                      |
| PATCH  | `/comments/:id`           | Yes  | Edit own comment                      |
| DELETE | `/comments/:id`           | Yes  | Delete own comment                    |
| POST   | `/comments/:id/like`      | Yes  | Like/unlike comment                   |

#### REACTIONS (multi-emoji)
| Method | Endpoint                     | Auth | Description                          |
|--------|------------------------------|------|--------------------------------------|
| POST   | `/reactions`                 | Yes  | React to post/comment/reel/story     |
| DELETE | `/reactions/:id`             | Yes  | Remove reaction                      |
| GET    | `/reactions/summary?targetType=&targetId=` | Yes | Get emoji breakdown + my reaction |

#### POLLS
| Method | Endpoint                  | Auth | Description                            |
|--------|---------------------------|------|----------------------------------------|
| POST   | `/polls/:id/vote`         | Yes  | Vote on a poll option                 |
| GET    | `/polls/:id/results`      | Yes  | Poll results (real-time)              |

#### STORIES (24h ephemeral)
| Method | Endpoint                  | Auth | Description                            |
|--------|---------------------------|------|----------------------------------------|
| POST   | `/stories`                | Yes  | Create story (media/text, expires 24h)|
| GET    | `/stories`                | Yes  | Active stories ring (followed users)  |
| GET    | `/stories/:id`            | Yes  | View single story (increments view)   |
| DELETE | `/stories/:id`            | Yes  | Delete own story                      |
| GET    | `/stories/:id/viewers`    | Yes  | Story viewers list (analytics)        |

#### REELS / SHORTS (short-form video)
| Method | Endpoint                  | Auth | Description                            |
|--------|---------------------------|------|----------------------------------------|
| POST   | `/reels`                  | Yes  | Upload a reel (video, caption, audio) |
| GET    | `/reels`                  | Yes  | Reels feed (algorithmic ranking)      |
| GET    | `/reels/:id`              | Yes  | Single reel + details                |
| GET    | `/reels/:id/comments`     | Yes  | Reel comments (reuses comment model)  |
| POST   | `/reels/:id/like`         | Yes  | Like / unlike reel                    |
| POST   | `/reels/:id/share`        | Yes  | Share / repost reel                  |
| DELETE | `/reels/:id`              | Yes  | Delete own reel                       |

#### NOTIFICATIONS
| Method | Endpoint                  | Auth | Description                            |
|--------|---------------------------|------|----------------------------------------|
| GET    | `/notifications`          | Yes  | Paginated notifications               |
| GET    | `/notifications/unread-count` | Yes  | Unread count (badge)               |
| PUT    | `/notifications/read`     | Yes  | Mark all as read                      |
| PUT    | `/notifications/:id/read` | Yes  | Mark single as read                   |

#### CHAT (socket + REST for history)
| Method | Endpoint                    | Auth | Description                          |
|--------|-----------------------------|------|--------------------------------------|
| GET    | `/chat/conversations`       | Yes  | List conversations + unread counts   |
| POST   | `/chat/conversations`       | Yes  | Start DM / create group chat         |
| GET    | `/chat/conversations/:id/messages` | Yes | Load message history (paginated) |
| GET    | `/chat/conversations/:id`   | Yes  | Conversation detail                  |
| PUT    | `/chat/conversations/:id/read` | Yes | Mark conversation read            |

#### REPORTS (user-facing + admin)
| Method | Endpoint                  | Auth        | Description                           |
|--------|---------------------------|-------------|---------------------------------------|
| POST   | `/reports`                | Yes         | Report a post/user/comment            |
| GET    | `/reports/my`             | Yes         | My submitted reports                  |

#### PRIVACY (Block / Mute / Account)
| Method | Endpoint                  | Auth | Description                            |
|--------|---------------------------|------|----------------------------------------|
| POST   | `/privacy/block/:userId`  | Yes  | Block a user (both ways cutoff)       |
| DELETE | `/privacy/block/:userId`  | Yes  | Unblock a user                        |
| GET    | `/privacy/blocked`        | Yes  | List blocked users                    |
| POST   | `/privacy/mute/:userId`   | Yes  | Mute feed/stories/notifications       |
| DELETE | `/privacy/mute/:userId`   | Yes  | Unmute user                           |
| GET    | `/privacy/muted`          | Yes  | List muted users                      |
| PATCH  | `/privacy/settings`       | Yes  | Update privacy (post visibility, dm policy) |

#### SECURITY (2FA, Sessions, Activity)
| Method | Endpoint                  | Auth | Description                            |
|--------|---------------------------|------|----------------------------------------|
| POST   | `/security/2fa/setup`     | Yes  | Generate 2FA (TOTP) secret + QR       |
| POST   | `/security/2fa/enable`    | Yes  | Verify OTP & enable 2FA              |
| POST   | `/security/2fa/disable`   | Yes  | Disable 2FA (verify OTP)             |
| POST   | `/security/2fa/login`     | No   | Login step-2 with TOTP/backup code   |
| GET    | `/security/sessions`      | Yes  | List active device sessions          |
| DELETE | `/security/sessions/:id`  | Yes  | Revoke a session (logout device)     |
| GET    | `/security/logs`          | Yes  | Login/security activity history      |

---

#### ADMIN PANEL

All admin routes protected with `authorize('admin', 'superadmin')`.

| Method | Endpoint                                 | Description                                    |
|--------|------------------------------------------|------------------------------------------------|
| POST   | `/admin/login`                           | Admin login (role-based)                      |
| GET    | `/admin/dashboard/stats`                 | Overview: users, posts, reports, engagement    |
| GET    | `/admin/dashboard/charts`                | Signups/day, posts/day, likes/day              |
| GET    | `/admin/users?page=&q=&role=&status=`    | List/manage users (search/filter/paginate)     |
| GET    | `/admin/users/:id`                       | User detail + activity                         |
| PATCH  | `/admin/users/:id/status`                | Ban/activate user (reason required for ban)    |
| PATCH  | `/admin/users/:id/role`                  | Promote/demote role                           |
| DELETE | `/admin/users/:id`                       | Hard-delete user + all content                 |
| GET    | `/admin/posts?status=&q=`                | List all posts (any user)                      |
| DELETE | `/admin/posts/:id`                       | Remove posts (soft/hard)                      |
| PATCH  | `/admin/posts/:id/pin`                   | Pin/unpin post (featured)                     |
| GET    | `/admin/stories?q=`                      | List all stories (+expired cleanup)           |
| DELETE | `/admin/stories/:id`                     | Remove a story before expiry                  |
| GET    | `/admin/reels?q=&status=`                | List/manage all reels                        |
| DELETE | `/admin/reels/:id`                       | Remove reel                                  |
| GET    | `/admin/reports?status=pending`          | Moderation queue                              |
| PATCH  | `/admin/reports/:id`                     | Resolve/dismiss report with action            |
| GET    | `/admin/comments?q=`                     | Manage comments                               |
| DELETE | `/admin/comments/:id`                    | Delete comment                                |
| GET    | `/admin/hashtags?q=`                     | Trending/hashtags management                  |
| GET    | `/admin/keywords`                        | List auto-moderation flagged keywords        |
| POST   | `/admin/keywords`                        | Add a moderation keyword                     |
| DELETE | `/admin/keywords/:id`                    | Remove a moderation keyword                  |
| GET    | `/admin/notifications`                   | Send broadcast notification                   |
| POST   | `/admin/notifications/broadcast`         | Push to all/specific users                    |
| GET    | `/admin/audit-logs`                      | Read admin action logs                        |
| PATCH  | `/admin/settings`                        | Platform settings (limits, tos, banner)        |

---

## 8. Real-Time Features (Socket.IO)

- Authentication handshake: client passes JWT in `auth.token`; server verifies before accepting.
- Namespaces/rooms:
  - **user:{id}** — per-user room for notifications.
  - **conversation:{id}** — chat room.
  - **presence** — online/offline status via `presence:` join/leave + `lastSeen`.

### Events
```
Client → Server:
  'message:send'   { conversationId, content, media }
  'message:typing' { conversationId, isTyping }
  'message:read'   { conversationId, messageIds }
  'story:watch'    { storyId }              // register view

Server → Client (emit):
  'message:new'         → subscribers of conversation room
  'message:typing'     → peers
  'notification:new'   → user room
  'presence:update'    → user room (online/offline of followed users)
  'feed:update'        → user room (new post from a followee)
  'story:new'          → followers of the story author
  'reel:trending'      → user room (algorithmic reel pushes)
  'reel:new'           → (optional) live reel feed
```

Scaling note: when going multi-instance, add the **Socket.IO Redis adapter**.

---

## 9. Media Upload Design

- Use **Multer** for multipart parsing → buffer/stream to **Cloudinary**.
- Validate: file type whitelist (jpg/png/webp/gif/mp4/webm), max size (images 5MB, videos 50MB, reels ≤ 90s / 200MB, stories image 5MB / video 50MB).
- Return Cloudinary `secure_url`, `public_id`, `width/height`, `format`.
- Support avatar/cover cropping on client before upload.
- For videos: use `resource_type: 'video'`, optionally generate thumbnails (used for reel cover / story poster).

---

## 10. Middleware & Caching

- `protect` — checks Bearer token, loads user, rejects inactive/banned.
- `authorize(...roles)` — role-based route guard.
- `validate(schema)` — Joi body/params/query validation.
- `rateLimiter` — e.g., login 5 tries/15min, register 3/hour, posts 30/hour.
- Mongoose **lean()** for read paths; partial index support.
- Feed caching (optional): cache JSON feed for hot users with Redis; invalidate on new post/like.

---

## 11. Security Checklist

- bcrypt (cost 10–12) for passwords; never log them.
- **2FA** with TOTP (speakeasy) + backup codes; optional on first login.
- JWT: short-lived access token (15min–1h) + rotating refresh token stored hashed in DB.
- Validate all inputs with Joi; sanitize HTML in content (e.g., `sanitize-html` / DOMPurify on render).
- CORS whitelist the React origin(s).
- Helmet for security headers.
- Rate limiting on auth/register/password endpoints.
- XSS/CSRF: use cookies with `httpOnly` (or token-in-header approach) and set `SameSite`.
- Upload validation to prevent malware/polyglot files.
- Admin endpoints: never expose user passwords/logs; require `superadmin` for destructive actions.
- Encrypt secrets in `.env`; keep `.env` out of git (`.gitignore`).

---

## 12. Testing Strategy

- **Unit:** services + validation schemas (Jest).
- **Integration:** request → controller → DB using a test Mongo instance (MongoMemoryServer) + Supertest for auth, posts, feed, admin flows.
- Use factory/seed data for deterministic tests.
- Add CI: `npm test` on push.

---

## 13. Implementation Roadmap

1. **Setup** — project scaffolding, env, Atlas connection, error handler, response wrapper.
2. **Auth** — register/login/OTP/refresh/forgot/reset + middleware.
3. **User** — profile, follow, search, suggestions, media upload.
4. **Posts** — CRUD, like, comment, share, save, hashtags, feed, explore.
5. **Reactions & Polls** — multi-emoji reactions, post polls + voting.
6. **Stories** — create/view/expire, viewers analytics, TTL cleanup.
7. **Reels** — short video upload, feed, likes/comments/shares.
8. **Privacy & Security** — block/mute, 2FA, device sessions, activity logs.
9. **Notifications** — create on events, REST + socket delivery.
10. **Chat** — conversations, messages, socket events, typing/read receipts.
11. **Reports & Moderation** — report creation, admin triage, auto keyword filter.
12. **Admin Panel** — dashboard, user/post/reel/story management, audit logs, broadcast, settings.
13. **Optimization** — indexes from Atlas profiler, caching, pagination tuning.
14. **Deploy** — Atlas production cluster, Cloudinary keys, env, PM2/Docker, CI/CD.

---

### Next Steps

After this document, create:
- `backend/` — Express application implementing the above.
- `admin/` or admin routes within frontend — React admin dashboard consuming `/admin/*` endpoints.
- `frontend/` — React (Vite) user app.
- `docs/FRONTEND-DESIGN.md` — UI/UX + component architecture.
