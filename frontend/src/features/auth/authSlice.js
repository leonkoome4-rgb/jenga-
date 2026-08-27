import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../api/client.js'

const TOKEN_STORAGE_KEY = 'tawi_auth_token'
const LOCAL_USER_STORAGE_KEY = 'tawi_auth_local_user'

// A client-side-only login path for demoing the app when there's no live
// backend to authenticate against (e.g. the frontend deployed alone on
// Vercel). This is NOT real security -- these credentials ship in the
// public JS bundle and anyone can read them out of it. It's only safe
// because this deployment mode has no real backend and no real data behind
// it. Remove this once a real backend is hosted somewhere.
export const LOCAL_SESSION_TOKEN = 'local-admin-session'
const DEMO_ADMIN_PASSWORD = '123456678910'
const DEMO_ADMINS = [
  { name: 'Leon Koome', email: 'leon.koome@student.moringaschool.com' },
  { name: 'Jason Mwangi', email: 'jason.mwangi@student.moringaschool.com' },
  { name: 'Nabil Hassan', email: 'nabil.hassan@student.moringaschool.com' },
  { name: 'Densinela Chepngetich', email: 'densinela.chepngetich@student.moringaschool.com' },
]

export function findDemoAdmin(email, password) {
  if (password !== DEMO_ADMIN_PASSWORD) return null
  const normalized = (email || '').trim().toLowerCase()
  return DEMO_ADMINS.find((a) => a.email === normalized) || null
}

const loadStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

const loadStoredLocalUser = () => {
  try {
    const raw = localStorage.getItem(LOCAL_USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const storeToken = (token) => {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } catch {
    // localStorage unavailable (private mode, etc.) -- session just won't persist
  }
}

const storeLocalUser = (user) => {
  try {
    localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(user))
  } catch {
    // ignore
  }
}

const clearStoredToken = () => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(LOCAL_USER_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      return await api.post('/api/auth/register', payload)
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.data?.error || err.message })
    }
  },
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      return await api.post('/api/auth/login', payload)
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.data?.error || err.message })
    }
  },
)

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (credential, { rejectWithValue }) => {
    try {
      return await api.post('/api/auth/google', { credential })
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.data?.error || err.message })
    }
  },
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth
    if (!token) return rejectWithValue({ status: null, message: 'No token' })
    try {
      return await api.get('/api/auth/me', { token })
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.data?.error || err.message })
    }
  },
)

const initialToken = loadStoredToken()

const initialState = {
  token: initialToken,
  user: initialToken === LOCAL_SESSION_TOKEN ? loadStoredLocalUser() : null,
  status: 'idle',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loggedOut(state) {
      state.token = null
      state.user = null
      state.status = 'idle'
      state.error = null
      clearStoredToken()
    },
    authErrorCleared(state) {
      state.error = null
    },
    localAdminLoggedIn(state, action) {
      const { name, email } = action.payload
      const user = {
        id: `local-${email}`,
        name,
        email,
        role: 'admin',
        cohort_id: null,
        cohort_name: 'Group 6',
        bio: null,
        github_url: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
      }
      state.token = LOCAL_SESSION_TOKEN
      state.user = user
      state.status = 'succeeded'
      state.error = null
      storeToken(LOCAL_SESSION_TOKEN)
      storeLocalUser(user)
    },
  },
  extraReducers(builder) {
    const handlePending = (state) => {
      state.status = 'loading'
      state.error = null
    }
    const handleAuthSuccess = (state, action) => {
      state.status = 'succeeded'
      state.token = action.payload.token
      state.user = action.payload.user
      storeToken(action.payload.token)
    }
    const handleRejected = (state, action) => {
      state.status = 'failed'
      state.error = action.payload?.message || action.error?.message || 'Account creation failed. Please try again.'
    }

    builder
      .addCase(registerUser.pending, handlePending)
      .addCase(registerUser.fulfilled, handleAuthSuccess)
      .addCase(registerUser.rejected, handleRejected)
      .addCase(loginUser.pending, handlePending)
      .addCase(loginUser.fulfilled, handleAuthSuccess)
      .addCase(loginUser.rejected, handleRejected)
      .addCase(googleLogin.pending, handlePending)
      .addCase(googleLogin.fulfilled, handleAuthSuccess)
      .addCase(googleLogin.rejected, handleRejected)
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        // Only a real 401 means the token is actually invalid/expired.
        // A network hiccup or a backend that's momentarily unreachable
        // must NOT log the user out -- that was forcing people to log in
        // over and over any time the server had a blip.
        if (action.payload?.status === 401) {
          state.token = null
          state.user = null
          clearStoredToken()
        }
      })
  },
})

export const { loggedOut, authErrorCleared, localAdminLoggedIn } = authSlice.actions

export default authSlice.reducer

export const selectAuthToken = (state) => state.auth.token
export const selectAuthUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => Boolean(state.auth.token)
export const selectAuthStatus = (state) => state.auth.status
export const selectAuthError = (state) => state.auth.error
