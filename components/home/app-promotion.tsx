import { Bell, Filter, MessageSquare, Heart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Bell,
    title: "Notificaciones en tiempo real",
    description: "Recibí notificaciones a medida que aparezcan nuevas oportunidades.",
  },
  {
    icon: Filter,
    title: "Filtros precisos",
    description: "Filtrá de la manera más precisa y encontrá tu casa más fácil.",
  },
  {
    icon: MessageSquare,
    title: "Consultas directas",
    description: "Consultá directamente desde la app con respuestas en tiempo real.",
  },
  {
    icon: Heart,
    title: "Guardados y alertas",
    description: "Guardá tus favoritos y recibí notificaciones si bajan de precio.",
  },
]

export function AppPromotion() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary/5 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
                ¡Encontrá tu casa con la app de 365SOFT!
              </h2>
              <p className="text-xl text-muted-foreground">
                Tu nuevo hogar a una descarga de distancia
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex shrink-0">
                    <div className="inline-flex p-2 rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Store buttons */}
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <div className="flex flex-col items-start">
                  <span className="text-xs">Descargar en</span>
                  <span className="text-sm font-semibold leading-none">App Store</span>
                </div>
              </Button>

              <Button size="lg" variant="outline" className="gap-2">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                </svg>
                <div className="flex flex-col items-start">
                  <span className="text-xs">Disponible en</span>
                  <span className="text-sm font-semibold leading-none">Google Play</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative flex justify-center">
            <div className="relative">
              {/* Phone frame */}
              <div className="mx-auto w-64 h-[500px] bg-gradient-to-br from-primary/20 to-primary/5 rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden relative">
                {/* Phone notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl" />

                {/* Screen content */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background p-4 pt-10">
                  <div className="space-y-3">
                    {/* App header */}
                    <div className="text-center mb-4">
                      <div className="text-lg font-bold text-primary">365SOFT</div>
                      <div className="text-xs text-muted-foreground">Encuentra tu hogar</div>
                    </div>

                    {/* Property cards */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2 shadow-sm">
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 rounded mb-2" />
                        <div className="h-2 bg-foreground/20 rounded w-3/4 mb-1" />
                        <div className="h-2 bg-foreground/10 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
