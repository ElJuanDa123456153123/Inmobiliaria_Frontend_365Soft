"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, Eye, MessageSquare, Calendar, Building } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PropertyStats {
  id: number
  titulo: string
  vistas_contador: number
  contactos_count: number
  visitas_count: number
  zona: string
}

export default function PanelReportesPage() {
  const [stats, setStats] = useState<any>({})
  const [properties, setProperties] = useState<PropertyStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch dashboard stats
      const dashboardResponse = await fetch("http://localhost:3001/api/panel/dashboard", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (dashboardResponse.ok) {
        const data = await dashboardResponse.json()
        setStats(data)
      }

      // Fetch properties
      const propsResponse = await fetch("http://localhost:3001/api/properties/my", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (propsResponse.ok) {
        const data = await propsResponse.json()
        setProperties(data.properties || [])
      }
    } catch (error) {
      console.error("Error fetching report data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Calculate totals
  const totalVistas = properties.reduce((sum, p) => sum + (p.vistas_contador || 0), 0)
  const totalContactos = stats.contactos_no_leidos || 0
  const totalVisitas = stats.visitas_pendientes || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-600 mt-1">Estadísticas y rendimiento de tus propiedades</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Vistas</p>
              <p className="text-3xl font-bold mt-1">{totalVistas}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Contactos</p>
              <p className="text-3xl font-bold mt-1">{totalContactos}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Visitas</p>
              <p className="text-3xl font-bold mt-1">{totalVisitas}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Propiedades</p>
              <p className="text-3xl font-bold mt-1">{properties.length}</p>
            </div>
            <Building className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Properties Performance */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Rendimiento por Propiedad</h2>
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Ver Detalle
          </Button>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-8">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay datos para mostrar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <div
                key={property.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{property.titulo}</h3>
                  <p className="text-sm text-gray-600">{property.zona}</p>
                </div>

                <div className="flex gap-8 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{property.vistas_contador || 0}</p>
                    <p className="text-xs text-gray-500">Vistas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{property.contactos_count || 0}</p>
                    <p className="text-xs text-gray-500">Contactos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{property.visitas_count || 0}</p>
                    <p className="text-xs text-gray-500">Visitas</p>
                  </div>
                </div>

                <div className="ml-4">
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">Activa</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <TrendingUp className="w-6 h-6 text-blue-600 mr-3 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Consejos para mejorar</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Agrega más fotos de alta calidad para aumentar las vistas</li>
              <li>• Responde rápidamente a los contactos para mejorar conversión</li>
              <li>• Mantén tu publicación actualizada con información detallada</li>
              <li>• Renueva antes de que venza para mantener visibilidad</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
