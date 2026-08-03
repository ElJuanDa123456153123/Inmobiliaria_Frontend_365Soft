"use client"

import { useState, useEffect } from "react"
import { FileText, Building, User, DollarSign, Calendar, Download, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Contract {
  id: number
  monto_mensual: number
  fecha_inicio: string
  fecha_fin: string
  estado: string
  documento_url?: string
  inquilino: {
    id: number
    nombre: string
    email: string
    telefono?: string
  }
  property: {
    id: number
    titulo: string
    zona: string
  }
}

export default function MisContratosActivosPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">Contratos Activos</h1>
        <p className="text-gray-600 mt-1">Gestiona tus contratos de alquiler vigentes</p>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes contratos activos</h3>
          <p className="text-gray-600">Los contratos activos se mostrarán aquí</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {contracts.map((contract) => (
            <div key={contract.id} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{contract.property.titulo}</h3>
                  <p className="text-sm text-gray-600">{contract.property.zona}</p>
                </div>
                <Badge className="bg-green-500">Activo</Badge>
              </div>

              {/* Tenant Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <User className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-900">Inquilino</span>
                </div>
                <p className="text-sm text-gray-700">{contract.inquilino.nombre}</p>
                {contract.inquilino.email && (
                  <p className="text-sm text-gray-600">{contract.inquilino.email}</p>
                )}
                {contract.inquilino.telefono && (
                  <p className="text-sm text-gray-600">{contract.inquilino.telefono}</p>
                )}
              </div>

              {/* Dates */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Inicio: {new Date(contract.fecha_inicio).toLocaleDateString("es-ES")}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Fin: {new Date(contract.fecha_fin).toLocaleDateString("es-ES")}</span>
                </div>
              </div>

              {/* Monthly Payment */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">Alquiler mensual</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  Bs. {contract.monto_mensual.toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link href={`/mis-contratos/pagos?contract=${contract.id}`} className="flex-1">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Ver Pagos
                  </Button>
                </Link>
                {contract.documento_url && (
                  <Button variant="outline" asChild>
                    <a href={contract.documento_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </a>
                  </Button>
                )}
                <Button variant="outline">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
