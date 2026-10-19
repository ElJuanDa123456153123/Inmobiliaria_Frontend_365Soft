"use client"

import { useState, useEffect } from "react"
import {
  FileText, Building, DollarSign, Calendar, Download, Loader2, User, Mail, Phone, Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { toast } from "sonner"
import { apiService } from "@/lib/services/api"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface Contract {
  id: number
  monto_mensual: number
  monto_deposito?: number
  fecha_inicio: string
  fecha_fin: string
  estado: string
  tipo_contrato?: string
  documento_url?: string
  vendedor?: {
    id: number
    nombre: string
    apellido?: string
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
  const [pdfCargando, setPdfCargando] = useState<number | null>(null)

  useEffect(() => {
    fetchContracts()
  }, [])

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/contracts/my?estado=activo`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const abrirPdf = async (contrato: Contract, download = false) => {
    setPdfCargando(contrato.id)
    try {
      await apiService.abrirContratoPdf(contrato.id, download)
    } catch {
      toast.error("No se pudo abrir el contrato")
    } finally {
      setPdfCargando(null)
    }
  }

  // Días restantes de contrato
  const diasRestantes = (fechaFin: string) => {
    const dias = Math.ceil((new Date(fechaFin).getTime() - Date.now()) / 86400000)
    return dias > 0 ? dias : 0
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
        <h1 className="text-3xl font-bold text-gray-900">Contratos activos</h1>
        <p className="text-gray-600 mt-1 text-sm">Los alquileres vigentes a tu nombre</p>
      </div>

      {contracts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <FileText className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No tienes contratos activos</h3>
          <p className="text-gray-500 text-sm">Cuando el propietario acepte tu solicitud de alquiler, el contrato aparecerá aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => {
            const vendedorNombre = [contract.vendedor?.nombre, contract.vendedor?.apellido].filter(Boolean).join(" ") || "Propietario"
            const dias = diasRestantes(contract.fecha_fin)
            return (
              <div key={contract.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-gray-900">{contract.property.titulo}</h2>
                      <Badge className="bg-green-500">Activo</Badge>
                      {contract.tipo_contrato === "anticretico" && <Badge className="bg-indigo-600">Anticrético</Badge>}
                      {dias <= 60 && (
                        <Badge className="bg-orange-500">Vence en {dias} días</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{contract.property.zona}</p>

                    <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(contract.fecha_inicio).toLocaleDateString("es-BO")} → {new Date(contract.fecha_fin).toLocaleDateString("es-BO")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <Link href="/mis-contratos/pagos">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 h-9">
                        <DollarSign className="w-3.5 h-3.5 mr-1" />
                        Ver pagos
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      disabled={pdfCargando === contract.id}
                      onClick={() => abrirPdf(contract, false)}
                    >
                      {pdfCargando === contract.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 mr-1" />
                      )}
                      Ver contrato
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
                      title="Descargar PDF"
                      disabled={pdfCargando === contract.id}
                      onClick={() => abrirPdf(contract, true)}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Franja inferior: monto + arrendador */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 flex-wrap text-sm">
                    <span className="font-semibold text-gray-900">
                      Bs. {contract.monto_mensual.toLocaleString()}
                      <span className="text-xs font-normal text-gray-400">/mes</span>
                    </span>
                    {contract.monto_deposito ? (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5" />
                        Depósito: Bs. {contract.monto_deposito.toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {vendedorNombre}
                    </span>
                    {contract.vendedor?.email && (
                      <a href={`mailto:${contract.vendedor.email}`} className="flex items-center gap-1 hover:text-blue-600">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="max-w-[180px] truncate">{contract.vendedor.email}</span>
                      </a>
                    )}
                    {contract.vendedor?.telefono && (
                      <a href={`tel:${contract.vendedor.telefono}`} className="flex items-center gap-1 hover:text-blue-600">
                        <Phone className="w-3.5 h-3.5" />
                        {contract.vendedor.telefono}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
