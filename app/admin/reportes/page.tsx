"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, DollarSign, Users, FileText, BarChart3, Receipt } from 'lucide-react'

export default function ReportesPage() {
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    // Obtener contador de comprobantes pendientes
    const fetchPendingCount = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/payments/pending/count`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setPendingCount(data.count || 0)
        }
      } catch (error) {
        console.error("Error fetching pending proofs count:", error)
      }
    }

    fetchPendingCount()
  }, [])

  const reportes = [
    {
      title: "Reporte de Ingresos",
      description: "Análisis completo de ingresos por período, con desglose por tipo de plan, asesor y mes.",
      href: "/admin/reportes/ingresos",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Métricas de Suscripciones",
      description: "Estadísticas de suscripciones activas, MRR, churn rate y distribución por plan.",
      href: "/admin/reportes/suscripciones",
      icon: Users,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Dashboard Financiero",
      description: "Vista general de métricas financieras clave para toma de decisiones rápida.",
      href: "/admin/analytics",
      icon: BarChart3,
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Comprobantes",
      description: "Revisa y aprueba los comprobantes de pago pendientes de verificación.",
      href: "/admin/reportes/comprobantes",
      icon: Receipt,
      color: "from-orange-500 to-red-600",
      badge: pendingCount
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Reportes Financieros
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Análisis detallado de ingresos, suscripciones y métricas clave
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grid de Reportes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportes.map((reporte) => {
            const Icon = reporte.icon
            return (
              <Link
                key={reporte.href}
                href={reporte.href}
                className="group"
              >
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50">
                  {/* Icon Header */}
                  <div className={`bg-gradient-to-r ${reporte.color} p-6`}>
                    <div className="flex items-center justify-between">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowLeft className="h-4 w-4 text-white rotate-[-90deg]" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        {reporte.title}
                      </h3>
                      {reporte.badge !== undefined && reporte.badge > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                          {reporte.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {reporte.description}
                    </p>

                    <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Ver reporte</span>
                      <ArrowLeft className="h-4 w-4 ml-1 rotate-[-90deg]" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl p-8 border border-primary/20">
          <div className="flex items-start gap-4">
            <div className="bg-primary/20 rounded-xl p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Sobre los Reportes
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Los reportes financieros proporcionan información detallada sobre el rendimiento económico de la plataforma.
                Puedes filtrar por períodos de tiempo, tipo de plan, asesor específico, y exportar los datos para análisis externo.
                Los datos se actualizan en tiempo real basándose en las transacciones procesadas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
