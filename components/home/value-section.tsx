import { Home, Search, BarChart3 } from "lucide-react"

const features = [
  {
    icon: Home,
    title: "Todas las propiedades",
    description: "Con más de 20,000 propiedades publicadas, alcanzamos el 97% de la oferta inmobiliaria del país.",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
  },
  {
    icon: Search,
    title: "Búsqueda exacta",
    description: "Nuestros filtros te permiten encontrar la propiedad que estás buscando en el menor tiempo posible.",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/20",
  },
  {
    icon: BarChart3,
    title: "Big Data",
    description: "Diseñamos herramientas para que puedas tomar las mejores decisiones basadas en datos.",
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
  },
]

export function ValueSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Mirá como 365SOFT te puede ayudar
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            La mejor plataforma para encontrar tu propiedad ideal
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-lg hover:shadow-xl transition-all"
            >
              <div className={`inline-flex p-4 rounded-xl ${feature.bgColor} mb-6`}>
                <feature.icon className={`h-8 w-8 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
