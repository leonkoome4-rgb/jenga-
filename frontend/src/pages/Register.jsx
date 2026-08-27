import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AlertCircle } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout.jsx'
import Button from '../components/Button.jsx'
import GoogleSignInButton from '../components/GoogleSignInButton.jsx'
import {
  registerUser,
  googleLogin,
  selectAuthStatus,
  selectAuthError,
  authErrorCleared,
} from '../features/auth/authSlice.js'

const inputClasses =
  'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-[14px] text-navy placeholder:text-text-muted focus:outline-none focus:border-orange'

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const status = useSelector(selectAuthStatus)
  const error = useSelector(selectAuthError)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const googleConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(authErrorCleared())

    const result = await dispatch(
      registerUser({ name, email, password }),
    )

    if (registerUser.fulfilled.match(result)) {
      navigate('/ai-hub')
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
    <AuthLayout title="Create account" subtitle="Join Tawi to publish your work and use the AI Hub.">
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
          <label className="text-[13px] font-medium text-navy">Name</label>
          <input
            required
            className={inputClasses}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
          />
        </div>

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
          <label className="text-[13px] font-medium text-navy">Password</label>
          <input
            required
            type="password"
            minLength={8}
            className={inputClasses}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={status === 'loading'}
          className="w-full py-3"
        >
          {status === 'loading' ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="text-center text-[13px] text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-orange">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
