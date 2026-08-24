import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertCircle, Check } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout.jsx'
import Button from '../components/Button.jsx'
import TurnstileWidget from '../components/TurnstileWidget.jsx'
import { api } from '../api/client.js'

const inputClasses =
  'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-[14px] text-navy placeholder:text-text-muted focus:outline-none focus:border-orange'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [captchaToken, setCaptchaToken] = useState(null)
  const [captchaKey, setCaptchaKey] = useState(0)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setError(null)

    try {
      await api.post('/api/auth/reset-password', {
        token,
        password,
        captcha_token: captchaToken,
      })
      setStatus('done')
    } catch (err) {
      setStatus('idle')
      setError(err.data?.error || err.message)
      setCaptchaToken(null)
      setCaptchaKey((k) => k + 1)
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Invalid link">
        <p className="text-center text-[14px] text-text-secondary">
          This password reset link is missing its token. Request a new one from the{' '}
          <Link to="/forgot-password" className="font-medium text-orange">
            forgot password
          </Link>{' '}
          page.
        </p>
      </AuthLayout>
    )
  }

  if (status === 'done') {
    return (
      <AuthLayout title="Password updated">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange/10">
            <Check size={22} strokeWidth={2} className="text-orange" />
          </div>
          <p className="text-[14px] text-text-secondary">You can now log in with your new password.</p>
          <Button to="/login" variant="primary" className="mt-2">
            Go to log in
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Set a new password">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-orange/10 px-3 py-2.5 text-[13px] text-navy">
            <AlertCircle size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-orange" />
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-navy">New password</label>
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
          {status === 'loading' ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthLayout>
  )
}
