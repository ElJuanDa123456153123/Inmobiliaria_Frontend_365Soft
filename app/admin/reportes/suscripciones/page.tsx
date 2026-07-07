"use client"

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Users, TrendingUp, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import StatCard from '@/components/admin/StatCard'
import BarChart from '@/components/admin/BarChart'

interface SubscriptionMetrics {
  total_subscriptions: number
  active_subscriptions: number
  monthly_recurring_revenue: number
  new_subscriptions_this_month: number
  churned_subscriptions_this_month: number
  by_plan: {
    [key: string]: number
  }
}

export default function SuscripcionesReportPage() {
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

      const response = await fetch(`${apiUrl}/admin/reports/subscriptions`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
        setError(null)
      } else {
        setError("No tienes permisos para ver reportes de suscripciones. Verifica que seas administrador.")
      }
    } catch (err) {
      setError("Error de conexión al servidor.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchMetrics()
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 0
    }).format(val)
  }

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('es-BO').format(val)
  }

  // Calcular churn rate
  const churnRate = metrics && metrics.active_subscriptions > 0
    ? ((metrics.churned_subscriptions_this_month / metrics.active_subscriptions) * 100).toFixed(1)
    : '0.0'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Cargando métricas de suscripciones...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-8">
        <div className="bg-red-500/10 dark:bg-red-950/20 border border-red-500/20 dark:border-red-800 rounded-2xl p-8 max-w-lg text-center">
          <div className="bg-red-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-primary text-white rounded-xl font-semibold shadow-sm hover:bg-primary/95 transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!metrics) return null

  // Preparar datos para el gráfico
  const chartByPlan = Object.entries(metrics.by_plan || {}).map(([name, count]) => ({
    label: name,
    value: count
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/reportes"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  Métricas de Suscripciones
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Análisis de suscripciones activas, MRR y distribución por plan
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              title="Actualizar métricas"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* StatCards - Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Suscripciones Activas"
            value={formatNumber(metrics.active_subscriptions)}
            icon={Users}
            description={`de ${formatNumber(metrics.total_subscriptions)} totales`}
          />
          <StatCard
            title="MRR (Ingresos Recurrentes)"
            value={formatCurrency(metrics.monthly_recurring_revenue)}
            icon={TrendingUp}
            description="Ingresos mensuales recurrentes"
          />
          <StatCard
            title="Nuevas este Mes"
            value={formatNumber(metrics.new_subscriptions_this_month)}
            icon={TrendingUp}
            trend={{
              value: `Churn: ${churnRate}%`,
              isPositive: parseFloat(churnRate) < 5
            }}
          />
        </div>

        {/* Información Adicional */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribución por Plan */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Suscripciones por Tipo de Plan
            </h3>
            {chartByPlan.length > 0 ? (
              <BarChart data={chartByPlan} color="#3b82f6" />
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No hay datos de suscripciones por plan
              </p>
            )}
          </div>

          {/* Detalles del Mes */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actividad del Mes
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nuevas Suscripciones</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatNumber(metrics.new_subscriptions_this_month)}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Canceladas/Vencidas</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatNumber(metrics.churned_subscriptions_this_month)}
                  </p>
                </div>
                <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
                  <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasa de Churn</p>
                  <span className={`text-lg font-bold ${
                    parseFloat(churnRate) < 5 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {churnRate}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {parseFloat(churnRate) < 5
                    ? '✓ Tasa de churn saludable (< 5%)'
                    : '⚠ Tasa de churn elevada (> 5%)'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información sobre MRR */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl p-8 border border-primary/20">
          <div className="flex items-start gap-4">
            <div className="bg-primary/20 rounded-xl p-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Sobre el MRR (Monthly Recurring Revenue)
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                El MRR representa los ingresos recurrentes mensuales que la plataforma genera de suscripciones activas.
                Es una métrica clave para evaluar la estabilidad financiera y el crecimiento a largo plazo.
                Un MRR creciente junto con una tasa de churn baja (menos del 5%) indica una plataforma saludable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
