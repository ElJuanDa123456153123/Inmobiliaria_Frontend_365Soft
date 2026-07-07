"use client"

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, Check, AlertCircle, Camera, FileImage } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ProofUploaderProps {
  onProofChange: (file: File | null, preview: string | null) => void
  submitting?: boolean
}

export default function ProofUploader({ onProofChange, submitting = false }: ProofUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen')
      return
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede ser mayor a 5MB')
      return
    }

    setSelectedFile(file)

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
      onProofChange(file, reader.result as string)
      toast.success('Imagen cargada correctamente')
    }
    reader.readAsDataURL(file)
  }, [onProofChange])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setPreview(null)
    onProofChange(null, null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast.info('Imagen eliminada')
  }

  const handleCamera = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!preview ? (
        <Card
          className={cn(
            "border-2 transition-all duration-300",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-dashed border-gray-300 dark:border-gray-600 hover:border-primary/50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="p-8">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
              disabled={submitting}
            />

            <div className="flex flex-col items-center text-center space-y-4">
              <div
                className={cn(
                  "p-6 rounded-full transition-all duration-300",
                  isDragging
                    ? "bg-primary/20 scale-110"
                    : "bg-gray-100 dark:bg-gray-800"
                )}
              >
                <Upload
                  className={cn(
                    "w-10 h-10 transition-colors",
                    isDragging ? "text-primary" : "text-gray-400"
                  )}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isDragging ? 'Suelta la imagen aquí' : 'Sube tu comprobante de pago'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                  Arrastra y suelta una imagen, o haz clic para seleccionar
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={submitting}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileImage className="w-4 h-4" />
                  Seleccionar Archivo
                </Button>

                <Button
                  onClick={handleCamera}
                  disabled={submitting}
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Abrir Cámara
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2">
                <AlertCircle className="w-3 h-3" />
                <span>Formatos: JPG, PNG, WEBP • Máximo 5MB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Preview */
        <Card className="border-2 border-primary/30 overflow-hidden">
          <CardContent className="p-6">
            <div className="relative">
              {/* Image */}
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden mb-4">
                <img
                  src={preview}
                  alt="Comprobante de pago"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Remove Button */}
              <Button
                onClick={handleRemove}
                disabled={submitting}
                variant="destructive"
                size="sm"
                className="absolute top-8 right-8 shadow-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* File Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedFile?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedFile && ((selectedFile.size / 1024).toFixed(2))} KB
                  </p>
                </div>
              </div>

              <Badge className="bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                Lista para enviar
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-300 space-y-1">
            <p className="font-semibold">Recuerda:</p>
            <ul className="space-y-1 text-blue-800 dark:text-blue-400 list-disc list-inside">
              <li>La imagen debe ser clara y legible</li>
              <li>Asegúrate de que se vea el monto y fecha</li>
              <li>El administrador revisará tu comprobante</li>
              <li>Recibirás una notificación al aprobar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
