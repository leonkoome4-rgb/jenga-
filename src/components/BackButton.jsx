import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ fallback = '/', floating = false, className = '' }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallback)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back"
      className={
        floating
          ? `flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy shadow-sm backdrop-blur-sm ${className}`
          : `flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-navy/5 ${className}`
      }
    >
      <ArrowLeft size={19} strokeWidth={1.75} />
    </button>
  )
}
