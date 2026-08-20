import { createSlice } from '@reduxjs/toolkit'
import { allCategoriesLabel } from '../../data/categories.js'

const initialState = {
  category: allCategoriesLabel,
  search: '',
  cohort: 'All cohorts',
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    categoryChanged(state, action) {
      state.category = action.payload
    },
    searchChanged(state, action) {
      state.search = action.payload
    },
    cohortChanged(state, action) {
      state.cohort = action.payload
    },
    filtersReset() {
      return initialState
    },
  },
})

export const { categoryChanged, searchChanged, cohortChanged, filtersReset } =
  filtersSlice.actions

export default filtersSlice.reducer

export const selectFilters = (state) => state.filters
