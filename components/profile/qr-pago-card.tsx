"use client"

import { useEffect, useState } from "react"
import { QrCode, Upload, Trash2, Loader2, Check, Plus, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiService } from "@/lib/services/api"
import { getImageUrl } from "@/lib/utils"
import { toast } from "sonner"

const PLATAFORMAS = ["Yape", "Plin", "BNB Simple", "Banco Unión", "Mercado Pago", "Otro"]

interface QrItem {
  plataforma: string
  url: string
}

// Tarjeta para que el propietario configure sus QR de cobro (uno por plataforma).
// Los inquilinos escanean el QR de la plataforma que prefieran para pagar la renta.
export function QrPagoCard() {
  const [qrs, setQrs] = useState<QrItem[]>([])
  const [cargando, setCargando] = useState(true)
  const [subiendo, setSubiendo] = useState(false)
  const [subiendoIdx, setSubiendoIdx] = useState<number | null>(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await apiService.getProfile()
        const user = data.user
        if (user.qrs_cobro && user.qrs_cobro.length > 0) {
          setQrs(user.qrs_cobro)
        } else if (user.qr_pago_url) {
          // Migración: QR único viejo → lista con plataforma genérica
          setQrs([{ plataforma: "QR", url: user.qr_pago_url }])
        }
      } catch {
        // silencioso
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const guardar = async (lista: QrItem[]) => {
    try {
      await apiService.actualizarQrsCobro(lista)
      setQrs(lista)
      toast.success(lista.length > 0 ? "QRs de cobro actualizados. Tus inquilinos ya pueden pagar" : "Lista de QR vacía")
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar los QR")
    }
  }

  const subirImagen = async (file: File, idx: number) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Sube una imagen de tu QR")
      return
    }
    setSubiendo(true)
    setSubiendoIdx(idx)
    try {
      const upload = await apiService.uploadImage(file)
      const lista = qrs.map((q, i) => (i === idx ? { ...q, url: upload.url } : q))
      await guardar(lista)
    } catch {
      toast.error("Error al subir la imagen")
    } finally {
      setSubiendo(false)
      setSubiendoIdx(null)
    }
  }

  const agregarFila = () => {
    if (qrs.length >= 5) {
      toast.error("Máximo 5 QR")
      return
    }
    const usadas = qrs.map((q) => q.plataforma)
    const libre = PLATAFORMAS.find((p) => !usadas.includes(p)) || "Otro"
    setQrs([...qrs, { plataforma: libre, url: "" }])
  }

  const actualizarFila = (idx: number, campo: Partial<QrItem>) => {
    setQrs((prev) => prev.map((q, i) => (i === idx ? { ...q, ...campo } : q)))
  }

  const quitarFila = (idx: number) => {
    guardar(qrs.filter((_, i) => i !== idx))
  }

  const hayPendientes = qrs.some((q) => !q.url)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary" />
          QR de cobros
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cargando ? (
          <div className="flex justify-center py-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {qrs.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Sube los QR de tus plataformas de cobro (Yape, Plin, BNB…) para que tus inquilinos puedan pagarte la renta escaneándolos.
              </p>
            )}

            {qrs.map((qr, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 p-2.5 space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={PLATAFORMAS.includes(qr.plataforma) ? qr.plataforma : "Otro"}
                    onChange={(e) => actualizarFila(idx, { plataforma: e.target.value })}
                    className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white cursor-pointer hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    {PLATAFORMAS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={() => quitarFila(idx)}
                    title="Quitar QR"
                    className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {qr.url ? (
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-lg border border-gray-200 bg-white p-1 flex items-center justify-center shrink-0">
                      <img src={getImageUrl(qr.url) || qr.url} alt={qr.plataforma} className="max-h-full object-contain" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Activo para tus inquilinos
                      </p>
                      <label className="inline-flex items-center gap-1.5 text-xs border rounded-md px-2.5 py-1.5 cursor-pointer hover:bg-muted transition-colors">
                        {subiendo && subiendoIdx === idx ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Upload className="w-3 h-3" />
                        )}
                        Cambiar imagen
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) subirImagen(f, idx)
                            e.target.value = ""
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                    {subiendo && subiendoIdx === idx ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">Subir imagen del QR de {qr.plataforma}</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) subirImagen(f, idx)
                        e.target.value = ""
                      }}
                    />
                  </label>
                )}
              </div>
            ))}

            <div className="flex gap-2">
              {qrs.length < 5 && (
                <Button variant="outline" size="sm" onClick={agregarFila} className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Agregar QR
                </Button>
              )}
              {hayPendientes && qrs.length > 0 && (
                <p className="text-xs text-amber-600 self-center">
                  Hay QR sin imagen: súbelas o elimina la fila
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
