"use client"

import { useState, useEffect } from "react"
import { History, Building, User, Calendar, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Contract {
  id: number
  monto_mensual: number
  fecha_inicio: string
  fecha_fin: string
  estado: string
  inquilino: {
    id: number
    nombre: string
  }
  property: {
    id: number
    titulo: string
    zona: string
  }
}

export default function MisContratosHistoricoPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEstado, setFilterEstado] = useState<string>("")

  useEffect(() => {
    fetchContracts()
  }, [filterEstado])

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem("token")
      let url = "http://localhost:3001/api/contracts/my"

      if (filterEstado) {
        url += `?estado=${filterEstado}`
      }

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Excluir contratos activos, mostrar solo vencidos y terminados
        const historicalContracts = (data.contratos || []).filter(
          (c: Contract) => c.estado !== "activo"
        )
        setContracts(historicalContracts)
      }
    } catch (error) {
      console.error("Error fetching contracts:", error)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "activo":
        return <Badge className="bg-green-500">Activo</Badge>
      case "vencido":
        return <Badge className="bg-red-500">Vencido</Badge>
      case "terminado":
        return <Badge className="bg-gray-500">Terminado</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "vencido":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "terminado":
        return <CheckCircle className="w-5 h-5 text-gray-500" />
      default:
        return <Calendar className="w-5 h-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Histórico de Contratos</h1>
        <p className="text-gray-600 mt-1">Contratos vencidos y terminados</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex gap-2">
          <Button
            variant={filterEstado === "" ? "default" : "outline"}
            onClick={() => setFilterEstado("")}
            size="sm"
          >
            Todos
          </Button>
          <Button
            variant={filterEstado === "vencido" ? "default" : "outline"}
            onClick={() => setFilterEstado("vencido")}
            size="sm"
          >
            Vencidos
          </Button>
          <Button
            variant={filterEstado === "terminado" ? "default" : "outline"}
            onClick={() => setFilterEstado("terminado")}
            size="sm"
          >
            Terminados
          </Button>
        </div>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay histórico</h3>
          <p className="text-gray-600">
            {filterEstado
              ? "No hay contratos con el estado seleccionado"
              : "Aún no tienes contratos vencidos o terminados"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-start justify-between">
                {/* Contract Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg">{contract.property.titulo}</h3>
                    {getEstadoBadge(contract.estado)}
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{contract.property.zona}</p>

                  {/* Tenant */}
                  <div className="flex items-center text-sm text-gray-700 mb-3">
                    <User className="w-4 h-4 mr-2" />
                    <span>Inquilino: {contract.inquilino.nombre}</span>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        {new Date(contract.fecha_inicio).toLocaleDateString("es-ES")} - {new Date(contract.fecha_fin).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                    <div className="flex items-center font-medium">
                      Bs. {contract.monto_mensual.toLocaleString()}/mes
                    </div>
                  </div>
                </div>

                {/* Status Icon */}
                <div className="ml-4">
                  {getEstadoIcon(contract.estado)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
