"use client"

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Property } from '@/lib/properties-api'
import { getImageUrl } from '@/lib/utils'
import { Building, MapPin } from 'lucide-react'
import Image from 'next/image'

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
function MapController({ properties, center, zoom }: { properties: Property[], center?: [number, number], zoom?: number }) {
  const map = useMap()

  useEffect(() => {
    if (properties.length > 0) {
      const bounds = L.latLngBounds(properties
        .filter(p => p.latitud && p.longitud)
        .map(p => [p.latitud!, p.longitud!] as [number, number])
      )
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
      }
    } else if (center) {
      map.setView(center, zoom || 13)
    }
  }, [properties, center, zoom, map])

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

  useEffect(() => {
    setIsClient(true)
  }, [])

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
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController properties={properties} center={center} zoom={zoom} />

        {properties.map((property) => (
          property.latitud && property.longitud && (
            <Marker
              key={property.id}
              position={[property.latitud, property.longitud]}
              icon={customIcon}
              eventHandlers={{
                click: () => onMarkerClick?.(property)
              }}
            >
              <Popup className="property-popup">
                <div className="w-48 overflow-hidden rounded-md">
                  <div className="relative h-32 w-full bg-muted">
                    {property.property_images && property.property_images.length > 0 ? (
                      <img
                        src={getImageUrl(property.property_images.find(img => img.principal)?.image_url || property.property_images[0].image_url) || ""}
                        alt={property.titulo}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Building className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                      {property.tipo_operacion}
                    </div>
                  </div>
                  <div className="p-2">
                    <h3 className="font-bold text-sm truncate">{property.titulo}</h3>
                    <p className="text-primary font-bold text-sm">
                      {property.moneda === 'USD' ? 'U$S' : 'Bs'} {property.precio.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-muted-foreground text-[10px]">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{property.zona}</span>
                    </div>
                    <a 
                      href={`/propiedades/${property.id}`} 
                      className="mt-2 block w-full bg-primary text-white text-center py-1 rounded text-xs hover:bg-primary/90 transition-colors"
                    >
                      Ver detalle
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
      `}</style>
    </div>
  )
}
