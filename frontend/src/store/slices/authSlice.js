import { createSlice } from '@reduxjs/toolkit';
import { STORAGE_KEYS as K } from '../../constants/api';

const readJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};

const initialState = {
  accessToken: localStorage.getItem(K.accessToken) || null,
  refreshToken: localStorage.getItem(K.refreshToken) || null,
  user: readJson(K.user),
  status: localStorage.getItem(K.accessToken) ? 'authenticated' : 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, { payload }) {
      if (payload.accessToken) {
        state.accessToken = payload.accessToken;
        localStorage.setItem(K.accessToken, payload.accessToken);
      }
      if (payload.refreshToken) {
        state.refreshToken = payload.refreshToken;
        localStorage.setItem(K.refreshToken, payload.refreshToken);
      }
      if (payload.user) {
        state.user = payload.user;
        localStorage.setItem(K.user, JSON.stringify(payload.user));
      }
      if (payload.accessToken) state.status = 'authenticated';
      state.error = null;
    },
    setUser(state, { payload }) {
      state.user = payload;
      localStorage.setItem(K.user, JSON.stringify(payload));
    },
    setAuthError(state, { payload }) {
      state.error = payload;
    },
    clearCredentials(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem(K.accessToken);
      localStorage.removeItem(K.refreshToken);
      localStorage.removeItem(K.user);
    },
  },
});

export const { setCredentials, setUser, setAuthError, clearCredentials } = authSlice.actions;
export default authSlice.reducer;