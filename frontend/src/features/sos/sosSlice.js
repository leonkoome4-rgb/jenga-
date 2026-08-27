import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../api/client.js'

export const fetchSosPosts = createAsyncThunk('sos/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const data = await api.get('/api/sos')
    return data.sos_posts
  } catch (err) {
    return rejectWithValue(err.data?.error || err.message)
  }
})

export const fetchSosPost = createAsyncThunk('sos/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const data = await api.get(`/api/sos/${id}`)
    return data.sos_post
  } catch (err) {
    return rejectWithValue(err.data?.error || err.message)
  }
})

export const createSosPost = createAsyncThunk(
  'sos/create',
  async (payload, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      const data = await api.post('/api/sos', payload, { token })
      return data.sos_post
    } catch (err) {
      return rejectWithValue(err.data?.error || err.message)
    }
  },
)

export const addSosComment = createAsyncThunk(
  'sos/addComment',
  async ({ postId, body }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      const data = await api.post(`/api/sos/${postId}/comments`, { body }, { token })
      return { postId, comment: data.comment }
    } catch (err) {
      return rejectWithValue(err.data?.error || err.message)
    }
  },
)

export const resolveSosPost = createAsyncThunk(
  'sos/resolve',
  async (postId, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      const data = await api.patch(`/api/sos/${postId}`, { resolved: true }, { token })
      return data.sos_post
    } catch (err) {
      return rejectWithValue(err.data?.error || err.message)
    }
  },
)

const initialState = {
  items: [],
  status: 'idle',
  current: null,
  currentStatus: 'idle',
}

const sosSlice = createSlice({
  name: 'sos',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchSosPosts.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchSosPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchSosPosts.rejected, (state) => {
        state.status = 'failed'
      })
      .addCase(createSosPost.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(fetchSosPost.pending, (state) => {
        state.currentStatus = 'loading'
      })
      .addCase(fetchSosPost.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded'
        state.current = action.payload
      })
      .addCase(fetchSosPost.rejected, (state) => {
        state.currentStatus = 'failed'
        state.current = null
      })
      .addCase(addSosComment.fulfilled, (state, action) => {
        if (state.current?.id === action.payload.postId) {
          state.current.comments = [...(state.current.comments || []), action.payload.comment]
          state.current.comment_count = (state.current.comment_count || 0) + 1
        }
      })
      .addCase(resolveSosPost.fulfilled, (state, action) => {
        if (state.current?.id === action.payload.id) {
          state.current.resolved = action.payload.resolved
        }
        const item = state.items.find((p) => p.id === action.payload.id)
        if (item) item.resolved = action.payload.resolved
      })
  },
})

export default sosSlice.reducer

export const selectSosPosts = (state) => state.sos.items
export const selectSosPostsStatus = (state) => state.sos.status
export const selectCurrentSosPost = (state) => state.sos.current
export const selectCurrentSosPostStatus = (state) => state.sos.currentStatus
