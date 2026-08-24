import { useEffect, useRef } from 'react'

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA'
let scriptPromise = null

function loadTurnstileScript() {
  if (typeof window !== 'undefined' && window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load the Turnstile script'))
    document.head.appendChild(script)
  })
  return scriptPromise
}

export default function TurnstileWidget({ onVerify, onExpire, onError, className = '' }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const callbacksRef = useRef({ onVerify, onExpire, onError })
  const isLocalTestMode =
    import.meta.env.VITE_TURNSTILE_SITE_KEY === TURNSTILE_TEST_SITE_KEY &&
    typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)

  useEffect(() => {
    callbacksRef.current = { onVerify, onExpire, onError }
  })

  useEffect(() => {
    let cancelled = false

    // Cloudflare's published test key is only for local development. It lets
    // the app be usable offline while the backend uses the matching test
    // secret; production site keys always render and verify normally.
    if (isLocalTestMode) {
      callbacksRef.current.onVerify?.('local-development-turnstile-token')
      return () => callbacksRef.current.onExpire?.()
    }

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
          callback: (token) => callbacksRef.current.onVerify?.(token),
          'expired-callback': () => callbacksRef.current.onExpire?.(),
          'error-callback': () => callbacksRef.current.onError?.(),
        })
      })
      .catch(() => callbacksRef.current.onError?.())

    return () => {
      cancelled = true
      if (widgetIdRef.current != null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, [isLocalTestMode])

  if (isLocalTestMode) {
    return <p className={`text-[12px] text-text-muted ${className}`}>Human verification ready for local development.</p>
  }

  return <div ref={containerRef} className={className} />
}
