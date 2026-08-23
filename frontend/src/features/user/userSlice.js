import { createSlice } from '@reduxjs/toolkit'
import { currentUser } from '../../data/users.js'

const initialState = {
  currentUser,
  isAuthenticated: true,
  isAdmin: true,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
})

export default userSlice.reducer

export const selectCurrentUser = (state) => state.user.currentUser
export const selectIsAdmin = (state) => state.user.isAdmin
