"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, LogOut, Settings, Key, User } from "lucide-react"
import Link from "next/link"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)

    // Verificar si hay un usuario logueado
    const token = localStorage.getItem("token")
    const name = localStorage.getItem("userName")
    const isAdmin = localStorage.getItem("isAdmin")

    if (!token || isAdmin !== "true") {
      // Si no está logueado o no es admin, redirigir a login
      router.push("/login")
      return
    }

    if (name) {
      setUserName(name)
    }

    setIsLoading(false)
  }, [router])

  useEffect(() => {
    // Escuchar cambios en localStorage
    const updateAuthState = () => {
      const token = localStorage.getItem("token")
      const isAdmin = localStorage.getItem("isAdmin")
      if (!token || isAdmin !== "true") {
        router.push("/login")
      }
    }

    window.addEventListener("storage", updateAuthState)
    window.addEventListener("auth-change", updateAuthState)

    return () => {
      window.removeEventListener("storage", updateAuthState)
      window.removeEventListener("auth-change", updateAuthState)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userName")
    localStorage.removeItem("isAdmin")
    setUserName(null)
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
          <p className="text-sm text-gray-400 mt-1">Panel de Administración</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          >
            <Users className="h-5 w-5" />
            <span className="font-medium">Usuarios</span>
          </Link>
        </nav>

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
              <p className="text-xs text-gray-400">Administrador</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
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
