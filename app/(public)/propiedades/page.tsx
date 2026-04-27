"use client"

import { useState, useEffect } from "react"
import { Search, SlidersHorizontal, MapPin, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
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
import {
  listProperties,
  searchProperties,
  formatPrice,
  type Property,
  type ListPropertiesParams
} from "@/lib/properties-api"
import { getImageUrl } from "@/lib/utils"

const propertyTypes = [
  { value: "todas", label: "Todas" },
  { value: "casa", label: "Casas" },
  { value: "departamento", label: "Departamentos" },
  { value: "terreno", label: "Terrenos" },
  { value: "oficina", label: "Oficinas" },
  { value: "local", label: "Locales" },
]

const operationTypes = [
  { value: "todas", label: "Todas" },
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
]

const bedroomsOptions = [
  { value: "todas", label: "Todos" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "5", label: "5+" },
]

const currencies = [
  { value: "todas", label: "Todas" },
  { value: "USD", label: "USD" },
  { value: "BOB", label: "Bs" },
]

export default function PropiedadesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [useFullTextSearch, setUseFullTextSearch] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    operation: "todas",
    type: "todas",
    bedrooms: "todas",
    priceMin: "",
    priceMax: "",
    moneda: "todas",
    metrosMin: "",
    metrosMax: "",
    orderBy: "fecha",
    order: "desc",
  })

  // Cargar propiedades
  useEffect(() => {
    loadProperties()
  }, [page, filters, useFullTextSearch])

  async function loadProperties() {
    setLoading(true)
    try {
      let params: ListPropertiesParams = {
        page,
        limit: 12,
        order_by: filters.orderBy as any,
        order: filters.order as any,
      }

      // Agregar filtros si no son "todas"
      if (filters.operation !== "todas") {
        params.tipo_operacion = filters.operation
      }
      if (filters.type !== "todas") {
        params.tipo_propiedad = filters.type
      }
      if (filters.bedrooms !== "todas") {
        params.dormitorios = filters.bedrooms
      }
      if (filters.moneda !== "todas") {
        params.moneda = filters.moneda
      }
      if (filters.priceMin) {
        params.precio_min = parseFloat(filters.priceMin)
      }
      if (filters.priceMax) {
        params.precio_max = parseFloat(filters.priceMax)
      }
      if (filters.metrosMin) {
        params.metros_min = parseFloat(filters.metrosMin)
      }
      if (filters.metrosMax) {
        params.metros_max = parseFloat(filters.metrosMax)
      }

      // Usar búsqueda full-text si hay un término de búsqueda
      if (searchTerm.trim().length >= 2 && useFullTextSearch) {
        const searchResults = await searchProperties({
          q: searchTerm,
          page,
          limit: 12,
          ...(filters.operation !== "todas" && { tipo_operacion: filters.operation }),
          ...(filters.type !== "todas" && { tipo_propiedad: filters.type }),
          ...(filters.moneda !== "todas" && { moneda: filters.moneda }),
          ...(filters.priceMin && { precio_min: parseFloat(filters.priceMin) }),
          ...(filters.priceMax && { precio_max: parseFloat(filters.priceMax) }),
          ...(filters.metrosMin && { metros_min: parseFloat(filters.metrosMin) }),
          ...(filters.metrosMax && { metros_max: parseFloat(filters.metrosMax) }),
        })

        setProperties(searchResults.propiedades)
        setTotal(searchResults.total)
        setTotalPages(searchResults.total_pages)
      } else {
        // Búsqueda normal con filtros
        if (searchTerm.trim()) {
          params.search = searchTerm
        }

        const results = await listProperties(params)
        setProperties(results.propiedades)
        setTotal(results.total)
        setTotalPages(results.total_pages)
      }
    } catch (error) {
      console.error("Error loading properties:", error)
      // TODO: Mostrar error al usuario
    } finally {
      setLoading(false)
    }
  }

  // Manejar búsqueda
  const handleSearch = () => {
    setPage(1)
    setUseFullTextSearch(true)
    loadProperties()
  }

  // Manejar cambio de filtros
  const handleFilterChange = (key: string, value: string) => {
    setPage(1)
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Limpiar filtros
  const clearFilters = () => {
    setPage(1)
    setFilters({
      operation: "todas",
      type: "todas",
      bedrooms: "todas",
      priceMin: "",
      priceMax: "",
      moneda: "todas",
      metrosMin: "",
      metrosMax: "",
      orderBy: "fecha",
      order: "desc",
    })
    setSearchTerm("")
    setUseFullTextSearch(false)
  }

  // Cambiar página
  const changePage = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
                Encuentra la propiedad perfecta entre {total.toLocaleString()} opciones
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
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-12 pl-12 pr-4 text-lg"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
              {searchTerm && (
                <div className="mt-2 text-sm text-muted-foreground text-center">
                  {useFullTextSearch ? (
                    <span>🔍 Búsqueda full-text activa para "{searchTerm}"</span>
                  ) : (
                    <span className="text-yellow-600">⚠️ Presiona Enter para búsqueda avanzada</span>
                  )}
                </div>
              )}
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
                <Select value={filters.operation} onValueChange={(value) => handleFilterChange('operation', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Operación" />
                  </SelectTrigger>
                  <SelectContent>
                    {operationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Property Type */}
                <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
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

                {/* Bedrooms */}
                <Select value={filters.bedrooms} onValueChange={(value) => handleFilterChange('bedrooms', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Dormitorios" />
                  </SelectTrigger>
                  <SelectContent>
                    {bedroomsOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Currency */}
                <Select value={filters.moneda} onValueChange={(value) => handleFilterChange('moneda', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Price Range */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Mín $"
                    type="number"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  />
                  <Input
                    placeholder="Máx $"
                    type="number"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  />
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={clearFilters}
                >
                  Limpiar
                </Button>
              </div>
            </div>

            {/* Additional filters */}
            <div className={`mt-3 grid gap-3 ${showFilters ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-6" : "hidden lg:grid-cols-6"}`}>
              {/* Meters Range */}
              <div className="flex gap-2">
                <Input
                  placeholder="Mts mín"
                  type="number"
                  value={filters.metrosMin}
                  onChange={(e) => handleFilterChange('metrosMin', e.target.value)}
                />
                <Input
                  placeholder="Mts máx"
                  type="number"
                  value={filters.metrosMax}
                  onChange={(e) => handleFilterChange('metrosMax', e.target.value)}
                />
              </div>

              {/* Order By */}
              <Select value={filters.orderBy} onValueChange={(value) => handleFilterChange('orderBy', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fecha">Más recientes</SelectItem>
                  <SelectItem value="precio">Precio</SelectItem>
                  <SelectItem value="vistas">Más vistas</SelectItem>
                  <SelectItem value="metros">Metros</SelectItem>
                </SelectContent>
              </Select>

              {/* Order Direction */}
              <Select value={filters.order} onValueChange={(value) => handleFilterChange('order', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Dirección" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descendente</SelectItem>
                  <SelectItem value="asc">Ascendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">
                {loading ? (
                  "Cargando..."
                ) : (
                  `${total.toLocaleString()} ${total === 1 ? 'propiedad' : 'propiedades'} encontradas`
                )}
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      id={property.id.toString()}
                      title={property.titulo}
                      location={`${property.zona}, ${property.direccion}`}
                      price={formatPrice(property)}
                      operationType={property.tipo_operacion as any}
                      bedrooms={property.dormitorios}
                      bathrooms={property.banos}
                      area={`${property.metros_edificados}m²`}
                      image={
                        property.property_images && property.property_images.length > 0
                          ? getImageUrl(property.property_images.find(img => img.principal)?.image_url || property.property_images[0].image_url) || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"
                          : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"
                      }
                      publishedDate={new Date(property.created_at).toLocaleDateString('es-BO')}
                      featured={property.destacado}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => changePage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (page <= 3) {
                          pageNum = i + 1
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = page - 2 + i
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => changePage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => changePage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {properties.length === 0 && (
                  <div className="text-center py-16">
                    <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No se encontraron propiedades</h3>
                    <p className="text-muted-foreground mb-4">
                      Intenta ajustar tus filtros de búsqueda
                    </p>
                    <Button onClick={clearFilters}>
                      Limpiar filtros
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
