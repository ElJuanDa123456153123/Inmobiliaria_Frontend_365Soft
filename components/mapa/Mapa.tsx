"use client"

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix para iconos por defecto de Leaflet con color rojo personalizado
delete (L.Icon.Default.prototype as any)._getIconUrl

// Crear icono rojo personalizado
const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface MapaProps {
  latitud: number
  longitud: number
  zoom?: number
  height?: string
  interactive?: boolean
  showMarker?: boolean
}

export default function Mapa({
  latitud,
  longitud,
  zoom = 15,
  height = "400px",
  interactive = true,
  showMarker = true,
}: MapaProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div
        className="w-full bg-muted animate-pulse rounded-lg"
        style={{ height }}
      />
    )
  }

  return (
    <div className="w-full rounded-lg overflow-hidden" style={{ height }}>
      <MapContainer
        center={[latitud, longitud]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showMarker && <Marker position={[latitud, longitud]} icon={redIcon} />}
      </MapContainer>
    </div>
  )
}
