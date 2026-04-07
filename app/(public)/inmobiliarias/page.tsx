import Image from "next/image"
import Link from "next/link"
import { MapPin, Phone, Mail, Building2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"

const inmobiliarias = [
  {
    id: "1",
    name: "365 Inmobiliaria",
    logo: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=200&fit=crop",
    city: "Santa Cruz",
    address: "Calle René Moreno #123, Centro",
    phone: "+591 777 12345",
    email: "info@365inmobiliaria.bo",
    properties: 150,
    rating: 4.8,
    reviews: 234,
    verified: true,
  },
  {
    id: "2",
    name: "Casa Express",
    logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop",
    city: "La Paz",
    address: "Av. Mariscal Santa Cruz #456, Edificio Centro",
    phone: "+591 777 67890",
    email: "contacto@casaexpress.bo",
    properties: 89,
    rating: 4.6,
    reviews: 156,
    verified: true,
  },
  {
    id: "3",
    name: "Inmobiliaria del Valle",
    logo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=200&fit=crop",
    city: "Cochabamba",
    address: "Calle España #789, Cala Cala",
    phone: "+591 777 11111",
    email: "ventas@inmobiliariadelvalle.bo",
    properties: 67,
    rating: 4.7,
    reviews: 89,
    verified: true,
  },
  {
    id: "4",
    name: "Propiedades Elite",
    logo: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=200&h=200&fit=crop",
    city: "Santa Cruz",
    address: "Av. San Martín #321, Equipetrol",
    phone: "+591 777 22222",
    email: "info@propiedadeselite.bo",
    properties: 203,
    rating: 4.9,
    reviews: 412,
    verified: true,
  },
  {
    id: "5",
    name: "Bienes Raíces Bolivia",
    logo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop",
    city: "El Alto",
    address: "Av. 6 de Marzo #654, Zona Ceja",
    phone: "+591 777 33333",
    email: "contacto@brbolivia.bo",
    properties: 45,
    rating: 4.5,
    reviews: 67,
    verified: false,
  },
  {
    id: "6",
    name: "Inmobiliaria del Sur",
    logo: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=200&h=200&fit=crop",
    city: "Sucre",
    address: "Calle Bolívar #987, Centro",
    phone: "+591 777 44444",
    email: "info@inmobiliariadelsur.bo",
    properties: 38,
    rating: 4.4,
    reviews: 52,
    verified: true,
  },
]

export default function InmobiliariasPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
                Directorio de Inmobiliarias
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Encuentra agencias inmobiliarias confiables en todo Bolivia
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="bg-card rounded-lg p-6 text-center border border-border">
                <div className="text-3xl font-bold text-primary">{inmobiliarias.length}</div>
                <div className="text-sm text-muted-foreground">Inmobiliarias</div>
              </div>
              <div className="bg-card rounded-lg p-6 text-center border border-border">
                <div className="text-3xl font-bold text-primary">592</div>
                <div className="text-sm text-muted-foreground">Propiedades</div>
              </div>
              <div className="bg-card rounded-lg p-6 text-center border border-border">
                <div className="text-3xl font-bold text-primary">4.7</div>
                <div className="text-sm text-muted-foreground">Calificación promedio</div>
              </div>
              <div className="bg-card rounded-lg p-6 text-center border border-border">
                <div className="text-3xl font-bold text-primary">1,010</div>
                <div className="text-sm text-muted-foreground">Reseñas</div>
              </div>
            </div>
          </div>
        </section>

        {/* Inmobiliarias List */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8">
              {inmobiliarias.length} inmobiliarias encontradas
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {inmobiliarias.map((inmobiliaria) => (
                <Card key={inmobiliaria.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Logo */}
                      <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={inmobiliaria.logo}
                          alt={inmobiliaria.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg truncate">
                                {inmobiliaria.name}
                              </h3>
                              {inmobiliaria.verified && (
                                <div className="flex items-center gap-1 text-primary">
                                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                  </svg>
                                  <span className="text-xs font-medium">Verificada</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{inmobiliaria.city}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span className="truncate">{inmobiliaria.address}</span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{inmobiliaria.rating}</span>
                            <span className="text-muted-foreground">({inmobiliaria.reviews} reseñas)</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {inmobiliaria.properties} propiedades
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/inmobiliarias/${inmobiliaria.id}`}>
                              Ver perfil
                            </Link>
                          </Button>
                          <Button size="sm" className="gap-1">
                            <Phone className="h-3 w-3" />
                            Contactar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-muted/50 py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              ¿Eres una inmobiliaria?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Únete a nuestra red y llega a miles de clientes potenciales en todo Bolivia
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg">
                Registrarse gratis
              </Button>
              <Button size="lg" variant="outline">
                Conocer beneficios
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
