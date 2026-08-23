import { createSlice, nanoid } from '@reduxjs/toolkit'
import { projects as mockProjects } from '../../data/projects.js'
import { PLACEHOLDER_LINK } from '../../data/constants.js'

const initialState = {
  items: mockProjects,
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    projectAdded: {
      reducer(state, action) {
        state.items.unshift(action.payload)
      },
      prepare(project) {
        return {
          payload: {
            id: nanoid(),
            createdAt: new Date().toISOString().slice(0, 10),
            imageUrl: null,
            videoUrl: null,
            members: [],
            githubLink: PLACEHOLDER_LINK,
            liveLink: PLACEHOLDER_LINK,
            likes: 0,
            liked: false,
            tips: 0,
            ...project,
          },
        }
      },
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
})

export const { projectAdded, projectUpdated, projectDeleted, projectLikeToggled, projectTipped } =
  projectsSlice.actions

export default projectsSlice.reducer

export const selectAllProjects = (state) => state.projects.items
export const selectProjectById = (state, id) =>
  state.projects.items.find((p) => p.id === id)
export const selectProjectsByOwner = (state, ownerId) =>
  state.projects.items.filter(
    (p) => p.owner.id === ownerId || p.members.some((m) => m.id === ownerId),
  )
