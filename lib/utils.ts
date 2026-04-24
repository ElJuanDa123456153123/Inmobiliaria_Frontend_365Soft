import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convierte un image_url del backend a una URL válida para mostrar
 *
 * FORMATOS SOPORTADOS:
 * - data:image/... → Imagen en base64 (ya formateada)
 * - http://... o https://... → URL externa (Cloudinary, S3, etc.)
 * - blob:... → Blob temporal (subida local)
 * - /api/imagenes/... → Imagen almacenada localmente en el backend
 * - Base64 sin prefijo → Detecta y agrega prefijo data:image/jpeg;base64,
 *
 * @param imageUrl - URL o ruta de la imagen
 * @returns URL completa para mostrar en <img> o null si es inválida
 */
export function getImageUrl(imageUrl: string | null | undefined): string | null {
  // 1. Validar entrada
  if (!imageUrl) return null

  // 2. Limpiar espacios en blanco
  imageUrl = imageUrl.trim()
  if (!imageUrl) return null

  // 3. Si ya es una URL completa o data URI, devolver tal cual
  if (imageUrl.startsWith('data:') ||
      imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://') ||
      imageUrl.startsWith('blob:')) {
    return imageUrl
  }

  // 4. Si es una ruta relativa del backend (/api/imagenes/...), convertirla a URL completa
  if (imageUrl.startsWith('/')) {
    // Obtener la URL base del backend
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

    // Normalizar: remover /api del final si existe
    apiUrl = apiUrl.replace(/\/api$/, '')

    // Remover slash del final si existe
    apiUrl = apiUrl.replace(/\/$/, '')

    // Construir URL completa del backend
    const fullUrl = `${apiUrl}${imageUrl}`

    return fullUrl
  }

  // 5. Detectar base64 sin prefijo (solo caracteres alfanuméricos, +, /)
  // Debe ser largo (mínimo 100 caracteres) para ser una imagen válida
  const base64Pattern = /^[A-Za-z0-9+/]+=*$/
  if (base64Pattern.test(imageUrl) && imageUrl.length > 100) {
    return `data:image/jpeg;base64,${imageUrl}`
  }

  // 6. Para cualquier otro caso, devolver tal cual (puede ser una URL relativa sin /)
  return imageUrl
}
