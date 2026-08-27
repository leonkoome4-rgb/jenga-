import { configureStore } from '@reduxjs/toolkit'
import projectsReducer from '../features/projects/projectsSlice.js'
import filtersReducer from '../features/filters/filtersSlice.js'
import userReducer from '../features/user/userSlice.js'
import authReducer from '../features/auth/authSlice.js'
import codeClinicReducer from '../features/codeClinic/codeClinicSlice.js'

export const store = configureStore({
  reducer: {
    projects: projectsReducer,
    filters: filtersReducer,
    user: userReducer,
    auth: authReducer,
    codeClinic: codeClinicReducer,
  },
})
