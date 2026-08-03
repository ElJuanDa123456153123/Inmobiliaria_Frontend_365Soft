"use client"

import { useState, useEffect } from "react"
import { Building, MessageSquare, Calendar, DollarSign, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  propiedades_activas: number
  contactos_no_leidos: number
  visitas_pendientes: number
  mensajes_no_leidos: number
}

export default function PanelDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    propiedades_activas: 0,
    contactos_no_leidos: 0,
    visitas_pendientes: 0,
    mensajes_no_leidos: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/panel/dashboard", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Propiedades Activas",
      value: stats.propiedades_activas,
      icon: Building,
      color: "bg-blue-500",
      link: "/panel/propiedades",
    },
    {
      title: "Contactos No Leídos",
      value: stats.contactos_no_leidos,
      icon: MessageSquare,
      color: "bg-green-500",
      link: "/panel/contactos",
    },
    {
      title: "Visitas Pendientes",
      value: stats.visitas_pendientes,
      icon: Calendar,
      color: "bg-purple-500",
      link: "/panel/visitas",
    },
    {
      title: "Mensajes No Leídos",
      value: stats.mensajes_no_leidos,
      icon: Users,
      color: "bg-orange-500",
      link: "/panel/mensajes",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bienvenido a tu panel de gestión</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.title}
              href={card.link}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/publicar"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Publicar Propiedad</p>
              <p className="text-sm text-gray-500">Añadir nueva propiedad</p>
            </div>
          </Link>

          <Link
            href="/panel/contactos"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Ver Contactos</p>
              <p className="text-sm text-gray-500">{stats.contactos_no_leidos} sin leer</p>
            </div>
          </Link>

          <Link
            href="/panel/visitas"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Ver Visitas</p>
              <p className="text-sm text-gray-500">{stats.visitas_pendientes} pendientes</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center">
          <TrendingUp className="w-12 h-12 mr-4" />
          <div>
            <h3 className="text-lg font-semibold">Panel Activo</h3>
            <p className="text-blue-100">
              Tienes {stats.propiedades_activas} propiedad(es) activa(s). Tu panel está completamente funcional.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
