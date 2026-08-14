# Social Media Platform — Frontend Integration Document

Frontend stack: **React (Vite) + JavaScript + Tailwind CSS + Redux Toolkit (RTK Query)**.

> ⚠️ This document only covers the **currently implemented backend steps** (Step 1: Setup, Step 2: Auth, Step 3: User, Step 4: Posts).
> New pages/slices are appended here as each backend step is completed.

---

## 1. What We Are Integrating Right Now

Backend readiness status:

| Backend Step | Feature                                    | Status  |
|--------------|--------------------------------------------|---------|
| Step 1       | Backend setup, health check, Atlas, ESM    | ✅ Done |
| Step 2       | Auth (register, verify, login, refresh, logout, reset) | ✅ Done |
| Step 3       | User (profile CRUD, follow, search, suggestions, avatar/cover upload) | ✅ Done |
| Step 4       | Posts (CRUD, feed, like, save, share, hashtags, explore, trending) + Comments | ✅ Done (backend only) |

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
│   │   └── userApi.js        # injected endpoints (profile, follow, search, suggestions, upload)
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
│   │   └── SavedPosts.jsx       # saved/bookmarked posts [step 4]
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

### Next integration step (when backend Step 6 is done)
Append: **Stories (Step 6)** — 24h ephemeral story viewer/ring. The `postApi`/`commentApi` pattern above extends with the new module using the same cursor-pagination + tag-invalidation conventions.