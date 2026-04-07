"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, MapPin, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PropertyCard } from "@/components/home/property-card"

// Datos de ejemplo
const allProperties = [
  {
    id: "1",
    title: "Residencia de Lujo en Urubó",
    location: "Santa Cruz, Zona Urubó",
    price: "$450,000",
    operationType: "venta" as const,
    bedrooms: 4,
    bathrooms: 3,
    area: "350m²",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    publishedDate: "2 días",
    featured: true,
  },
  {
    id: "2",
    title: "Departamento Moderno",
    location: "La Paz, Achumani",
    price: "$1,200/mes",
    operationType: "alquiler" as const,
    bedrooms: 2,
    bathrooms: 2,
    area: "120m²",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    publishedDate: "1 semana",
  },
  {
    id: "3",
    title: "Casa Familiar",
    location: "Cochabamba, Cala Cala",
    price: "Bs 8,000 Anticrético",
    operationType: "anticretico" as const,
    bedrooms: 3,
    bathrooms: 2,
    area: "200m²",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
    publishedDate: "3 días",
    featured: true,
  },
  {
    id: "4",
    title: "Penthouse con Vista",
    location: "Santa Cruz, Equipetrol",
    price: "$280,000",
    operationType: "venta" as const,
    bedrooms: 3,
    bathrooms: 2,
    area: "180m²",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    publishedDate: "5 días",
  },
  {
    id: "5",
    title: "Loft Industrial",
    location: "La Paz, Sopocachi",
    price: "$850/mes",
    operationType: "alquiler" as const,
    bedrooms: 1,
    bathrooms: 1,
    area: "85m²",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    publishedDate: "1 día",
  },
  {
    id: "6",
    title: "Casa con Jardín",
    location: "Cochabamba, Cota Cota",
    price: "$195,000",
    operationType: "venta" as const,
    bedrooms: 4,
    bathrooms: 3,
    area: "280m²",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
    publishedDate: "4 días",
  },
  {
    id: "7",
    title: "Departamento en el Centro",
    location: "Santa Cruz, Centro",
    price: "$650/mes",
    operationType: "alquiler" as const,
    bedrooms: 2,
    bathrooms: 1,
    area: "90m²",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    publishedDate: "6 días",
  },
  {
    id: "8",
    title: "Villa de Lujo",
    location: "Santa Cruz, San Martín",
    price: "$750,000",
    operationType: "venta" as const,
    bedrooms: 5,
    bathrooms: 4,
    area: "450m²",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop",
    publishedDate: "1 semana",
    featured: true,
  },
]

const propertyTypes = [
  { value: "todas", label: "Todas" },
  { value: "casas", label: "Casas" },
  { value: "departamentos", label: "Departamentos" },
  { value: "terrenos", label: "Terrenos" },
  { value: "oficinas", label: "Oficinas" },
  { value: "locales", label: "Locales" },
]

const cities = [
  { value: "todas", label: "Todas las ciudades" },
  { value: "santa-cruz", label: "Santa Cruz" },
  { value: "la-paz", label: "La Paz" },
  { value: "cochabamba", label: "Cochabamba" },
  { value: "el-alto", label: "El Alto" },
]

export default function PropiedadesPage() {
  const [filters, setFilters] = useState({
    operation: "todas",
    type: "todas",
    city: "todas",
    bedrooms: "todas",
    priceMin: "",
    priceMax: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Filtrar propiedades
  const filteredProperties = allProperties.filter((property) => {
    if (filters.operation !== "todas" && property.operationType !== filters.operation) return false
    if (searchTerm && !property.location.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !property.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
                Propiedades en Bolivia
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Encuentra la propiedad perfecta entre más de 20,000 opciones
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar por zona, calle o referencia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 pl-12 pr-4 text-lg"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
              </Button>

              <div className={`flex-1 grid gap-3 ${showFilters ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-6" : "hidden lg:grid-cols-6"}`}>
                {/* Operation Type */}
                <Select value={filters.operation} onValueChange={(value) => setFilters({ ...filters, operation: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Operación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="venta">Venta</SelectItem>
                    <SelectItem value="alquiler">Alquiler</SelectItem>
                    <SelectItem value="anticretico">Anticrético</SelectItem>
                  </SelectContent>
                </Select>

                {/* Property Type */}
                <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* City */}
                <Select value={filters.city} onValueChange={(value) => setFilters({ ...filters, city: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Bedrooms */}
                <Select value={filters.bedrooms} onValueChange={(value) => setFilters({ ...filters, bedrooms: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Dormitorios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todos</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>

                {/* Price Range */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Mín"
                    value={filters.priceMin}
                    onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                  />
                  <Input
                    placeholder="Máx"
                    value={filters.priceMax}
                    onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                  />
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={() => setFilters({
                    operation: "todas",
                    type: "todas",
                    city: "todas",
                    bedrooms: "todas",
                    priceMin: "",
                    priceMax: "",
                  })}
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">
                {filteredProperties.length} propiedades encontradas
              </h2>

              <Select defaultValue="relevantes">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevantes">Más relevantes</SelectItem>
                  <SelectItem value="recientes">Más recientes</SelectItem>
                  <SelectItem value="precio-asc">Precio: menor a mayor</SelectItem>
                  <SelectItem value="precio-desc">Precio: mayor a menor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <div className="text-center py-16">
                <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No se encontraron propiedades</h3>
                <p className="text-muted-foreground mb-4">
                  Intenta ajustar tus filtros de búsqueda
                </p>
                <Button onClick={() => setFilters({
                  operation: "todas",
                  type: "todas",
                  city: "todas",
                  bedrooms: "todas",
                  priceMin: "",
                  priceMax: "",
                })}>
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
