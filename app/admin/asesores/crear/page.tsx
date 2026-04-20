"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Esta página redirige a la página de asesores.
 * El formulario de crear asesor ahora es un modal en /admin/asesores
 */
export default function AdminCrearAsesorRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir a la página principal de asesores
    router.replace("/admin/asesores")
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Redirigiendo...</p>
    </div>
  )
}
