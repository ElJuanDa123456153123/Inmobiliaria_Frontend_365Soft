"use client"

import React from 'react'
import { Shield, Lock, HeadphonesIcon as Headphones, Award, CheckCircle2, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface TrustBadge {
  icon: React.ElementType
  title: string
  description: string
  color: string
}

const badges: TrustBadge[] = [
  {
    icon: Shield,
    title: "Pago Seguro",
    description: "Transacción encriptada de extremo a extremo",
    color: "text-blue-600 dark:text-blue-400"
  },
  {
    icon: Lock,
    title: "SSL Certificado",
    description: "Conexión segura con certificado SSL",
    color: "text-green-600 dark:text-green-400"
  },
  {
    icon: CheckCircle2,
    title: "Verificación Automática",
    description: "Confirmación instantánea del pago",
    color: "text-purple-600 dark:text-purple-400"
  },
  {
    icon: Zap,
    title: "Activación Inmediata",
    description: "Tu plan se activa al confirmar pago",
    color: "text-orange-600 dark:text-orange-400"
  },
  {
    icon: Award,
    title: "Satisfecho o Garantizado",
    description: "30 días de garantía de devolución",
    color: "text-pink-600 dark:text-pink-400"
  },
  {
    icon: Headphones,
    title: "Soporte 24/7",
    description: "Asistencia técnica disponible siempre",
    color: "text-cyan-600 dark:text-cyan-400"
  }
]

export default function TrustBadges() {
  return (
    <Card className="border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-primary/10 rounded-full p-2">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h3 className="ml-3 text-lg font-bold text-gray-900 dark:text-white">
            ¿Por qué pagar con nosotros?
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge, index) => {
            const Icon = badge.icon
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <div className={`bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-2.5 border-2 ${badge.color.replace('text-', 'border-').replace('-600', '/20').replace('-400', '/30')}`}>
                  <Icon className={`w-5 h-5 ${badge.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                    {badge.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Additional Trust Message */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm font-medium text-green-900 dark:text-green-300">
              Más de 10,000 usuarios confían en nosotros. Pagos procesados de forma segura.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
