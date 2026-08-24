import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectAuthToken, selectAuthUser } from '../features/auth/authSlice.js'

export default function RequireAdmin() {
  // The app root (App.jsx) already fetches the real user once a token
  // exists -- this guard just waits for that and checks the role.
  const token = useSelector(selectAuthToken)
  const authUser = useSelector(selectAuthUser)

  if (!token) {
    return <Navigate to="/login" replace />
  }
  if (!authUser) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[14px] text-text-muted">
        Loading…
      </div>
    )
  }
  if (authUser.role !== 'admin') {
    return <Navigate to="/discover" replace />
  }
  return <Outlet />
}
