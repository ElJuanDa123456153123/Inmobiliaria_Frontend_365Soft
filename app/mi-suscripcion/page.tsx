'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, History, CreditCard, ArrowRight, Loader2, Sparkles, RefreshCw } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import SubscriptionCard from '@/components/SubscriptionCard'
import type { Subscription, QrPago } from '@/lib/services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function MiSuscripcionPage() {
  const router = useRouter()
  const [activeSub, setActiveSub] = useState<Subscription | null>(null)
  const [allSubs, setAllSubs] = useState<Subscription[]>([])
  const [payments, setPayments] = useState<QrPago[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  // Helper para hacer fetch seguro sin lanzar excepciones (evita el overlay de error de Next.js dev)
  const safeFetch = async (url: string, method: string = 'GET'): Promise<any | null> => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }

  const getApiUrl = () => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
    }
    return 'http://localhost:3001'
  }

  const fetchData = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/ingresar?redirect=/mi-suscripcion')
      return
    }

    setLoading(true)
    const baseUrl = getApiUrl()

    // 1. Obtener la suscripción seleccionada actual
    const subData = await safeFetch(`${baseUrl}/api/payments/subscription`)
    setActiveSub(subData || null)

    // 2. Obtener todas las suscripciones
    const subsData = await safeFetch(`${baseUrl}/api/payments/subscriptions`)
    setAllSubs(Array.isArray(subsData) ? subsData : [])

    // 3. Obtener el historial de pagos
    const payData = await safeFetch(`${baseUrl}/api/payments`)
    if (Array.isArray(payData)) {
      setPayments(payData)
    } else if (payData && Array.isArray(payData.pagos)) {
      setPayments(payData.pagos)
    } else {
      setPayments([])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelectSubscription = async (subId: number) => {
    setActionLoading(subId)
    const baseUrl = getApiUrl()
    const result = await safeFetch(`${baseUrl}/api/payments/subscriptions/${subId}/select`, 'POST')
    if (result) {
      toast.success('Suscripción seleccionada como activa con éxito')
      await fetchData()
    } else {
      toast.error('Error al seleccionar la suscripción')
    }
    setActionLoading(null)
  }

  // Formatear precio
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Formatear fecha corta
  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAGADO':
      case 'COMPLETADO':
      case 'ACTIVA':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 uppercase font-bold text-[10px]">Pagado</Badge>
      case 'PENDIENTE':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200 uppercase font-bold text-[10px]">Pendiente</Badge>
      case 'CANCELADO':
        return <Badge className="bg-red-100 text-red-600 border-red-200 uppercase font-bold text-[10px]">Cancelado</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 border-gray-200 uppercase font-bold text-[10px]">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground font-medium">Cargando tus datos de suscripción...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Banner de Bienvenida */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/90 to-teal-600 rounded-2xl p-8 mb-8 shadow-lg">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white rounded-full blur-3xl opacity-10" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Control de Vigencia
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                Mi Suscripción
              </h1>
              <p className="text-white/80 text-sm md:text-base mt-2 max-w-xl">
                Monitorea el vencimiento de tus publicaciones y administra tus planes para maximizar la visibilidad de tus propiedades.
              </p>
            </div>
            <div>
              <Button
                variant="outline"
                className="border-white/30 hover:bg-white/10 text-white bg-white/10 font-semibold"
                onClick={fetchData}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tarjeta Plan Actual (Izquierda / Principal) */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Plan de Suscripción Activo
            </h2>

            {activeSub ? (
              <SubscriptionCard subscription={activeSub} />
            ) : (
              <Card className="border-dashed border-gray-300 text-center py-16 px-6">
                <CardContent className="space-y-6">
                  <div className="w-16 h-16 bg-amber-100 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto">
                    <Crown className="w-8 h-8 text-amber-500" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">No tienes un plan seleccionado</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Para publicar propiedades necesitas adquirir una suscripción. Si ya compraste un plan, puedes seleccionarlo en la sección de abajo.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/planes')}
                    className="bg-primary hover:bg-primary/90 font-bold px-8 py-6 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all"
                  >
                    Ver Planes Disponibles
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Listado de Suscripciones Históricas/Alternativas */}
            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Mis Suscripciones Contratadas
              </h2>

              {allSubs.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl border border-gray-200 text-muted-foreground text-sm italic">
                  No has contratado suscripciones todavía.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allSubs.map((sub) => {
                    const isSelected = sub.seleccionada
                    // Corregir validación: suscripción expirada si no está ACTIVA o si fecha_fin es pasada
                    const isExp = sub.estado !== 'ACTIVA' || (sub.fecha_fin && new Date(sub.fecha_fin) < new Date())

                    return (
                      <Card
                        key={sub.id}
                        className={`border transition-all duration-200 ${
                          isSelected
                            ? 'border-primary shadow-md ring-1 ring-primary/20'
                            : 'hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <CardHeader className="pb-3 flex flex-row items-start justify-between">
                          <div>
                            <CardTitle className="text-base font-bold text-gray-900">
                              {sub.plan?.nombre || 'Suscripción'}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                              ID: {sub.id} • Límite: {sub.plan?.limite_propiedades} prop.
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            {isSelected ? (
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] uppercase font-bold">
                                Seleccionada
                              </Badge>
                            ) : isExp ? (
                              <Badge className="bg-rose-100 text-rose-600 border-rose-200 text-[9px] uppercase font-bold">
                                Expirada
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-100 text-emerald-600 border-emerald-200 text-[9px] uppercase font-bold">
                                Disponible
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pb-4 space-y-3">
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex justify-between">
                              <span>Período:</span>
                              <span className="font-semibold text-gray-700">
                                {formatDateShort(sub.fecha_inicio)} al {formatDateShort(sub.fecha_fin)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Propiedades usadas:</span>
                              <span className="font-semibold text-gray-700">
                                {sub.propiedades_usadas} de {sub.plan?.limite_propiedades}
                              </span>
                            </div>
                          </div>

                          {!isSelected && !isExp && sub.estado === 'ACTIVA' && (
                            <Button
                              onClick={() => handleSelectSubscription(sub.id)}
                              disabled={actionLoading !== null}
                              className="w-full mt-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs py-2 h-auto rounded-lg"
                            >
                              {actionLoading === sub.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                'Seleccionar como Activa'
                              )}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Historial de Pagos (Derecha) */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Historial de Pagos
            </h2>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  Transacciones QR recientes
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                {payments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground italic">
                    No registras pagos con QR.
                  </div>
                ) : (
                  <div className="divide-y max-h-[500px] overflow-y-auto">
                    {payments.map((pay) => (
                      <div key={pay.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-800">
                              {pay.detalle_glosa ? pay.detalle_glosa.replace('Publicación de propiedad - ', '') : 'Pago QR'}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <span>{formatDateShort(pay.created_at)}</span>
                            <span>•</span>
                            <span className="font-mono text-gray-400">Alias: {pay.alias}</span>
                          </p>
                        </div>
                        <div className="text-right space-y-1.5">
                          <span className="font-extrabold text-sm block text-gray-900">
                            {formatMoney(pay.monto)}
                          </span>
                          {getStatusBadge(pay.estado)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
