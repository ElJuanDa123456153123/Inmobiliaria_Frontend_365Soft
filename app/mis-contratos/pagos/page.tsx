"use client"

import { useState, useEffect } from "react"
import { DollarSign, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface RentPayment {
  id: number
  mes_correspondiente: number
  anio: number
  monto: number
  fecha_pago: string
  metodo_pago: string
  estado: string
  comprobante_url?: string
}

export default function MisContratosPagosPage() {
  const [payments, setPayments] = useState<RentPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/payments/history", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPayments(data.pagos || [])
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMonthName = (month: number) => {
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    return months[month - 1] || "Desconocido"
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pagado":
        return <Badge className="bg-green-500">Pagado</Badge>
      case "pendiente":
        return <Badge className="bg-yellow-500">Pendiente</Badge>
      case "atrasado":
        return <Badge className="bg-red-500">Atrasado</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const groupedPayments = payments.reduce((acc, payment) => {
    const key = `${payment.anio}-${payment.mes_correspondiente}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(payment)
    return acc
  }, {} as Record<string, RentPayment[]>)

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagos de Alquiler</h1>
          <p className="text-gray-600 mt-1">Historial de pagos mensuales</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <DollarSign className="w-4 h-4 mr-2" />
          Registrar Pago
        </Button>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay pagos registrados</h3>
          <p className="text-gray-600">Los pagos de alquiler se mostrarán aquí</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPayments)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([period, periodPayments]) => (
              <div key={period} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">
                    {getMonthName(parseInt(period.split("-")[1]))} {period.split("-")[0]}
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {periodPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">
                              Bs. {payment.monto.toLocaleString()}
                            </h4>
                            {getEstadoBadge(payment.estado)}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(payment.fecha_pago).toLocaleDateString("es-ES")}
                            </div>
                            <div className="flex items-center capitalize">
                              <Clock className="w-4 h-4 mr-1" />
                              {payment.metodo_pago}
                            </div>
                          </div>
                        </div>

                        {payment.comprobante_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={payment.comprobante_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ver Comprobante
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
