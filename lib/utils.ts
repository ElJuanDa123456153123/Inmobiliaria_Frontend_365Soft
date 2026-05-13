import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normaliza una URL de imagen del backend.
 * Si la URL es relativa (ej. "/uploads/..."), la convierte en una URL absoluta
 * usando la URL base del API. Si ya es absoluta (http/https), la retorna tal cual.
 * Retorna null si no se proporciona una URL válida.
 */
export function getImageUrl(imageUrl: string | undefined | null): string | null {
  if (!imageUrl) return null

  // Si ya es una URL absoluta, retornar directamente
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl
  }

  // Obtener la URL base del API (quitar /api del final si existe)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
  const baseUrl = apiUrl.replace(/\/api\/?$/, "")

  // Asegurar que la ruta de imagen comience con /
  const path = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`

  return `${baseUrl}${path}`
}
