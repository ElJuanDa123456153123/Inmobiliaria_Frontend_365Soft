"use client"

import { useCallback, useState, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Upload, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { Imagen } from '@/lib/store/formularioPublicacion'
import { apiService } from '@/lib/services/api'

interface UploadImagenesProps {
  imagenes: Imagen[]
  onImagenesChange: (imagenes: Imagen[]) => void
  maxImagenes?: number
}

export default function UploadImagenes({
  imagenes,
  onImagenesChange,
  maxImagenes = 30
}: UploadImagenesProps) {

  const [uploadingCount, setUploadingCount] = useState(0)
  const imagenesRef = useRef(imagenes)

  // Mantener la ref actualizada
  useEffect(() => {
    imagenesRef.current = imagenes
  }, [imagenes])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const currentImagenes = imagenesRef.current

    if (currentImagenes.length + acceptedFiles.length > maxImagenes) {
      alert(`Solo puedes subir máximo ${maxImagenes} imágenes`)
      return
    }

    // Función interna para subir una imagen
    const uploadImage = async (file: File, id: string, orden: number): Promise<Imagen> => {
      try {
        // Subir al backend
        const resultado = await apiService.uploadImage(file)

        // La URL del backend es relativa (ej: /api/imagenes/propiedad-123-1.webp)
        // Usar la URL directamente (Next.js la servirá a través del proxy)
        return {
          id,
          url: resultado.url,
          preview: resultado.url,  // Usar la URL del backend como preview
          orden,
          uploading: false,
          error: undefined,
        }
      } catch (error: any) {
        console.error('Error uploading image:', error)
        // Mantener el preview existente en caso de error
        const currentImg = imagenesRef.current.find(img => img.id === id)

        // Crear un preview desde el archivo si no existe
        let preview = currentImg?.preview
        if (!preview && file) {
          preview = URL.createObjectURL(file)
        }

        return {
          id,
          preview: preview || '',
          url: undefined,  // No hay URL del backend
          orden,
          uploading: false,
          error: error.message || 'Error al subir',
          file,  // Mantener el archivo para permitir reintentar
        }
      }
    }

    // Crear imágenes iniciales con vista previa inmediata
    const nuevasImagenes: Imagen[] = acceptedFiles.map((file, index) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),  // Vista previa inmediata
      orden: currentImagenes.length + index,
      uploading: true,
    }))

    onImagenesChange([...currentImagenes, ...nuevasImagenes])

    // Subir imágenes con límite de concurrencia (máximo 3 a la vez)
    setUploadingCount(acceptedFiles.length)
    const MAX_CONCURRENT = 3

    // Función para subir imágenes en lotes
    const uploadBatch = async (imagenes: Imagen[]) => {
      for (const img of imagenes) {
        if (img.file) {
          const uploadedImage = await uploadImage(img.file, img.id, img.orden)

          // Actualizar la imagen específica en el array usando la ref actualizada
          onImagenesChange(
            imagenesRef.current.map(currentImg =>
              currentImg.id === img.id ? uploadedImage : currentImg
            )
          )
        }
        setUploadingCount(prev => Math.max(0, prev - 1))
      }
    }

    // Dividir en lotes y subir
    const batches: Imagen[][] = []
    for (let i = 0; i < nuevasImagenes.length; i += MAX_CONCURRENT) {
      batches.push(nuevasImagenes.slice(i, i + MAX_CONCURRENT))
    }

    // Subir cada lote secuencialmente
    for (const batch of batches) {
      await uploadBatch(batch)
    }
  }, [maxImagenes, onImagenesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: maxImagenes,
    disabled: uploadingCount > 0,  // Deshabilitar si hay imágenes subiendo
  })

  const removeImagen = (id: string) => {
    const imagen = imagenes.find(img => img.id === id)
    if (imagen && imagen.preview) {
      // Revocar si es un blob URL temporal (empieza con blob:)
      if (imagen.preview.startsWith('blob:')) {
        URL.revokeObjectURL(imagen.preview)
      }
    }
    onImagenesChange(imagenes.filter(img => img.id !== id))
  }

  const retryUpload = async (id: string) => {
    const imagen = imagenes.find(img => img.id === id)
    if (!imagen || !imagen.file) return

    // Marcar como subiendo
    onImagenesChange(
      imagenes.map(img =>
        img.id === id ? { ...img, uploading: true, error: undefined } : img
      )
    )

    try {
      const resultado = await apiService.uploadImage(imagen.file)

      // Actualizar con la URL del backend
      onImagenesChange(
        imagenes.map(img =>
          img.id === id
            ? {
                ...img,
                url: resultado.url,
                preview: resultado.url,
                uploading: false,
                error: undefined,
                file: undefined,  // Ya no necesitamos el archivo
              }
            : img
        )
      )

      // Limpiar el preview temporal si existe
      if (imagen.preview && imagen.preview.startsWith('blob:')) {
        URL.revokeObjectURL(imagen.preview)
      }
    } catch (error: any) {
      onImagenesChange(
        imagenes.map(img =>
          img.id === id
            ? {
                ...img,
                uploading: false,
                error: error.message || 'Error al subir',
              }
            : img
        )
      )
    }
  }

  const moveImagen = (fromIndex: number, toIndex: number) => {
    const nuevasImagenes = [...imagenes]
    const [removed] = nuevasImagenes.splice(fromIndex, 1)
    nuevasImagenes.splice(toIndex, 0, removed)
    // Actualizar orden
    nuevasImagenes.forEach((img, idx) => img.orden = idx)
    onImagenesChange(nuevasImagenes)
  }

  return (
    <div className="space-y-4">
      {/* Zona de drop */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          uploadingCount > 0
            ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
            : isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          {uploadingCount > 0 ? (
            <>
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <p className="text-lg font-semibold text-primary">
                Subiendo {uploadingCount} imagen{uploadingCount !== 1 ? 'es' : ''}...
              </p>
            </>
          ) : isDragActive ? (
            <>
              <Upload className="w-16 h-16 text-primary animate-bounce" />
              <p className="text-lg font-semibold text-primary">
                Suelta las imágenes aquí...
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Arrastra imágenes aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG o WebP (máx. {maxImagenes} imágenes)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Grid de imágenes */}
      {imagenes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              {imagenes.length} de {maxImagenes} imágenes
            </p>
            <p className="text-xs text-gray-500">
              Arrastra para reordenar
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {imagenes.map((imagen, index) => (
              <div
                key={imagen.id}
                className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                  imagen.error
                    ? 'border-red-300 bg-red-50'
                    : imagen.uploading
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:border-primary'
                }`}
                draggable={!imagen.uploading}
                onDragStart={(e) => {
                  if (!imagen.uploading) {
                    e.dataTransfer.effectAllowed = 'move'
                    e.dataTransfer.setData('imagen-index', index.toString())
                  }
                }}
                onDragOver={(e) => {
                  if (!imagen.uploading) {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  if (!imagen.uploading) {
                    const fromIndex = parseInt(e.dataTransfer.getData('imagen-index'))
                    moveImagen(fromIndex, index)
                  }
                }}
              >
                {/* Imagen de fondo siempre visible si hay preview */}
                {imagen.preview && (
                  <img
                    src={imagen.preview}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Overlay de carga */}
                {imagen.uploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                    <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                    <p className="text-xs text-white font-medium">Subiendo...</p>
                  </div>
                )}

                {/* Overlay de error */}
                {imagen.error && !imagen.uploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/90">
                    <AlertCircle className="w-8 h-8 text-white mb-2" />
                    <p className="text-xs text-white text-center px-2 mb-2">Error al subir</p>
                    {imagen.file && (
                      <button
                        onClick={() => retryUpload(imagen.id)}
                        className="mt-2 px-3 py-1 bg-white text-red-600 rounded-full text-xs font-semibold hover:bg-gray-100 transition-colors"
                        type="button"
                      >
                        Reintentar
                      </button>
                    )}
                  </div>
                )}


                {/* Número de orden */}
                <div className="absolute top-2 left-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>

                {/* Botón eliminar */}
                <button
                  onClick={() => removeImagen(imagen.id)}
                  disabled={imagen.uploading}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Indicador principal */}
                {index === 0 && !imagen.uploading && !imagen.error && (
                  <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    Principal
                  </div>
                )}

                {/* Indicador de subida completada */}
                {imagen.url && !imagen.uploading && !imagen.error && (
                  <div className="absolute top-2 right-12 bg-green-500 text-white p-1 rounded-full">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
