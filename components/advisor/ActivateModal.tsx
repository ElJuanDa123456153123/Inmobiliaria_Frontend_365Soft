"use client"

import { AlertTriangle, CheckCircle2, Home, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Property {
  id: number
  titulo: string
  precio: number
  moneda: string
  zona: string
}

interface ActivateModalProps {
  property: Property
  onConfirm: () => void
  onCancel: () => void
}

const formatPrice = (price: number, moneda: string) => {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: moneda === "USD" ? "USD" : "BOB",
    maximumFractionDigits: 0,
  }).format(price)
}

export function ActivateModal({ property, onConfirm, onCancel }: ActivateModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Activar Propiedad</h2>
              <p className="text-green-100 text-sm">Publicar propiedad en el sistema</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Property Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Home className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                  {property.titulo}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-1">{property.zona}</p>
                <p className="text-lg font-bold text-blue-600 mt-2">
                  {formatPrice(property.precio, property.moneda)}
                </p>
              </div>
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">¿Qué sucede al activar?</p>
                <ul className="text-blue-700 space-y-1 text-xs">
                  <li>• La propiedad será visible públicamente</li>
                  <li>• Los usuarios podrán contactar por esta propiedad</li>
                  <li>• Aparecerá en los resultados de búsqueda</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-900">
                <p className="font-medium">Antes de activar, verifica:</p>
                <ul className="text-yellow-700 space-y-1 text-xs mt-1">
                  <li>• La información de la propiedad sea correcta</li>
                  <li>• Las imágenes sean de buena calidad</li>
                  <li>• El precio sea el adecuado</li>
                  <li>• La descripción sea clara y completa</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Activar Propiedad
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
