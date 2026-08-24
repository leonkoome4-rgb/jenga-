import { Compass } from 'lucide-react'
import Button from '../components/Button.jsx'
import Logo from '../components/Logo.jsx'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <Logo size="large" className="mb-2" />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange/10">
        <Compass size={26} strokeWidth={1.75} className="text-orange" />
      </div>
      <h1 className="font-heading text-[22px] font-bold text-navy">Page not found</h1>
      <p className="max-w-sm text-[14px] leading-relaxed text-text-secondary">
        This page branched off somewhere we can't find. Let's get you back to something real.
      </p>
      <div className="mt-2 flex gap-3">
        <Button to="/discover" variant="primary">
          Go to feed
        </Button>
        <Button to="/" variant="secondary">
          Home
        </Button>
      </div>
    </div>
  )
}
