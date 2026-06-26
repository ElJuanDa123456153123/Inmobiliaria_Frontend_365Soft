"use client"

import { useState, useEffect } from "react"
import { Building2, CheckCircle2, Clock, Home, TrendingUp, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AdvisorPropertyCard } from "@/components/advisor/AdvisorPropertyCard"
import { ActivateModal } from "@/components/advisor/ActivateModal"
import { toast } from "sonner"

interface Property {
  id: number
  titulo: string
  precio: number
  moneda: string
  tipo_propiedad: string
  zona: string
  estado_propiedad: "pendiente" | "activo" | "vendido"
  imagen_url?: string
  created_at: string
}

interface AdvisorStats {
  por_gestionar: number
  activas: number
  vendidas: number
  total: number
}

export default function AdvisorPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [stats, setStats] = useState<AdvisorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"pendiente" | "activo" | "vendido" | "all">("pendiente")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [showActivateModal, setShowActivateModal] = useState(false)

  useEffect(() => {
    fetchProperties()
    fetchStats()
  }, [activeTab])

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem("token")
      const statusParam = activeTab !== "all" ? `?status=${activeTab}` : ""
      const response = await fetch(`http://localhost:3001/api/advisor/properties${statusParam}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProperties(data.properties || [])
      } else {
        toast.error("Error al cargar propiedades")
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
      toast.error("Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/advisor/stats", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleActivate = (property: Property) => {
    setSelectedProperty(property)
    setShowActivateModal(true)
  }

  const handleConfirmActivate = async () => {
    if (!selectedProperty) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/advisor/properties/${selectedProperty.id}/activate`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success("Propiedad activada exitosamente")
        setShowActivateModal(false)
        setSelectedProperty(null)
        fetchProperties()
        fetchStats()
      } else {
        const data = await response.json()
        toast.error(data.error || "Error al activar propiedad")
      }
    } catch (error) {
      console.error("Error activating property:", error)
      toast.error("Error al conectar con el servidor")
    }
  }

  const filteredProperties = activeTab === "all" ? properties : properties.filter(p => p.estado_propiedad === activeTab)

  const tabs = [
    { id: "pendiente" as const, label: "Por Gestionar", icon: Clock, color: "bg-yellow-500" },
    { id: "activo" as const, label: "Activas", icon: Home, color: "bg-green-500" },
    { id: "vendido" as const, label: "Vendidas", icon: DollarSign, color: "bg-blue-500" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Mis Propiedades</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona las propiedades asignadas por 365Soft</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Por Gestionar</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.por_gestionar}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Activas</p>
                    <p className="text-3xl font-bold text-green-600">{stats.activas}</p>
                  </div>
                  <Home className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Vendidas</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.vendidas}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-gray-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const count = stats ? (tab.id === "pendiente" ? stats.por_gestionar : tab.id === "activo" ? stats.activas : stats.vendidas) : 0
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {count > 0 && (
                    <span className={`ml-1 py-0.5 px-2 rounded-full text-xs font-medium ${tab.color} text-white`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando propiedades...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === "pendiente" && "No tienes propiedades por gestionar"}
                {activeTab === "activo" && "No tienes propiedades activas"}
                {activeTab === "vendido" && "No tienes propiedades vendidas"}
              </h3>
              <p className="text-gray-500">
                {activeTab === "pendiente" && "Las propiedades que te asignen aparecerán aquí"}
                {activeTab === "activo" && "Las propiedades que actives aparecerán aquí"}
                {activeTab === "vendido" && "Las propiedades vendidas aparecerán aquí"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <AdvisorPropertyCard
                key={property.id}
                property={property}
                onActivate={activeTab === "pendiente" ? handleActivate : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Activate Modal */}
      {showActivateModal && selectedProperty && (
        <ActivateModal
          property={selectedProperty}
          onConfirm={handleConfirmActivate}
          onCancel={() => {
            setShowActivateModal(false)
            setSelectedProperty(null)
          }}
        />
      )}
    </div>
  )
}
