"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Home, Building2, MessageSquare, Calendar, CreditCard, BarChart3, LogOut, Menu, ChevronLeft, ChevronRight, Send, BellRing, Users, Globe, User, Settings } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { PanelConfigDialog } from "@/components/panel/panel-config-dialog"
import { applyAccent, getUserIdFromToken, loadPanelPrefs, savePanelPrefs, type PanelPrefs } from "@/lib/user-prefs"

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [activePropertiesCount, setActivePropertiesCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [prefs, setPrefs] = useState<PanelPrefs>({})
  const panelUserIdRef = useRef<string | null>(null)
  const userMenuRef = useRef<HTMLDivElement | null>(null)

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

    // Cargar preferencias personales del usuario (acento, sidebar) — aisladas por user_id
    const userId = getUserIdFromToken()
    panelUserIdRef.current = userId
    const savedPrefs = loadPanelPrefs(userId)
    setPrefs(savedPrefs)
    setSidebarCollapsed(savedPrefs.sidebarCollapsed ?? false)
    applyAccent(savedPrefs)

    // Verificar si tiene propiedades activas llamando al dashboard
    checkActiveProperties(token)

    setIsLoading(false)
  }, [router])

  // Cerrar el dropdown del usuario al hacer click fuera o presionar Escape
  useEffect(() => {
    if (!userMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [userMenuOpen])

  const handlePrefsChange = (next: PanelPrefs) => {
    setPrefs(next)
    savePanelPrefs(panelUserIdRef.current, next)
    applyAccent(next)
    // Notificar a otras pestañas/componentes (ej: AccentInit del home)
    window.dispatchEvent(new Event("accent-change"))
    if (typeof next.sidebarCollapsed === "boolean") {
      setSidebarCollapsed(next.sidebarCollapsed)
    }
  }

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
    setUserMenuOpen(false)
    router.push("/ingresar")
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
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
    { icon: Building2, label: "Propiedades", path: "/panel/propiedades" },
    { icon: BellRing, label: "Solicitudes", path: "/panel/solicitudes" },
    { icon: Users, label: "Mis Inquilinos", path: "/panel/inquilinos" },
    { icon: MessageSquare, label: "Contactos", path: "/panel/contactos" },
    { icon: Send, label: "Consultas", path: "/panel/mensajes" },
    { icon: Calendar, label: "Visitas", path: "/panel/visitas" },
    { icon: CreditCard, label: "Pagos", path: "/panel/pagos" },
    { icon: BarChart3, label: "Reportes", path: "/panel/reportes" },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "hidden lg:flex bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex-col transition-all duration-300 ease-in-out relative shadow-2xl",
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
          "border-b border-gray-700/50 transition-all duration-300",
          sidebarCollapsed ? "p-4" : "p-6"
        )}>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
                  Panel de Propietario
                </h1>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {userName || "Mi espacio"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/30'
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                  !sidebarCollapsed && "group-hover:scale-110"
                )} />
                {!sidebarCollapsed && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
                {/* Tooltip when collapsed */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 border border-gray-700">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Ver Sitio */}
        <div className="p-3 border-t border-gray-700/50">
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
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 border border-gray-700">
                Ver Sitio
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
              </div>
            )}
          </Link>
        </div>

        {/* User Menu */}
        <div ref={userMenuRef} className="p-3 border-t border-gray-700/50 relative">
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
                <p className="font-medium text-sm truncate">{userName || "Usuario"}</p>
                <p className="text-xs text-gray-400 truncate">
                  {activePropertiesCount} {activePropertiesCount === 1 ? "propiedad activa" : "propiedades activas"}
                </p>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 border border-gray-700">
                {userName || "Usuario"} · {activePropertiesCount} prop. activas
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
              </div>
            )}
          </button>

          {/* Dropdown Menu */}
          {userMenuOpen && !sidebarCollapsed && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 overflow-hidden">
              <button
                onClick={() => {
                  setUserMenuOpen(false)
                  setConfigOpen(true)
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
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900 leading-tight">Panel de Propietario</h1>
          <p className="text-xs text-gray-500">{activePropertiesCount} propiedades activas</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-gray-900 text-white p-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-tight">Panel de Propietario</h1>
                  <p className="text-xs text-gray-400">{userName || "Mi espacio"}</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-2 flex-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive(item.path)
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
            <div className="pt-4 border-t border-gray-700 space-y-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <Globe className="h-5 w-5" />
                <span className="font-medium">Ver Sitio</span>
              </Link>
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top spacer for mobile header */}
        <div className="lg:hidden h-14" />

        {/* Main content area */}
        <main className={cn(
          "flex-1 overflow-y-auto p-6 transition-all duration-300",
          mobileMenuOpen && "lg:opacity-50"
        )}>
          {children}
        </main>
      </div>

      {/* Dialog de configuración personal (por usuario) */}
      <PanelConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        prefs={prefs}
        onChange={handlePrefsChange}
      />
    </div>
  )
}
