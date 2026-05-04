"use client"

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix para iconos por defecto de Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
}
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface MapaSelectorProps {
  latitud?: number
  longitud?: number
  onUbicacionChange: (lat: number, lng: number) => void
  readonly?: boolean
  // Nueva prop para forzar el centro del mapa
  forzarCentro?: { lat: number; lng: number }
}

// Componente para actualizar el centro del mapa programáticamente
function MapaCenterUpdater({ centro }: { centro: { lat: number; lng: number } }) {
  const map = useMap()

  useEffect(() => {
    if (centro) {
      map.setView([centro.lat, centro.lng], 15)
    }
  }, [centro, map])

  return null
}

function MapaClickable({ onUbicacionChange, readonly }: { onUbicacionChange: (lat: number, lng: number) => void, readonly?: boolean }) {
  const [position, setPosition] = useState<L.LatLng | null>(null)

  useMapEvents({
    click(e) {
      if (readonly) return
      setPosition(e.latlng)
      onUbicacionChange(e.latlng.lat, e.latlng.lng)
    },
  })

  return position ? <Marker position={position} /> : null
}

export default function MapaSelector({ latitud, longitud, onUbicacionChange, readonly = false, forzarCentro }: MapaSelectorProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">
        <p className="text-gray-500">Cargando mapa...</p>
      </div>
    )
  }

  // Usar forzarCentro si se proporciona, sino usar latitud/longitud
  const center = forzarCentro || {
    lat: latitud || -17.3895,
    lng: longitud || -66.1568,
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 relative">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapaClickable onUbicacionChange={onUbicacionChange} readonly={readonly} />
        {/* Actualizar centro programáticamente cuando cambia forzarCentro */}
        {forzarCentro && <MapaCenterUpdater centro={forzarCentro} />}
        {(latitud && longitud) && !readonly && (
          <Marker position={[latitud, longitud]} />
        )}
      </MapContainer>
      {readonly && latitud && longitud && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md text-sm">
          <p className="font-medium text-gray-700">
            Ubicación seleccionada
          </p>
          <p className="text-xs text-gray-500">
            {latitud.toFixed(4)}, {longitud.toFixed(4)}
          </p>
        </div>
      )}
      {!readonly && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md text-sm z-[1000]">
          <p className="text-xs text-gray-600">
            Click en el mapa para seleccionar ubicación precisa
          </p>
        </div>
      )}
    </div>
  )
}
