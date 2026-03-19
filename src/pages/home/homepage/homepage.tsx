import { FinalCtaSection } from './components/final-cta-section'
import { HowItWorksSection } from './components/how-it-works-section'
import { PartnerCoopsSection } from './components/partner-coops-section'
import { PopularRoutesSection } from './components/popular-routes-section'
import { HeroSection } from './hero-section'

export function HomePage() {
  return (
    <div className="w-full">
      <HeroSection />
      <PopularRoutesSection />
      <HowItWorksSection />
      <PartnerCoopsSection />
      <FinalCtaSection />
    </div>
  )
}
