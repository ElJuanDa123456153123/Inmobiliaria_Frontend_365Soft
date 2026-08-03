"use client"

import { useState, useEffect } from "react"
import { Building, Edit, Eye, Calendar, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Property {
  id: number
  titulo: string
  tipo_propiedad: string
  tipo_operacion: string
  precio: number
  moneda: string
  zona: string
  estado_propiedad: string
  fecha_publicacion: string
  fecha_expiracion: string
  vistas_contador: number
  imagenes?: { image_url: string }[]
}

export default function PanelPropiedadesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/properties/my", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Filtrar solo propiedades activas
        const activeProperties = data.properties?.filter(
          (p: Property) => p.estado_propiedad === "activo"
        ) || []
        setProperties(activeProperties)
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysRemaining = (fechaExpiracion: string) => {
    const exp = new Date(fechaExpiracion)
    const now = new Date()
    const diff = exp.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  const getDaysRemainingColor = (days: number) => {
    if (days <= 3) return "text-red-600 bg-red-50"
    if (days <= 7) return "text-orange-600 bg-orange-50"
    if (days <= 15) return "text-yellow-600 bg-yellow-50"
    return "text-green-600 bg-green-50"
  }

  const getDaysRemainingText = (days: number) => {
    if (days < 0) return "Vencida"
    if (days === 0) return "Vence hoy"
    if (days === 1) return "1 día"
    return `${days} días`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Propiedades</h1>
          <p className="text-gray-600 mt-1">Gestiona tus propiedades activas</p>
        </div>
        <Link href="/publicar">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Building className="w-4 h-4 mr-2" />
            Publicar Nueva
          </Button>
        </Link>
      </div>

      {/* Properties List */}
      {properties.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes propiedades activas</h3>
          <p className="text-gray-600 mb-6">Publica tu primera propiedad para comenzar a gestionarla desde el panel</p>
          <Link href="/publicar">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Building className="w-4 h-4 mr-2" />
              Publicar Propiedad
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const daysRemaining = getDaysRemaining(property.fecha_expiracion)
            const daysColor = getDaysRemainingColor(daysRemaining)

            return (
              <div
                key={property.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {property.imagenes && property.imagenes.length > 0 ? (
                    <img
                      src={property.imagenes[0].image_url}
                      alt={property.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-green-500 hover:bg-green-600">
                      Activo
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  {/* Title */}
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate">{property.titulo}</h3>
                    <p className="text-sm text-gray-600">{property.zona}</p>
                  </div>

                  {/* Price */}
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {property.moneda} {property.precio.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {property.tipo_operacion} • {property.tipo_propiedad}
                    </p>
                  </div>

                  {/* Expiration */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Expira:</span>
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${daysColor}`}>
                      {getDaysRemainingText(daysRemaining)}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{property.vistas_contador} vistas</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                      <span>Activo</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/propiedades/${property.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
