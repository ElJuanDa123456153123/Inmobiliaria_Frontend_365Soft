"use client"

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Receipt, User, Mail, Phone, Calendar, DollarSign, Building2, CheckCircle, XCircle, AlertCircle, Search, Filter } from 'lucide-react'
import Link from 'next/link'

interface ProofItem {
  id: number
  created_at: string
  monto: number
  estado: string
  comprobante_url: string
  user: {
    id: number
    nombre: string
    email: string
    telefono: string
  }
  plan: {
    id: number
    nombre: string
    precio: number
  }
  property?: {
    id: number
    titulo: string
  }
}

interface GetAllResponse {
  data: ProofItem[]
  total: number
  page: number
  limit: number
  total_pages: number
}

type TabType = 'pendientes' | 'historial'

export default function ComprobantesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pendientes')

  // Estado para pendientes
  const [pendingProofs, setPendingProofs] = useState<ProofItem[]>([])
  const [loadingPending, setLoadingPending] = useState(true)

  // Estado para historial
  const [historyData, setHistoryData] = useState<GetAllResponse | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Filtros de historial
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Modal de confirmación
  const [selectedProof, setSelectedProof] = useState<ProofItem | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [action, setAction] = useState<'aprobar' | 'rechazar'>('aprobar')
  const [rejectReason, setRejectReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (activeTab === 'pendientes') {
      fetchPendingProofs()
    } else {
      fetchHistoryProofs()
    }
  }, [activeTab, estadoFilter, searchTerm, currentPage])

  const fetchPendingProofs = async () => {
    try {
      setLoadingPending(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/payments/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener comprobantes')
      }

      const data = await response.json()
      setPendingProofs(data)
    } catch (err) {
      console.error('Error fetching pending proofs:', err)
    } finally {
      setLoadingPending(false)
    }
  }

  const fetchHistoryProofs = async () => {
    try {
      setLoadingHistory(true)
      const token = localStorage.getItem("token")

      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('limit', '20')

      if (estadoFilter) {
        params.append('estado', estadoFilter)
      }

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/payments/all?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Error al obtener historial')
      }

      const data: GetAllResponse = await response.json()
      setHistoryData(data)
    } catch (err) {
      console.error('Error fetching history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleAction = (proof: ProofItem, actionType: 'aprobar' | 'rechazar') => {
    setSelectedProof(proof)
    setAction(actionType)
    setRejectReason('')
    setShowConfirmModal(true)
  }

  const confirmAction = async () => {
    if (!selectedProof) return

    try {
      setSubmitting(true)
      const token = localStorage.getItem("token")

      const payload: any = {
        accion: action
      }

      if (action === 'rechazar') {
        if (!rejectReason.trim()) {
          alert('Debes ingresar un motivo para rechazar el comprobante')
          setSubmitting(false)
          return
        }
        payload.motivo = rejectReason
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/payments/${selectedProof.id}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Error al procesar la acción')
      }

      // Actualizar lista de pendientes
      setPendingProofs(pendingProofs.filter(p => p.id !== selectedProof.id))
      setShowConfirmModal(false)
      setSelectedProof(null)

      // Mostrar mensaje de éxito
      alert(action === 'aprobar' ? 'Comprobante aprobado exitosamente' : 'Comprobante rechazado')
    } catch (err) {
      console.error('Error processing action:', err)
      alert('Error al procesar la acción. Intenta nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'PAGADO':
        return 'bg-emerald-100 text-emerald-800'
      case 'RECHAZADO':
        return 'bg-red-100 text-red-800'
      case 'EN_PROCESO':
        return 'bg-yellow-100 text-yellow-800'
      case 'VENCIDO':
        return 'bg-gray-100 text-gray-800'
      case 'PENDIENTE':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'PAGADO':
        return 'Pagado'
      case 'RECHAZADO':
        return 'Rechazado'
      case 'EN_PROCESO':
        return 'En Proceso'
      case 'VENCIDO':
        return 'Vencido'
      case 'PENDIENTE':
        return 'Pendiente'
      default:
        return estado
    }
  }

  const renderProofCard = (proof: ProofItem, showActions: boolean = false) => (
    <div
      key={proof.id}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
    >
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: Información del usuario y pago */}
          <div className="lg:col-span-2 space-y-4">
            {/* Usuario */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Información del Usuario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Nombre:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{proof.user.nombre}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{proof.user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{proof.user.telefono}</span>
                </div>
              </div>
            </div>

            {/* Pago */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Información del Pago
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monto</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    Bs. {proof.monto.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Plan</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {proof.plan.nombre}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fecha</p>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(proof.created_at).toLocaleDateString('es-BO')}
                  </p>
                </div>
              </div>
            </div>

            {/* Estado */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Estado:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold ${getEstadoBadge(proof.estado)}`}>
                  {getEstadoLabel(proof.estado)}
                </span>
              </div>
            </div>

            {/* Propiedad (si existe) */}
            {proof.property && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Propiedad
                </h3>
                <p className="text-sm text-gray-900 dark:text-white">
                  {proof.property.titulo}
                </p>
              </div>
            )}
          </div>

          {/* Columna derecha: Imagen del comprobante */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Comprobante
            </h3>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/${proof.comprobante_url}`}
                alt="Comprobante de pago"
                className="w-64 h-48 object-cover rounded border border-gray-300 dark:border-gray-700 mx-auto cursor-pointer hover:scale-105 transition-transform"
                onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/${proof.comprobante_url}`, '_blank')}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Click en la imagen para ampliar
            </p>
          </div>
        </div>

        {/* Botones de acción (solo para pendientes) */}
        {showActions && (
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => handleAction(proof, 'rechazar')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Rechazar
            </button>
            <button
              onClick={() => handleAction(proof, 'aprobar')}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Aprobar
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/reportes"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Comprobantes de Pago
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gestión completa de comprobantes pendientes e historial
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => {
                setActiveTab('pendientes')
                setCurrentPage(1)
              }}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'pendientes'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Pendientes
                {pendingProofs.length > 0 && (
                  <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                    {pendingProofs.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('historial')
                setCurrentPage(1)
              }}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'historial'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Receipt className="h-5 w-5" />
                Historial Completo
              </div>
            </button>
          </div>
        </div>

        {/* Filtros de historial (solo mostrar en tab de historial) */}
        {activeTab === 'historial' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Búsqueda */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Filtro por estado */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={estadoFilter}
                  onChange={(e) => {
                    setEstadoFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Todos los estados</option>
                  <option value="PAGADO">Pagado</option>
                  <option value="RECHAZADO">Rechazado</option>
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="VENCIDO">Vencido</option>
                  <option value="PENDIENTE">Pendiente</option>
                </select>
              </div>

              {/* Info de resultados */}
              <div className="flex items-center justify-center md:justify-end text-sm text-gray-600 dark:text-gray-400">
                {historyData && (
                  <span>
                    {historyData.total} resultado{historyData.total !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Pendientes */}
        {activeTab === 'pendientes' && (
          <>
            {loadingPending ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : pendingProofs.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-800">
                <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No hay comprobantes pendientes
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Todos los comprobantes han sido procesados
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {pendingProofs.map((proof) => renderProofCard(proof, true))}
              </div>
            )}
          </>
        )}

        {/* Tab Historial */}
        {activeTab === 'historial' && (
          <>
            {loadingHistory ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : !historyData || historyData.data.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-800">
                <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No hay comprobantes en el historial
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No se encontraron resultados con los filtros actuales
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6">
                  {historyData.data.map((proof) => renderProofCard(proof, false))}
                </div>

                {/* Paginación */}
                {historyData.total_pages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>

                    <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                      Página {currentPage} de {historyData.total_pages}
                    </span>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, historyData.total_pages))}
                      disabled={currentPage === historyData.total_pages}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              {action === 'aprobar' ? (
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {action === 'aprobar' ? '¿Aprobar Comprobante?' : '¿Rechazar Comprobante?'}
              </h3>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Usuario:</strong> {selectedProof.user.nombre}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Monto:</strong> Bs. {selectedProof.monto.toFixed(2)}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Plan:</strong> {selectedProof.plan.nombre}
              </p>
            </div>

            {action === 'rechazar' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Motivo del rechazo <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explica por qué se rechaza este comprobante..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false)
                  setSelectedProof(null)
                  setRejectReason('')
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={confirmAction}
                disabled={submitting}
                className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                  action === 'aprobar'
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-red-500 hover:bg-red-600'
                } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : action === 'aprobar' ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Aprobar
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Rechazar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
