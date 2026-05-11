import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturedPropertiesServer } from "@/components/home/featured-properties-server"
import { ValueSection } from "@/components/home/value-section"
import { AppPromotion } from "@/components/home/app-promotion"
import { RecommendedSearches } from "@/components/home/recommended-searches"

// Forzar renderizado dinámico para evitar fetch durante build
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <HeroSection />
        <FeaturedPropertiesServer />
        <ValueSection />
        <AppPromotion />
        <RecommendedSearches />
      </main>

      <Footer />
    </div>
  )
}
