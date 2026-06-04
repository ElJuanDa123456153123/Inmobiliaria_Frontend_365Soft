"use client"

import { Clock, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"

interface ExpiracionBadgeProps {
  fechaExpiracion: string | null
}

export function ExpiracionBadge({ fechaExpiracion }: ExpiracionBadgeProps) {
  const [tiempoRestante, setTiempoRestante] = useState<string>("")

  useEffect(() => {
    if (!fechaExpiracion) return

    const calcularTiempoRestante = () => {
      const ahora = new Date()
      const expiracion = new Date(fechaExpiracion)
      const diferencia = expiracion.getTime() - ahora.getTime()

      if (diferencia <= 0) {
        return "Expirada"
      }

      const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
      const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60))

      if (dias > 30) {
        const meses = Math.floor(dias / 30)
        return `${meses} mes${meses > 1 ? 'es' : ''}`
      } else if (dias > 0) {
        return `${dias} día${dias > 1 ? 's' : ''}`
      } else if (horas > 0) {
        return `${horas} hora${horas > 1 ? 's' : ''}`
      } else if (minutos > 0) {
        return `${minutos} minuto${minutos > 1 ? 's' : ''}`
      } else {
        return "Menos de 1 minuto"
      }
    }

    setTiempoRestante(calcularTiempoRestante())

    // Actualizar cada minuto
    const interval = setInterval(() => {
      setTiempoRestante(calcularTiempoRestante())
    }, 60000)

    return () => clearInterval(interval)
  }, [fechaExpiracion])

  if (!fechaExpiracion) {
    return null
  }

  const estaExpirada = tiempoRestante === "Expirada"
  const estaProximaAExpirar = !estaExpirada && tiempoRestante.includes("día") && parseInt(tiempoRestante) <= 7

  return (
    <div
      className={`flex items-center gap-1 text-xs ${
        estaExpirada
          ? "text-red-600 bg-red-50"
          : estaProximaAExpirar
          ? "text-orange-600 bg-orange-50"
          : "text-gray-600 bg-gray-50"
      } px-2 py-1 rounded-full`}
    >
      {estaExpirada ? (
        <>
          <AlertTriangle className="w-3 h-3" />
          <span>Expirada</span>
        </>
      ) : (
        <>
          <Clock className="w-3 h-3" />
          <span>Expira en {tiempoRestante}</span>
        </>
      )}
    </div>
  )
}
