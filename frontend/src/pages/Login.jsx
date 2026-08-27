import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AlertCircle } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout.jsx'
import Button from '../components/Button.jsx'
import GoogleSignInButton from '../components/GoogleSignInButton.jsx'
import {
  loginUser,
  googleLogin,
  selectAuthStatus,
  selectAuthError,
  authErrorCleared,
  findDemoAdmin,
  localAdminLoggedIn,
} from '../features/auth/authSlice.js'

const inputClasses =
  'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-[14px] text-navy placeholder:text-text-muted focus:outline-none focus:border-orange'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const status = useSelector(selectAuthStatus)
  const error = useSelector(selectAuthError)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const demoAdmin = findDemoAdmin(email, password)
  const googleConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(authErrorCleared())

    const result = await dispatch(loginUser({ email, password }))

    if (loginUser.fulfilled.match(result)) {
      navigate('/ai-hub')
      return
    }

    // Only fall back to the local demo session when there's genuinely no
    // backend to talk to (e.g. this is the frontend-only deployed preview).
    // A real backend must always win so real accounts get a real token --
    // otherwise AI Hub calls would carry a fake token and get rejected.
    if (result.payload?.status === 0 && demoAdmin) {
      dispatch(localAdminLoggedIn(demoAdmin))
      navigate('/discover')
    }
  }

  const handleGoogleCredential = async (credential) => {
    dispatch(authErrorCleared())
    const result = await dispatch(googleLogin(credential))
    if (googleLogin.fulfilled.match(result)) {
      navigate('/ai-hub')
    }
  }

  return (
    <AuthLayout title="Log in" subtitle="Welcome back.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-orange/10 px-3 py-2.5 text-[13px] text-navy">
            <AlertCircle size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-orange" />
            {error}
          </div>
        )}

        {googleConfigured && (
          <>
            <GoogleSignInButton onCredential={handleGoogleCredential} className="flex justify-center" />
            <div className="flex items-center gap-3 text-[12px] text-text-muted">
              <div className="h-px flex-1 bg-border" />
              or
              <div className="h-px flex-1 bg-border" />
            </div>
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-navy">Email</label>
          <input
            required
            type="email"
            className={inputClasses}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@moringaschool.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-medium text-navy">Password</label>
            <Link to="/forgot-password" className="text-[12px] font-medium text-orange">
              Forgot password?
            </Link>
          </div>
          <input
            required
            type="password"
            className={inputClasses}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={status === 'loading'}
          className="w-full py-3"
        >
          {status === 'loading' ? 'Logging in…' : 'Log in'}
        </Button>

        <p className="text-center text-[13px] text-text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-orange">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
