'use client'

import React from 'react'
import Link from 'next/link'
import { Calendar, CheckCircle, AlertTriangle, ArrowUpRight, BarChart3, Clock } from 'lucide-react'
import { Subscription } from '@/lib/services/api'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface SubscriptionCardProps {
  subscription: Subscription
}

export default function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const plan = subscription.plan
  const propertiesUsed = subscription.propiedades_usadas || 0
  const maxProperties = plan?.limite_propiedades || 0
  const percentUsed = maxProperties > 0 ? (propertiesUsed / maxProperties) * 100 : 0

  // Formatear fechas
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  // Calcular días restantes
  const calculateDaysRemaining = (endDateStr: string) => {
    if (!endDateStr) return 0
    const endDate = new Date(endDateStr)
    const now = new Date()
    endDate.setHours(0, 0, 0, 0)
    now.setHours(0, 0, 0, 0)
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const daysRemaining = calculateDaysRemaining(subscription.fecha_fin)
  const isExpired = subscription.estado !== 'ACTIVA' || new Date(subscription.fecha_fin) < new Date()

  // Determinar color de gradiente por nombre de plan
  const getPlanGradient = (planName: string = '') => {
    const name = planName.toLowerCase()
    if (name.includes('premium')) return 'from-violet-600 via-indigo-600 to-blue-600'
    if (name.includes('estandar') || name.includes('estándar')) return 'from-amber-500 to-orange-600'
    return 'from-emerald-500 to-teal-600' // Básico / default
  }

  const gradientClass = getPlanGradient(plan?.nombre)

  return (
    <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Fondo decorativo con gradiente */}
      <div className={`absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-gradient-to-br ${gradientClass} rounded-full blur-3xl opacity-10`} />

      <CardHeader className="relative pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Plan Contratado
            </span>
            <CardTitle className="text-3xl font-extrabold tracking-tight mt-1 text-gray-900">
              {plan?.nombre || 'Plan Activo'}
            </CardTitle>
          </div>
          <Badge
            className={`px-3 py-1 font-bold text-xs uppercase ${
              isExpired
                ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
                : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
            }`}
          >
            {isExpired ? 'Vencida' : 'Activa'}
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground text-sm mt-2">
          {plan?.descripcion || 'Disfruta de los beneficios de tu publicación.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative py-6 space-y-6">
        {/* Barra de progreso de propiedades */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <BarChart3 className="w-4 h-4 text-primary" />
              Límite de Propiedades
            </span>
            <span className="font-semibold text-gray-800">
              Usaste <span className="text-primary font-bold">{propertiesUsed}</span> de <span className="font-bold">{maxProperties}</span>
            </span>
          </div>
          
          <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden ring-1 ring-gray-200">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>{propertiesUsed >= maxProperties ? 'Límite alcanzado' : `${(maxProperties - propertiesUsed)} disponibles`}</span>
            <span>100%</span>
          </div>
        </div>

        {/* Fechas de vigencia */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Fecha de Inicio
            </span>
            <p className="text-sm font-semibold text-gray-800">
              {formatDate(subscription.fecha_inicio)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Vence el
            </span>
            <p className="text-sm font-semibold text-gray-800">
              {formatDate(subscription.fecha_fin)}
            </p>
          </div>
        </div>

        {/* Alerta de días restantes */}
        <div className={`p-4 rounded-xl flex items-start gap-3 border ${
          isExpired
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : daysRemaining <= 5
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {isExpired ? (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
          ) : daysRemaining <= 5 ? (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500 mt-0.5" />
          ) : (
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5" />
          )}
          <div>
            <h4 className="font-bold text-sm">
              {isExpired
                ? 'Suscripción expirada'
                : daysRemaining === 1
                  ? 'Queda 1 día restante'
                  : `Quedan ${daysRemaining} días restantes`}
            </h4>
            <p className="text-xs opacity-80 mt-1">
              {isExpired
                ? 'Tu plan ha finalizado. Renueva tu suscripción para seguir publicando tus propiedades.'
                : daysRemaining <= 5
                  ? 'Tu plan está muy cerca de vencer. Te sugerimos renovar para evitar la desactivación de tus propiedades.'
                  : 'Tu plan se encuentra en vigencia normal y tus propiedades están activas en el buscador.'}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative px-6 py-4 flex items-center justify-between">
        <Link href="/planes" className="w-full">
          <Button className={`w-full font-bold bg-gradient-to-r ${gradientClass} text-white border-none hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-1.5 py-5 rounded-lg shadow-md`}>
            Renovar suscripción
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
