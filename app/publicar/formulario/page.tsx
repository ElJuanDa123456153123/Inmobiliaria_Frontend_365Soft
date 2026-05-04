"use client"

export const dynamic = 'force-dynamic'

import { FormularioProvider } from "@/lib/contexts/FormularioContext"
import { FormularioContent } from "@/components/propiedades/FormularioContent"

export default function FormularioPublicarPage() {
  return (
    <FormularioProvider>
      <FormularioContent />
    </FormularioProvider>
  )
}
