"use client"

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { Property } from '@/lib/properties-api'
import { getImageUrl } from '@/lib/utils'
import { Building, MapPin, Navigation, X, ChevronLeft, ChevronRight, Home } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

// Fix for default Leaflet icons
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
}

const customIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

interface PropertySearchMapProps {
  properties: Property[]
  onMarkerClick?: (property: Property) => void
  center?: [number, number]
  zoom?: number
}

// Component to handle map centering and bounds
function MapController({
  properties,
  center,
  zoom,
  userLocation
}: {
  properties: Property[]
  center?: [number, number]
  zoom?: number
  userLocation?: [number, number]
}) {
  const map = useMap()

  useEffect(() => {
    if (userLocation) {
      map.setView(userLocation, 14)
    } else if (properties.length > 0) {
      const bounds = L.latLngBounds(
        properties
          .filter((p) => p.latitud && p.longitud)
          .map((p) => [p.latitud!, p.longitud!] as [number, number])
      )

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
      }
    } else if (center) {
      map.setView(center, zoom || 13)
    }
  }, [properties, center, zoom, map, userLocation])

  return null
}

export default function PropertySearchMap({
  properties,
  onMarkerClick,
  center = [
    Number(process.env.NEXT_PUBLIC_MAP_CENTER_LAT) || -17.3895,
    Number(process.env.NEXT_PUBLIC_MAP_CENTER_LNG) || -66.1568
  ],
  zoom = Number(process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM) || 13
}: PropertySearchMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [userLocation, setUserLocation] = useState<[number, number] | undefined>(undefined)
  const [isLocating, setIsLocating] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Geolocalización
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation([latitude, longitude])
        setIsLocating(false)

        // Centrar mapa en ubicación del usuario
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 15)
        }
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error)
        setIsLocating(false)
        alert('No se pudo obtener tu ubicación')
      }
    )
  }

  // Obtener imágenes ordenadas de una propiedad
  const getSortedImages = (property: Property) => {
    if (!property.imagenes || property.imagenes.length === 0) {
      return []
    }

    return [...property.imagenes].sort((a, b) => {
      if (a.principal && !b.principal) return -1
      if (!a.principal && b.principal) return 1
      return a.orden - b.orden
    })
  }

  // Navegar imágenes
  const nextImage = () => {
    if (!selectedProperty) return
    const images = getSortedImages(selectedProperty)
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    if (!selectedProperty) return
    const images = getSortedImages(selectedProperty)
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Manejar click en marcador
  const handleMarkerClick = (property: Property) => {
    setSelectedProperty(property)
    setCurrentImageIndex(0)
    setShowSidebar(true)
    onMarkerClick?.(property)
  }

  // Cerrar sidebar
  const closeSidebar = () => {
    setShowSidebar(false)
    setSelectedProperty(null)
    setUserLocation(undefined)
  }

  if (!isClient) {
    return (
      <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
        <MapPin className="h-8 w-8 text-muted-foreground animate-bounce" />
      </div>
    )
  }

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        ref={(map) => {
          if (map) {
            mapRef.current = map
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController properties={properties} center={center} zoom={zoom} userLocation={userLocation} />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={80}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
        >
          {properties.map((property) => {
            if (!property.latitud || !property.longitud) return null

            const images = getSortedImages(property)
            const mainImage = images[0]?.image_url || null

            return (
              <Marker
                key={property.id}
                position={[property.latitud, property.longitud]}
                icon={customIcon}
                eventHandlers={{
                  click: () => handleMarkerClick(property)
                }}
              >
                <Popup
                  className="property-popup-custom"
                  maxWidth={350}
                  minWidth={280}
                >
                  <div className="w-full">
                    {/* Galería de imágenes */}
                    <div className="relative h-40 w-full bg-muted rounded-t-lg overflow-hidden">
                      {mainImage ? (
                        <>
                          <img
                            src={getImageUrl(mainImage) || ""}
                            alt={property.titulo}
                            className="w-full h-full object-cover"
                          />
                          {images.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                              1/{images.length}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Building className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      {/* Badge de tipo de operación */}
                      <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shadow-md">
                        {property.tipo_operacion}
                      </div>
                    </div>

                    {/* Información de la propiedad */}
                    <div className="p-3 space-y-2">
                      <h3 className="font-bold text-sm line-clamp-1">{property.titulo}</h3>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="line-clamp-1">{property.zona}</span>
                      </div>

                      <p className="text-primary font-bold text-sm">
                        {property.moneda === 'USD' ? 'U$S' : 'Bs'} {property.precio.toLocaleString()}
                      </p>

                      {/* Características principales */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {Number(property.dormitorios) > 0 && (
                          <span className="flex items-center gap-1">
                            <Home className="h-3 w-3" />
                            {property.dormitorios}
                          </span>
                        )}
                        {Number(property.banos) > 0 && (
                          <span>• {property.banos} baños</span>
                        )}
                      </div>

                      <a
                        href={`/propiedades/${property.id}`}
                        className="block w-full bg-primary text-white text-center py-2 rounded text-xs hover:bg-primary/90 transition-colors font-semibold mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ver detalle
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MarkerClusterGroup>

        {/* Marcador de ubicación del usuario */}
        {userLocation && (
          <Marker position={userLocation} icon={L.divIcon({
            className: 'user-location-marker',
            html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })}>
            <Popup>Tu ubicación</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Botón de geolocalización */}
      <button
        onClick={handleLocateUser}
        disabled={isLocating}
        className="absolute top-4 right-4 z-[1000] bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-lg shadow-lg border border-gray-200 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Mi ubicación"
      >
        <Navigation className={`h-5 w-5 ${isLocating ? 'animate-spin' : ''}`} />
      </button>

      {/* Sidebar lateral deslizante */}
      {showSidebar && selectedProperty && (
        <div className="absolute top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-[1001] transform transition-transform duration-300 ease-in-out flex flex-col">
          {/* Header del sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="font-bold text-lg">Detalle de Propiedad</h2>
            <button
              onClick={closeSidebar}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Contenido del sidebar */}
          <div className="flex-1 overflow-y-auto">
            {/* Galería de imágenes con navegación */}
            <div className="relative h-64 bg-gray-100">
              {getSortedImages(selectedProperty).length > 0 ? (
                <>
                  <img
                    src={getImageUrl(getSortedImages(selectedProperty)[currentImageIndex]?.image_url) || ""}
                    alt={selectedProperty.titulo}
                    className="w-full h-full object-cover"
                  />
                  {getSortedImages(selectedProperty).length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                        {currentImageIndex + 1} / {getSortedImages(selectedProperty).length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Building className="h-16 w-16 text-gray-300" />
                </div>
              )}
            </div>

            {/* Información detallada */}
            <div className="p-4 space-y-4">
              <div>
                <span className="inline-block bg-primary text-white text-xs font-bold px-2 py-1 rounded uppercase mb-2">
                  {selectedProperty.tipo_operacion}
                </span>
                <h3 className="font-bold text-xl">{selectedProperty.titulo}</h3>
                <p className="text-primary font-bold text-2xl mt-2">
                  {selectedProperty.moneda === 'USD' ? 'U$S' : 'Bs'} {selectedProperty.precio.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{selectedProperty.zona}</span>
              </div>

              {/* Características */}
              <div className="grid grid-cols-3 gap-3 py-4 border-t border-b border-gray-200">
                {Number(selectedProperty.dormitorios) > 0 && (
                  <div className="text-center">
                    <div className="font-bold text-lg">{selectedProperty.dormitorios}</div>
                    <div className="text-xs text-gray-500">Dormitorios</div>
                  </div>
                )}
                {Number(selectedProperty.banos) > 0 && (
                  <div className="text-center">
                    <div className="font-bold text-lg">{selectedProperty.banos}</div>
                    <div className="text-xs text-gray-500">Baños</div>
                  </div>
                )}
                {selectedProperty.metros_edificados > 0 && (
                  <div className="text-center">
                    <div className="font-bold text-lg">{selectedProperty.metros_edificados}m²</div>
                    <div className="text-xs text-gray-500">Construidos</div>
                  </div>
                )}
              </div>

              {/* Descripción */}
              {selectedProperty.descripcion && (
                <div>
                  <h4 className="font-semibold mb-2">Descripción</h4>
                  <p className="text-sm text-gray-600 line-clamp-4">
                    {selectedProperty.descripcion}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer del sidebar */}
          <div className="p-4 border-t border-gray-200">
            <a
              href={`/propiedades/${selectedProperty.id}`}
              onClick={closeSidebar}
              className="block w-full bg-primary text-white text-center py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Ver detalle completo
            </a>
          </div>
        </div>
      )}

      {/* Overlay para cerrar sidebar */}
      {showSidebar && (
        <div
          onClick={closeSidebar}
          className="absolute inset-0 bg-black/30 z-[1000] sm:hidden"
        />
      )}

      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 0.5rem;
        }
        .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .property-popup-custom .leaflet-popup-tip {
          display: none;
        }
      `}</style>
    </div>
  )
}
