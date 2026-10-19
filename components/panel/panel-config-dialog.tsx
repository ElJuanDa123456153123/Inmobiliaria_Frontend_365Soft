"use client"

import { Check, Info, Palette, PanelLeftClose, RotateCcw } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { PanelAccent, PanelPrefs } from "@/lib/user-prefs"

const accentColors: { value: PanelAccent; label: string; bgClass: string }[] = [
  { value: "cyan", label: "Cian (Original)", bgClass: "bg-cyan-500" },
  { value: "blue", label: "Azul", bgClass: "bg-blue-500" },
  { value: "green", label: "Verde", bgClass: "bg-green-500" },
  { value: "purple", label: "Púrpura", bgClass: "bg-purple-500" },
  { value: "orange", label: "Naranja", bgClass: "bg-orange-500" },
  { value: "red", label: "Rojo", bgClass: "bg-red-500" },
]

interface PanelConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prefs: PanelPrefs
  onChange: (prefs: PanelPrefs) => void
}

export function PanelConfigDialog({ open, onOpenChange, prefs, onChange }: PanelConfigDialogProps) {
  const currentAccent = prefs.accent ?? "cyan"
  const hasPersonalAccent = Boolean(prefs.accent && prefs.accent !== "cyan")

  const handleAccent = (accent: PanelAccent) => {
    onChange({ ...prefs, accent })
  }

  const handleReset = () => {
    onChange({ ...prefs, accent: undefined })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Configuración
          </DialogTitle>
          <DialogDescription>
            Personaliza la apariencia de tu panel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Color de acento */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Color de acento</Label>
            <div className="flex gap-2 flex-wrap">
              {accentColors.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAccent(option.value)}
                  className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-200 hover:scale-110
                    ${option.bgClass}
                    shadow-md hover:shadow-lg
                  `}
                  title={option.label}
                >
                  {currentAccent === option.value && (
                    <Check className="h-5 w-5 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar colapsado por defecto */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="sidebar-collapsed" className="flex items-center gap-2 text-sm font-medium">
                <PanelLeftClose className="h-4 w-4" />
                Sidebar colapsado
              </Label>
              <p className="text-xs text-muted-foreground">
                Abrir el panel con el menú lateral contraído
              </p>
            </div>
            <Switch
              id="sidebar-collapsed"
              checked={prefs.sidebarCollapsed ?? false}
              onCheckedChange={(checked) => onChange({ ...prefs, sidebarCollapsed: checked })}
            />
          </div>

          {/* Restablecer */}
          {hasPersonalAccent && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Restablecer color original
            </button>
          )}

          {/* Nota privacidad */}
          <div className="flex items-start gap-2 rounded-lg bg-muted p-3">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Estos ajustes son personales: solo tú los ves, en el panel y en el sitio.
              Los visitantes sin cuenta verán el tema configurado por el administrador.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
