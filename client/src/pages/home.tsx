import { Header } from "@/components/booking/header"
import { HeroSection } from "@/components/booking/hero-section"
import { OffersSection } from "@/components/booking/offers-section"
import { PropertyTypesSection } from "@/components/booking/property-types-section"
import { TrendingDestinationsSection } from "@/components/booking/trending-destinations-section"
import { Footer } from "@/components/booking/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <OffersSection />
      <PropertyTypesSection />
      <TrendingDestinationsSection />
      <Footer />
    </div>
  )
}
