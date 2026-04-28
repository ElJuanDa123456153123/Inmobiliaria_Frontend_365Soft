"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, User, Heart, LogOut, ChevronDown, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [publishMenuOpen, setPublishMenuOpen] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Verificar si estamos en la página /publicar
  const isPublicarPage = pathname?.startsWith("/publicar")

  useEffect(() => {
    setIsClient(true)
    // Verificar si hay un usuario logueado
    const token = localStorage.getItem("token")
    const name = localStorage.getItem("userName")
    const adminFlag = localStorage.getItem("isAdmin")
    if (token && name) {
      setUserName(name)
      setIsAdmin(adminFlag === 'true')
    }

    // Función para actualizar el estado desde localStorage
    const updateAuthState = () => {
      const token = localStorage.getItem("token")
      const name = localStorage.getItem("userName")
      const adminFlag = localStorage.getItem("isAdmin")
      if (token && name) {
        setUserName(name)
        setIsAdmin(adminFlag === 'true')
      } else {
        setUserName(null)
        setIsAdmin(false)
      }
    }

    // Escuchar cambios en localStorage (para actualizar cuando se loguee/desloguee en otra pestaña)
    window.addEventListener("storage", updateAuthState)

    // Escuchar evento personalizado para cambios en la misma pestaña
    window.addEventListener("auth-change", updateAuthState)

    // Escuchar cambios de foco en la ventana (para actualizar cuando vuelves de otra página)
    window.addEventListener("focus", updateAuthState)

    return () => {
      window.removeEventListener("storage", updateAuthState)
      window.removeEventListener("auth-change", updateAuthState)
      window.removeEventListener("focus", updateAuthState)
    }
  }, [])

  // Cerrar el dropdown del usuario cuando se hace click fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const userMenu = target.closest(".user-menu-container")
      if (!userMenu && userMenuOpen) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [userMenuOpen])

  // Cerrar el dropdown de publicación cuando se hace click fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const publishMenu = target.closest(".publish-menu-container")
      if (!publishMenu && publishMenuOpen) {
        setPublishMenuOpen(false)
      }
    }

    if (publishMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [publishMenuOpen])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userName")
    localStorage.removeItem("isAdmin")
    setUserName(null)
    setIsAdmin(false)
    setUserMenuOpen(false)

    // Disparar evento para notificar el cambio
    window.dispatchEvent(new Event("auth-change"))

    router.push("/")
  }

  const navLinks = [
    { name: "Venta", href: "/propiedades?operation=venta" },
    { name: "Alquiler", href: "/propiedades?operation=alquiler" },
    { name: "Anticrético", href: "/propiedades?operation=anticretico" },
    { name: "Proyectos", href: "/proyectos" },
    { name: "Inmobiliarias", href: "/inmobiliarias" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="text-2xl font-bold text-primary">365SOFT</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Abrir menú principal</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          {isClient && userName ? (
            <>
              {/* Usuario logueado */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm">{userName}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border py-2 z-50">
                    <Link
                      href="/perfil"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Perfil
                    </Link>
                    <Link
                      href="/favoritos"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Heart className="h-4 w-4" />
                      Favoritos
                    </Link>
                    {isAdmin && (
                      <>
                        <hr className="my-2 border-border" />
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-primary hover:bg-muted transition-colors font-semibold"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="h-4 w-4" />
                          Panel de Administrador
                        </Link>
                      </>
                    )}
                    <hr className="my-2 border-border" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-muted transition-colors w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Usuario no logueado */}
              <Button variant="ghost" asChild>
                <Link href="/ingresar">Ingresar</Link>
              </Button>
            </>
          )}
          {/* Dropdown "Publica tu Propiedad" */}
          <div className="relative publish-menu-container">
            <Button
              variant="default"
              onClick={() => setPublishMenuOpen(!publishMenuOpen)}
              className="flex items-center gap-2"
            >
              Publica tu Propiedad
              <ChevronDown className="h-4 w-4" />
            </Button>

            {publishMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-border py-2 z-50">
                {isPublicarPage ? (
                  <>
                    {/* Opciones cuando está en /publicar */}
                    <Link
                      href="/publicar/inmobiliaria"
                      className="block px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setPublishMenuOpen(false)}
                    >
                      <div className="font-medium">Inmobiliaria</div>
                      <div className="text-xs text-muted-foreground mt-1">Publica como inmobiliaria</div>
                    </Link>
                    <Link
                      href="/publicar/proyecto"
                      className="block px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setPublishMenuOpen(false)}
                    >
                      <div className="font-medium">Proyecto</div>
                      <div className="text-xs text-muted-foreground mt-1">Publica un proyecto nuevo</div>
                    </Link>
                    <Link
                      href="/publicar/particular"
                      className="block px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setPublishMenuOpen(false)}
                    >
                      <div className="font-medium">Particular</div>
                      <div className="text-xs text-muted-foreground mt-1">Publica como particular</div>
                    </Link>
                  </>
                ) : (
                  <>
                    {/* Opciones cuando NO está en /publicar */}
                    <Link
                      href="/publicar?tipo=dueño-vende"
                      className="block px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setPublishMenuOpen(false)}
                    >
                      <div className="font-medium">Dueño Vende</div>
                      <div className="text-xs text-muted-foreground mt-1">Vende tu propiedad</div>
                    </Link>
                    <Link
                      href="/publicar?tipo=dueño-alquila-anual"
                      className="block px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setPublishMenuOpen(false)}
                    >
                      <div className="font-medium">Dueño Alquila Anual</div>
                      <div className="text-xs text-muted-foreground mt-1">Alquila por largo plazo</div>
                    </Link>
                    <Link
                      href="/publicar?tipo=dueño-alquila-temporario"
                      className="block px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setPublishMenuOpen(false)}
                    >
                      <div className="font-medium">Dueño Alquila Temporario</div>
                      <div className="text-xs text-muted-foreground mt-1">Alquila por temporadas</div>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-4">
              {isClient && userName ? (
                <>
                  {/* Usuario logueado en móvil */}
                  <div className="px-3 py-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{userName}</p>
                        <p className="text-xs text-muted-foreground">Usuario</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" asChild className="w-full justify-start">
                    <Link href="/perfil" onClick={() => setMobileMenuOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      Perfil
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="w-full justify-start">
                    <Link href="/favoritos" onClick={() => setMobileMenuOpen(false)}>
                      <Heart className="h-4 w-4 mr-2" />
                      Favoritos
                    </Link>
                  </Button>
                  {isAdmin && (
                    <Button variant="ghost" asChild className="w-full justify-start text-primary">
                      <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <Shield className="h-4 w-4 mr-2" />
                        Panel de Administrador
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  {/* Usuario no logueado en móvil */}
                  <Button variant="ghost" asChild className="w-full">
                    <Link href="/ingresar" onClick={() => setMobileMenuOpen(false)}>
                      Ingresar
                    </Link>
                  </Button>
                </>
              )}
              <div className="space-y-2">
                <Button variant="default" asChild className="w-full">
                  <Link href="/publicar" onClick={() => setMobileMenuOpen(false)}>
                    Publica tu Propiedad
                  </Link>
                </Button>
                <div className="pl-4 space-y-1">
                  {isPublicarPage ? (
                    <>
                      {/* Opciones cuando está en /publicar - móvil */}
                      <Link
                        href="/publicar/inmobiliaria"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-muted rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Inmobiliaria
                      </Link>
                      <Link
                        href="/publicar/proyecto"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-muted rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Proyecto
                      </Link>
                      <Link
                        href="/publicar/particular"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-muted rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Particular
                      </Link>
                    </>
                  ) : (
                    <>
                      {/* Opciones cuando NO está en /publicar - móvil */}
                      <Link
                        href="/publicar?tipo=dueño-vende"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-muted rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dueño Vende
                      </Link>
                      <Link
                        href="/publicar?tipo=dueño-alquila-anual"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-muted rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dueño Alquila Anual
                      </Link>
                      <Link
                        href="/publicar?tipo=dueño-alquila-temporario"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-muted rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dueño Alquila Temporario
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
