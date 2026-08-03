"use client"

import { useState, useEffect } from "react"
import { CreditCard, Calendar, Building, Download, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Payment {
  id: number
  monto: number
  metodo_pago: string
  estado: string
  comprobante_url?: string
  created_at: string
  plan?: {
    id: number
    nombre: string
    precio: number
    duracion_dias: number
  }
}

export default function PanelPagosPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/payments/my", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "PAGADO":
        return <Badge className="bg-green-500">Pagado</Badge>
      case "PENDIENTE":
        return <Badge className="bg-yellow-500">Pendiente</Badge>
      case "RECHAZADO":
        return <Badge className="bg-red-500">Rechazado</Badge>
      case "EN_PROCESO":
        return <Badge className="bg-blue-500">En Proceso</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Mis Pagos</h1>
          <p className="text-gray-600 mt-1">Historial de pagos por publicación</p>
        </div>
        <Link href="/planes">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <CreditCard className="w-4 h-4 mr-2" />
            Nuevo Pago
          </Button>
        </Link>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay pagos registrados</h3>
          <p className="text-gray-600 mb-6">Aún no has realizado pagos por publicaciones</p>
          <Link href="/planes">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <CreditCard className="w-4 h-4 mr-2" />
              Ver Planes
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comprobante
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(payment.created_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.plan?.nombre || "Publicación"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Bs. {payment.monto.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {payment.metodo_pago || "QR"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(payment.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.comprobante_url ? (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={payment.comprobante_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Ver
                          </a>
                        </Button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
