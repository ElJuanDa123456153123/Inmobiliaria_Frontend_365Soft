import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convierte un image_url del backend a una URL válida para mostrar
 * - Si es base64 (empieza con letras/números y es largo), agrega el prefijo data:image/jpeg;base64,
 * - Si es una URL normal (http/https), la deja tal cual
 * - Si es blob URL, la deja tal cual (aunque no funcionará después de recargar)
 */
export function getImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null

  // Si ya empieza con data:, http://, https://, o blob://, dejarlo tal cual
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://') || imageUrl.startsWith('blob:')) {
    return imageUrl
  }

  // Si parece ser base64 (solo caracteres alfanuméricos, +, /, y = al final)
  // Y es lo suficientemente largo (mínimo 100 caracteres para ser una imagen válida)
  const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
  if (base64Pattern.test(imageUrl) && imageUrl.length > 100) {
    // Es base64, agregar el prefijo (asumimos JPEG por defecto)
    return `data:image/jpeg;base64,${imageUrl}`
  }

  // Para cualquier otro caso, devolver tal cual
  return imageUrl
}
