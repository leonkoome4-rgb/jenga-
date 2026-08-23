import { Link } from 'react-router-dom'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none'

const variants = {
  primary: 'bg-orange text-white hover:opacity-90',
  secondary: 'bg-white border-[1.5px] border-navy text-navy hover:bg-navy/5',
  text: 'text-orange hover:opacity-80 px-0 py-0 rounded-none',
}

export default function Button({
  to,
  href,
  variant = 'primary',
  className = '',
  children,
  ...rest
}) {
  const classes = `${base} ${variants[variant]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  )
}
