"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { FileText, DollarSign, History, LogOut, Menu, X, ChevronLeft, ChevronRight, Building } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function MisContratosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [contractsCount, setContractsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const isActive = (path: string) => {
    if (path === '/mis-contratos') {
      return pathname === '/mis-contratos'
    }
    return pathname.startsWith(path)
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    const name = localStorage.getItem("userName")

    if (!token) {
      router.push("/ingresar")
      return
    }

    if (name) {
      setUserName(name)
    }

    checkContracts(token)
    setIsLoading(false)
  }, [router])

  const checkContracts = async (token: string) => {
    try {
      const response = await fetch("http://localhost:3001/api/contracts/my", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setContractsCount(data.contratos?.length || 0)
      } else if (response.status === 403) {
        // No tiene contratos, redirigir a home
        router.push("/")
      }
    } catch (error) {
      console.error("Error verificando contratos:", error)
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

  const menuItems = [
    { icon: FileText, label: "Dashboard", path: "/mis-contratos" },
    { icon: Building, label: "Contratos Activos", path: "/mis-contratos/activos" },
    { icon: DollarSign, label: "Pagos", path: "/mis-contratos/pagos" },
    { icon: History, label: "Histórico", path: "/mis-contratos/historico" },
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
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-800">Mis Contratos</h1>
              <p className="text-xs text-gray-500">Gestión de alquileres</p>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-full text-center">
              <span className="text-2xl font-bold text-green-600">MC</span>
            </div>
          )}
        </div>

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
                    ? "bg-green-50 text-green-600"
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

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            {!sidebarCollapsed && (
              <div>
                <p className="text-sm font-medium text-gray-800">{userName}</p>
                <p className="text-xs text-gray-500">{contractsCount} contrato(s)</p>
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
                <h1 className="text-xl font-bold text-gray-800">Mis Contratos</h1>
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
                        ? "bg-green-50 text-green-600"
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
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Mis Contratos</h1>
            <p className="text-xs text-gray-500">{contractsCount} contrato(s)</p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
