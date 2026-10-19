"use client"

import { useState, useEffect } from "react"
import { Building2, Edit, Eye, Calendar, CheckCircle, PauseCircle, PlayCircle, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { apiService, Property } from "@/lib/services/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type FiltroEstado = "all" | "activo" | "inactivo"

export default function PanelPropiedadesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<FiltroEstado>("all")
  const [procesando, setProcesando] = useState<number | null>(null)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const data = await apiService.getMyProperties()
      setProperties(data.properties || [])
    } catch (error) {
      console.error("Error fetching properties:", error)
      toast.error("Error al cargar tus propiedades")
    } finally {
      setLoading(false)
    }
  }

  const getDaysRemaining = (fechaExpiracion?: string | null) => {
    if (!fechaExpiracion) return null
    const exp = new Date(fechaExpiracion)
    const now = new Date()
    const diff = exp.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
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

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "activo":
        return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
      case "inactivo":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pausada</Badge>
      case "vendido":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Vendida</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const handleToggleStatus = async (property: Property) => {
    const nuevoEstado = property.estado_propiedad === "activo" ? "inactivo" : "activo"
    setProcesando(property.id)
    try {
      await apiService.updatePropertyStatus(property.id, nuevoEstado)
      toast.success(
        nuevoEstado === "activo"
          ? "Propiedad activada correctamente"
          : "Propiedad pausada (no será visible al público)"
      )
      await fetchProperties()
    } catch (error: any) {
      toast.error(error.message || "Error al cambiar el estado")
    } finally {
      setProcesando(null)
    }
  }

  const handleDelete = async () => {
    if (!propertyToDelete) return
    setDeleting(true)
    try {
      await apiService.deleteProperty(propertyToDelete.id)
      toast.success("Propiedad eliminada correctamente")
      setPropertyToDelete(null)
      await fetchProperties()
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar la propiedad")
    } finally {
      setDeleting(false)
    }
  }

  const filteredProperties = properties.filter((p) => {
    if (filtro === "all") return true
    if (filtro === "activo") return p.estado_propiedad === "activo"
    if (filtro === "inactivo") return p.estado_propiedad !== "activo" && p.estado_propiedad !== "vendido"
    return true
  })

  const counts = {
    all: properties.length,
    activo: properties.filter((p) => p.estado_propiedad === "activo").length,
    inactivo: properties.filter((p) => p.estado_propiedad !== "activo" && p.estado_propiedad !== "vendido").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Propiedades</h1>
          <p className="text-gray-600 mt-1">Gestiona tus propiedades publicadas</p>
        </div>
        <Link href="/publicar">
          <Button>
            <Building2 className="w-4 h-4 mr-2" />
            Publicar Nueva
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {([
          { key: "all", label: `Todas (${counts.all})` },
          { key: "activo", label: `Activas (${counts.activo})` },
          { key: "inactivo", label: `Pausadas (${counts.inactivo})` },
        ] as { key: FiltroEstado; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFiltro(tab.key)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              filtro === tab.key
                ? "bg-primary text-white shadow"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Properties List */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {properties.length === 0 ? "No tienes propiedades publicadas" : "No hay propiedades en este filtro"}
          </h3>
          <p className="text-gray-600 mb-6">
            {properties.length === 0
              ? "Publica tu primera propiedad para comenzar a gestionarla desde el panel"
              : "Prueba con otro filtro para ver tus otras propiedades"}
          </p>
          {properties.length === 0 && (
            <Link href="/publicar">
              <Button>
                <Building2 className="w-4 h-4 mr-2" />
                Publicar Propiedad
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => {
            const daysRemaining = getDaysRemaining(property.fecha_expiracion)
            const daysColor = daysRemaining !== null ? getDaysRemainingColor(daysRemaining) : null
            const esActiva = property.estado_propiedad === "activo"
            const esVendida = property.estado_propiedad === "vendido"

            return (
              <div
                key={property.id}
                className={cn(
                  "bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow",
                  !esActiva && "opacity-80"
                )}
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
                      <Building2 className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    {getEstadoBadge(property.estado_propiedad)}
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
                    <p className="text-2xl font-bold text-primary">
                      {property.moneda} {property.precio.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {property.tipo_operacion} • {property.tipo_propiedad}
                    </p>
                  </div>

                  {/* Expiration */}
                  {daysRemaining !== null && esActiva && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">Expira:</span>
                      </div>
                      <span className={cn("text-sm font-medium px-2 py-1 rounded", daysColor)}>
                        {getDaysRemainingText(daysRemaining)}
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{property.vistas_contador} vistas</span>
                    </div>
                    {esActiva && (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                        <span>Pública</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/propiedades/${property.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                    </Link>
                    <Link href={`/publicar/formulario?edit=${property.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    {!esVendida && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={procesando === property.id}
                        onClick={() => handleToggleStatus(property)}
                      >
                        {procesando === property.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : esActiva ? (
                          <PauseCircle className="w-4 h-4 mr-2 text-yellow-600" />
                        ) : (
                          <PlayCircle className="w-4 h-4 mr-2 text-green-600" />
                        )}
                        {esActiva ? "Pausar" : "Activar"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setPropertyToDelete(property)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirmación de eliminación */}
      <AlertDialog open={Boolean(propertyToDelete)} onOpenChange={(open) => !open && setPropertyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta propiedad?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar <strong>"{propertyToDelete?.titulo}"</strong>. Esta acción no se puede
              deshacer y el aviso dejará de estar visible al público.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Sí, eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
