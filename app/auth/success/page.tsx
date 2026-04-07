"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

function AuthSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Obtener token y nombre de los query params
    const token = searchParams.get("token")
    const nombre = searchParams.get("nombre")

    if (!token) {
      router.push("/login")
      return
    }

    // Guardar en localStorage
    localStorage.setItem("token", token)
    localStorage.setItem("userName", nombre || "Usuario")

    // Redirigir al home después de 2 segundos
    const timer = setTimeout(() => {
      router.push("/")
    }, 2000)

    return () => clearTimeout(timer)
  }, [searchParams, router])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              ¡Autenticación Exitosa!
            </h1>
            <p className="text-muted-foreground">
              Has iniciado sesión correctamente. Redirigiendo...
            </p>
          </div>

          {/* Loading Spinner */}
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <AuthSuccessContent />
    </Suspense>
  )
}
