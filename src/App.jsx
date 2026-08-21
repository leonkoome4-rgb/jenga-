import { Routes, Route } from 'react-router-dom'
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<landing />} />

      <Route element={<AppLayout />}>
        <Route path="/discover" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/top" element={<TopRated />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/creators/:id" element={<Profile />} />
        <Route path="/add-project" element={<AddProject />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/cohorts" element={<AdminCohorts />} />
      </Route>
    </Routes>
  )
}

export default App
