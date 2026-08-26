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
  likes: 0,
  liked: false,
  tips: 0,
})

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const data = await api.get('/api/projects')
    return data.projects
  } catch (err) {
    return rejectWithValue(err.data?.error || err.message)
  }
})

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
    projectLikeToggled(state, action) {
      const project = state.items.find((p) => p.id === action.payload)
      if (project) {
        project.liked = !project.liked
        project.likes += project.liked ? 1 : -1
      }
    },
    projectTipped(state, action) {
      const project = state.items.find((p) => p.id === action.payload)
      if (project) {
        project.tips += 1
      }
    },
  },
  extraReducers(builder) {
    builder.addCase(fetchProjects.fulfilled, (state, action) => {
      state.items = action.payload.map(normalizeProject)
    })
  },
})

export const { projectCreated, projectUpdated, projectDeleted, projectLikeToggled, projectTipped } =
  projectsSlice.actions

export default projectsSlice.reducer

export const selectAllProjects = (state) => state.projects.items
export const selectProjectById = (state, id) =>
  state.projects.items.find((p) => p.id === id)
export const selectProjectsByOwner = (state, ownerId) =>
  state.projects.items.filter(
    (p) =>
      String(p.owner.id) === String(ownerId) ||
      p.members.some((member) => String(member.id) === String(ownerId)),
  )
