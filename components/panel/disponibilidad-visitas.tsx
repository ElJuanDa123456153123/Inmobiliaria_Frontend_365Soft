"use client"

import { useEffect, useState } from "react"
import { CalendarClock, Check, Loader2, Plus, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface RangoHorario {
  desde: string
  hasta: string
}

// "1"=Lun ... "6"=Sáb, "0"=Dom → franjas de ese día
type Horarios = Record<string, RangoHorario[]>

const DIAS = [
  { value: "1", label: "Lun" },
  { value: "2", label: "Mar" },
  { value: "3", label: "Mié" },
  { value: "4", label: "Jue" },
  { value: "5", label: "Vie" },
  { value: "6", label: "Sáb" },
  { value: "0", label: "Dom" },
]

const FRANJA_DEFAULT: RangoHorario = { desde: "09:00", hasta: "12:00" }

const HORA_VALIDA = /^([01]\d|2[0-3]):[0-5]\d$/

// Input de hora HH:MM: se puede escribir con el teclado y se formatea solo
// (ej: "9" → "09:00" al salir del campo). Formato 24h, sin dropdowns.
function InputHora({
  valor,
  onChange,
  invalido,
}: {
  valor: string
  onChange: (v: string) => void
  invalido?: boolean
}) {
  const [texto, setTexto] = useState(valor)
  const [enFoco, setEnFoco] = useState(false)

  // Sincronizar cuando cambia desde afuera (y no se está editando)
  useEffect(() => {
    if (!enFoco) setTexto(valor)
  }, [valor, enFoco])

  const manejarCambio = (input: string) => {
    const digitos = input.replace(/\D/g, "").slice(0, 4)
    let formateado = digitos
    if (digitos.length > 2) formateado = `${digitos.slice(0, 2)}:${digitos.slice(2)}`
    setTexto(formateado)
    if (HORA_VALIDA.test(formateado)) onChange(formateado)
  }

  const alSalir = () => {
    setEnFoco(false)
    const digitos = texto.replace(/\D/g, "")
    if (digitos.length === 0) {
      setTexto(valor)
      return
    }
    // Completar lo incompleto: "9" → "09:00", "10" → "10:00", "107" → "10:07"
    const pad = digitos.padStart(4, "0")
    const candidato = `${pad.slice(0, 2)}:${pad.slice(2)}`
    const hora = Number(candidato.slice(0, 2))
    const min = Number(candidato.slice(3))
    if (hora <= 23 && min <= 59) {
      setTexto(candidato)
      onChange(candidato)
    } else {
      setTexto(valor)
    }
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={texto}
      placeholder="07:00"
      maxLength={5}
      onChange={(e) => manejarCambio(e.target.value)}
      onFocus={() => setEnFoco(true)}
      onBlur={alSalir}
      className={cn(
        "w-[64px] px-1.5 py-1.5 text-center rounded-lg border text-sm bg-white transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400",
        invalido ? "border-red-300 text-red-600" : "border-gray-200 text-gray-700 hover:border-blue-300"
      )}
    />
  )
}

export function DisponibilidadVisitasCard() {
  const [horarios, setHorarios] = useState<Horarios>({})
  const [duracion, setDuracion] = useState(60)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        })
        if (res.ok) {
          const data = await res.json()
          const hv = data.user?.horario_visitas
          if (hv) {
            const parsed = typeof hv === "string" ? JSON.parse(hv) : hv
            if (parsed.duracion_min) setDuracion(parsed.duracion_min)
            if (parsed.horarios) {
              setHorarios(parsed.horarios)
            } else if (parsed.dias && parsed.rangos) {
              // Formato viejo: días globales + franjas globales → convertir
              const h: Horarios = {}
              for (const d of parsed.dias) h[String(d)] = parsed.rangos
              setHorarios(h)
            }
          } else {
            // Sin config: default Lun-Vie 09-12 y 14-18
            const franjas = [{ desde: "09:00", hasta: "12:00" }, { desde: "14:00", hasta: "18:00" }]
            const h: Horarios = {}
            for (const d of ["1", "2", "3", "4", "5"]) h[d] = franjas.map((f) => ({ ...f }))
            setHorarios(h)
          }
        }
      } catch {
        // mantener default
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const diaActivo = (dia: string) => (horarios[dia]?.length ?? 0) > 0

  const toggleDia = (dia: string) => {
    setHorarios((prev) => {
      const next = { ...prev }
      if (diaActivo(dia)) delete next[dia]
      else next[dia] = [{ ...FRANJA_DEFAULT }]
      return next
    })
  }

  const setRango = (dia: string, index: number, campo: "desde" | "hasta", valor: string) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: prev[dia].map((r, i) => (i === index ? { ...r, [campo]: valor } : r)),
    }))
  }

  const agregarRango = (dia: string) => {
    const ultima = horarios[dia]?.[horarios[dia].length - 1]
    const desde = ultima?.hasta && ultima.hasta < "20:30" ? ultima.hasta : "14:00"
    setHorarios((prev) => ({ ...prev, [dia]: [...(prev[dia] || []), { desde, hasta: "18:00" }] }))
  }

  const quitarRango = (dia: string, index: number) => {
    setHorarios((prev) => {
      const restantes = prev[dia].filter((_, i) => i !== index)
      const next = { ...prev }
      if (restantes.length === 0) delete next[dia]
      else next[dia] = restantes
      return next
    })
  }

  const handleGuardar = async () => {
    if (Object.keys(horarios).length === 0) {
      toast.error("Configura al menos un día con horarios")
      return
    }
    for (const [dia, franjas] of Object.entries(horarios)) {
      for (const r of franjas) {
        if (!r.desde || !r.hasta || r.desde >= r.hasta) {
          toast.error("Hay franjas con la hora de inicio mayor o igual a la de fin. Revísalas")
          return
        }
      }
    }

    setGuardando(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/panel/visit-availability`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ duracion_min: duracion, horarios }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Disponibilidad actualizada. Los interesados solo podrán agendar en estos horarios")
      } else {
        toast.error(data.error || "Error al guardar la disponibilidad")
      }
    } catch {
      toast.error("Error al guardar la disponibilidad")
    } finally {
      setGuardando(false)
    }
  }

  const diasActivos = DIAS.filter((d) => diaActivo(d.value))
  const totalFranjas = Object.values(horarios).reduce((acc, f) => acc + f.length, 0)

  // Celda de un día: chip para activar + franjas con inputs tipeables
  const CeldaDia = ({ value: dia, label }: { value: string; label: string }) => {
    const activo = diaActivo(dia)
    return (
      <div
        className={cn(
          "rounded-lg border p-2.5 transition-colors",
          activo ? "border-blue-200 bg-blue-50/40" : "border-gray-200 bg-white"
        )}
      >
        <button
          type="button"
          onClick={() => toggleDia(dia)}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-semibold transition-all mb-1.5",
            activo
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-400 border-gray-200 hover:border-blue-300 hover:text-gray-600"
          )}
          title={activo ? `Desactivar ${label}` : `Activar ${label}`}
        >
          {activo && <Check className="w-3 h-3" />}
          {label}
        </button>

        {activo ? (
          <div className="space-y-1.5">
            {horarios[dia].map((rango, i) => {
              const invalido = !rango.desde || !rango.hasta || rango.desde >= rango.hasta
              return (
                <div key={i} className="flex flex-wrap items-center gap-1">
                  <InputHora valor={rango.desde} onChange={(v) => setRango(dia, i, "desde", v)} />
                  <span className="text-gray-300 text-xs">a</span>
                  <InputHora
                    valor={rango.hasta}
                    onChange={(v) => setRango(dia, i, "hasta", v)}
                    invalido={invalido}
                  />
                  <button
                    type="button"
                    onClick={() => quitarRango(dia, i)}
                    title="Quitar franja"
                    className="p-0.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
            {horarios[dia].some((r) => !r.desde || !r.hasta || r.desde >= r.hasta) && (
              <p className="text-[10px] text-red-500">Hay franjas inválidas (inicio &lt; fin)</p>
            )}
            <button
              type="button"
              onClick={() => agregarRango(dia)}
              className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
            >
              <Plus className="w-3 h-3" />
              Agregar
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-gray-400 italic">No atiende</span>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-blue-600" />
            Mi disponibilidad
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Activa los días que atiendes y escribe tus horarios. Los interesados solo podrán agendar en ellos.
          </p>
        </div>
        <Button
          onClick={handleGuardar}
          disabled={guardando}
          size="sm"
          className="bg-green-600 hover:bg-green-700 h-9"
        >
          {guardando ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
          {guardando ? "Guardando..." : "Guardar"}
        </Button>
      </div>

      {/* Contenido: días en grilla compacta */}
      {cargando ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="px-3 sm:px-5 py-4">
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2">
            {DIAS.map((d) => (
              <CeldaDia key={d.value} value={d.value} label={d.label} />
            ))}
          </div>

          <p className="text-[11px] text-gray-400 mt-3">
            {diasActivos.length === 0
              ? "Sin días configurados: activa al menos un día"
              : `${diasActivos.length} ${diasActivos.length === 1 ? "día" : "días"} activos · ${totalFranjas} ${totalFranjas === 1 ? "franja" : "franjas"}`}
          </p>
        </div>
      )}
    </div>
  )
}
