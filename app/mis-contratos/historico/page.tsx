"use client"

import { useState, useEffect } from "react"
import { History, Building, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

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

const badgeEstado: Record<string, { label: string; className: string }> = {
  activo: { label: "Activo", className: "bg-green-500" },
  vencido: { label: "Vencido", className: "bg-red-500" },
  terminado: { label: "Terminado", className: "bg-gray-400" },
}

export default function MisContratosHistoricoPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEstado, setFilterEstado] = useState<string>("")

  useEffect(() => {
    fetchContracts()
  }, [])

  const fetchContracts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/contracts/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        // Solo histórico: vencidos y terminados
        setContracts((data.contratos || []).filter((c: Contract) => c.estado !== "activo"))
      }
    } catch (error) {
      console.error("Error fetching contracts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = contracts
    .filter((c) => !filterEstado || c.estado === filterEstado)
    .sort((a, b) => new Date(b.fecha_fin).getTime() - new Date(a.fecha_fin).getTime())

  const conteos = {
    todos: contracts.length,
    vencido: contracts.filter((c) => c.estado === "vencido").length,
    terminado: contracts.filter((c) => c.estado === "terminado").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Histórico</h1>
        <p className="text-gray-600 mt-1 text-sm">Contratos vencidos y terminados</p>
      </div>

      {/* Chips-filtro con conteos */}
      <div className="flex flex-wrap gap-2">
        {([
          ["", "Todos", conteos.todos],
          ["vencido", "Vencidos", conteos.vencido],
          ["terminado", "Terminados", conteos.terminado],
        ] as [string, string, number][]).map(([valor, label, count]) => (
          <button
            key={valor || "todos"}
            onClick={() => setFilterEstado(valor)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filterEstado === valor
                ? "bg-green-600 text-white border-green-600 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
            }`}
          >
            {label}
            <span className={`ml-1.5 px-1.5 rounded-full text-[10px] font-semibold ${
              filterEstado === valor ? "bg-white/20" : "bg-gray-100"
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <History className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No hay histórico</h3>
          <p className="text-gray-500 text-sm">Aún no tienes contratos vencidos o terminados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((contract) => {
            const badge = badgeEstado[contract.estado]
            const Icono = contract.estado === "vencido" ? XCircle : CheckCircle
            return (
              <div
                key={contract.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  contract.estado === "vencido" ? "bg-red-50" : "bg-gray-100"
                }`}>
                  <Icono className={`w-5 h-5 ${contract.estado === "vencido" ? "text-red-500" : "text-gray-400"}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{contract.property.titulo}</h3>
                    {badge && <Badge className={`${badge.className} text-[10px] px-2`}>{badge.label}</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 truncate">
                      <Building className="w-3.5 h-3.5" />
                      {contract.property.zona}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(contract.fecha_inicio).toLocaleDateString("es-BO")} → {new Date(contract.fecha_fin).toLocaleDateString("es-BO")}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-semibold text-gray-700 text-sm">Bs. {contract.monto_mensual.toLocaleString()}<span className="text-xs text-gray-400 font-normal">/mes</span></p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
