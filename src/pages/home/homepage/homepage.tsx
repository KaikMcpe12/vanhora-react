import { HomeFeedSection } from './components/home-feed-section'
import { HowItWorksSection } from './components/how-it-works-section'
import { PartnerCoopsSection } from './components/partner-coops-section'
import { PopularRoutesSection } from './components/popular-routes-section'
import { HeroSection } from './hero-section'

export function HomePage() {
  return (
    <div className="w-full">
      <HeroSection />
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-10">
        <HomeFeedSection />
        <PopularRoutesSection />
        <PartnerCoopsSection />
        <HowItWorksSection />
      </div>
    </div>
  )
}
