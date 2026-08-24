import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Check } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout.jsx'
import Button from '../components/Button.jsx'
import TurnstileWidget from '../components/TurnstileWidget.jsx'
import { api } from '../api/client.js'

const inputClasses =
  'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-[14px] text-navy placeholder:text-text-muted focus:outline-none focus:border-orange'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [captchaToken, setCaptchaToken] = useState(null)
  const [captchaKey, setCaptchaKey] = useState(0)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [devResetToken, setDevResetToken] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setError(null)

    try {
      const data = await api.post('/api/auth/forgot-password', {
        email,
        captcha_token: captchaToken,
      })
      setStatus('sent')
      setDevResetToken(data.reset_token || null)
    } catch (err) {
      setStatus('idle')
      setError(err.data?.error || err.message)
      setCaptchaToken(null)
      setCaptchaKey((k) => k + 1)
    }
  }

  if (status === 'sent') {
    return (
      <AuthLayout title="Check your email">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange/10">
            <Check size={22} strokeWidth={2} className="text-orange" />
          </div>
          <p className="text-[14px] text-text-secondary">
            If <strong className="text-navy">{email}</strong> is registered, a reset link has
            been sent.
          </p>

          {devResetToken && (
            <div className="mt-2 w-full rounded-lg border border-dashed border-border bg-bg p-3 text-left text-[12px] text-text-secondary">
              <p className="font-medium text-navy">Dev mode -- no email service is configured</p>
              <p className="mt-1">
                Normally this token would be emailed, not shown here.{' '}
                <Link
                  to={`/reset-password?token=${encodeURIComponent(devResetToken)}`}
                  className="font-medium text-orange"
                >
                  Continue to reset your password →
                </Link>
              </p>
            </div>
          )}

          <Link to="/login" className="mt-2 text-[13px] font-medium text-orange">
            Back to log in
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
    >
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
          {status === 'loading' ? 'Sending…' : 'Send reset link'}
        </Button>

        <p className="text-center text-[13px] text-text-secondary">
          <Link to="/login" className="font-medium text-orange">
            Back to log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
