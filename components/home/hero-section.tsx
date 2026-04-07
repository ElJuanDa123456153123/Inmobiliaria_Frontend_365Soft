"use client"

import { useState } from "react"
import { Search, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const propertyTypes = [
  { value: "todas", label: "Todas las propiedades" },
  { value: "casas", label: "Casas" },
  { value: "departamentos", label: "Departamentos" },
  { value: "terrenos", label: "Terrenos" },
  { value: "oficinas", label: "Oficinas" },
  { value: "locales", label: "Locales Comerciales" },
  { value: "galpones", label: "Galpones" },
]

const operationTypes = [
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
  { value: "anticretico", label: "Anticrético" },
]

const cities = [
  { value: "santa-cruz", label: "Santa Cruz" },
  { value: "la-paz", label: "La Paz" },
  { value: "cochabamba", label: "Cochabamba" },
  { value: "el-alto", label: "El Alto" },
  { value: "sucre", label: "Sucre" },
  { value: "oruro", label: "Oruro" },
]

export function HeroSection() {
  const [propertyType, setPropertyType] = useState("todas")
  const [operationType, setOperationType] = useState("venta")
  const [city, setCity] = useState("santa-cruz")
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = () => {
    console.log({ propertyType, operationType, city, searchTerm })
    // TODO: Implementar lógica de búsqueda
  }

  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Alquiler y venta de
            <span className="block text-primary mt-2">
              departamentos y casas
            </span>
            <span className="block text-2xl sm:text-3xl md:text-4xl mt-4 text-muted-foreground">
              en Bolivia
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Encuentra la propiedad perfecta entre más de 20,000 propiedades publicadas.
            El portal inmobiliario más completo del país.
          </p>
        </div>

        {/* Search Box */}
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="rounded-2xl bg-white/80 dark:bg-gray-900/80 p-6 shadow-xl backdrop-blur-sm border border-border/50">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Tipo de Operación */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Operación
                </label>
                <Select value={operationType} onValueChange={setOperationType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tipo de operación" />
                  </SelectTrigger>
                  <SelectContent>
                    {operationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Propiedad */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tipo de Propiedad
                </label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tipo de propiedad" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ciudad */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Ubicación
                </label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="w-full">
                    <MapPin className="mr-2 h-4 w-4" />
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
              </div>

              {/* Búsqueda */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Buscar
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Zona, calle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={handleSearch}
                    className="shrink-0"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Búsqueda rápida */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-3">
                Búsquedas populares:
              </p>
              <div className="flex flex-wrap gap-2">
                {["Norte", "Achumani", "Urubó", "Equipetrol"].map((zone) => (
                  <Button
                    key={zone}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm(zone)}
                    className="text-xs"
                  >
                    {zone}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
