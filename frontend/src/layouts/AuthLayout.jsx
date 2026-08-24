import Logo from '../components/Logo.jsx'

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo size="large" />
        </div>

        <div className="rounded-2xl border border-border bg-white px-6 py-8 sm:px-8">
          <h1 className="font-heading text-center text-[22px] font-bold text-navy">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-center text-[14px] text-text-secondary">{subtitle}</p>
          )}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
