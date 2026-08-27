import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../api/client.js'

export const fetchPosts = createAsyncThunk('codeClinic/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const data = await api.get('/api/code-clinic')
    return data.posts
  } catch (err) {
    return rejectWithValue(err.data?.error || err.message)
  }
})

export const fetchPost = createAsyncThunk('codeClinic/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const data = await api.get(`/api/code-clinic/${id}`)
    return data.post
  } catch (err) {
    return rejectWithValue(err.data?.error || err.message)
  }
})

export const createPost = createAsyncThunk(
  'codeClinic/create',
  async (payload, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      const data = await api.post('/api/code-clinic', payload, { token })
      return data.post
    } catch (err) {
      return rejectWithValue(err.data?.error || err.message)
    }
  },
)

export const addComment = createAsyncThunk(
  'codeClinic/addComment',
  async ({ postId, body }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      const data = await api.post(`/api/code-clinic/${postId}/comments`, { body }, { token })
      return { postId, comment: data.comment }
    } catch (err) {
      return rejectWithValue(err.data?.error || err.message)
    }
  },
)

export const resolvePost = createAsyncThunk(
  'codeClinic/resolve',
  async (postId, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      const data = await api.patch(`/api/code-clinic/${postId}`, { resolved: true }, { token })
      return data.post
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

const codeClinicSlice = createSlice({
  name: 'codeClinic',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchPosts.rejected, (state) => {
        state.status = 'failed'
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(fetchPost.pending, (state) => {
        state.currentStatus = 'loading'
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded'
        state.current = action.payload
      })
      .addCase(fetchPost.rejected, (state) => {
        state.currentStatus = 'failed'
        state.current = null
      })
      .addCase(addComment.fulfilled, (state, action) => {
        if (state.current?.id === action.payload.postId) {
          state.current.comments = [...(state.current.comments || []), action.payload.comment]
          state.current.comment_count = (state.current.comment_count || 0) + 1
        }
      })
      .addCase(resolvePost.fulfilled, (state, action) => {
        if (state.current?.id === action.payload.id) {
          state.current.resolved = action.payload.resolved
        }
        const item = state.items.find((p) => p.id === action.payload.id)
        if (item) item.resolved = action.payload.resolved
      })
  },
})

export default codeClinicSlice.reducer

export const selectPosts = (state) => state.codeClinic.items
export const selectPostsStatus = (state) => state.codeClinic.status
export const selectCurrentPost = (state) => state.codeClinic.current
export const selectCurrentPostStatus = (state) => state.codeClinic.currentStatus
