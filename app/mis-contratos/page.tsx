"use client"

import { useState, useEffect } from "react"
import { FileText, DollarSign, Calendar, AlertCircle, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
  }
}

export default function MisContratosDashboardPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContracts()
  }, [])

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/contracts/my?estado=activo", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setContracts(data.contratos || [])
      }
    } catch (error) {
      console.error("Error fetching contracts:", error)
    } finally {
      setLoading(false)
    }
  }

  const activeContracts = contracts.filter(c => c.estado === "activo")
  const totalMonthlyIncome = activeContracts.reduce((sum, c) => sum + c.monto_mensual, 0)

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Contratos</h1>
        <p className="text-gray-600 mt-1">Gestiona tus contratos de alquiler</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Contratos Activos</p>
              <p className="text-3xl font-bold mt-1">{activeContracts.length}</p>
            </div>
            <FileText className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Ingreso Mensual</p>
              <p className="text-3xl font-bold mt-1">Bs. {totalMonthlyIncome.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Contratos</p>
              <p className="text-3xl font-bold mt-1">{contracts.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/mis-contratos/activos">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Ver Contratos Activos
            </Button>
          </Link>
          <Link href="/mis-contratos/pagos">
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="w-4 h-4 mr-2" />
              Registrar Pago
            </Button>
          </Link>
          <Link href="/mis-contratos/historico">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Ver Histórico
            </Button>
          </Link>
        </div>
      </div>

      {/* Active Contracts */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Contratos Activos Recientes</h2>
          <Link href="/mis-contratos/activos">
            <Button variant="outline" size="sm">Ver todos</Button>
          </Link>
        </div>

        {activeContracts.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No tienes contratos activos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeContracts.slice(0, 5).map((contract) => (
              <div
                key={contract.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{contract.property.titulo}</h3>
                  <p className="text-sm text-gray-600">Inquilino: {contract.inquilino.nombre}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-green-600">
                    Bs. {contract.monto_mensual.toLocaleString()}/mes
                  </p>
                  <p className="text-xs text-gray-500">
                    Vence: {new Date(contract.fecha_fin).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Banner */}
      {activeContracts.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">No tienes contratos activos</h3>
              <p className="text-sm text-yellow-800">
                Los contratos de alquiler te permiten gestionar los pagos mensuales y el seguimiento de tus propiedades en alquiler.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
