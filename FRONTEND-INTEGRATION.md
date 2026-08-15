# Social Media Platform — Frontend Integration Document

Frontend stack: **React (Vite) + JavaScript + Tailwind CSS + Redux Toolkit (RTK Query)**.

> ⚠️ This document covers the **implemented backend steps** (Step 1: Setup, Step 2: Auth, Step 3: User, Step 4: Posts, Step 5: Reactions & Polls, Step 6: Stories, Step 7: Reels, Step 8: Notifications, Step 8a: Privacy & Security, Step 10: Chat, Step 11: Reports & Moderation, Step 12: Admin Panel — backend + frontend).
> New pages/slices are appended here as each backend step is completed.

---

## 1. What We Are Integrating Right Now

Backend readiness status:

| Backend Step | Feature                                    | Status  |
|--------------|--------------------------------------------|---------|
| Step 1       | Backend setup, health check, Atlas, ESM    | ✅ Done |
| Step 2       | Auth (register, verify, login, refresh, logout, reset) | ✅ Done |
| Step 3       | User (profile CRUD, follow, search, suggestions, avatar/cover upload) | ✅ Done |
| Step 4       | Posts (CRUD, feed, like, save, share, hashtags, explore, trending) + Comments | ✅ Done |
| Step 5       | Reactions (multi-emoji) + Polls            | ✅ Done |
| Step 6       | Stories (24h ephemeral, views, viewers)    | ✅ Done |
| Step 7       | Reels (short-form video, algorithmic feed) | ✅ Done |
| Step 8       | Notifications (likes, comments, follows, mentions, shares, unread badge) | ✅ Done |
| Step 8a      | Privacy & Security (block, mute, 2FA, sessions, activity logs) | ✅ Done |
| Step 10      | Chat (DM + group, socket, typing/read receipts, presence) | ✅ Done |
| Step 11      | Reports & Moderation (report content, admin triage, auto keyword filter) | ✅ Done |
| Step 12      | Admin Panel (dashboard, user/content management, audit logs, broadcast, settings) | ✅ Done |

### Live Backend Endpoints (base `http://localhost:5000/api/v1`)

| Method | Endpoint                    | Auth | Purpose                        |
|--------|-----------------------------|------|--------------------------------|
| GET    | `/health`                   | No   | Connection + DB status         |
| POST   | `/auth/register`            | No   | Create account (OTP email)     |
| POST   | `/auth/verify-email`        | No   | Verify with 6-digit OTP        |
| POST   | `/auth/resend-otp`          | No   | Resend OTP                     |
| POST   | `/auth/login`               | No   | Login → access + refresh token |
| POST   | `/auth/refresh`             | Yes  | Rotate refresh token           |
| POST   | `/auth/logout`              | Yes  | Logout, revoke session         |
| POST   | `/auth/forgot-password`     | No   | Send reset OTP                 |
| POST   | `/auth/reset-password`      | No   | Reset password (OTP + new pass)|
| PUT    | `/auth/change-password`     | Yes  | Change password (logged in)    |
| GET    | `/auth/me`                  | Yes  | Current user profile           |

### User module endpoints (base `http://localhost:5000/api/v1/users`)

| Method | Endpoint            | Auth | Purpose                                   |
|--------|---------------------|------|-------------------------------------------|
| GET    | `/:username`        | No   | Public profile (adds `isFollowing` for authed viewers) |
| PATCH  | `/profile`          | Yes  | Update fullName, bio, gender, dob, location, website, privacy |
| POST   | `/avatar`           | Yes  | Upload avatar (multipart `image`, image only, ≤5MB) |
| POST   | `/cover`            | Yes  | Upload cover photo (multipart `image`, image only, ≤5MB) |
| POST   | `/:username/follow` | Yes  | Follow a user                             |
| DELETE | `/:username/follow` | Yes  | Unfollow a user                           |
| GET    | `/:username/followers` | No | Paginated follower list (`?page=&limit=`) |
| GET    | `/:username/following` | No | Paginated following list (`?page=&limit=`)|
| GET    | `/search?q=&page=&limit=` | Yes | Search users by username/fullName     |
| GET    | `/suggestions?limit=` | Yes | Who-to-follow suggestions (excludes self + followed) |

### Posts module endpoints (base `http://localhost:5000/api/v1/posts`)

**All POSTS endpoints require auth.** Feed/list endpoints use **cursor pagination** (`?cursor=<lastPostId>&limit=`, default 20, max 50) → returns `pagination: { cursor, hasMore }`.

| Method | Endpoint             | Body                           | Purpose                              |
|--------|----------------------|---------------------------------|--------------------------------------|
| POST   | `/`                  | `content`, `visibility`, `location`, `tags[]` + multipart `media[]` (image/video ≤50MB, max 4) | Create post |
| GET    | `/`                  | — (query `cursor`, `limit`)     | Feed: own posts + following, `_id` desc |
| GET    | `/:id`               | —                               | Single post (increments `views`)     |
| PATCH  | `/:id`               | `content`, `visibility`, `location` | Edit own post (re-extracts hashtags) |
| DELETE | `/:id`               | —                               | Soft-delete own post (`isDeleted`)   |
| POST   | `/:id/share`         | `content` (optional)            | Repost (original shared via `originalPost`, bumps `sharesCount`) |
| POST   | `/:id/like`          | —                               | Like / unlike toggle                 |
| GET    | `/:id/likes`         | — (query `cursor`, `limit`)     | Users who liked the post             |
| GET    | `/:id/comments`      | — (query `cursor`, `limit`)     | Top-level comments (threaded)        |
| POST   | `/:id/save`          | —                               | Save / unsave toggle                 |
| GET    | `/explore`           | — (query `cursor`, `limit`)     | Popular public posts (sort: likes/comments desc) |
| GET    | `/tag/:hashtag`      | — (query `cursor`, `limit`)     | Posts by hashtag                     |
| GET    | `/trending`          | —                               | Trending hashtags (7-day aggregation) |

### Comments module endpoints (base `http://localhost:5000/api/v1/comments`)

**All require auth.**

| Method | Endpoint        | Body                | Purpose                          |
|--------|-----------------|---------------------|----------------------------------|
| POST   | `/`             | `post`, `parent?`, `content` | Add comment (or reply if `parent`) |
| GET    | `/:id/replies`  | — (query `cursor`, `limit`) | Reply thread for a comment        |
| PATCH  | `/:id`          | `content`           | Edit own comment                 |
| DELETE | `/:id`          | —                   | Soft-delete own comment          |
| POST   | `/:id/like`     | —                   | Like / unlike comment            |

### Privacy module endpoints (base `http://localhost:5000/api/v1/privacy`)

**All require auth.**

| Method | Endpoint                 | Body                    | Purpose                                  |
|--------|--------------------------|-------------------------|------------------------------------------|
| POST   | `/block/:userId`         | —                       | Block a user (two-way cutoff, auto-unfollow, clears notifications/mutes) |
| DELETE | `/block/:userId`         | —                       | Unblock a user                           |
| GET    | `/blocked`               | — (query `page`, `limit`) | List blocked users (paginated)          |
| POST   | `/mute/:userId`          | `{ scope }`             | Mute a user — scope: `feed` \| `stories` \| `notifications` \| `all` |
| DELETE | `/mute/:userId`          | —                       | Unmute a user                            |
| GET    | `/muted`                 | — (query `page`, `limit`) | List muted users + scope (paginated)    |
| PATCH  | `/settings`              | `{ postsVisibleTo?, messages? }` | Update privacy settings           |

- `postsVisibleTo` enum: `public` \| `followers` \| `onlyme`; `messages` enum: `everyone` \| `followers` \| `nobody`.
- `GET /blocked` → `{ users: [UserView...], pagination }`; `GET /muted` → `{ users: [{ user: UserView, scope }], pagination }`.

### Security module endpoints (base `http://localhost:5000/api/v1/security`)

**All require auth except `POST /2fa/login`.**

| Method | Endpoint              | Body                    | Purpose                                        |
|--------|-----------------------|-------------------------|------------------------------------------------|
| POST   | `/2fa/setup`          | —                       | Generate TOTP secret + otpauth URL (not yet enabled) |
| POST   | `/2fa/enable`         | `{ code }`              | Verify 6-digit code & enable 2FA; returns one-time `backupCodes` |
| POST   | `/2fa/disable`        | `{ code }`              | Verify current code & disable 2FA             |
| POST   | `/2fa/login`          | `{ challenge, code }`   | Complete login step-2 (TOTP or one backup code) |
| GET    | `/sessions`           | —                       | List active signed-in sessions                |
| DELETE | `/sessions/:id`       | —                       | Revoke a session (log out that device)        |
| GET    | `/logs`               | — (query `page`, `limit`) | Security activity log (paginated)            |

- 2FA flow: `login` returns `{ requiresTwoFactor: true, challenge, twoFA: true }` when 2FA is enabled (no tokens yet) → UI shows a code screen → `POST /security/2fa/login` returns the normal token pair.
- `GET /sessions` → `{ sessions: [{ _id, device: {browser, os}, ip, createdAt, expiresAt }] }`; `GET /logs` → `{ logs: [{ action, ip, device, success, createdAt }], pagination }`.
- `action` enum: `login | login_failed | 2fa_setup | 2fa_enabled | 2fa_disabled | 2fa_login | password_changed | logout | session_revoked`.

> **Post JSON shape** from `GET /posts/:id` and `GET /posts`:
> `{ post: { _id, author: {_id, username, fullName, avatar, verified, bio, counts}, content, media: [{type: 'image'|'video', public_id, url, thumb}], tags, mentions, location, visibility, likesCount, commentsCount, sharesCount, views, isPinned, originalPost?, isLiked, isSaved, createdAt, updatedAt } }`
>
> Feed/explore/hashtag return `{ posts: [...] , pagination: { cursor, hasMore } }`; likes return `{ users: [...] , pagination }`; comments return `{ comments: [...] , pagination }`; trending returns `{ trending: [{ tag, count }] }`.

> Profile JSON shape from `GET /:username`:
> `{ user: { _id, username, fullName, avatar, coverPhoto, bio, verified, role, location, website, privacy, counts:{posts,stories,followers,following}, emailVerified, createdAt, isFollowing?, followsYou? }, viewerId, cache }`
>
> List endpoints return `{ followers | following | users | suggestions: [...] }` plus optional `pagination: { page, limit, total, pages }`.

---

## 2. Tech Stack

| Concern          | Technology                 | Why                             |
|------------------|----------------------------|---------------------------------|
| UI Library       | React 18                    | Component-based UI              |
| Build tool       | Vite                        | Fast dev server / HMR           |
| Styling          | Tailwind CSS v4 (or v3)     | Utility-first, design system    |
| State (server)   | RTK Query (`createApi`)     | Auto caching, refetch, tags     |
| State (client)   | Redux Toolkit `createSlice` | Tokens, user, UI state          |
| Routing          | React Router v6             | Auth-guarded routes             |
| HTTP layer       | RTK Query `fetchBaseQuery`  | Central baseURL + auth headers  |
| Forms            | React Hook Form             | Controlled forms + validation   |
| Validation       | Yup                        | Schema validation (mirrors Joi) |
| Toasts           | react-hot-toast             | OTP / success / error feedback  |

### Vite + Tailwind + Redux Toolkit setup commands

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom
npm install @reduxjs/toolkit react-redux
npm install react-hook-form yup react-hot-toast
npm install axios   # optional: RTK Query can also use fetchBaseQuery
```

---

## 3. Frontend Folder Structure (current scope)

```
frontend/
├── index.html
├── vite.config.js           # dev proxy → localhost:5000
├── tailwind.config.js        # theme: brand colors
├── postcss.config.js
├── src/
│   ├── main.jsx              # entry: Provider + Router + ToastProvider
│   ├── App.jsx               # route table
│   ├── index.css             # tailwind base/utilities
│   ├── store/
│   │   ├── index.js          # configureStore
│   │   └── slices/
│   │       └── authSlice.js  # tokens + user in memory/localStorage
│   ├── api/
│   │   ├── baseApi.js        # RTK Query createApi, fetchBaseQuery, auth header, 401 refresh
│   │   ├── authApi.js        # injected endpoints (register, login, ...)
│   │   ├── userApi.js        # injected endpoints (profile, follow, search, suggestions, upload)
│   │   ├── reactionApi.js    # injected endpoints (reactions) [step 5]
│   │   ├── pollApi.js        # injected endpoints (polls) [step 5]
│   │   ├── storyApi.js       # injected endpoints (stories) [step 6]
│   │   ├── reelApi.js        # injected endpoints (reels, shares) [step 7]
│   │   ├── notificationApi.js# injected endpoints (notifications, badge) [step 8]
│   │   ├── privacyApi.js     # injected endpoints (block/mute/settings) [step 8a]
│   │   └── securityApi.js    # injected endpoints (2FA, sessions, logs) [step 8a]
│   ├── hooks/
│   │   ├── useAuth.js        # useSelector/useDispatch helpers
│   │   └── useDocumentTitle.js
│   ├── routes/
│   │   ├── ProtectedRoute.jsx   # redirect to /login if no token
│   │   └── GuestRoute.jsx       # redirect to /feed if already logged in
│   ├── layouts/
│   │   ├── RootLayout.jsx       # top bar or sidebar shell (extended in step 3+)
│   │   └── AppLayout.jsx        # authed shell: sidebar + main (nav: Feed, Search, Profile) [step 3]
│   ├── pages/
│   │   ├── Landing.jsx          # public splash
│   │   ├── Register.jsx
│   │   ├── VerifyEmail.jsx
│   │   ├── Login.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── ChangePassword.jsx
│   │   ├── Profile.jsx          # public profile view (@username) [step 3]
│   │   ├── EditProfile.jsx      # edit profile + avatar/cover upload [step 3]
│   │   ├── FollowersList.jsx    # /u/:username/followers [step 3]
│   │   ├── FollowingList.jsx    # /u/:username/following [step 3]
│   │   ├── Search.jsx           # user search results [step 3]
│   │   ├── Suggestions.jsx      # who-to-follow list [step 3]
│   │   ├── Feed.jsx             # infinite-scroll feed (cursor pagination) [step 4]
│   │   ├── PostDetail.jsx       # single post + comment thread [step 4]
│   │   ├── Compose.jsx          # create post (text + media upload) [step 4]
│   │   ├── Explore.jsx          # popular posts grid [step 4]
│   │   ├── HashtagFeed.jsx      # /tag/:hashtag posts [step 4]
│   │   ├── SavedPosts.jsx       # saved/bookmarked posts [step 4]
│   │   ├── Notifications.jsx    # /notifications feed [step 8]
│   │   ├── PrivacySettings.jsx  # /privacy: visibility, message policy, blocked/muted lists [step 8a]
│   │   └── SecuritySettings.jsx # /security: 2FA, active sessions, activity log [step 8a]
│   ├── components/
│   │   ├── ui/                # Button, Input, Card, Spinner, OTPInput
│   │   ├── auth/              # AuthLayout (split-screen), AuthLogo
│   │   ├── user/              # [step 3] UserCard, FollowButton, AvatarUpload, CoverUpload, ProfileHeader, SuggestionsPanel
│   │   └── post/              # [step 4] PostCard, PostMedia, LikeButton, SaveButton, ShareButton, CommentSection, CommentItem, HashtagChip, TrendingPanel
│   └── constants/
│       └── api.js             # BASE_URL, endpooint paths
```

---

## 4. Redux / RTK Query Design (current scope)

### 4.1 `store/slices/authSlice.js`

Holds the **session** locally and mirrors the backend session model.

```js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  status: 'idle',        // idle | loading | authenticated | error
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      state.accessToken = payload.accessToken || state.accessToken;
      state.refreshToken = payload.refreshToken || state.refreshToken;
      if (payload.user) state.user = payload.user;
      if (payload.accessToken) localStorage.setItem('accessToken', payload.accessToken);
      if (payload.refreshToken) localStorage.setItem('refreshToken', payload.refreshToken);
      state.status = 'authenticated';
      state.error = null;
    },
    setUser: (state, { payload }) => { state.user = payload; },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.status = 'idle';
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, setUser, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
```

### 4.2 `api/baseApi.js` (RTK Query)

```js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants/api';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Auth', 'User', 'Profile', 'Followers', 'Following', 'Suggestions', 'Post', 'Feed', 'Explore', 'Hashtag', 'Saved'],   // extend per future step
  endpoints: () => ({}),
});
```

> **Runtime tag registry** (from `src/api/baseApi.js`) now includes the steps wired so far:
> `'Auth','User','Profile','Followers','Following','Suggestions','Post','Feed','Explore','Hashtag','Saved','Poll','Stories','Story','Reels','Reel','SharedReels','Notifications','NotificationCount','Blocked','Muted','Sessions','SecurityLogs'`

> **401 auto-refresh — implemented in `baseApi.js`:** `baseQueryWithReauth` wraps `fetchBaseQuery`. On a `401` it calls `/auth/refresh` with the stored refresh token, dispatches `setCredentials` with the rotated pair, and retries the original request. If refresh fails it dispatches `clearCredentials`. The refresh/logout calls themselves are excluded from the reauth loop. This replaces the earlier "add later" recommendation — the UI gets a transparent session refresh and only sees a logout after real auth failure.

### 4.3 `api/authApi.js` — endpoint→slice mapping

```js
import { baseApi } from './baseApi';
import { setCredentials, clearCredentials } from '../store/slices/authSlice';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      invalidatesTags: ['Auth'],
    }),
    verifyEmail: builder.mutation({
      query: (body) => ({ url: '/auth/verify-email', method: 'POST', body }),
    }),
    resendOtp: builder.mutation({
      query: (body) => ({ url: '/auth/resend-otp', method: 'POST', body }),
    }),
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data.data));  // tokens + user
        } catch { /* handled by component toast */ }
      },
    }),
    refresh: builder.mutation({
      query: (body) => ({ url: '/auth/refresh', method: 'POST', body }),
    }),
    logout: builder.mutation({
      query: (refreshToken) => ({ url: '/auth/logout', method: 'POST', body: { refreshToken } }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearCredentials());
        } catch { /* still clear locally */ }
      },
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
    changePassword: builder.mutation({
      query: (body) => ({ url: '/auth/change-password', method: 'PUT', body }),
    }),
    getMe: builder.query({
      query: () => ({ url: '/auth/me', method: 'GET' }),
      providesTags: ['Auth'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendOtpMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetMeQuery,
} = authApi;
```

### 4.4 `api/userApi.js` — user module endpoints

```js
import { baseApi } from './baseApi';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: (username) => ({ url: `/users/${username}`, method: 'GET' }),
      providesTags: (result, _err, username) => [{ type: 'Profile', id: username }],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: '/users/profile', method: 'PATCH', body }),
      invalidatesTags: (result) => [
        { type: 'Profile', id: result?.data?.user?.username },
        { type: 'Auth' }, // /auth/me cache
      ],
    }),
    uploadAvatar: builder.mutation({
      query: (formData) => ({ url: '/users/avatar', method: 'POST', body: formData }),
      invalidatesTags: (result) => [
        { type: 'Profile', id: result?.data?.user?.username },
        { type: 'Auth' },
      ],
    }),
    uploadCover: builder.mutation({
      query: (formData) => ({ url: '/users/cover', method: 'POST', body: formData }),
      invalidatesTags: (result) => [
        { type: 'Profile', id: result?.data?.user?.username },
        { type: 'Auth' },
      ],
    }),
    followUser: builder.mutation({
      query: (username) => ({ url: `/users/${username}/follow`, method: 'POST' }),
      invalidatesTags: (result, _err, username) => [
        { type: 'Profile', id: username },
        { type: 'Followers' },
        { type: 'Following' },
        { type: 'Suggestions' },
      ],
    }),
    unfollowUser: builder.mutation({
      query: (username) => ({ url: `/users/${username}/follow`, method: 'DELETE' }),
      invalidatesTags: (result, _err, username) => [
        { type: 'Profile', id: username },
        { type: 'Followers' },
        { type: 'Following' },
        { type: 'Suggestions' },
      ],
    }),
    getFollowers: builder.query({
      query: ({ username, page = 1, limit = 20 }) =>
        ({ url: `/users/${username}/followers`, method: 'GET', params: { page, limit } }),
      providesTags: ['Followers'],
    }),
    getFollowing: builder.query({
      query: ({ username, page = 1, limit = 20 }) =>
        ({ url: `/users/${username}/following`, method: 'GET', params: { page, limit } }),
      providesTags: ['Following'],
    }),
    searchUsers: builder.query({
      query: ({ q, page = 1, limit = 10 }) =>
        ({ url: '/users/search', method: 'GET', params: { q, page, limit } }),
    }),
    getSuggestions: builder.query({
      query: (limit = 10) => ({ url: '/users/suggestions', method: 'GET', params: { limit } }),
      providesTags: ['Suggestions'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useUploadCoverMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useSearchUsersQuery,
  useGetSuggestionsQuery,
} = userApi;
```

> **Multipart uploads with RTK Query:** build a `FormData` and pass it as `body`. Do **not** set a `Content-Type` header manually — `fetchBaseQuery` lets the browser set the multipart boundary automatically.
>
> **Follow toggle pattern:** a `FollowButton` reads `isFollowing` from the cached profile and calls `followUser`/`unfollowUser`; RTK Query auto-refreshes the profile + lists via the tags above, so no local `following` state slice is needed.

### 4.5 `api/postApi.js` + `api/commentApi.js` — posts & comments endpoints

Both are `baseApi.injectEndpoints(...)`. Use **cursor pagination**: keep the last post's `_id` as the next `cursor`, stop when `hasMore` is false.

```js
import { baseApi } from './baseApi';

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeed: builder.query({
      query: ({ cursor, limit = 20 } = {}) => ({ url: '/posts', method: 'GET', params: { cursor: cursor || undefined, limit } }),
      providesTags: ['Feed'],
    }),
    getExplore: builder.query({
      query: ({ cursor, limit = 20 } = {}) => ({ url: '/posts/explore', method: 'GET', params: { cursor: cursor || undefined, limit } }),
      providesTags: ['Explore'],
    }),
    getPost: builder.query({
      query: (id) => ({ url: `/posts/${id}`, method: 'GET' }),
      providesTags: (result, _err, id) => [{ type: 'Post', id }],
      // returns { post } — read res.data.post
    }),
    getPostsByTag: builder.query({
      query: ({ hashtag, cursor, limit = 20 }) => ({ url: `/posts/tag/${hashtag}`, method: 'GET', params: { cursor: cursor || undefined, limit } }),
      providesTags: ['Hashtag'],
    }),
    getTrending: builder.query({
      query: () => ({ url: '/posts/trending', method: 'GET' }),
      providesTags: ['Hashtag'],
    }),
    createPost: builder.mutation({
      // body = FormData (content, media[] files …), multipart boundary auto-set
      query: (formData) => ({ url: '/posts', method: 'POST', body: formData }),
      invalidatesTags: ['Post', 'Feed', 'Explore', 'Hashtag', 'Profile'],
    }),
    updatePost: builder.mutation({
      query: ({ id, body }) => ({ url: `/posts/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Post', 'Feed', 'Explore', 'Hashtag'],
    }),
    deletePost: builder.mutation({
      query: (id) => ({ url: `/posts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Post', 'Feed', 'Explore', 'Hashtag', 'Profile'],
    }),
    likePost: builder.mutation({
      query: (id) => ({ url: `/posts/${id}/like`, method: 'POST' }),
      invalidatesTags: ['Post'],
    }),
    savePost: builder.mutation({
      query: (id) => ({ url: `/posts/${id}/save`, method: 'POST' }),
      invalidatesTags: ['Post', 'Saved'],
    }),
    getPostLikes: builder.query({
      query: ({ id, cursor, limit = 20 }) => ({ url: `/posts/${id}/likes`, method: 'GET', params: { cursor: cursor || undefined, limit } }),
    }),
  }),
});

export const postApiEndpoints = postApi.endpoints; // optional namespace for tree-shaking
```

> **Comment tag pattern:** a `Post` comment query keyed by post id keeps like/save/comment states coherent:

```js
import { baseApi } from './baseApi';

export const commentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPostComments: builder.query({
      query: ({ postId, cursor, limit = 20 } = {}) => ({ url: `/posts/${postId}/comments`, method: 'GET', params: { cursor: cursor || undefined, limit } }),
      providesTags: (result, _err, arg) => [{ type: 'Post', id: arg.postId }],
    }),
    addComment: builder.mutation({
      query: (body) => ({ url: '/comments', method: 'POST', body }), // { post, parent?, content }
      invalidatesTags: (result, _err, arg) => [{ type: 'Post', id: arg.post }],
    }),
    getCommentReplies: builder.query({
      query: ({ id, cursor, limit = 20 }) => ({ url: `/comments/${id}/replies`, method: 'GET', params: { cursor: cursor || undefined, limit } }),
    }),
    updateComment: builder.mutation({
      query: ({ id, body }) => ({ url: `/comments/${id}`, method: 'PATCH', body }),
      invalidatesTags: (result, _err, arg) => [{ type: 'Post', id: result?.data?.comment?.post }],
    }),
    deleteComment: builder.mutation({
      query: (id) => ({ url: `/comments/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Post'],
    }),
    likeComment: builder.mutation({
      query: (id) => ({ url: `/comments/${id}/like`, method: 'POST' }),
    }),
  }),
});
```

> **Cursor-pagination pattern for feeds:** the query result exposes `pagination.cursor`. On "load more", fetch the next page with that cursor and **merge** into the existing list (append), rather than refetching from scratch, so scrolling is smooth and cache-friendly.

---

## 5. Response Shape (contract with backend)

The backend always wraps responses — the UI must read `data.data`.

```
Success:
{ "success": true, "message": "...", "data": { ... } , "pagination": {...}? }

Error:
{ "success": false, "message": "...", "errors": [{ "field": "...", "message": "..." }] }
```

RTK Query uses HTTP status for success/error, so components map:
- success → read `res.data.data`
- error → read `err.data.message` (+ `err.data.errors` for field hints)

---

## 6. Route Table (current scope)

| Path                     | Component         | Guard        | Backend call triggered             |
|--------------------------|-------------------|--------------|------------------------------------|
| `/`                      | Landing           | Guest        | —                                  |
| `/register`              | Register          | Guest        | `auth/register`                    |
| `/verify-email`          | VerifyEmail       | Guest        | `auth/verify-email`, `resend-otp`  |
| `/login`                 | Login             | Guest        | `auth/login`                       |
| `/forgot-password`       | ForgotPassword    | Guest        | `auth/forgot-password`             |
| `/reset-password`        | ResetPassword     | Guest        | `auth/reset-password`              |
| `/change-password`       | ChangePassword    | Protected    | `auth/change-password`             |
| `/account`               | Profile (stub)    | Protected    | `auth/me`                          |
| `/u/:username`           | Profile           | Public       | `users/:username` [step 3]         |
| `/u/:username/edit`      | EditProfile       | Protected    | `users/:username`, `users/profile`, `users/avatar`, `users/cover` [step 3] |
| `/u/:username/followers` | FollowersList     | Public       | `users/:username/followers` [step 3] |
| `/u/:username/following` | FollowingList     | Public       | `users/:username/following` [step 3] |
| `/search?q=`             | Search            | Protected    | `users/search` [step 3]            |
| `/suggestions`           | Suggestions       | Protected    | `users/suggestions` [step 3]       |
| `/feed`                  | Feed              | Protected    | `posts`, `posts/:id/comments` [step 4] |
| `/post/:id`              | PostDetail        | Protected    | `posts/:id`, `posts/:id/comments`, `posts/:id/likes` [step 4] |
| `/compose`               | Compose           | Protected    | `posts` (multipart media) [step 4] |
| `/explore`               | Explore           | Protected    | `posts/explore` [step 4]           |
| `/tag/:hashtag`          | HashtagFeed       | Protected    | `posts/tag/:hashtag` [step 4]      |
| `/saved`                 | SavedPosts        | Protected    | `posts/:id/save`, `posts/explore` [step 4] |
| `/reels`                 | Reels             | Protected    | `reels`, `reels/:id` [step 7]             |
| `/reels/shared`          | SharedReels       | Protected    | `reels/shared-with-me` [step 7]           |
| `/notifications`         | Notifications     | Protected    | `notifications`, `notifications/unread-count` [step 8] |
| `/privacy`               | PrivacySettings   | Protected    | `privacy/settings`, `privacy/blocked`, `privacy/muted` [step 8a] |
| `/security`              | SecuritySettings  | Protected    | `security/2fa/*`, `security/sessions`, `security/logs` [step 8a] |

> `/u/:username/edit` renders the edit form **only when** the authed user owns the profile (`auth.user.username === :username`); otherwise redirect to the public profile page.

### Guard logic

```jsx
// ProtectedRoute.jsx
const token = useSelector((s) => s.auth.accessToken);
return token ? <Outlet /> : <Navigate to="/login" replace />;

// GuestRoute.jsx
const token = useSelector((s) => s.auth.accessToken);
return token ? <Navigate to="/account" replace /> : <Outlet />;
```

---

## 7. Auth Flow Wiring (how pages call APIs)

### 7.1 Register → VerifyEmail (OTP)

1. `Register` submits → `useRegisterMutation()`.
2. On success, backend emails OTP (dev: check backend console). Show OTP screen.
3. `VerifyEmail` calls `useVerifyEmailMutation()` with `{ email, otp }`.
4. On success → navigate to `/login`.

> If OTP expired → `useResendOtpMutation()` re-sends.

### 7.2 Login → tokens → protected access

1. `Login` calls `useLoginMutation()`.
2. `onQueryStarted` dispatches `setCredentials({ accessToken, refreshToken, user })` → tokens stored in localStorage + Redux.
3. Router re-renders; `ProtectedRoute` allows entry.
4. `getMe` query used on app load to rehydrate fresh profile (optional).

### 7.3 Refresh token (session persistence)

- Access token is short-lived (`1h`). Before it expires, UI calls `auth/refresh` with the stored refresh token → gets rotated pair → `setCredentials`.
- Recommended: attach a silent refresh timer OR `baseQueryWithReauth` on 401.

### 7.4 Logout

- `Logout` button calls `useLogoutMutation()` → backend revokes session → `clearCredentials()` wipes local state + redirects to `/login`.

### 7.5 Password flows

- **Forgot** → OTP by email → **Reset** (`email + otp + newPassword`) → toast → login.
- **Change** (protected) → `currentPassword + newPassword` → backend revokes all sessions → user must re-login.

### 7.6 User module flows (Step 3)

#### Profile view (`/u/:username`)

1. `useGetProfileQuery(username)` → renders `ProfileHeader` (avatar, cover, bio, counts).
2. If `auth.user.username === :username` → show **Edit profile** button → `/u/:username/edit`.
3. Otherwise show `FollowButton`:
   - `isFollowing` true → `unfollowUser` → toast "Unfollowed".
   - `isFollowing` false → `followUser` → toast "Following".
4. Link to followers/following counts → lists pages.

#### Edit profile (`/u/:username/edit`)

1. Form pre-filled from profile query (`fullName`, `bio`, `gender`, `dob`, `location`, `website`, `privacy`).
2. Submit → `updateProfile` → success toast → navigate back to `/u/:username`.
3. **Avatar/cover upload:** hidden file inputs → `uploadAvatar` / `uploadCover` (FormData, field name `image`) → optimistic preview via `URL.createObjectURL(file)` before mutation resolves.

#### Followers / Following lists

- `useGetFollowersQuery({ username, page })` / `useGetFollowingQuery(...)`.
- Render `UserCard` list with `FollowButton` on each (authed users can follow/unfollow from lists).
- Infinite scroll or "Load more" using the `pagination` object returned by the API.

#### Search (`/search?q=`)

1. Search box updates `?q=` (debounced, ~300ms).
2. `useSearchUsersQuery({ q, page })` → results as `UserCard`s.
3. Empty query → show suggestions (`useGetSuggestionsQuery`) or recent searches placeholder.

#### Suggestions (`/suggestions`)

- `useGetSuggestionsQuery(10)` → grid of `UserCard` + `FollowButton`.
- Following someone removes them from the list (RTK Query `Suggestions` tag invalidation).

### 7.7 Posts module flows (Step 4 — backend done, UI pending)

#### Feed (`/feed`)

1. `useGetFeedQuery({ cursor })` → renders `PostCard` list (cursor pagination).
2. "Load more": append `pagination.cursor` → merge results into the list.
3. Like/save buttons mutate via `likePost`/`savePost` → `Post` tags invalidate → card reflects `isLiked`/`isSaved`.

#### Create post (`/compose`)

1. Text area + optional media file inputs.
2. On submit build a `FormData`: `content`, `visibility` (default `public`), `location` (optional), `media[]` files.
3. `useCreatePostMutation(formData)` → invalidates `Feed`/`Explore`/`Hashtag`/`Profile` → toast → navigate to `/feed`.

#### Single post (`/post/:id`)

- `useGetPostQuery(id)` + `useGetPostCommentsQuery({ postId: id })` → `PostDetail`.
- `addComment` (top-level) or with `parent` (reply) → invalidates that `Post` tag so `commentsCount` + thread refresh.

#### Explore / Hashtag

- `useGetExploreQuery` / `useGetPostsByTagQuery({ hashtag })` — same cursor-pagination + merge pattern as feed.
- `useGetTrendingQuery` renders hashtag chips in a `TrendingPanel`; clicking navigates to `/tag/:hashtag`.

---

## 8. Vite dev proxy (avoid CORS issues)

`vite.config.js`

```js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

Set `BASE_URL = '/api/v1'` in `src/constants/api.js` when using the proxy (or the full `http://localhost:5000/api/v1` if not).

---

## 9. Tailwind theme tokens (shared design system)

`tailwind.config.js` (v3 style)

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#eef2ff', 500:'#6366f1', 600:'#4f46e5', 700:'#4338ca' },
        surface: '#ffffff',
        ink: '#0f172a',
      },
      borderRadius: { xl: '1rem', '2xl': '1.25rem' },
    },
  },
  plugins: [],
};
```

Reusable UI components: `Button`, `Input` (label + error), `Spinner`, `OTPInput`, `Toast` via react-hot-toast.

---

## 10. Environment / Run

```
# Terminal A — backend
cd backend && npm run dev         # http://localhost:5000

# Terminal B — frontend
cd frontend && npm run dev        # http://localhost:5173
```

---

## 11. Acceptance Checklist (Step 1 + 2 UI)

- [ ] App boots, Vite proxy → `/api/v1/health` shows green dot on Landing
- [ ] Register creates user; success toast; redirect to `/verify-email`
- [ ] OTP screen: paste 6 digits → verify → redirect to `/login` (resend works)
- [ ] Login stores tokens via Redux + localStorage; redirect to `/account`
- [ ] `/account` shows profile from `auth/me` (real user name/email/avatar)
- [ ] Refresh keeps session alive (test by editing `JWT_EXPIRES_IN=... `)
- [ ] Logout clears store + localStorage → back to `/login`
- [ ] Forgot → Reset password flow works end-to-end
- [ ] Change password revokes sessions (must re-login)
- [ ] Protected routes redirect unauthenticated users to `/login`

### Acceptance Checklist (Step 3 UI — User module)

- [ ] `GET /users/:username` renders public profile (avatar, cover, bio, counts) at `/u/:username`
- [ ] Own profile shows **Edit profile** button; others show `FollowButton` reflecting `isFollowing`
- [ ] Follow / Unfollow toggles instantly; counts update on profile + follower/following lists
- [ ] `/u/:username/edit` saves fullName/bio/gender/dob/location/website/privacy → toast → back to profile
- [ ] Avatar + cover upload works (multipart `image`, ≤5MB, image-only), Cloudinary URL persisted
- [ ] `/u/:username/followers` and `/following` paginate correctly
- [ ] `/search?q=` returns matching users with debounce; empty → suggestions
- [ ] `/suggestions` excludes self + already-followed; following removes the card live
- [ ] Profile cache invalidation verified: editing profile reflects on next reload (`cache=hit` after first load)

### Acceptance Checklist (Step 4 UI — Posts & Comments module)

- [ ] `/feed` renders own + following posts (`GET /posts`) with cursor `pagination`
- [ ] Load more appends next page without duplicate posts (`hasMore` respected)
- [ ] `/compose` uploads text + media (`media[]`, image/video ≤50MB) → Cloudinary URLs returned
- [ ] Hashtags in content auto-link to `/tag/:hashtag`; `GET /posts/tag/:hashtag` shows matching posts
- [ ] `/explore` shows popular public posts; `/posts/trending` shows trending chips
- [ ] Like/unlike toggles `likesCount` + `isLiked` live; count reflects on `GET /posts/:id/likes`
- [ ] Save/unsave toggles `isSaved`; saved posts accessible
- [ ] Repost (`POST /posts/:id/share`) increments `sharesCount` and appears in feed with `originalPost`
- [ ] Comments: add top-level + reply (`parent`), edit own, delete own (soft), like/unlike
- [ ] Visibility (public/followers/onlyme) enforced — `onlyme` posts hidden from other viewers
- [ ] Public profile `counts.posts` updates after create/delete

---

### Integration: Step 5 — Reactions & Polls

New RTK API slices (`src/api/reactionApi.js`, `src/api/pollApi.js`) added via `injectEndpoints` on `baseApi`. Tag types: `Post` (existing), `Poll` (new). Reactions on posts/comments invalidate the owning post's `{ type: 'Post', id }` tag so the feed/detail stays in sync.

- `useReactMutation` → `POST /reactions` `{ targetType: 'post'|'comment', targetId, emoji }`; passing `postId` in the arg scopes tag invalidation to that post. Same emoji again removes the reaction (toggle); a different emoji updates it.
- `useRemoveReactionMutation` → `DELETE /reactions/:id`
- `useGetReactionSummaryQuery` → `GET /reactions/summary?targetType=&targetId=` (emoji breakdown + `myReaction`)
- `useVotePollMutation` → `POST /polls/:id/vote` `{ optionId }`; one vote per user (backend `voters` guard)
- `useGetPollResultsQuery` → `GET /polls/:id/results`
- `useCreatePollMutation` → `POST /polls/create` `{ post, question, options: [text...] (2–5), expiresAt? }` (author-only)

Components:
- `src/components/post/ReactionBar.jsx` — compact emoji row (👍❤️😆😮😢😡) with hover picker; optimistic count/my-reaction updates; `post.reactions.summary`/`total`/`myReaction` populated by the backend `decoratePosts`.
- `src/components/post/CommentReaction.jsx` — lightweight emoji toggle on each comment.
- `src/components/post/PollCard.jsx` — embedded poll with live percentage bars; results shown once voted or expired; shows total votes + ends-in label.

Post payload additions (backend): `reactions: { total, summary: [{emoji,count}], myReaction }` and `poll` view (`question`, `options[{id,text,votes}]`, `totalVotes`, `hasVoted`, `myOptionId`, `isExpired`) on every post response.

### Acceptance Checklist (Step 5 UI — Reactions & Polls module)

- [ ] Reacting on a post shows the emoji picker; total + chosen emoji update optimistically
- [ ] Tapping the same emoji again removes the reaction; a different emoji replaces it
- [ ] Reaction summary (`/reactions/summary`) matches the feed counts after refresh
- [ ] Comments can be reacted to with the small emoji toggle; no double-count on the owning post
- [ ] Post with a poll shows options; voting records once (`hasVoted` true, further clicks disabled)
- [ ] Voted/expired polls render percentage bars + total votes; never double-vote
- [ ] `POST /polls/create` attaches a poll to own post; other users cannot add polls to your post
- [ ] `Poll` tag invalidation keeps poll results fresh on the post detail page

### Step 6 — Stories module

API module: `src/api/storyApi.js` (extends `baseApi`; `tagTypes`, items 13–14). All story endpoints are protected (`Bearer` token).

```js
useGetActiveStoriesQuery()      // GET /stories          → feed query
useGetStoryQuery(id, opts)      // GET /stories/:id      → Story tag (registers a view via $addToSet + $inc)
useCreateStoryMutation()        // POST /stories         FormData: text, bgColor, media (optional)
useDeleteStoryMutation()        // DELETE /stories/:id   own story only
useGetStoryViewersQuery(id, {cursor, limit}) // GET /stories/:id/viewers  author-only
```

Cache/invalidation: `getActiveStories` provides `['Stories']`; `getStory` provides `{type:'Story', id}`; `createStory`/`deleteStory` invalidate `['Stories','Profile']` so the ring + profile story counts stay in sync.

Components:
- `src/components/stories/StoriesRing.jsx` — horizontal scrolling ring; gradient border on each avatar; a leading dashed-border "Your story" button (calls the passed `ownStoryHandler`) when provided; tapping a ring item opens `StoryViewer`. Empty state: "No stories right now…".
- `src/components/stories/StoryViewer.jsx` — fullscreen modal. Auto-advances every 5s via rAF-driven progress; progress bars per story (tap any bar to jump); ←/→ and Esc keys; pause button; view count (`getStory.data.data.story.viewCount ?? story.viewCount ?? 0`); own stories get a "views" button that opens a viewer-listing panel (`useGetStoryViewersQuery`, linked profiles) and a Delete action (confirm dialog). Renders video autoplay-loop, image, or text on `bgColor`. Opening a story calls `useGetStoryQuery` to register the view.
- `src/components/stories/StoryComposer.jsx` — modal to publish a story: text (≤500) on a chosen `bgColor` or a photo/video picker (replaces text when media chosen); submits `FormData` via `useCreateStoryMutation`; success toast.

Story response shapes (backend): `POST /stories` → `{ story }`; `GET /stories` → `{ authors: [{ user, stories: [...] }] }` with `pagination`; `GET /stories/:id` → `{ story, viewedByViewer }`; `GET /stories/:id/viewers` → `{ viewers: [...], pagination }`. Story object: `{ _id, author, media: [{url, mediaType, thumb}], bgColor, text, mentions, tags, viewCount, isActive, expiresAt, createdAt }`.

Backend notes: stories auto-expire 24h after creation via TTL index on `expiresAt` (`expireAfterSeconds: 0`); `GET /stories` only returns active, unexpired stories from followed users + self; views only count distinct viewers (`$addToSet` on `viewers`, `$inc` on `viewCount`); delete is soft (`isActive: false`) and decrements the author stats counter.

### Acceptance Checklist (Step 6 UI — Stories module)

- [x] Ring shows stories from followed users + the user's own; empty state when none
- [x] Clicking a ring item opens the viewer with progress bars that auto-advance every 5s
- [x] Video stories autoplay; image stories display; text stories render on the chosen background color
- [x] Each open registers a view; the view counter increments and the viewers list works on own stories only (403 for others' stories, 404 if missing/expired)
- [x] ← / → / Esc navigation and pause work; stories expire server-side 24h after creation (TTL index) and drop out of the ring
- [x] "+ Your story" opens the composer; text and media both publish; new story appears in the ring
- [x] Deleting a story removes it from the ring for everyone; `Stories`/`Profile` tags keep counts fresh

### Step 7 — Reels module (frontend integration plan)

Backend (Step 7) is complete and mounted at `/api/v1/reels`. The design is in `BACKEND-DESIGN.md` (Reel model, lines 252–274; REELS/SHORTS endpoints, lines 679–688). This plan mirrors the posts/stories conventions: a `reelApi.js` injected into `baseApi`, tag invalidation, and components under `frontend/src/components/reel/`.

#### API module — `src/api/reelApi.js`

```js
useGetReelsQuery({ cursor, limit })            // GET /reels            → 'Reels'
useGetReelQuery(id)                            // GET /reels/:id        → {type:'Reel', id}
useCreateReelMutation()                        // POST /reels           FormData: video, caption, audioName, audioArtist
useDeleteReelMutation()                        // DELETE /reels/:id     owner only
useLikeReelMutation()                          // POST /reels/:id/like  toggle (Reaction 'like' emoji)
useShareReelMutation()                         // POST /reels/:id/share share/repost count
usePlayReelMutation()                          // POST /reels/:id/play  record a play
useGetReelCommentsQuery({ id, cursor, limit }) // GET /reels/:id/comments
useAddReelCommentMutation()                    // POST /reels/:id/comments {content, parent?}
```

- Tag strategy: add `'Reels'`, `'Reel'` to `baseApi.tagTypes`. `getReels` provides `['Reels']`; `getReel` provides `{type:'Reel', id}`; `likeReel`/`shareReel`/`playReel` invalidate the single `{type:'Reel', id}`; `createReel`/`deleteReel` invalidate `['Reels','Profile']`; reel comments invalidate `{type:'Reel', id}` (so `commentsCount` stays fresh).
- Multicomponent feed: use `useGetReelsQuery` on the Reels page (vertical pager). The scroll "infinite" pattern should **not** be the infinite-scroll list used for posts — reels render one-at-a-time with infinite paging via `pagination.cursor`.

#### Backend contracts the UI must honor

- `GET /reels` → `{ reels: [ReelView...], pagination: { cursor, hasMore } }`. `cursor` is a **composite string `"<score>::<reelId>"`** (NOT a bare ObjectId) — pass it straight back to keep "algorithmic ranking" (engagement-weighted) order. ReelView: `{ _id, author{...}, video: {url, thumbnail}, caption, audio?... , tags, mentions, likesCount, commentsCount, sharesCount, views, plays, durationSec, isLiked, createdAt }`.
- `POST /reels` → `{ reel }` (201). Requires `video` file (multipart) — the composer must always attach a file; server enforces video-only and ≤90s (rejects with 400 if longer). Duration is detected server-side from Cloudinary; the client does not need to send it.
- `GET /reels/:id` → `{ reel }`, increments `views`. Call it when a reel becomes the active/focused item (do NOT increment on every autoplay scroll pass — the play counter is separate).
- `POST /reels/:id/play` → `{ plays }`. Fire once when a reel's video actually starts playing (autoplay intent), guarded so it isn't spammed on scroll.
- `POST /reels/:id/like` → `{ liked, likesCount }` (toggle, optimistic). Server writes a `like` emoji `Reaction` on the reel; the same `Reaction` doc backs `/reactions/summary?targetType=reel&targetId=...`, so the emoji breakdown for reels works through the existing Reaction UI patterns.
- `GET /reels/:id/comments` → `{ comments:[{ ...author, repliesCount }], pagination }`; `POST /reels/:id/comments` accepts `{ content, parent? }`. Reel comments live in the same `Comment` model via `targetType:'reel'` — shape identical to post comments, so reuse the comment UI components (CommentList / CommentComposer) with the reel's `_id` as the target.
- `DELETE /reels/:id` → owner-only (403 otherwise) — show Delete only when `useAuth().user._id` matches `reel.author._id`.

#### Components (under `src/components/reel/`)

- `ReelsPage.jsx` (`src/pages/Reels.jsx`, route `/reels` in `RootLayout` nav) — full-height vertical pager: one `ReelPlayer` fills the viewport, swipe/scroll up-down advances using `pagination.hasMore` + `pagination.cursor`. Keep mounted player reels only (index ±1) for performance; call `useGetReelQuery` for the focused reel (view counted) and `usePlayReelMutation` when its video `onPlay` fires.
- `ReelPlayer.jsx` — 9:16 video (`autoPlay`, `loop`, `playsInline`, `muted` toggle), `poster={video.thumbnail}`, caption overlay, author row, right rail with Like / Share / Comment buttons + live counters (`isLiked`, `likesCount`), a plays badge, and a Delete action for own reels. Right-rail counts update optimistically from the mutation response then settle via tag refetch.
- `ReelComposer.jsx` — `FormData` upload (file picker `accept="video/*"`), caption ≤2200, optional audio name/artist; mirrors `StoryComposer` modal pattern; on success close + invalidate (`['Reels']`).
- `ReelCommentSheet.jsx` — bottom sheet listing reel comments (reuse post comment components) + add comment box; invalidates the focused `{type:'Reel', id}`.

#### Wiring

- Add `Reels` route to `RootLayout` nav (icon + `/reels`) and a `Link` on the Home feed (Next to StoriesRing) if desired.
- `baseApi.tagTypes` gains `'Reels', 'Reel'` (keeps the tag registry + list in sync).
- Follow the existing no-setState-in-effect, RTK Query optimistic conventions used by `postApi`/`commentApi`.

### Acceptance Checklist (Step 7 UI — Reels module)

- [x] `/reels` route in nav opens a full-screen vertical reel player; first reel autoplays with sound-off toggle
- [x] Feed ordering follows the server `cursor` exactly (algorithmic ranking maintained across pages); load-more prepends/continues on scroll
- [x] Caption + author row render on the video with a 9:16 thumbnail poster while it buffers
- [x] Like toggles instantly (optimistic) and settles to `likesCount` + `isLiked` from the server; reactions summary for the reel matches
- [x] Share increments `sharesCount` on the focused reel only (no double-fire on scroll)
- [x] Views increment once per focused reel; plays record on the first real `onPlay` only
- [x] Comments open a sheet with post-style comments + replies; new comments increment `commentsCount` on the active reel
- [x] Create flow reports a specific error when the server rejects an oversize/non-video/`>90s` file; successful upload appears in the feed
- [x] Own reels show Delete and remove the reel everywhere after confirm
- [x] `Reels`/`Reel`/`Profile` tags keep the page, like counts, and profile counts consistent after mutations

#### Share-to-contacts (Instagram-style, added after checklist)

Verified working: tapping Share opens `ReelShareSheet` (searchable contact list = people you follow), multi-select, "Send to N"; `POST /reels/:id/share` accepts `{ recipients }`, records per-recipient `Share` docs (deduped), bumps `sharesCount` by new recipients, and notifies each recipient. Recipients see the reel in the `/reels/shared` inbox (`SharedReels.jsx`, nav "Shared") with a "shared this" badge and can like/comment/re-share onward.

### Step 8 — Notifications module (frontend integration plan)

Backend (Step 8) is complete and mounted at `/api/v1/notifications`. The design is in `BACKEND-DESIGN.md` (Notification model, lines 379–393; NOTIFICATIONS endpoints, lines 690–696). Backend event wiring emits notifications automatically on: follow, post like/comment/share/mention, reel like/comment/share/mention, story mention.

#### API module — `src/api/notificationApi.js`

```js
useGetNotificationsQuery({ cursor, limit })      // GET /notifications          → 'Notifications'
useGetUnreadCountQuery()                         // GET /notifications/unread-count → 'NotificationCount'
useMarkAllReadMutation()                         // PUT /notifications/read
useMarkOneReadMutation(id)                       // PUT /notifications/:id/read
```

- Tag strategy: `getNotifications` provides `'Notifications'`; `getUnreadCount` provides `'NotificationCount'` (polled ~30s via `pollingInterval`); both `markAllRead`/`markOneRead` invalidate `['Notifications','NotificationCount']` so the badge and list stay in sync.
- Add `'Notifications', 'NotificationCount'` to `baseApi.tagTypes`.

#### Backend contracts the UI must honor

- `GET /notifications` → `{ notifications: [{ _id, type, actor{username,fullName,avatar,verified,counts}, targetType, targetId, message, read, seenAt, createdAt }], pagination: { cursor, hasMore } }`. Cursor is a bare ObjectId — pass it straight back.
- `type` enum: `like | reaction | comment | follow | mention | share | message | story_reply | report_resolved | admin_notice | broadcast`. `targetType` enum: `post | reel | story | comment`; `targetId` points at the item via `targetModel`.
- `PUT /notifications/read` marks all read; `PUT /notifications/:id/read` marks one (404 if not owned by viewer).

#### Components

- `src/components/notifications/NotificationBell.jsx` — bell icon in `RootLayout` nav; red badge shows unread count (99+ cap), polls every 30s; links to `/notifications`.
- `src/pages/Notifications.jsx` (route `/notifications`, protected) — paginated feed of notification cards: actor avatar, verb text built from `type`/`targetType`, unread dot + highlight, relative time. Clicking a card marks it read (`markOneRead`) and deep-links (`/post/:id`, `/reels`, profile). Header "Mark all read" button when any unread. Load-more via `pagination.cursor` + RTK `merge`.

### Acceptance Checklist (Step 8 UI — Notifications module)

- [ ] `/notifications` route in nav (bell icon) shows the paginated notification feed; unread badge shows live count (polled)
- [ ] Following a user sends a `follow` notification to that user with an avatar + verb row
- [ ] Liking/commenting a post or reel notifies the author; sharing a reel notifies each recipient; mentions notify the mentioned users
- [ ] Each card's unread dot/highlight clears when clicked and the badge count decrements after `markOneRead`
- [ ] "Mark all read" clears the whole list and zeroes the badge
- [ ] Cards deep-link correctly (post → `/post/:id`, reel → `/reels`, actor → profile)
- [ ] `Notifications`/`NotificationCount` tags keep the list and badge consistent after mutations

### Step 8a — Privacy & Security module (frontend integration plan)

Backend (Step 8a) is complete and mounted at `/api/v1/privacy` and `/api/v1/security`. The design is in `BACKEND-DESIGN.md` (Block/Mute models, lines 303–322; Session, lines 324–337; SecurityLog, lines 339–351; PRIVACY + SECURITY endpoints, lines 713–733). Privacy content (block/mute/settings) plus security measures (2FA, sessions, activity log) were integrated together into the frontend as part of the Step 8 rollout.

#### API modules

**`src/api/privacyApi.js`**

```js
useGetBlockedQuery({ page, limit })              // GET /privacy/blocked     → 'Blocked'
useBlockUserMutation(userId)                     // POST /privacy/block/:userId
useUnblockUserMutation(userId)                   // DELETE /privacy/block/:userId
useGetMutedQuery({ page, limit })                // GET /privacy/muted       → 'Muted'
useMuteUserMutation({ userId, scope })           // POST /privacy/mute/:userId
useUnmuteUserMutation(userId)                    // DELETE /privacy/mute/:userId
useUpdatePrivacySettingsMutation(body)           // PATCH /privacy/settings
```

**`src/api/securityApi.js`**

```js
useSetup2FAMutation()                            // POST /security/2fa/setup
useEnable2FAMutation(code)                       // POST /security/2fa/enable { code }
useDisable2FAMutation(code)                      // POST /security/2fa/disable { code }
useLogin2FAMutation({ challenge, code })         // POST /security/2fa/login
useGetSessionsQuery()                            // GET /security/sessions   → 'Sessions'
useRevokeSessionMutation(id)                     // DELETE /security/sessions/:id
useGetSecurityLogsQuery({ page, limit })         // GET /security/logs       → 'SecurityLogs'
```

- Tag strategy: `getBlocked` provides `'Blocked'`, `getMuted` provides `'Muted'`; block/unblock also invalidate `['Followers','Following','Suggestions']` (the graph changes); `getSessions` provides `'Sessions'`, `getSecurityLogs` provides `'SecurityLogs'`; 2FA setup/enable/disable invalidate `['Auth','SecurityLogs']` (the profile `twoFAEnabled` flag lives on the auth user); `revokeSession` invalidates `['Sessions','SecurityLogs']`.
- Add `'Blocked','Muted','Sessions','SecurityLogs'` to `baseApi.tagTypes` (done).

#### Backend contracts the UI must honor

- `GET /privacy/blocked` → `{ users: [UserView...], pagination: { page, limit, total, pages } }`. `GET /privacy/muted` → `{ users: [{ user: UserView, scope }], pagination }`. UserView is the same public profile shape as search (`username, fullName, avatar, verified, bio, counts`).
- `POST /privacy/mute/:userId` accepts `{ scope?: 'feed'|'stories'|'notifications'|'all' }` (defaults to `'all'`) — the muted list displays the resulting scope per user.
- `PATCH /privacy/settings` accepts `{ postsVisibleTo?, messages? }` and returns `{ privacy }`; both fields also ship on the auth `user.privacy` used to pre-fill the toggles.
- `POST /security/2fa/setup` → `{ secret, otpauthUrl }` — shows the manual authenticator key (no QR lib is used).
- `POST /security/2fa/enable` → `{ twoFA: true, backupCodes: [String] }` — the codes are returned **once**; the UI must prompt the user to store them.
- `POST /auth/login` (2FA users) → `{ requiresTwoFactor: true, challenge }` — NO tokens yet. The Login page must swap to a code screen and call `POST /security/2fa/login { challenge, code }`, which returns the normal token pair + user.
- `GET /security/sessions` → `{ sessions: [{ _id, device: {browser, os}, ip, createdAt, expiresAt }] }` (only `revoked: false`).
- `GET /security/logs` → `{ logs: [{ action, ip, device, success, createdAt }], pagination }`. `action` values: `login | login_failed | 2fa_setup | 2fa_enabled | 2fa_disabled | 2fa_login | password_changed | logout | session_revoked`.
- Backend suppression is applied server-side: blocked/muted authors are hidden from post feed, explore, hashtag feeds, stories ring, reels feed, suggestions, user search, notifications, and profile visibility (403 for blocked users). The UI does not re-filter.

#### Components / Pages

- `src/pages/PrivacySettings.jsx` (`/privacy`, protected, nav "Privacy") — post-visibility (public / followers / onlyme) and message-policy (everyone / followers / nobody) segmented toggles with a Save button (`updatePrivacySettings`), plus the blocked list (`unblockUser` per row) and the muted list showing scope (`unmuteUser` per row).
- `src/pages/SecuritySettings.jsx` (`/security`, protected, nav "Security") — three cards:
  - **2FA**: disabled state → "Set up" → shows manual `secret` + 6-digit verify → enable returns `backupCodes` shown once in a grid; enabled state → "Disable 2FA" with a current-code confirm.
  - **Active sessions**: lists `device.browser · device.os`, `ip`, signed-in time, with a **Revoke** button per row.
  - **Security activity**: log feed with success/failure dot, human `action` label, device + IP + timestamp.
- `src/pages/Login.jsx` — handles the two-step flow: after `login`, if `res.data.requiresTwoFactor`, render the 6-digit code screen and submit via `login2FA`; navigate on success.
- Nav links for both pages were added to `RootLayout` (icon + `/privacy`, icon + `/security`) — both behind `ProtectedRoute`.

#### Wiring

- Routes added in `App.jsx` under the Step 8 protected `<Route>` block.
- `baseApi.tagTypes` gained `'Blocked','Muted','Sessions','SecurityLogs'`.
- 2FA secret/backup codes are TOTP (RFC 6238) generated server-side (`utils/totp.js`, native crypto — no QR dependency); the authenticator key is displayed for manual entry.

### Acceptance Checklist (Step 8a UI — Privacy & Security module)

- [x] `/privacy` toggles persist `postsVisibleTo` + `messages`; toggles pre-fill from `user.privacy`
- [x] Blocked list renders each user with an avatar + unblock action that removes them immediately
- [x] Muted list renders users with their mute scope + unmute action
- [x] `/security` shows the 2FA setup → key → enable → backup-codes flow; disabling requires a current code
- [x] Login with a 2FA-enabled account stops at the code screen, then signs in via `security/2fa/login`; a backup code also works
- [x] Sessions list shows all active devices; "Revoke" logs that device out (the badge/list refresh via `Sessions` tag)
- [x] Security activity log lists login/failed-login/2FA/password/logout events with device + IP
- [x] `Blocked`/`Muted`/`Sessions`/`SecurityLogs`/`Auth` tags keep lists, badge and `twoFAEnabled` consistent after mutations
- [x] Blocked/muted suppression reflects server-side across feeds, suggestions, search, notifications and profiles

### Step 10 — Chat module (backend + frontend integration)

Backend (Step 10) is complete: models, REST endpoints, socket handlers. The design is in `BACKEND-DESIGN.md` (Conversation, lines 395–409; Message, lines 411–425; CHAT REST endpoints, lines 698–705; socket events, lines 781–798; roadmap #10, line 861).

#### Backend modules (all new)

| File | Purpose |
|------|---------|
| `models/Conversation.js` | conversation (`direct`/`group`), participants, groupName/Avatar, admin, lastMessage, mutedBy |
| `models/Message.js` | message (`text`/`image`/`video`/`file`), media[], readBy[], deletedFor[] |
| `services/chatService.js` | DM policy + block checks, get-or-create DM, group creation, send/mark-read helpers |
| `controllers/chatController.js` | REST handlers |
| `routes/chatRoutes.js` | mounted at `/api/v1/chat` |
| `sockets/auth.js` | JWT handshake check (`socket.handshake.auth.token`) |
| `sockets/chat.js` | `message:send` / `message:typing` / `message:read` |
| `sockets/presence.js` | online map + `presence:update` broadcasts, `lastSeen` persist |
| `sockets/index.js` | join conversation rooms on connect |

#### REST API (base `http://localhost:5000/api/v1/chat`, all `protect`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/conversations?page&limit` | List conversations + `unread` + `peer` per row |
| POST   | `/conversations` | Start DM `{ type:'direct', participant }` / group `{ type:'group', participants[], groupName }` |
| GET    | `/conversations/:id` | Conversation detail (403 if blocked edge) |
| GET    | `/conversations/:id/messages?cursor&limit` | Paginated history (newest-first; `cursor` is a bare ObjectId, pass it straight back) |
| PUT    | `/conversations/:id/read` | Mark conversation read |

- **DM policy** enforced server-side from the recipient's `user.privacy.messages`: `nobody` → 403; `followers` → sender must be a follower of the recipient; blocked edge (either direction) → 403.
- `createConversation` for DM is **get-or-create** (201 on new / 200 on existing with the same pair).
- `GET /conversations` decodes the DM `peer` (the other participant) so the inbox can render an avatar/name without joining the socket.

#### Socket contract (client connects with `{ auth: { token } }`)

```
Client → Server:
  message:send    { conversationId, content, media: [{url, mediaType}] }   ack(s)
  message:typing  { conversationId, isTyping }
  message:read    { conversationId, messageIds? }   (no ids → mark all)

Server → Client:
  message:new      { conversationId, message }         → conversation room
  message:typing   { conversationId, userId, isTyping } → peers in room
  message:read     { conversationId, userId, messageIds | all }
  presence:update  { userId, online, lastSeen }         → 'presence' room
```

- Socket auth rejects connections without a valid access token (`socket.handshake.auth.token`).
- New messages emit `message:new` to `conversation:{id}`; the sender is already a `readBy` member, so unread counts stay correct for recipients.

#### Frontend integration (done)

- **`src/api/chatApi.js`** — RTK Query: `useGetConversationsQuery`, `useGetConversationQuery`, `useCreateConversationMutation`, `useGetMessagesQuery` (cursor), `useMarkReadMutation`. Adds `'Conversations'` / `'Messages'` tags to `baseApi.tagTypes`.
- **`src/store/slices/messagesSlice.js`** — presence, typing, per-conversation thread store; dedupes by `_id`, optimistically marks own messages read, `markRead` handles `all` or specific `messageIds`.
- **`src/utils/chatSocket.js`** — Socket.IO singleton (URL = `VITE_SOCKET_URL` or same-origin `/`, Vite dev proxy has `/socket.io` with `ws:true`). Reconnects only on token change; multiple `useChatSocket` consumers share one socket.
- **`src/hooks/useChatSocket.js`** — wires `message:new` → `pushMessage`, `message:read` → `markRead`, `message:typing` → `setTyping`, `presence:update` → `setPresence`; exposes `joinConversation` (also emits `conversation:join`), `sendMessage` (ack backpressure), `emitTyping`, `emitRead`.
- **`src/pages/Chat.jsx`** (`/chat`, protected, nav "Messages") — inbox list (peer avatar, last message, relative time, unread badge, online dot) + thread pane (cursor "Load older", bubble list with read receipt `✓/✓✓`, typing indicator, textarea composer, Enter-to-send). Opens a DM via `?conversation=<id>` from `ProfileHeader.handleMessage`.
- **`src/hooks/useChatUnread.js`** — sums `unread` across conversations (30s poll) for the `Messages` nav badge.
- **`ProfileHeader`** — added a **Message** button (creates conversation, navigates to `/chat?conversation=...`).
- **Wiring** — route in `App.jsx` under a protected block; nav link + `ChatUnreadBadge` in `RootLayout`; `messagesReducer` in `store/index.js`.
- **Deploy (prod)** — `frontend/nginx.conf` now proxies `/socket.io/` to `backend:5000` with WebSocket upgrade headers and extended timeouts; the socket uses same-origin `/` so no `VITE_SOCKET_URL` is needed in the Docker image.

### Acceptance Checklist (Step 10 UI — Chat module)

- [ ] `/chat` renders the conversation inbox with peer name, last-message preview, relative time, and unread badge
- [ ] Select a conversation → opens the thread; "Load older" paginates via cursor
- [ ] Send a text message via Enter/Send; it appears immediately in the thread, then is confirmed by the socket ack
- [ ] A second account's message arrives live via `message:new` and the inbox preview + unread badge update
- [ ] Typing indicator shows when the peer is typing and clears on idle
- [ ] Read receipts render as `✓` for own unread, `✓✓` once the peer's client marks read
- [ ] Profile **Message** button opens (or reuses) the DM and lands on `/chat?conversation=...`
- [ ] `nobody` / `followers` DM policies and blocked users are rejected with the server's message
- [ ] Presence dot shows online peers in the inbox and a `presence:update` broadcast reflects online/offline + `lastSeen`
- [ ] Socket reconnects using the current access token; a rotated token swaps the socket without a full page reload

### Step 11 — Reports & Moderation (backend + frontend integration)

Backend (Step 11) is complete and mounted at `/api/v1/reports` (user-facing) + `/api/v1/admin` (admin-only). The design is in `BACKEND-DESIGN.md` (Report model, lines 438–453; REPORTS endpoints, lines 707–711; ModerationKeyword model; ADMIN reports + keywords endpoints, lines 753–765). Frontend UI is integrated.

#### Backend modules (all new)

| File | Purpose |
|------|---------|
| `models/Report.js` | report (`targetType` user/post/comment/reel/story/message, `reason`, `status`, `actionTaken`, `handledBy`) |
| `models/ModerationKeyword.js` | auto-moderation keyword list (`keyword`, `matchType` exact/includes, `isActive`) |
| `services/moderationService.js` | cached keyword scan + `autoModerate` flag helper |
| `validations/reportValidation.js` | Joi schemas (create report, resolve, queries, keyword create, id param) |
| `controllers/reportController.js` | `POST /reports`, `GET /reports/my` (+ `report_resolved` notification on triage) |
| `controllers/moderationController.js` | admin report queue + stats + keyword CRUD |
| `routes/reportRoutes.js` | mounted at `/api/v1/reports` (all `protect`) |
| `routes/adminRoutes.js` | mounted at `/api/v1/admin` (all `protect` + `authorize('admin','superadmin')`) |

#### User-facing endpoints (base `http://localhost:5000/api/v1/reports`, all `protect`)

| Method | Endpoint    | Body | Purpose |
|--------|-------------|------|---------|
| POST   | `/`         | `targetType`, `targetId`, `reason`, `description?` | Report content (rejects self-report + duplicate pending report) |
| GET    | `/my?page&limit` | — | My submitted reports + statuses (`{ reports, pagination }`) |

- `targetType` enum: `user | post | comment | reel | story | message`.
- `reason` enum: `spam | harassment | hate_speech | violence | nudity | false_info | scam | copyright | other`.
- Creating a report returns `{ report: { _id, targetType, targetId, reason, status, createdAt } }`; the content owner is not notified at submission time.

#### Admin endpoints (base `http://localhost:5000/api/v1/admin`, `protect` + `authorize('admin','superadmin')`)

| Method | Endpoint | Body | Purpose |
|--------|----------|------|---------|
| GET    | `/reports?status&page&limit` | — | Moderation queue (filterable by status, default all) — `{ reports, pagination }` |
| GET    | `/reports/stats` | — | Queue counts `{ stats: { pending, reviewing, resolved, dismissed, total } }` |
| PATCH  | `/reports/:id` | `status` (`resolved`\|`dismissed`), `actionTaken?` | Triage a report; notifies the reporter (`report_resolved`) |
| GET    | `/keywords` | — | List moderation keywords |
| POST   | `/keywords` | `keyword`, `matchType?` | Add a keyword (lowercased, unique); invalidates the keyword cache |
| DELETE | `/keywords/:id` | — | Remove a keyword; invalidates the keyword cache |

- Report rows include `reportedBy` + `handledBy` populated (username, fullName, avatar, verified, counts).
- Evergreen reports (`resolved`/`dismissed`) cannot be re-triaged (409).

#### Auto-moderation keyword filter

- Content creation now scans **post content, story text, reel caption, and comment text** via `moderationService.scanForKeywords`.
- On a match, `autoModerate` sets `isFlagged: true` on the created doc (Post/Story/Reel already had `isFlagged`; Comment gained the field), so flagged content surfaces in the admin queue. Keyword list is cached (`moderation:keywords:v1`, 5min) and invalidated on keyword add/remove.
- `matchType: 'exact'` matches whole words only (word-boundary regex); `'includes'` matches the keyword anywhere in the text (case-insensitive).

#### Frontend integration (done)

- **`src/api/reportApi.js`** — RTK Query: `useCreateReportMutation` (POST /reports), `useGetMyReportsQuery`, admin `useGetAdminReportsQuery` (+status filter), `useGetReportStatsQuery`, `useResolveReportMutation`, and keyword CRUD (`useGetModerationKeywordsQuery`, `useCreateKeywordMutation`, `useDeleteKeywordMutation`). Adds `'Reports', 'AdminReports', 'ReportStats', 'Keywords'` tags to `baseApi.tagTypes`.
- **`src/components/report/ReportModal.jsx`** — reason picker modal (9 reasons with descriptions + optional details textarea, ≤1000 chars) using `useCreateReportMutation`; duplicate-pending + server errors surface via toast.
- **`src/components/report/ReportButton.jsx`** — compact flag trigger opening `ReportModal` for a given `targetType`/`targetId`.
- **Report actions wired in:** `PostCard` (non-own posts, header row), `PostDetail` (non-own, top action row), `CommentItem` (non-own, header row), `ProfileHeader` (non-own profiles, beside Message/Follow). Auto-moderated (flagged) posts still render — admins triage via the queue.
- **`src/pages/MyReports.jsx`** (`/reports`, protected, nav "My Reports") — paginated list of my reports with live status badges (pending/reviewing/resolved/dismissed) and an "Action taken" note for resolved rows; empty state links to the feed.
- **`src/pages/AdminReports.jsx`** (`/admin/reports`, role-gated to admin/superadmin) — stat cards (pending/reviewing/resolved/dismissed/total), status filter tabs, report cards with reporter avatar + target + description + **Resolve** (prompts for an action note) / **Dismiss** buttons on open reports.
- **`src/pages/AdminKeywords.jsx`** (`/admin/keywords`, role-gated) — add keyword form (`includes`/`exact` matcher) + active keyword list with Remove; cache invalidates server-side so new keywords apply to the next content creation.
- **Wiring** — routes in `App.jsx` under a protected block (`/reports`, `/admin/reports`, `/admin/keywords`); "My Reports" added to the Account nav group and a "Moderation" nav group (Moderation + Keywords) rendered only for admin/superadmin roles in `RootLayout`.

### Acceptance Checklist (Step 11 UI — Reports & Moderation)

- [x] Report action on posts/users/comments (and via same modal on reels/stories) opens a reason picker (`POST /reports`) and confirms with a toast; duplicate pending reports are rejected with the server message
- [x] `/reports` lists submitted reports with live status badges (pending → resolved/dismissed) and action notes
- [x] Admin `/admin/reports` (role-gated) lists the report queue with status filter + queue stats
- [x] Admin can resolve (with an action note) or dismiss a report; the reporter gets a `report_resolved` notification
- [x] Admin `/admin/keywords` lists/adds/removes moderation keywords; adding a keyword flags newly created posts/stories/reels/comments containing it
- [x] Flagged (`isFlagged`) content is visible in the admin queue for triage; blocked/muted suppression still applies server-side

### Step 12 — Admin Panel (backend + frontend integration)

Backend (Step 12) is complete and mounted at `/api/v1/admin`. The design is in `BACKEND-DESIGN.md` (AdminActionLog model, lines 466–478; ADMIN endpoints, lines 739–769). Frontend is integrated below.

#### Authorization model (frontend)

Role is read from the authenticated user (`useAuth().user.role`; roles: `user`, `admin`, `superadmin`). Enforcement happens in two layers:

1. **Route guards** — `ProtectedRoute` accepts `requireRoles`. The admin section uses `requireRoles={['admin','superadmin']}`; superadmin-only panels (role change, pin, audit logs, settings) use `requireRoles={['superadmin']}` so the `Navigate → /account` fallback fires for unauthorized roles.
2. **Nav + in-page gating** — `RootLayout` renders the Admin nav group only for admin/superadmin, and hides superadmin-only items from admins. Pages additionally short-circuit with a "no access" panel if the required role is missing.

Server-side enforcement is unchanged (`protect` + `authorize('admin','superadmin')` / `authorize('superadmin')`); the frontend gates are UX only and never the security boundary.

#### New frontend files

- **`src/api/adminApi.js`** — RTK Query slice for the full admin surface (dashboard stats/charts, users list/detail/status/role/delete, posts/stories/reels/comments list+delete, pin post, hashtags, broadcast, audit logs, settings, self). Adds tags `'AdminDashboard', 'AdminUsers', 'AdminContent', 'AdminAuditLogs', 'AdminSettings', 'AdminHashtags'` to `baseApi.tagTypes`.
- **`src/utils/roles.js`** — `isAdmin(user)` / `isSuperAdmin(user)` helpers used by nav + pages.
- **`src/components/admin/AdminPageLayout.jsx`** — shared admin page shell (title, description, max-width, Aurora background) + `StatCard` + status-pill/empty-state helpers.
- **`src/pages/AdminLogin.jsx`** (`/admin/login`, guest) — posts to `/admin/login`; mirrors `Login.jsx` including the 2FA challenge hand-off to `/security/2fa/login`.
- **`src/pages/AdminDashboard.jsx`** (`/admin`, protected admin) — stat cards grid from `/dashboard/stats` + dependency-free 7-day bar charts from `/dashboard/charts`.
- **`src/pages/AdminUsers.jsx`** (`/admin/users`) — search + role/status filters, status badges, ban/unban/activate/deactivate, role change (superadmin), delete (confirm dialog).
- **`src/pages/AdminPosts.jsx`** (`/admin/posts`) — status tabs (visible/flagged/deleted/all) + search, preview links, delete, pin/unpin (superadmin).
- **`src/pages/AdminReels.jsx`** (`/admin/reels`) — status tabs + search, delete.
- **`src/pages/AdminStories.jsx`** (`/admin/stories`) — list + search, delete.
- **`src/pages/AdminComments.jsx`** (`/admin/comments`) — search, delete.
- **`src/pages/AdminHashtags.jsx`** (`/admin/hashtags`) — top-hashtag leaderboard.
- **`src/pages/AdminBroadcast.jsx`** (`/admin/broadcast`, superadmin) — message composer + type (`broadcast`/`admin_notice`), optional recipient user-ids (blank = all active users).
- **`src/pages/AdminAuditLogs.jsx`** (`/admin/audit-logs`, superadmin) — action filter + log table (admin, action, target, ip, time).
- **`src/pages/AdminSettings.jsx`** (`/admin/settings`, superadmin) — edit allowed keys (maintenanceMode, closedRegistration, maxPostLength, maxReelSeconds, tosUrl, bannerMessage).

#### Admin endpoints (base `http://localhost:5000/api/v1/admin`)

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| POST | `/login` | Public | Admin login (role-gated) |
| GET | `/me` | admin/superadmin | Current admin profile |
| GET | `/dashboard/stats` | admin/superadmin | Platform totals overview |
| GET | `/dashboard/charts` | admin/superadmin | 7-day trend series |
| GET | `/users` | admin/superadmin | List users (q/role/status) |
| GET | `/users/:id` | admin/superadmin | User detail + activity |
| PATCH | `/users/:id/status` | admin/superadmin | ban/unban/activate/deactivate |
| PATCH | `/users/:id/role` | superadmin | Change user role |
| DELETE | `/users/:id` | admin/superadmin | Delete user + content |
| GET | `/posts` | admin/superadmin | List posts (q/status) |
| DELETE | `/posts/:id` | admin/superadmin | Remove post (soft) |
| PATCH | `/posts/:id/pin` | superadmin | Pin/unpin post |
| GET | `/stories` | admin/superadmin | List stories |
| DELETE | `/stories/:id` | admin/superadmin | Remove story |
| GET | `/reels` | admin/superadmin | List reels (q/status) |
| DELETE | `/reels/:id` | admin/superadmin | Remove reel |
| GET | `/comments` | admin/superadmin | List comments |
| DELETE | `/comments/:id` | admin/superadmin | Remove comment |
| GET | `/hashtags` | admin/superadmin | Top hashtags |
| POST | `/notifications/broadcast` | admin/superadmin | Broadcast notification |
| GET | `/audit-logs` | superadmin | Audit trail |
| GET | `/settings` | admin/superadmin | Read app settings |
| PATCH | `/settings` | superadmin | Update app settings |
| GET | `/reports`, `/reports/stats`, PATCH `/reports/:id` | admin/superadmin | (Step 11 report queue, still here) |
| GET/POST/DELETE | `/keywords` | admin/superadmin | (Step 11 moderation keywords, still here) |

### Acceptance Checklist (Step 12 UI — Admin Panel)

- [x] `/admin` login screen posts to `/admin/login` (role-gated; honours 2FA challenge if enabled)
- [x] Admin dashboard renders `/admin/dashboard/stats` + `/admin/dashboard/charts` (7-day trends)
- [x] Admin Users page lists/filters users; ban/unban/activate/deactivate + role change (superadmin) + delete
- [x] Admin content pages (`/posts`, `/reels`, `/stories`, `/comments`) list, search and remove content
- [x] Superadmin-only audit logs page (`/audit-logs`), broadcast, and settings management surfaces
- [x] All admin pages role-gated client-side + server-side (`protect` + `authorize`)