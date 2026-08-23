import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import BottomNav from '../components/BottomNav.jsx'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
