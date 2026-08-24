import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../api/client.js'

const TOKEN_STORAGE_KEY = 'tawi_auth_token'

const loadStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
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

const clearStoredToken = () => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
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
      return rejectWithValue(err.data?.error || err.message)
    }
  },
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      return await api.post('/api/auth/login', payload)
    } catch (err) {
      return rejectWithValue(err.data?.error || err.message)
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

const initialState = {
  token: loadStoredToken(),
  user: null,
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
      state.error = action.payload || 'Something went wrong'
    }

    builder
      .addCase(registerUser.pending, handlePending)
      .addCase(registerUser.fulfilled, handleAuthSuccess)
      .addCase(registerUser.rejected, handleRejected)
      .addCase(loginUser.pending, handlePending)
      .addCase(loginUser.fulfilled, handleAuthSuccess)
      .addCase(loginUser.rejected, handleRejected)
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

export const { loggedOut, authErrorCleared } = authSlice.actions

export default authSlice.reducer

export const selectAuthToken = (state) => state.auth.token
export const selectAuthUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => Boolean(state.auth.token)
export const selectAuthStatus = (state) => state.auth.status
export const selectAuthError = (state) => state.auth.error
