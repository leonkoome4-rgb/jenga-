import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../api/client.js'

const normalizeUser = (user) => ({
  id: String(user?.id ?? ''),
  name: user?.name || 'Unknown creator',
  avatarUrl: user?.avatar_url || null,
})

export const normalizeProject = (project) => ({
  id: String(project.id),
  name: project.name,
  description: project.description,
  fullDescription: project.full_description || project.description,
  imageUrl: project.image_url || null,
  videoUrl: project.video_url || null,
  githubLink: project.github_link || '',
  liveLink: project.live_link || '',
  category: project.category?.name || 'Uncategorized',
  cohort: project.cohort?.name || 'No cohort',
  techStack: (project.tech_tags || []).map((tag) => tag.name),
  owner: normalizeUser(project.owner),
  members: (project.members || []).map(normalizeUser),
  createdAt: project.created_at?.slice(0, 10) || '',
  likes: project.like_count ?? 0,
  liked: project.liked_by_me ?? false,
  tips: project.tip_count ?? 0,
})

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const data = await api.get('/api/projects', token ? { token } : undefined)
      return data.projects
    } catch (err) {
      return rejectWithValue(err.data?.error || err.message)
    }
  },
)

// Liking requires an account (someone has to "own" the like so it can be
// toggled back off), so this hits the real backend rather than mutating
// local state -- it's a real, shared, persisted interaction now.
export const toggleProjectLike = createAsyncThunk(
  'projects/toggleLike',
  async (projectId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const data = await api.post(`/api/projects/${projectId}/like`, undefined, { token })
      return { projectId, liked: data.liked, likeCount: data.like_count }
    } catch (err) {
      return rejectWithValue(err.data?.error || err.message)
    }
  },
)

export const tipProject = createAsyncThunk(
  'projects/tip',
  async (projectId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      const data = await api.post(`/api/projects/${projectId}/tip`, undefined, { token })
      return { projectId, tipCount: data.tip_count }
    } catch (err) {
      return rejectWithValue(err.data?.error || err.message)
    }
  },
)

const initialState = {
  items: [],
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    projectCreated(state, action) {
      state.items.unshift(normalizeProject(action.payload))
    },
    projectUpdated(state, action) {
      const { id, changes } = action.payload
      const project = state.items.find((p) => p.id === id)
      if (project) {
        Object.assign(project, changes)
      }
    },
    projectDeleted(state, action) {
      state.items = state.items.filter((p) => p.id !== action.payload)
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.items = action.payload.map(normalizeProject)
      })
      .addCase(toggleProjectLike.fulfilled, (state, action) => {
        const project = state.items.find((p) => p.id === action.payload.projectId)
        if (project) {
          project.liked = action.payload.liked
          project.likes = action.payload.likeCount
        }
      })
      .addCase(tipProject.fulfilled, (state, action) => {
        const project = state.items.find((p) => p.id === action.payload.projectId)
        if (project) {
          project.tips = action.payload.tipCount
        }
      })
  },
})

export default projectsSlice.reducer

export const { projectCreated, projectUpdated, projectDeleted } = projectsSlice.actions

export const selectAllProjects = (state) => state.projects.items
export const selectProjectById = (state, id) =>
  state.projects.items.find((p) => p.id === id)
export const selectProjectsByOwner = (state, ownerId) =>
  state.projects.items.filter(
    (p) =>
      String(p.owner.id) === String(ownerId) ||
      p.members.some((member) => String(member.id) === String(ownerId)),
  )
