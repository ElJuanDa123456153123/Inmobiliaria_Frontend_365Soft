"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  FileText, DollarSign, Calendar, AlertCircle, Wallet, ArrowRight,
  CalendarClock, CircleCheck, Building, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiService, RentPayment } from "@/lib/services/api"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const MESES_COMPLETOS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

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
  const [pagos, setPagos] = useState<RentPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = localStorage.getItem("token")
        const [resContratos, resPagos] = await Promise.all([
          fetch(`${API_URL}/api/contracts/my?estado=activo`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiService.getPaymentHistory("", "inquilino"),
        ])
        if (resContratos.ok) {
          const data = await resContratos.json()
          setContracts(data.contratos || [])
        }
        setPagos(resPagos.pagos || [])
      } catch (error) {
        console.error("Error cargando dashboard:", error)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const cuotas = pagos.filter((p) => p.estado !== "pagado" && p.tipo !== "devolucion_deposito" && p.tipo !== "devolucion_anticres")
  const atrasadas = cuotas.filter((p) => p.estado === "atrasado")
  const pagadas = pagos.filter((p) => p.estado === "pagado")

  // Próximo pago: la cuota más cercana a vencer (atrasadas primero por monto alto)
  const proximoPago = [...cuotas]
    .sort((a, b) => (a.estado === "atrasado" ? -1 : 1) - (b.estado === "atrasado" ? -1 : 1) || new Date(a.fecha_pago).getTime() - new Date(b.fecha_pago).getTime())[0]

  const cuotaMensual = contracts[0]?.monto_mensual || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Resumen</h1>
        <p className="text-gray-600 mt-1 text-sm">Tus alquileres y pagos de un vistazo</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5" />
            Cuota mensual
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">Bs. {cuotaMensual.toLocaleString()}</p>
        </div>
        <div className={`rounded-xl border shadow-sm p-4 ${atrasadas.length > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
          <p className={`text-xs flex items-center gap-1.5 ${atrasadas.length > 0 ? "text-red-600" : "text-gray-500"}`}>
            <AlertCircle className="w-3.5 h-3.5" />
            En atraso
          </p>
          <p className={`text-2xl font-bold mt-1 ${atrasadas.length > 0 ? "text-red-600" : "text-gray-300"}`}>
            {atrasadas.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" />
            Por pagar
          </p>
          <p className="text-2xl font-bold text-amber-500 mt-1">
            Bs. {cuotas.reduce((a, p) => a + p.monto, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <CircleCheck className="w-3.5 h-3.5" />
            Pagadas
          </p>
          <p className="text-2xl font-bold text-green-600 mt-1">{pagadas.length}</p>
        </div>
      </div>

      {/* Próximo pago destacado */}
      {proximoPago && (
        <div className={`rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          proximoPago.estado === "atrasado" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 shrink-0 text-center rounded-lg border py-2 bg-white ${
              proximoPago.estado === "atrasado" ? "border-red-200" : "border-amber-200"
            }`}>
              <p className={`text-[10px] uppercase font-semibold ${proximoPago.estado === "atrasado" ? "text-red-600" : "text-amber-600"}`}>
                {MESES_COMPLETOS[proximoPago.mes_correspondiente - 1]?.slice(0, 3) || "?"}
              </p>
              <p className={`text-xl font-bold leading-tight ${proximoPago.estado === "atrasado" ? "text-red-700" : "text-amber-700"}`}>
                {new Date(proximoPago.fecha_pago).getDate()}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900">
                  {proximoPago.estado === "atrasado" ? "Tienes un pago atrasado" : "Próximo pago"}
                </p>
                <Badge className={proximoPago.estado === "atrasado" ? "bg-red-500" : "bg-amber-500"}>
                  {proximoPago.estado === "atrasado" ? "Atrasado" : "Pendiente"}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-0.5">
                {proximoPago.contract?.property?.titulo || "Tu alquiler"} · Vencía el{" "}
                {new Date(proximoPago.fecha_pago).toLocaleDateString("es-BO", { day: "numeric", month: "long" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <p className="text-2xl font-bold text-gray-900">Bs. {proximoPago.monto.toLocaleString()}</p>
            <Link href="/mis-contratos/pagos">
              <Button className="bg-green-600 hover:bg-green-700">
                Pagar ahora
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { href: "/mis-contratos/pagos", icon: DollarSign, titulo: "Mis pagos", desc: "Pagar con QR o subir comprobante" },
          { href: "/mis-contratos/activos", icon: FileText, titulo: "Contratos activos", desc: "Detalles y PDF de tu contrato" },
          { href: "/mis-contratos/historico", icon: Calendar, titulo: "Histórico", desc: "Contratos finalizados" },
        ].map((a) => {
          const Icono = a.icon
          return (
            <Link
              key={a.href}
              href={a.href}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-green-300 hover:shadow transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Icono className="w-5 h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{a.titulo}</p>
                  <p className="text-xs text-gray-500 truncate">{a.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 ml-auto transition-colors" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Contratos activos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" />
            Mis alquileres activos
          </h2>
          <Link href="/mis-contratos/activos" className="text-xs text-green-600 hover:underline">
            Ver todos
          </Link>
        </div>
        {contracts.length === 0 ? (
          <div className="p-8 text-center">
            <Building className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No tienes contratos de alquiler activos</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {contracts.slice(0, 4).map((contract) => (
              <div key={contract.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{contract.property.titulo}</p>
                  <p className="text-xs text-gray-500">
                    Hasta {new Date(contract.fecha_fin).toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-green-600 text-sm">Bs. {contract.monto_mensual.toLocaleString()}<span className="text-xs text-gray-400 font-normal">/mes</span></p>
                  <Badge className="bg-green-500 text-[10px]">Activo</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info: sin contratos */}
      {contracts.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            Cuando aceptes un alquiler desde una propiedad, tu contrato y sus cuotas aparecerán aquí automáticamente.
          </p>
        </div>
      )}
    </div>
  )
}
