export default function WaveDivider({ fill = '#FAFAFA', className = '' }) {
  return (
    <svg
      viewBox="0 0 1440 110"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`absolute inset-x-0 bottom-0 block h-16 w-full sm:h-20 ${className}`}
    >
      <path
        d="M0,45 C220,100 420,0 720,35 C1020,70 1240,15 1440,55 L1440,110 L0,110 Z"
        fill={fill}
      />
    </svg>
  )
}
