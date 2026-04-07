"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, Building2, Home, Calendar, TrendingUp, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"

const projects = [
  {
    id: "1",
    name: "Torres del Urubó",
    developer: "Constructora Boliviana",
    city: "Santa Cruz",
    location: "Zona Urubó",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
    type: "Residencial",
    status: "En construcción",
    units: 120,
    priceFrom: "$180,000",
    deliveryDate: "Diciembre 2025",
    featured: true,
    amenities: ["Piscina", "Gimnasio", "Área infantil", "Seguridad 24h", "Estacionamiento"],
    description: "Exclusivo complejo residencial de lujo en una de las zonas más privilegiadas de Santa Cruz. Departamentos modernos con acabados de primera calidad y vistas panorámicas.",
  },
  {
    id: "2",
    name: "Residencial Equipetrol Norte",
    developer: "Inmobiliaria Elite",
    city: "Santa Cruz",
    location: "Equipetrol",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
    type: "Residencial",
    status: "En venta",
    units: 45,
    priceFrom: "$250,000",
    deliveryDate: "Inmediato",
    featured: true,
    amenities: ["Piscina", "Gimnasio", "Jardines", "Seguridad 24h"],
    description: "Hermosas casas en condominio cerrado en Equipetrol. Seguridad, tranquilidad y excelentes acabados.",
  },
  {
    id: "3",
    name: "Oficinas Calacoto",
    developer: "Bienes Raíces La Paz",
    city: "La Paz",
    location: "Calacoto",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    type: "Comercial",
    status: "En preventa",
    units: 30,
    priceFrom: "$95,000",
    deliveryDate: "Marzo 2026",
    featured: false,
    amenities: ["Auditorio", "Coworking", "Cafetería", "Estacionamiento"],
    description: "Moderno edificio de oficinas con espacios versátiles y tecnología de punta. Ideal para empresas que buscan prestigio y comodidad.",
  },
  {
    id: "4",
    name: "Departamentos Achumani",
    developer: "Constructora Andina",
    city: "La Paz",
    location: "Achumani",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    type: "Residencial",
    status: "En construcción",
    units: 60,
    priceFrom: "$135,000",
    deliveryDate: "Junio 2025",
    featured: false,
    amenities: ["Gimnasio", "Sauna", "Área verde", "Estacionamiento"],
    description: "Departamentos modernos con vistas impresionantes a la montaña. Diseño contemporáneo y ubicación privilegiada.",
  },
  {
    id: "5",
    name: "Residencial Cala Cala",
    developer: "Inmobiliaria del Valle",
    city: "Cochabamba",
    location: "Cala Cala",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    type: "Residencial",
    status: "En venta",
    units: 25,
    priceFrom: "$165,000",
    deliveryDate: "Inmediato",
    featured: true,
    amenities: ["Piscina", "Quincho", "Jardines", "Seguridad"],
    description: "Casas en una de las zonas más exclusivas de Cochabamba. Calidad de vida y excelente ubicación.",
  },
  {
    id: "6",
    name: "Centro Comercial Norte",
    developer: "Grupo Inversionista",
    city: "Santa Cruz",
    location: "Norte",
    image: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=800&h=600&fit=crop",
    type: "Comercial",
    status: "En preventa",
    units: 80,
    priceFrom: "$65,000",
    deliveryDate: "Septiembre 2025",
    featured: false,
    amenities: ["Escaleras mecánicas", "Ascensores", "Estacionamiento", "Seguridad"],
    description: "Local comerciales en moderno centro comercial. Alta fluencia de personas y excelente ubicación.",
  },
]

export default function ProyectosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
                Proyectos Inmobiliarios
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Encuentra tu futuro hogar en los mejores desarrollos de Bolivia
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-card rounded-lg p-6 text-center border border-border">
                <Building2 className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold">{projects.length}</div>
                <div className="text-sm text-muted-foreground">Proyectos</div>
              </div>
              <div className="bg-card rounded-lg p-6 text-center border border-border">
                <Home className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold">
                  {projects.reduce((acc, p) => acc + p.units, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Unidades</div>
              </div>
              <div className="bg-card rounded-lg p-6 text-center border border-border">
                <TrendingUp className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold">
                  {projects.filter(p => p.status === "En preventa").length}
                </div>
                <div className="text-sm text-muted-foreground">En Preventa</div>
              </div>
              <div className="bg-card rounded-lg p-6 text-center border border-border">
                <Calendar className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold">2025</div>
                <div className="text-sm text-muted-foreground">Entregas</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Proyectos Destacados</h2>
              <Button variant="outline">Ver todos</Button>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    {project.featured && (
                      <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                        Destacado
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 px-3 py-1 rounded-full text-sm font-medium">
                      {project.type}
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                    <div className="flex items-center gap-1 text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{project.location}, {project.city}</span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estado:</span>
                        <span className="font-medium">{project.status}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Unidades:</span>
                        <span className="font-medium">{project.units}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Desde:</span>
                        <span className="font-bold text-primary">{project.priceFrom}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Entrega:</span>
                        <span className="font-medium">{project.deliveryDate}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                          <Check className="h-3 w-3 text-primary" />
                          {amenity}
                        </span>
                      ))}
                      {project.amenities.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{project.amenities.length - 3} más
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" asChild>
                        <Link href={`/proyectos/${project.id}`}>
                          Ver detalles
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </Button>
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
              ¿Eres un desarrollador inmobiliario?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Publica tus proyectos y llega a miles de potenciales compradores
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg">
                Publicar proyecto
              </Button>
              <Button size="lg" variant="outline">
                Conocer más
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
