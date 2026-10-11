'use server'

import { apiService } from '@/lib/services/api'

/**
 * Server Action para cargar propiedades destacadas
 * Se ejecuta en el servidor donde API_URL_INTERNAL está disponible
 */
export async function getFeaturedProperties() {
  try {
    const response = await apiService.listProperties({
      estado: 'activo',
      destacado: true,
      limit: 6,
    })
    return { success: true, data: response }
  } catch (error) {
    console.error('[getFeaturedProperties] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al cargar propiedades',
    }
  }
}
