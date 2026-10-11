"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Users, LogOut, Settings, Key, User, Building, UserCog, Layers, Globe, BarChart3, Users2, Award, FileText, ChevronLeft, ChevronRight, Menu, TrendingUp, MessageCircle, CalendarClock } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { AdminThemeProvider } from "@/components/admin/admin-theme-provider"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>("Admin")
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAdvisor, setIsAdvisor] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Función para determinar si un link está activo
  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(path)
  }

  useEffect(() => {
    setIsClient(true)

    // Verificar si hay un usuario logueado
    const token = localStorage.getItem("token")
    const name = localStorage.getItem("userName")
    const adminFlag = localStorage.getItem("isAdmin")
    const advisorFlag = localStorage.getItem("isAdvisor")
    const userRol = localStorage.getItem("userRol")

    // Verificar si es asesor (agente o inmobiliaria, o tiene perfil de asesor)
    const advisorCheck = advisorFlag === 'true' || userRol === 'agente' || userRol === 'inmobiliaria'
    const adminCheck = adminFlag === 'true'

    setIsAdmin(adminCheck)
    setIsAdvisor(advisorCheck)

    // Permitir acceso a /admin/publicar sin verificar admin (la página misma establece el flag)
    const isAdminPublicRoute = pathname === '/admin/publicar'

    // Permitir acceso a admin o agentes (asesores)
    if (!token || (!isAdminPublicRoute && !adminCheck && !advisorCheck)) {
      // Si no está logueado o no es admin/asesor (y no es ruta pública), redirigir a login
      router.push("/login")
      return
    }

    if (name) {
      setUserName(name)
    }

    // Establecer el rol para mostrar en el panel
    if (adminCheck) {
      setUserRole("Administrador")
    } else if (advisorCheck) {
      setUserRole("Asesor")
    }

    setIsLoading(false)
  }, [router, pathname])

  // Inicializar el color de acento guardado
  useEffect(() => {
    const savedAccent = localStorage.getItem('accent-color')
    if (savedAccent) {
      document.documentElement.setAttribute('data-accent', savedAccent)
    }
  }, [])

  useEffect(() => {
    // Escuchar cambios en localStorage
    const updateAuthState = () => {
      const token = localStorage.getItem("token")
      const adminFlag = localStorage.getItem("isAdmin")
      const advisorFlag = localStorage.getItem("isAdvisor")
      const userRol = localStorage.getItem("userRol")
      const isAdminPublicRoute = pathname === '/admin/publicar'

      // Verificar si es asesor
      const advisorCheck = advisorFlag === 'true' || userRol === 'agente' || userRol === 'inmobiliaria'
      const adminCheck = adminFlag === 'true'

      setIsAdmin(adminCheck)
      setIsAdvisor(advisorCheck)

      // Permitir acceso a admin o agentes (asesores)
      if (!token || (!isAdminPublicRoute && !adminCheck && !advisorCheck)) {
        router.push("/login")
      }
    }

    window.addEventListener("storage", updateAuthState)
    window.addEventListener("auth-change", updateAuthState)

    return () => {
      window.removeEventListener("storage", updateAuthState)
      window.removeEventListener("auth-change", updateAuthState)
    }
  }, [router, pathname])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userName")
    localStorage.removeItem("isAdmin")
    localStorage.removeItem("isAdvisor")
    localStorage.removeItem("userRol")
    setUserName(null)
    setIsAdmin(false)
    setIsAdvisor(false)
    setUserMenuOpen(false)
    window.dispatchEvent(new Event("auth-change"))
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  const navItems = [
    { href: "/admin/analytics", icon: BarChart3, label: "Panel de Estadísticas", show: true },
    { href: "/admin", icon: Users, label: "Usuarios Registrados", show: isAdmin },
    { href: "/admin/propiedades", icon: Building, label: "Gestionar Propiedades", show: true },
    { href: "/admin/documentos", icon: FileText, label: "Documentos", show: true },
    { href: "/admin/crm/clientes", icon: Users2, label: "CRM de Clientes", show: true },
    { href: "/admin/crm/top-leads", icon: Award, label: "Top Leads", show: true },
    { href: "/admin/whatsapp/leads", icon: MessageCircle, label: "Leads WhatsApp", show: true },
    { href: "/admin/whatsapp/visitas", icon: CalendarClock, label: "Agenda WhatsApp", show: true },
    { href: "/admin/asesores", icon: UserCog, label: "Asesores", show: isAdmin },
    { href: "/admin/accesos", icon: Key, label: "Gestión de Accesos", show: isAdmin },
    { href: "/admin/planes", icon: Layers, label: "Planes de Suscripción", show: isAdmin },
    { href: "/admin/reportes", icon: TrendingUp, label: "Reportes Financieros", show: isAdmin },
  ]

  return (
    <AdminThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col transition-all duration-300 ease-in-out relative shadow-2xl",
          sidebarCollapsed ? "w-20" : "w-72"
        )}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-24 z-50 bg-primary hover:bg-primary/90 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
          title={sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Logo */}
        <div className={cn(
          "p-6 border-b border-gray-700/50 transition-all duration-300",
          sidebarCollapsed ? "p-4" : "p-6"
        )}>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold">365</span>
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  365SOFT
                </h1>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {isAdmin ? "Panel de Administración" : "Panel de Asesor"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.filter(item => item.show).map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/30'
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                  !sidebarCollapsed && "group-hover:scale-110",
                  isActive(item.href) && "group-hover:scale-110"
                )} />
                {!sidebarCollapsed && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
                {/* Tooltip when collapsed */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Ver Sitio */}
        <div className={cn(
          "p-3 border-t border-gray-700/50",
          sidebarCollapsed ? "p-3" : "p-3"
        )}>
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-200 group relative",
              sidebarCollapsed ? "justify-center" : ""
            )}
          >
            <Globe className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            {!sidebarCollapsed && <span className="font-medium">Ver Sitio</span>}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                Ver Sitio
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
              </div>
            )}
          </Link>
        </div>

        {/* User Menu */}
        <div className="p-3 border-t border-gray-700/50 relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-all duration-200 group relative",
              sidebarCollapsed ? "justify-center" : ""
            )}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 shadow-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium text-sm truncate">{userName || "Admin"}</p>
                <p className="text-xs text-gray-400 truncate">{userRole}</p>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                {userName || "Admin"} - {userRole}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
              </div>
            )}
          </button>

          {/* Dropdown Menu */}
          {userMenuOpen && !sidebarCollapsed && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 overflow-hidden">
              {isAdmin && (
                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    router.push("/admin/accesos")
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Key className="h-4 w-4" />
                  Accesos
                </button>
              )}
              <button
                onClick={() => {
                  setUserMenuOpen(false)
                  router.push("/admin/configuracion")
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Configuración
              </button>
              <hr className="my-2 border-gray-200" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">365SOFT Admin</h1>
        <div className="w-10" />
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-gray-900 text-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold">365SOFT</h1>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-2">
              {navItems.filter(item => item.show).map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive(item.href)
                        ? 'bg-primary text-white font-semibold'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300 bg-white dark:bg-gray-950",
        mobileMenuOpen && "lg:opacity-50"
      )}>
        <div className={cn(
          "min-h-screen",
          !sidebarCollapsed ? "lg:ml-0" : "lg:ml-0"
        )}>
          {/* Top spacer for mobile header */}
          <div className="lg:hidden h-16" />
          {children}
        </div>
      </main>
    </div>
  </AdminThemeProvider>
  )
}
