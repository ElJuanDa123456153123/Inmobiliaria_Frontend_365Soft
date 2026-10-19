"use client"

import { useState, useEffect } from "react"
import { Calendar, Building, User, Clock, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

import Link from "next/link"
import { parseFechaVisita } from "@/lib/utils"
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface Visit {
  id: number
  fecha_visita: string
  estado: string
  notas?: string
  vendedor?: {
    id: number
    nombre: string
    email: string
  }
  property: {
    id: number
    titulo: string
    zona: string
  }
}

export function VisitasTab() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEstado, setFilterEstado] = useState<string>("")

  useEffect(() => {
    fetchVisits()
  }, [filterEstado])

  const fetchVisits = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      let url = `${API_URL}/api/panel/visits/my`
      if (filterEstado) {
        url += `?estado=${filterEstado}`
      }

      const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setVisits(data.visitas || [])
      }
    } catch (error) {
      console.error("Error fetching visits:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateVisitStatus = async (visitId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/panel/visits/${visitId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ estado: newStatus })
      })

      if (response.ok) {
        toast.success(newStatus === "cancelada" ? "Visita cancelada" : "Visita actualizada")
        fetchVisits()
      } else {
        toast.error("Error al actualizar visita")
      }
    } catch (error) {
      console.error("Error updating visit:", error)
      toast.error("Error al actualizar visita")
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Badge className="bg-yellow-500">Pendiente</Badge>
      case "completada":
        return <Badge className="bg-green-500">Confirmada</Badge>
      case "cancelada":
        return <Badge className="bg-red-500">Cancelada</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const filteredVisits = visits.filter((visit) => {
    if (!filterEstado) return true
    return visit.estado === filterEstado
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Mis Visitas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={filterEstado === "" ? "default" : "outline"}
            onClick={() => setFilterEstado("")}
            size="sm"
          >
            Todas
          </Button>
          <Button
            variant={filterEstado === "pendiente" ? "default" : "outline"}
            onClick={() => setFilterEstado("pendiente")}
            size="sm"
          >
            Pendientes
          </Button>
          <Button
            variant={filterEstado === "completada" ? "default" : "outline"}
            onClick={() => setFilterEstado("completada")}
            size="sm"
          >
            Confirmadas
          </Button>
          <Button
            variant={filterEstado === "cancelada" ? "default" : "outline"}
            onClick={() => setFilterEstado("cancelada")}
            size="sm"
          >
            Canceladas
          </Button>
        </div>

        {/* Lista */}
        {filteredVisits.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-1">No hay visitas</p>
            <p className="text-sm text-gray-400">
              Aun no has agendado visitas a propiedades
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVisits.map((visit) => (
              <div
                key={visit.id}
                className="border border-border rounded-xl p-5 hover:shadow-md transition-all bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {visit.vendedor?.nombre}
                      </h4>
                      {getEstadoBadge(visit.estado)}
                    </div>

                    <div className="space-y-1 mb-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {visit.vendedor?.email}
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Building className="w-4 h-4 mr-2" />
                      <Link
                        href={`/propiedades/${visit.property.id}`}
                        className="text-primary hover:underline"
                      >
                        {visit.property.titulo}
                      </Link>
                      <span className="mx-2">*</span>
                      <span>{visit.property.zona}</span>
                    </div>

                    {visit.fecha_visita && !visit.fecha_visita.startsWith("0001") ? (
                      <div className="flex items-center text-sm text-gray-700">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="font-medium">
                          {parseFechaVisita(visit.fecha_visita).toLocaleDateString("es-BO", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Fecha por confirmar</span>
                      </div>
                    )}
                  </div>

                  {visit.estado === "pendiente" && (
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => updateVisitStatus(visit.id, "completada")}
                        className="whitespace-nowrap bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateVisitStatus(visit.id, "cancelada")}
                        className="whitespace-nowrap"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
