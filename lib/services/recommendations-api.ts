// Servicio API para el Motor de Recomendaciones

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// ==================== INTERFACES ====================

export interface PropertyRecommendation {
  property: Property
  score: number
  reason: string
  match_factors: string[]
}

export interface Property {
  id: number
  titulo: string
  tipo_operacion: string
  precio: number
  moneda: string
  tipo_propiedad: string
  zona: string
  dormitorios: string
  banos: string
  garaje?: string
  metros_edificados?: number
  metros_terreno?: number
  descripcion: string
  estado_propiedad: string
  vistas_contador: number
  destacado: boolean
  created_at: string
  updated_at: string
  imagenes?: PropertyImage[]
}

export interface PropertyImage {
  id: number
  property_id: number
  image_url: string
  orden: number
  principal: boolean
}

export interface RecommendationsResponse {
  recommendations: PropertyRecommendation[]
  total: number
  user_id: number
}

// ==================== RECOMMENDATIONS API SERVICE ====================

class RecommendationsApiService {
  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error desconocido' }))
      throw new Error(error.error || error.message || 'Error en la petición')
    }
    return response.json()
  }

  /**
   * Obtiene recomendaciones personalizadas para el usuario actual
   * @param limit - Número máximo de recomendaciones (default: 10, max: 50)
   */
  async getRecommendations(limit: number = 10): Promise<RecommendationsResponse> {
    const response = await fetch(`${API_URL}/api/recommendations?limit=${limit}`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<RecommendationsResponse>(response)
  }

  /**
   * Obtiene recomendaciones para un usuario específico (admin/asesor)
   * @param userId - ID del usuario
   * @param limit - Número máximo de recomendaciones (default: 10, max: 50)
   */
  async getRecommendationsByUser(userId: number, limit: number = 10): Promise<RecommendationsResponse> {
    const response = await fetch(`${API_URL}/api/recommendations/user/${userId}?limit=${limit}`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<RecommendationsResponse>(response)
  }
}

export const recommendationsApiService = new RecommendationsApiService()
