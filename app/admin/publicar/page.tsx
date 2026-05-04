"use client"

export const dynamic = 'force-dynamic'

import { useState, useLayoutEffect } from "react"
import { FormularioProvider } from "@/lib/contexts/FormularioContext"
import { FormularioContent } from "@/components/propiedades/FormularioContent"

function AdminPublicarContent() {
  const [isReady, setIsReady] = useState(false)

  // Establecer flag de admin ANTES de montar el formulario
  useLayoutEffect(() => {
    localStorage.setItem('isAdmin', 'true')
    setIsReady(true)
  }, [])

  // No renderizar el formulario hasta que el flag esté establecido
  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <FormularioContent key="admin-form" />
}

export default function AdminPublicarPage() {
  return (
    <FormularioProvider>
      <AdminPublicarContent />
    </FormularioProvider>
  )
}
