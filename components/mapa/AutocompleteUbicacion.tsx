"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Loader2 } from "lucide-react"

interface Sugerencia {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address: {
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
    suburb?: string
    district?: string
    road?: string
  }
}

interface AutocompleteUbicacionProps {
  valor: string
  onChange: (valor: string, lat?: number, lng?: number) => void
  onUbicacionSeleccionada: (lat: number, lng: number) => void
  placeholder?: string
}

export default function AutocompleteUbicacion({
  valor,
  onChange,
  onUbicacionSeleccionada,
  placeholder = "Escribe una ubicación (ej: Quillacollo, Cochabamba)"
}: AutocompleteUbicacionProps) {
  const [busqueda, setBusqueda] = useState(valor)
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([])
  const [cargando, setCargando] = useState(false)
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const componenteRef = useRef<HTMLDivElement>(null)

  // Actualizar el input cuando cambia el valor externo
  useEffect(() => {
    setBusqueda(valor)
  }, [valor])

  // Cerrar sugerencias cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (componenteRef.current && !componenteRef.current.contains(event.target as Node)) {
        setMostrarSugerencias(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Buscar ubicaciones con debounce
  const buscarUbicaciones = async (texto: string) => {
    if (!texto || texto.length < 3) {
      setSugerencias([])
      setMostrarSugerencias(false)
      return
    }

    setCargando(true)

    try {
      // Usar la API de Nominatim (OpenStreetMap) - gratuita
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(texto)}&addressdetails=1&limit=5&countrycodes=bo`,
        {
          headers: {
            'Accept-Language': 'es',
          }
        }
      )

      if (!response.ok) {
        throw new Error('Error en la búsqueda')
      }

      const data: Sugerencia[] = await response.json()
      setSugerencias(data)
      setMostrarSugerencias(data.length > 0)
    } catch (error) {
      console.error('Error buscando ubicaciones:', error)
      setSugerencias([])
    } finally {
      setCargando(false)
    }
  }

  // Manejar cambio en el input con debounce
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    setBusqueda(valor)
    onChange(valor)

    // Limpiar timer anterior
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Crear nuevo timer para debounce (500ms)
    const nuevoTimer = setTimeout(() => {
      buscarUbicaciones(valor)
    }, 500)

    setDebounceTimer(nuevoTimer)
  }

  // Enter → seleccionar la primera sugerencia (busca y mueve el mapa directo)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && sugerencias.length > 0) {
      e.preventDefault()
      handleSeleccionarSugerencia(sugerencias[0])
    }
  }

  // Seleccionar una sugerencia
  const handleSeleccionarSugerencia = (sugerencia: Sugerencia) => {
    const lat = parseFloat(sugerencia.lat)
    const lng = parseFloat(sugerencia.lon)

    // Actualizar el input con la ubicación formateada
    setBusqueda(sugerencia.display_name)
    onChange(sugerencia.display_name, lat, lng)

    // Notificar al mapa
    onUbicacionSeleccionada(lat, lng)

    // Cerrar sugerencias
    setMostrarSugerencias(false)
    setSugerencias([])
  }

  // Formatear la dirección para mostrar en las sugerencias
  const formatearDireccion = (sugerencia: Sugerencia): string => {
    const { address } = sugerencia

    // Priorizar ciudad/town/village
    const localidad = address.city || address.town || address.village || ""
    const zona = address.suburb || address.district || ""
    const estado = address.state || ""
    const pais = address.country || ""

    let partes = []
    if (localidad) partes.push(localidad)
    if (zona && zona !== localidad) partes.push(zona)
    if (estado) partes.push(estado)
    if (pais && pais !== "Bolivia") partes.push(pais)

    return partes.length > 0 ? partes.join(", ") : sugerencia.display_name
  }

  return (
    <div ref={componenteRef} className="relative">
      {/* Input con icono de ubicación */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={busqueda}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={(e) => {
            if (sugerencias.length > 0) {
              setMostrarSugerencias(true)
            }
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
        />
        {cargando && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5 animate-spin" />
        )}
      </div>

      {/* Lista de sugerencias */}
      {mostrarSugerencias && sugerencias.length > 0 && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {sugerencias.map((sugerencia) => (
            <button
              key={sugerencia.place_id}
              type="button"
              onClick={() => handleSeleccionarSugerencia(sugerencia)}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-2">
                <MapPin className="text-primary w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {formatearDireccion(sugerencia)}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {sugerencia.display_name}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Mensaje de ayuda */}
      {!busqueda && (
        <p className="text-xs text-gray-500 mt-2">
          Escribe una ciudad, zona o dirección (Enter selecciona la primera sugerencia y mueve el mapa)
        </p>
      )}
    </div>
  )
}
