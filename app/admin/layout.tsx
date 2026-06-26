"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Users, LogOut, Settings, Key, User, Building, UserCog, Layers, Globe, BarChart3, Users2 } from "lucide-react"
import Link from "next/link"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white">365SOFT</h1>
          <p className="text-sm text-gray-400 mt-1">
            {isAdmin ? "Panel de Administración" : "Panel de Asesor"}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin/analytics"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/analytics')
                ? 'bg-primary text-white font-semibold'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="font-medium">Panel de Estadísticas</span>
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin')
                  ? 'bg-primary text-white font-semibold'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="font-medium">Usuarios Registrados</span>
            </Link>
          )}
          <Link
            href="/admin/propiedades"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/propiedades')
                ? 'bg-primary text-white font-semibold'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Building className="h-5 w-5" />
            <span className="font-medium">Gestionar Propiedades</span>
          </Link>
          <Link
            href="/admin/crm/clientes"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/crm')
                ? 'bg-primary text-white font-semibold'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Users2 className="h-5 w-5" />
            <span className="font-medium">CRM de Clientes</span>
          </Link>
          {isAdmin && (
            <>
              <Link
                href="/admin/asesores"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin/asesores')
                    ? 'bg-primary text-white font-semibold'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <UserCog className="h-5 w-5" />
                <span className="font-medium">Asesores</span>
              </Link>
              <Link
                href="/admin/accesos"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin/accesos')
                    ? 'bg-primary text-white font-semibold'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Key className="h-5 w-5" />
                <span className="font-medium">Gestión de Accesos</span>
              </Link>
              <Link
                href="/admin/planes"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin/planes')
                    ? 'bg-primary text-white font-semibold'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Layers className="h-5 w-5" />
                <span className="font-medium">Planes de Suscripción</span>
              </Link>
            </>
          )}
        </nav>

        {/* Ver Sitio - Link al sitio principal */}
        <div className="p-4 border-t border-gray-800">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <Globe className="h-5 w-5" />
            <span className="font-medium">Ver Sitio</span>
          </Link>
        </div>

        {/* User Menu */}
        <div className="p-4 border-t border-gray-800 relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{userName || "Admin"}</p>
              <p className="text-xs text-gray-400">{userRole}</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {isAdmin && (
                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    router.push("/admin/accesos")
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Configuración
              </button>
              <hr className="my-2 border-gray-200" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
