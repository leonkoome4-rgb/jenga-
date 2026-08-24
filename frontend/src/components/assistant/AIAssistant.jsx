import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { X, Send, ArrowUpRight } from 'lucide-react'
import { api } from '../../api/client.js'
import { selectAuthToken, selectIsAuthenticated } from '../../features/auth/authSlice.js'
import Button from '../Button.jsx'
import DogMascot from './DogMascot.jsx'

const WELCOME = {
  role: 'assistant',
  content:
    "Woof! I'm the Tawi mascot. Ask me anything, or tell me where you want to go — try \"take me to the feed\" or \"open AI Hub\".",
}

const HISTORY_TURNS = 8

export default function AIAssistant() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = useSelector(selectAuthToken)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [open, setOpen] = useState(false)
  const [poked, setPoked] = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  const handlePoke = () => {
    setOpen((v) => !v)
    setPoked(true)
    setTimeout(() => setPoked(false), 400)
  }

  // The immersive video feed has its own full-bleed engagement rail
  // (like/tip/share) pinned bottom-right, so the assistant moves to the
  // top-right there instead -- the top tabs on that page are centered, so
  // that corner is always clear.
  const isImmersiveFeed = location.pathname === '/discover'
  const buttonPositionClasses = isImmersiveFeed
    ? 'right-5 top-[calc(env(safe-area-inset-top)_+_18px)]'
    : 'right-5 bottom-[calc(env(safe-area-inset-bottom)_+_84px)] lg:bottom-6'
  const panelPositionClasses = isImmersiveFeed
    ? 'top-[calc(env(safe-area-inset-top)_+_80px)]'
    : 'bottom-[calc(env(safe-area-inset-bottom)_+_150px)] lg:bottom-24'

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const handleSend = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const history = nextMessages.slice(-HISTORY_TURNS).map(({ role, content }) => ({
        role,
        content,
      }))
      const data = await api.post('/api/ai/chat', { message: text, history }, { token })
      const { reply, navigate_to: navigateTo } = data.result
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      if (navigateTo && navigateTo !== location.pathname) {
        navigate(navigateTo)
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err.data?.error || "Sorry, I couldn't reach the AI right now.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handlePoke}
        aria-label={open ? 'Close Tawi assistant' : 'Open Tawi assistant'}
        className={`fixed z-40 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-border transition-transform hover:scale-105 ${buttonPositionClasses}`}
      >
        <DogMascot className="h-[52px] w-[52px]" poked={poked} />
        {open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-navy text-white">
            <X size={11} strokeWidth={2.5} />
          </span>
        )}
      </button>

      {open && (
        <div
          className={`fixed inset-x-4 z-40 flex max-h-[65vh] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl sm:inset-x-auto sm:right-5 sm:w-96 ${panelPositionClasses}`}
        >
          <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
            <DogMascot className="h-9 w-9 shrink-0" animated={false} />
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-navy">Tawi mascot</p>
              <p className="text-[11px] text-text-muted">Ask anything, or ask to go somewhere</p>
            </div>
            {isAuthenticated && (
              <Link
                to="/ai-hub"
                onClick={() => setOpen(false)}
                className="ml-auto flex shrink-0 items-center gap-1 text-[11px] font-medium text-orange"
              >
                AI Hub
                <ArrowUpRight size={12} strokeWidth={2} />
              </Link>
            )}
          </div>

          {!isAuthenticated ? (
            <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <p className="text-[13px] leading-relaxed text-text-secondary">
                Log in to chat with the assistant and get answers personalized to your account.
              </p>
              <div className="flex gap-2">
                <Button to="/login" variant="primary" className="px-4 py-2 text-[13px]">
                  Log in
                </Button>
                <Button to="/register" variant="secondary" className="px-4 py-2 text-[13px]">
                  Create account
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                        m.role === 'user'
                          ? 'rounded-br-sm bg-orange text-white'
                          : 'rounded-bl-sm bg-bg text-navy'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm bg-bg px-3.5 py-2 text-[13px] text-text-muted">
                      Thinking…
                    </div>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 border-t border-border p-3"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message the assistant…"
                  className="min-w-0 flex-1 rounded-full border border-border bg-bg px-3.5 py-2 text-[13px] text-navy placeholder:text-text-muted focus:outline-none focus:border-orange"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  aria-label="Send"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange text-white disabled:opacity-40"
                >
                  <Send size={15} strokeWidth={2} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}
