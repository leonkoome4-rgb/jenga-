import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AlertCircle } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout.jsx'
import Button from '../components/Button.jsx'
import TurnstileWidget from '../components/TurnstileWidget.jsx'
import { loginUser, selectAuthStatus, selectAuthError, authErrorCleared } from '../features/auth/authSlice.js'

const inputClasses =
  'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-[14px] text-navy placeholder:text-text-muted focus:outline-none focus:border-orange'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const status = useSelector(selectAuthStatus)
  const error = useSelector(selectAuthError)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captchaToken, setCaptchaToken] = useState(null)
  const [captchaKey, setCaptchaKey] = useState(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(authErrorCleared())

    const result = await dispatch(loginUser({ email, password, captcha_token: captchaToken }))

    if (loginUser.fulfilled.match(result)) {
      navigate('/ai-hub')
    } else {
      setCaptchaToken(null)
      setCaptchaKey((k) => k + 1)
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

        <TurnstileWidget
          key={captchaKey}
          onVerify={setCaptchaToken}
          onExpire={() => setCaptchaToken(null)}
          onError={() => setCaptchaToken(null)}
        />

        <Button
          type="submit"
          variant="primary"
          disabled={!captchaToken || status === 'loading'}
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
