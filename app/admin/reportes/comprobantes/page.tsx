"use client"

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Receipt, User, Mail, Phone, Calendar, DollarSign, Building2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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

export default function ComprobantesPage() {
  const [proofs, setProofs] = useState<ProofItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProof, setSelectedProof] = useState<ProofItem | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [action, setAction] = useState<'aprobar' | 'rechazar'>('aprobar')
  const [rejectReason, setRejectReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProofs()
  }, [])

  const fetchProofs = async () => {
    try {
      setLoading(true)
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
      setProofs(data)
    } catch (err) {
      setError('Error al cargar los comprobantes. Intenta nuevamente.')
      console.error('Error fetching proofs:', err)
    } finally {
      setLoading(false)
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

      // Actualizar lista
      setProofs(proofs.filter(p => p.id !== selectedProof.id))
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando comprobantes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchProofs}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

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
                Comprobantes Pendientes
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Revisa y aprueba los comprobantes de pago enviados por los usuarios
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {proofs.length === 0 ? (
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
            {proofs.map((proof) => (
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
                          className="w-64 h-48 object-cover rounded border border-gray-300 dark:border-gray-700 mx-auto"
                          onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/${proof.comprobante_url}`, '_blank')}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        Click en la imagen para ampliar
                      </p>
                    </div>
                  </div>

                  {/* Botones de acción */}
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
                </div>
              </div>
            ))}
          </div>
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
