"use client"

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Download, Filter, TrendingUp, DollarSign, Users, BarChart3, RefreshCw, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import StatCard from '@/components/admin/StatCard'
import BarChart from '@/components/admin/BarChart'
import LineChart from '@/components/admin/LineChart'

interface Transaction {
  id: number
  date: string
  client_name: string
  plan_name: string
  amount: number
}

interface AdvisorIncome {
  advisor_id: number
  name: string
  amount: number
  count: number
}

interface IncomeReport {
  period: {
    start: string
    end: string
  }
  summary: {
    total_income: number
    payment_count: number
    average_ticket: number
    growth_vs_previous: number
  }
  by_plan: {
    [key: string]: {
      amount: number
      count: number
    }
  }
  by_month: Array<{
    month: string
    amount: number
  }>
  by_advisor?: Array<{
    advisor_id: number
    name: string
    amount: number
    count: number
  }>
  transactions?: Transaction[]
  user_payments?: Array<{
    payment_id: number
    user_id: number
    user_name: string
    email: string
    amount: number
    status: string
    payment_method: string
    process_date?: string
    plan_name?: string
  }>
}

export default function IngresosReportPage() {
  const [report, setReport] = useState<IncomeReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Filtros
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 11)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])
  const [showTransactions, setShowTransactions] = useState(false)

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PAGADO':
        return { icon: CheckCircle, label: 'Pagado' }
      case 'PENDIENTE':
        return { icon: Clock, label: 'Pendiente' }
      case 'CANCELADO':
        return { icon: XCircle, label: 'Cancelado' }
      case 'EN_PROCESO':
        return { icon: Loader2, label: 'En Proceso' }
      default:
        return { icon: Clock, label: status }
    }
  }

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        include_transactions: showTransactions.toString()
      })

      const response = await fetch(`${apiUrl}/admin/reports/income?${params}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setReport(data)
        setError(null)
      } else {
        setError("No tienes permisos para ver reportes. Verifica que seas administrador.")
      }
    } catch (err) {
      setError("Error de conexión al servidor.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [startDate, endDate, showTransactions])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchReport()
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Cargando reporte de ingresos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-8">
        <div className="bg-red-500/10 dark:bg-red-950/20 border border-red-500/20 dark:border-red-800 rounded-2xl p-8 max-w-lg text-center">
          <div className="bg-red-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Filter className="h-8 w-8 text-red-600 dark:text-red-400" />
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

  if (!report) return null

  // Preparar datos para gráficos
  const chartByMonth = report.by_month.map(m => ({
    label: m.month.substring(5), // Solo MM
    value: m.amount
  }))

  const chartByPlan = Object.entries(report.by_plan || {}).map(([name, data]) => ({
    label: name,
    value: data.amount
  }))

  const chartByAdvisor = report.by_advisor?.map(a => ({
    label: a.name,
    value: a.amount
  })) || []

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
                  <TrendingUp className="h-8 w-8 text-primary" />
                  Reporte de Ingresos
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Análisis completo de ingresos y transacciones
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              title="Actualizar reporte"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Filtros */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filtros del Reporte
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha Inicio
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha Fin
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-end">
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 flex-1">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <strong>Período:</strong> {report.period.start} a {report.period.end}
                </p>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={() => setShowTransactions(!showTransactions)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showTransactions
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {showTransactions ? 'Ocultar' : 'Ver'} Transacciones
              </button>
            </div>
          </div>
        </div>

        {/* StatCards - Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Ingresos Totales"
            value={formatCurrency(report.summary.total_income)}
            icon={DollarSign}
          />
          <StatCard
            title="Cantidad de Pagos"
            value={formatNumber(report.summary.payment_count)}
            icon={BarChart3}
          />
          <StatCard
            title="Ticket Promedio"
            value={formatCurrency(report.summary.average_ticket)}
            icon={Users}
          />
          <StatCard
            title="Crecimiento"
            value={`${report.summary.growth_vs_previous >= 0 ? '+' : ''}${report.summary.growth_vs_previous.toFixed(1)}%`}
            icon={TrendingUp}
            trend={{
              value: `${report.summary.growth_vs_previous >= 0 ? '+' : ''}${report.summary.growth_vs_previous.toFixed(1)}%`,
              isPositive: report.summary.growth_vs_previous >= 0
            }}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ingresos por Mes */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ingresos por Mes
            </h3>
            <LineChart data={chartByMonth} color="#10b981" />
          </div>

          {/* Ingresos por Plan */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ingresos por Tipo de Plan
            </h3>
            <BarChart data={chartByPlan} color="#3b82f6" />
          </div>
        </div>

        {/* Ingresos por Asesor */}
        {report.by_advisor && report.by_advisor.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ingresos por Asesor
            </h3>
            <BarChart data={chartByAdvisor} color="#8b5cf6" />
          </div>
        )}

        {/* Tabla de Transacciones */}
        {showTransactions && report.transactions && report.transactions.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Transacciones Detalladas
                </h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/95 transition-colors">
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </button>
              </div>
            </div>

            {/* Tabla Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {report.transactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {trx.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {trx.client_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {trx.plan_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(trx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards Móviles */}
            <div className="lg:hidden p-4 space-y-4">
              {report.transactions.map((trx) => (
                <div key={trx.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {trx.client_name}
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(trx.amount)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
                      <p className="text-gray-900 dark:text-white mt-1">{trx.date}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Plan:</span>
                      <p className="text-gray-900 dark:text-white mt-1">{trx.plan_name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Todos los Pagos Individuales */}
        {report.user_payments && report.user_payments.length > 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Todos los Pagos de Usuarios
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Lista completa de pagos de suscripciones con todos los estados y métodos
              </p>
            </div>

            {/* Tabla Desktop - Tablets y Desktop */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Usuario
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Plan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Monto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Método
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Fecha Proceso
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {report.user_payments.map((payment) => (
                      <tr key={payment.payment_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {payment.user_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {payment.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {payment.plan_name || 'Sin Plan'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            payment.status === 'PAGADO'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : payment.status === 'PENDIENTE'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : payment.status === 'CANCELADO'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {(() => {
                              const { icon: Icon, label } = getStatusDisplay(payment.status)
                              return (
                                <>
                                  <Icon className="h-3.5 w-3.5" />
                                  {label}
                                </>
                              )
                            })()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {payment.payment_method || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {payment.process_date ? new Date(payment.process_date).toLocaleString('es-BO') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cards Móviles */}
            <div className="md:hidden p-4 space-y-4">
              {report.user_payments.map((payment) => (
                <div key={payment.payment_id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {payment.user_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {payment.email}
                      </p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(payment.amount)}
                      </p>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mt-1 ${
                        payment.status === 'PAGADO'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : payment.status === 'PENDIENTE'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : payment.status === 'CANCELADO'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {(() => {
                          const { icon: Icon, label } = getStatusDisplay(payment.status)
                          return (
                            <>
                              <Icon className="h-3.5 w-3.5" />
                              {label}
                            </>
                          )
                        })()}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="min-w-0">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Plan:</span>
                      <p className="text-gray-900 dark:text-white mt-1 truncate" title={payment.plan_name || 'Sin Plan'}>
                        {payment.plan_name || 'Sin Plan'}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Método:</span>
                      <p className="text-gray-900 dark:text-white mt-1 truncate">
                        {payment.payment_method || '-'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Fecha Proceso:</span>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {payment.process_date ? new Date(payment.process_date).toLocaleString('es-BO') : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No hay pagos registrados aún
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Cuando los usuarios realicen pagos de suscripciones, aparecerán aquí.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
