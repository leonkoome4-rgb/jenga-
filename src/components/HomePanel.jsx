import MarketingContent from './MarketingContent.jsx'

export default function HomePanel() {
  return (
    <div className="h-full overflow-y-auto lg:rounded-2xl">
      <MarketingContent heroTopPadding="pt-[calc(env(safe-area-inset-top)+80px)]" />
    </div>
  )
}
