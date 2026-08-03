"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Home, Building, MessageSquare, Calendar, CreditCard, BarChart3, LogOut, Menu, X, ChevronLeft, ChevronRight, Send } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [activePropertiesCount, setActivePropertiesCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Función para determinar si un link está activo
  const isActive = (path: string) => {
    if (path === '/panel') {
      return pathname === '/panel'
    }
    return pathname.startsWith(path)
  }

  useEffect(() => {
    // Verificar si hay un usuario logueado
    const token = localStorage.getItem("token")
    const name = localStorage.getItem("userName")

    if (!token) {
      // Si no está logueado, redirigir a login
      router.push("/ingresar")
      return
    }

    if (name) {
      setUserName(name)
    }

    // Verificar si tiene propiedades activas llamando al dashboard
    checkActiveProperties(token)

    setIsLoading(false)
  }, [router])

  const checkActiveProperties = async (token: string) => {
    try {
      const response = await fetch("http://localhost:3001/api/panel/dashboard", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setActivePropertiesCount(data.propiedades_activas || 0)
      } else if (response.status === 403) {
        // No tiene propiedades activas, redirigir a publicar
        router.push("/publicar")
      }
    } catch (error) {
      console.error("Error verificando propiedades activas:", error)
      // En caso de error, permitir acceso pero mostrar mensaje
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userName")
    localStorage.removeItem("isAdmin")
    localStorage.removeItem("userRol")
    router.push("/ingresar")
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Menu items
  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/panel" },
    { icon: Building, label: "Propiedades", path: "/panel/propiedades" },
    { icon: MessageSquare, label: "Contactos", path: "/panel/contactos" },
    { icon: Send, label: "Mensajes", path: "/panel/mensajes" },
    { icon: Calendar, label: "Visitas", path: "/panel/visitas" },
    { icon: CreditCard, label: "Pagos", path: "/panel/pagos" },
    { icon: BarChart3, label: "Reportes", path: "/panel/reportes" },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
          sidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-800">365Soft Panel</h1>
              <p className="text-xs text-gray-500">Gestión de propiedades</p>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-full text-center">
              <span className="text-2xl font-bold text-blue-600">365</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center px-4 py-3 rounded-lg transition-colors",
                  isActive(item.path)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="ml-3 font-medium">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            {!sidebarCollapsed && (
              <div>
                <p className="text-sm font-medium text-gray-800">{userName}</p>
                <p className="text-xs text-gray-500">{activePropertiesCount} propiedades activas</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span className="ml-2">Cerrar sesión</span>}
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center justify-center w-full px-4 py-2 mt-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg">
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
              <div>
                <h1 className="text-xl font-bold text-gray-800">365Soft Panel</h1>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-lg transition-colors",
                      isActive(item.path)
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="ml-3 font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="ml-2">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header mobile */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div>
            <h1 className="text-lg font-bold text-gray-800">365Soft Panel</h1>
            <p className="text-xs text-gray-500">{activePropertiesCount} propiedades activas</p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
