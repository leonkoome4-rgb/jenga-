import WaveDivider from './WaveDivider.jsx'

export default function GradientHero({ children, className = '', waveFill = '#FAFAFA' }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: 'linear-gradient(180deg, #FDEEE4 0%, #F6B89F 100%)' }}
    >
      {children}
      <WaveDivider fill={waveFill} />
    </div>
  )
}
