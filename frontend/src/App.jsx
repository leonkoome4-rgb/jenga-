import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import AppLayout from './layouts/AppLayout.jsx'
import Landing from './pages/Landing.jsx'
import Home from './pages/Home.jsx'
import Explore from './pages/Explore.jsx'
import TopRated from './pages/TopRated.jsx'
import Inbox from './pages/Inbox.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Profile from './pages/Profile.jsx'
import AddProject from './pages/AddProject.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminCohorts from './pages/AdminCohorts.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import AIHub from './pages/AIHub.jsx'
import HelpFeed from './pages/HelpFeed.jsx'
import HelpPostDetail from './pages/HelpPostDetail.jsx'
import AskForHelp from './pages/AskForHelp.jsx'
import NotFound from './pages/NotFound.jsx'
import AIAssistant from './components/assistant/AIAssistant.jsx'
import RequireAdmin from './components/RequireAdmin.jsx'
import {
  selectAuthToken,
  selectAuthUser,
  fetchCurrentUser,
  LOCAL_SESSION_TOKEN,
} from './features/auth/authSlice.js'
import { fetchProjects } from './features/projects/projectsSlice.js'

function App() {
  const dispatch = useDispatch()
  const token = useSelector(selectAuthToken)
  const authUser = useSelector(selectAuthUser)

  // Resolve the real logged-in identity once at the root, so role-gated UI
  // (admin link, profile, AI Hub) is correct everywhere from first paint
  // instead of each page having to trigger its own fetch. A local demo
  // session has no backend to fetch from -- its user is already in state.
  useEffect(() => {
    if (token && token !== LOCAL_SESSION_TOKEN && !authUser) {
      dispatch(fetchCurrentUser())
    }
  }, [token, authUser, dispatch])

  useEffect(() => {
    dispatch(fetchProjects())
  }, [dispatch])

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<AppLayout />}>
          <Route path="/discover" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/top" element={<TopRated />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/ai-hub" element={<AIHub />} />
          <Route path="/help" element={<HelpFeed />} />
          <Route path="/help/new" element={<AskForHelp />} />
          <Route path="/help/:id" element={<HelpPostDetail />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/creators/:id" element={<Profile />} />
          <Route path="/add-project" element={<AddProject />} />

          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/cohorts" element={<AdminCohorts />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <AIAssistant />
    </>
  )
}

export default App
