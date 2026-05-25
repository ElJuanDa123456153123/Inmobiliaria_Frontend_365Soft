"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { Search, SlidersHorizontal, MapPin, ChevronLeft, ChevronRight, Loader2, Map as MapIcon, List as ListIcon, Columns, Bell } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SaveSearchModal } from "@/components/ui/save-search-modal"
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
import dynamic from "next/dynamic"

// Cargar el mapa dinámicamente para evitar errores de SSR con Leaflet
const PropertySearchMap = dynamic(
  () => import("@/components/mapa/PropertySearchMap"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
)

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
  { value: "anticretico", label: "Anticrético" },
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

type ViewMode = 'list' | 'map' | 'split'

function PropiedadesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [properties, setProperties] = useState<Property[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "")
  const [useFullTextSearch, setUseFullTextSearch] = useState(!!searchParams.get('search'))
  const [showFilters, setShowFilters] = useState(false)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const [filters, setFilters] = useState({
    operation: searchParams.get('operation') || "todas",
    type: searchParams.get('type') || "todas",
    zona: searchParams.get('zona') || "",
    bedrooms: "todas",
    priceMin: "",
    priceMax: "",
    moneda: "todas",
    metrosMin: "",
    metrosMax: "",
    orderBy: "fecha",
    order: "desc",
  })

  // Sincronizar filtros desde la URL cuando cambia
  useEffect(() => {
    const operation = searchParams.get('operation')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const zona = searchParams.get('zona')

    if (operation || type || search || zona) {
      setFilters(prev => ({
        ...prev,
        operation: operation || prev.operation,
        type: type || prev.type,
        zona: zona || prev.zona,
      }))
      if (search) {
        setSearchTerm(search)
        setUseFullTextSearch(true)
      } else if (zona) {
        // Si hay zona pero no búsqueda, podemos poner la zona en el input para que el usuario la vea
        setSearchTerm(zona)
      }
      setPage(1)
    }
  }, [searchParams])

  // Ajustar viewMode según el tamaño de la pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && viewMode === 'split') {
        setViewMode('list')
      }
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [viewMode])

  // Coordenadas de ciudades para centrar el mapa
  const mapCenter = useMemo((): [number, number] | undefined => {
    if (!filters.zona) return undefined

    const cityCoords: Record<string, [number, number]> = {
      'Santa Cruz': [-17.7833, -63.1821],
      'La Paz': [-16.4897, -68.1193],
      'Cochabamba': [-17.3895, -66.1568],
      'El Alto': [-16.5000, -68.1833],
      'Sucre': [-19.0333, -65.2627],
      'Oruro': [-17.9833, -67.1500],
      'Tarija': [-21.5354, -64.7296],
      'Potosí': [-19.5833, -65.7500],
      'Beni': [-14.8333, -64.9000],
      'Pando': [-11.0167, -68.7667],
    }

    // Buscar coincidencia exacta o parcial
    const foundCity = Object.keys(cityCoords).find(city => 
      filters.zona.toLowerCase().includes(city.toLowerCase())
    )

    return foundCity ? cityCoords[foundCity] : undefined
  }, [filters.zona])

  // Cargar propiedades
  useEffect(() => {
    loadProperties()
  }, [page, filters, useFullTextSearch])

  async function loadProperties() {
    setLoading(true)
    try {
      // Para el modo mapa/split, podríamos querer cargar más resultados
      const limit = viewMode === 'list' ? 12 : 24

      let params: ListPropertiesParams = {
        page,
        limit,
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
      if (filters.zona) {
        params.zona = filters.zona
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

      // Hack: Si buscan la ciudad principal, usamos la búsqueda normal (listProperties)
      // porque la base de datos no tiene la ciudad en los campos de texto
      const lowerSearch = searchTerm.trim().toLowerCase();
      const isCitySearchOnly = lowerSearch === "santa cruz" || lowerSearch === "santa cruz de la sierra";

      // Usar búsqueda full-text si hay un término de búsqueda específico
      if (searchTerm.trim().length >= 2 && useFullTextSearch && !isCitySearchOnly) {
        const searchResults = await searchProperties({
          q: searchTerm,
          page,
          limit,
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
      zona: "",
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
    if (viewMode !== 'split') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Header />

      {/* Toolbar / Filters Area */}
      <div className="flex-none border-b border-border bg-card z-20">
        <div className="mx-auto max-w-[1600px] px-4 py-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="flex flex-col gap-1 w-full md:w-80">
              <span className="text-xs text-muted-foreground ml-1">Ubicación</span>
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Ciudad, zona o barrio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9 h-10 bg-muted/50"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Main Filters */}
            <div className="flex flex-wrap items-end gap-2 w-full md:w-auto mt-2 md:mt-0">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground ml-1">Operación</span>
                <Select value={filters.operation} onValueChange={(v) => handleFilterChange('operation', v)}>
                  <SelectTrigger className="w-[120px] h-10">
                    <SelectValue placeholder="Operación" />
                  </SelectTrigger>
                  <SelectContent>
                    {operationTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground ml-1">Tipo de Propiedad</span>
                <Select value={filters.type} onValueChange={(v) => handleFilterChange('type', v)}>
                  <SelectTrigger className="w-[130px] h-10">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="hidden sm:flex gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground ml-1">Moneda</span>
                  <Select value={filters.moneda} onValueChange={(v) => handleFilterChange('moneda', v)}>
                    <SelectTrigger className="w-[100px] h-10">
                      <SelectValue placeholder="Moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground ml-1">Precio máx</span>
                  <Input
                    placeholder="Precio máx"
                    type="number"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    className="w-28 h-10"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-10 w-10 ${showFilters ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const token = localStorage.getItem("token")
                  if (!token) {
                    alert("Debes iniciar sesión para poder guardar búsquedas.")
                    return
                  }
                  setIsSaveModalOpen(true)
                }}
                className="h-10 border-primary text-primary hover:bg-primary/5 flex items-center gap-2 px-3"
              >
                <Bell className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline font-semibold">Guardar búsqueda</span>
              </Button>

              <div className="flex-1" />

              {/* View Mode Toggle */}
              <div className="flex items-center rounded-md border border-border p-1 bg-muted/30">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-2"
                >
                  <ListIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Lista</span>
                </Button>
                <Button
                  variant={viewMode === 'split' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('split')}
                  className="h-8 px-2 hidden lg:flex"
                >
                  <Columns className="h-4 w-4 mr-1" />
                  <span>Dividido</span>
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="h-8 px-2"
                >
                  <MapIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Mapa</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Superficie</label>
                <div className="flex gap-2">
                  <Input placeholder="Mín m²" value={filters.metrosMin} onChange={(e) => handleFilterChange('metrosMin', e.target.value)} />
                  <Input placeholder="Máx m²" value={filters.metrosMax} onChange={(e) => handleFilterChange('metrosMax', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dormitorios</label>
                <Select value={filters.bedrooms} onValueChange={(v) => handleFilterChange('bedrooms', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dormitorios" />
                  </SelectTrigger>
                  <SelectContent>
                    {bedroomsOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Precio Mínimo</label>
                <Input placeholder="Precio mín" value={filters.priceMin} onChange={(e) => handleFilterChange('priceMin', e.target.value)} />
              </div>
              <div className="flex items-end gap-2">
                <Button variant="ghost" onClick={clearFilters} className="flex-1">Limpiar todo</Button>
                <Button variant="default" onClick={() => setShowFilters(false)} className="flex-1">Aplicar</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* List Side */}
        {(viewMode === 'list' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-full lg:w-[45%] xl:w-[40%]' : 'w-full'} h-full overflow-y-auto scrollbar-hide ${viewMode === 'list' ? '' : 'border-r border-border'}`}>
            <div className={`p-4 md:p-6 mx-auto ${viewMode === 'list' ? 'max-w-[1100px]' : 'max-w-7xl'}`}>
              {/* Header InfoCasas Style */}
              <div className="mb-6">
                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {filters.operation !== "todas"
                    ? `${filters.operation.charAt(0).toUpperCase() + filters.operation.slice(1)} de inmuebles${filters.zona ? ` en ${filters.zona}` : ''}`
                    : `Inmuebles${filters.zona ? ` en ${filters.zona}` : ''}`
                  }
                </h1>

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <span>Estás en:</span>
                  <span className="font-medium">Inmobiliaria</span>
                  <span className="text-muted-foreground">&gt;</span>
                  {filters.operation !== "todas" && (
                    <>
                      <span className="font-medium capitalize">{filters.operation}</span>
                      <span className="text-muted-foreground">&gt;</span>
                    </>
                  )}
                  <span className="font-medium">Inmuebles</span>
                  {filters.zona && (
                    <>
                      <span className="text-muted-foreground">&gt;</span>
                      <span className="font-medium">{filters.zona}</span>
                    </>
                  )}
                </div>

                {/* Results Counter */}
                <div className="text-sm text-muted-foreground">
                  {!loading && total > 0 && (
                    <span>
                      Mostrando {(page - 1) * 12 + 1} - {Math.min(page * 12, total)} de más de {total.toLocaleString()} resultados
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {loading ? 'Buscando...' : (
                    filters.operation === 'venta' ? `${total.toLocaleString()} propiedades en venta` :
                    filters.operation === 'alquiler' ? `${total.toLocaleString()} propiedades en alquiler` :
                    filters.operation === 'anticretico' ? `${total.toLocaleString()} propiedades en anticrético` :
                    `${total.toLocaleString()} propiedades`
                  )}
                </h2>
                <Select value={filters.orderBy} onValueChange={(v) => handleFilterChange('orderBy', v)}>
                  <SelectTrigger className="w-[180px] h-9 border-none shadow-none focus:ring-0">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fecha">Más recientes</SelectItem>
                    <SelectItem value="precio">Menor precio</SelectItem>
                    <SelectItem value="vistas">Más populares</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading && properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <p>Cargando resultados...</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {properties.map((property) => {
                      // Obtener imagen principal usando getImageUrl
                      const mainImage = property.imagenes && property.imagenes.length > 0
                        ? (property.imagenes.find(img => img.principal)?.image_url || property.imagenes[0].image_url)
                        : null

                      const mainImageUrl = mainImage
                        ? (getImageUrl(mainImage) || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop")
                        : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"

                      // Obtener todas las imágenes
                      const allImages = property.imagenes && property.imagenes.length > 0
                        ? property.imagenes.map(img => getImageUrl(img.image_url) || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop")
                        : []

                      return (
                        <PropertyCard
                          key={property.id}
                          id={property.id.toString()}
                          title={property.titulo}
                          location={property.zona}
                          price={formatPrice(property)}
                          operationType={property.tipo_operacion as any}
                          bedrooms={property.dormitorios}
                          bathrooms={property.banos}
                          area={`${property.metros_edificados}m²`}
                          image={mainImageUrl}
                          publishedDate={new Date(property.created_at).toLocaleDateString('es-BO')}
                          featured={property.destacado}
                          description={property.descripcion}
                          agentName={property.vendedor_nombre}
                          agencyName={property.vendedor_nombre}
                          images={allImages}
                        />
                      )
                    })}
                  </div>

                  {properties.length === 0 && !loading && (
                    <div className="text-center py-20">
                      <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                      <h3 className="text-lg font-semibold">Sin resultados</h3>
                      <p className="text-muted-foreground text-sm">Prueba ajustando los filtros o la zona.</p>
                      <Button variant="link" onClick={clearFilters}>Limpiar filtros</Button>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12 mb-8">
                      <Button variant="outline" size="sm" onClick={() => changePage(page - 1)} disabled={page === 1}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">Página {page} de {totalPages}</span>
                      <Button variant="outline" size="sm" onClick={() => changePage(page + 1)} disabled={page === totalPages}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Map Side */}
        {(viewMode === 'map' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'hidden lg:block lg:w-[55%] xl:w-[60%]' : 'w-full'} h-full relative z-0`}>
            <PropertySearchMap properties={properties} center={mapCenter} />
            
            {/* Mobile Map Toggle Info */}
            {viewMode === 'map' && (
              <div className="absolute top-4 left-4 z-10 lg:hidden">
                <div className="bg-background/90 backdrop-blur-md border border-border px-4 py-2 rounded-full shadow-lg text-sm font-bold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {total} resultados
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button for Mobile Toggle */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Button
          onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
          className="rounded-full shadow-2xl h-12 px-6 bg-primary text-primary-foreground font-bold flex items-center gap-2"
        >
          {viewMode === 'map' ? (
            <><ListIcon className="h-5 w-5" /> Ver Lista</>
          ) : (
            <><MapIcon className="h-5 w-5" /> Ver Mapa</>
          )}
        </Button>
      </div>

      <SaveSearchModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        filters={filters}
        searchTerm={searchTerm}
      />
    </div>
  )
}

export default function PropiedadesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PropiedadesContent />
    </Suspense>
  )
}
