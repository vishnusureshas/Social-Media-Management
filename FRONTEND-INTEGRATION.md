# Social Media Platform — Frontend Integration Document

Frontend stack: **React (Vite) + JavaScript + Tailwind CSS + Redux Toolkit (RTK Query)**.

> ⚠️ This document only covers the **currently implemented backend steps** (Step 1: Setup, Step 2: Auth).
> New pages/slices are appended here as each backend step is completed.

---

## 1. What We Are Integrating Right Now

Backend readiness status:

| Backend Step | Feature                                    | Status  |
|--------------|--------------------------------------------|---------|
| Step 1       | Backend setup, health check, Atlas, ESM    | ✅ Done |
| Step 2       | Auth (register, verify, login, refresh, logout, reset) | ✅ Done |

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
│   │   └── baseApi.js        # RTK Query createApi, fetchBaseQuery, auth header, 401 refresh
│   │   └── authApi.js        # injected endpoints (register, login, ...)
│   ├── hooks/
│   │   ├── useAuth.js        # useSelector/useDispatch helpers
│   │   └── useDocumentTitle.js
│   ├── routes/
│   │   ├── ProtectedRoute.jsx   # redirect to /login if no token
│   │   └── GuestRoute.jsx       # redirect to /feed if already logged in
│   ├── layouts/
│   │   └── RootLayout.jsx       # top bar or sidebar shell (extended in step 3+)
│   ├── pages/
│   │   ├── Landing.jsx          # public splash
│   │   ├── Register.jsx
│   │   ├── VerifyEmail.jsx
│   │   ├── Login.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   └── ChangePassword.jsx
│   ├── components/
│   │   ├── ui/                # Button, Input, Card, Spinner, OTPInput
│   │   └── auth/              # AuthLayout (split-screen), AuthLogo
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
  tagTypes: ['Auth', 'User', 'Post'],   // extend per future step
  endpoints: () => ({}),
});
```

> **401 auto-refresh hook (add later, recommended):** a `baseQueryWithReauth` wrapper that calls `/auth/refresh` once on 401, stores new tokens, and retries the original request.

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

---

### Next integration step (when backend Step 3 is done)
Append: **User module** — user store slice, profile page (view/update/edit), follow/unfollow buttons, followers/following lists, search results page, follower suggestions, avatar/cover upload with Cloudinary.