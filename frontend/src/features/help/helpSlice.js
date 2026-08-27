import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../api/client.js'

export const fetchHelpPosts = createAsyncThunk('help/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const data = await api.get('/api/help')
    return data.help_posts
  } catch (err) {
    return rejectWithValue(err.data?.error || err.message)
  }
})

export const fetchHelpPost = createAsyncThunk('help/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const data = await api.get(`/api/help/${id}`)
    return data.help_post
  } catch (err) {
    return rejectWithValue(err.data?.error || err.message)
  }
})

export const createHelpPost = createAsyncThunk(
  'help/create',
  async (payload, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      const data = await api.post('/api/help', payload, { token })
      return data.help_post
    } catch (err) {
      return rejectWithValue(err.data?.error || err.message)
    }
  },
)

export const addHelpComment = createAsyncThunk(
  'help/addComment',
  async ({ postId, body }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      const data = await api.post(`/api/help/${postId}/comments`, { body }, { token })
      return { postId, comment: data.comment }
    } catch (err) {
      return rejectWithValue(err.data?.error || err.message)
    }
  },
)

export const resolveHelpPost = createAsyncThunk(
  'help/resolve',
  async (postId, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      const data = await api.patch(`/api/help/${postId}`, { resolved: true }, { token })
      return data.help_post
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

const helpSlice = createSlice({
  name: 'help',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchHelpPosts.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchHelpPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchHelpPosts.rejected, (state) => {
        state.status = 'failed'
      })
      .addCase(createHelpPost.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(fetchHelpPost.pending, (state) => {
        state.currentStatus = 'loading'
      })
      .addCase(fetchHelpPost.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded'
        state.current = action.payload
      })
      .addCase(fetchHelpPost.rejected, (state) => {
        state.currentStatus = 'failed'
        state.current = null
      })
      .addCase(addHelpComment.fulfilled, (state, action) => {
        if (state.current?.id === action.payload.postId) {
          state.current.comments = [...(state.current.comments || []), action.payload.comment]
          state.current.comment_count = (state.current.comment_count || 0) + 1
        }
      })
      .addCase(resolveHelpPost.fulfilled, (state, action) => {
        if (state.current?.id === action.payload.id) {
          state.current.resolved = action.payload.resolved
        }
        const item = state.items.find((p) => p.id === action.payload.id)
        if (item) item.resolved = action.payload.resolved
      })
  },
})

export default helpSlice.reducer

export const selectHelpPosts = (state) => state.help.items
export const selectHelpPostsStatus = (state) => state.help.status
export const selectCurrentHelpPost = (state) => state.help.current
export const selectCurrentHelpPostStatus = (state) => state.help.currentStatus
