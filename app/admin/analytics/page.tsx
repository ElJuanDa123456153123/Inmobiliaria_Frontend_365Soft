"use client"

import React, { useState, useEffect } from 'react'
import { Users, Building2, DollarSign, Eye, ShieldAlert, Award, TrendingUp, RefreshCw } from 'lucide-react'
import StatCard from '@/components/admin/StatCard'
import LineChart from '@/components/admin/LineChart'
import BarChart from '@/components/admin/BarChart'

interface PropertyImage {
  id: number
  url: string
}

interface Property {
  id: number
  titulo: string
  precio: number
  moneda: string
  tipo_propiedad: string
  estado_propiedad: string
  vistas_contador: number
  PropertyImages?: PropertyImage[]
}

interface DayCount {
  date: string
  count: number
}

interface TypeCount {
  type: string
  count: number
}

interface MonthIncome {
  month: string
  amount: number
}

interface AnalyticsData {
  total_users: number
  total_properties: number
  active_properties: number
  pending_properties: number
  income_current_month: number
  properties_by_day: DayCount[]
  properties_by_type: TypeCount[]
  income_by_month: MonthIncome[]
  most_viewed_properties: Property[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
      
      const response = await fetch(`${apiUrl}/admin/analytics`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setData(result)
        setError(null)
      } else {
        setError("No se pudieron cargar los datos estadísticos. Verifique sus permisos.")
      }
    } catch (err) {
      setError("Error de conexión al servidor de base de datos.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAnalytics()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Cargando métricas y análisis de datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 flex flex-col items-center max-w-lg mx-auto mt-12 text-center">
          <ShieldAlert className="h-12 w-12 text-red-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="px-6 py-2 bg-primary text-white rounded-xl font-semibold shadow-sm hover:bg-primary/95 transition-all"
          >
            Reintentar Conexión
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  // Mapear datos para gráficos con safe checks
  const chartPropsByDay = (data.properties_by_day || []).map(d => ({
    label: d.date.substring(5), // Solo mostrar MM-DD
    value: d.count
  }))

  const chartPropsByType = (data.properties_by_type || []).map(t => ({
    label: t.type,
    value: t.count
  }))

  const chartIncomeByMonth = (data.income_by_month || []).map(m => ({
    label: m.month,
    value: m.amount
  }))

  // Formateadores
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 0 }).format(val)
  }

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('es-BO').format(val)
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Panel de Estadísticas</h1>
          <p className="text-gray-500 mt-1">Monitoreo en tiempo real del rendimiento de la inmobiliaria, registros e ingresos.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Actualizando...' : 'Actualizar Datos'}
        </button>
      </div>

      {/* Cards de Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Usuarios Registrados"
          value={formatNumber(data.total_users)}
          icon={Users}
          description="Usuarios activos con rol 'usuario'"
          trend={{ value: "+12.5%", isPositive: true }}
        />
        <StatCard
          title="Propiedades Publicadas"
          value={formatNumber(data.total_properties)}
          icon={Building2}
          description="Propiedades totales en el catálogo"
          trend={{ value: "+8.3%", isPositive: true }}
        />
        <StatCard
          title="Activas vs Pendientes"
          value={`${data.active_properties} / ${data.pending_properties}`}
          icon={TrendingUp}
          description="Propiedades aprobadas vs. por aprobar"
        />
        <StatCard
          title="Ingresos del Mes"
          value={formatCurrency(data.income_current_month)}
          icon={DollarSign}
          description="Suscripciones y publicaciones (BOB)"
          trend={{ value: "+18.2%", isPositive: true }}
        />
      </div>

      {/* Fila de Gráficos 1: Propiedades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-bold text-gray-900">Propiedades por Día</h2>
            <span className="text-xs font-semibold text-gray-500 bg-gray-200/50 px-2.5 py-1 rounded-lg">Últimos 30 días</span>
          </div>
          <LineChart 
            data={chartPropsByDay} 
            color="#3b82f6" 
            valueFormatter={(v) => `${v} props`}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-bold text-gray-900">Distribución por Tipo</h2>
            <span className="text-xs font-semibold text-gray-500 bg-gray-200/50 px-2.5 py-1 rounded-lg">Histórico</span>
          </div>
          <BarChart 
            data={chartPropsByType} 
            color="#10b981"
            valueFormatter={(v) => `${v}`}
          />
        </div>
      </div>

      {/* Fila de Gráficos 2: Ingresos */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-bold text-gray-900">Historial de Ingresos Mensuales</h2>
          <span className="text-xs font-semibold text-gray-500 bg-gray-200/50 px-2.5 py-1 rounded-lg">Últimos 12 meses (BOB)</span>
        </div>
        <LineChart 
          data={chartIncomeByMonth} 
          color="#f59e0b"
          valueFormatter={(v) => formatCurrency(v)}
        />
      </div>

      {/* Tabla de Propiedades Más Vistas */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Top 10 Propiedades Más Vistas
          </h2>
          <span className="text-xs text-gray-500 font-medium">Ordenado por contador de visitas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Propiedad</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Precio</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Visitas</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.most_viewed_properties && data.most_viewed_properties.length > 0 ? (
                data.most_viewed_properties.map((property) => {
                  const thumbnail = property.PropertyImages && property.PropertyImages.length > 0
                    ? property.PropertyImages[0].url
                    : null

                  return (
                    <tr key={property.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {thumbnail ? (
                          <img 
                            src={thumbnail} 
                            alt={property.titulo} 
                            className="h-10 w-14 object-cover rounded-lg border border-gray-100 shadow-sm"
                          />
                        ) : (
                          <div className="h-10 w-14 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-semibold border border-gray-100">
                            SIN FOTO
                          </div>
                        )}
                        <span className="font-semibold text-gray-900 text-sm max-w-xs truncate">{property.titulo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 capitalize">
                        {property.tipo_propiedad}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-gray-900 text-sm">
                        {property.moneda} {formatNumber(property.precio)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-primary flex items-center justify-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {formatNumber(property.vistas_contador)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        property.estado_propiedad === 'activo'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                      }`}>
                        {property.estado_propiedad}
                      </span>
                    </td>
                  </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Building2 className="h-12 w-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">No hay propiedades para mostrar</p>
                      <p className="text-gray-400 text-sm">Las propiedades más vistas aparecerán aquí</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
