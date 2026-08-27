import { useEffect, useRef } from 'react'

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
let scriptPromise = null

function loadGoogleScript() {
  if (typeof window !== 'undefined' && window.google?.accounts?.id) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Sign-In'))
    document.head.appendChild(script)
  })
  return scriptPromise
}

export default function GoogleSignInButton({ onCredential, className = '' }) {
  const containerRef = useRef(null)
  const callbackRef = useRef(onCredential)
  callbackRef.current = onCredential

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!clientId) return undefined
    let cancelled = false

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google?.accounts?.id) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => callbackRef.current?.(response.credential),
        })
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
        })
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [clientId])

  if (!clientId) return null

  return <div ref={containerRef} className={className} />
}
