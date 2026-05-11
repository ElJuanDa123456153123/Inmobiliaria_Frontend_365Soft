// Obtener la URL del API admin según el contexto (igual que en api.ts)
const getAdminApiUrl = () => {
  // Si estamos en el servidor, usar API_URL_INTERNAL
  if (typeof window === 'undefined') {
    return `${process.env.API_URL_INTERNAL || 'http://backend:3001'}/api/admin`
  }
  // Si estamos en el cliente, usar NEXT_PUBLIC_API_URL
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin`
}

// ==================== INTERFACES ====================

export interface AdminProperty {
  id: number
  user_id: number
  titulo: string
  tipo_operacion: string
  precio: number
  moneda: string
  acepta_permuta: boolean
  financia: boolean
  tipo_propiedad: string
  direccion: string
  zona: string
  tipo_marcador?: string
  latitud?: number
  longitud?: number
  mostrar_direccion: boolean
  dormitorios: string
  banos: string
  garaje: string
  metros_edificados: number
  metros_terreno: number
  estado: string
  ano_construccion: number
  apto_oficina: boolean
  vivienda_social: boolean
  condominio: boolean
  cantidad_pisos: number
  confort: string[]
  seguridad: string[]
  no_aplica_confort: boolean
  video_url?: string
  descripcion: string
  terminos_condiciones?: string
  estado_propiedad: string
  destacado: boolean
  vistas_contador: number
  created_at: string
  updated_at: string
  advisor_id?: number
  // Relaciones
  user?: {
    id: number
    nombre: string
    email: string
    telefono: string
  }
  advisor?: {
    id: number
    nombre: string
    email: string
    especialidad: string
  }
  imagenes?: PropertyImage[]
  asesores_asignados?: Advisor[] // Array de asesores asignados a la propiedad
  vendedor_nombre: string
  vendedor_email?: string
  vendedor_telefono?: string
  mostrar_vendedor: boolean
}

export interface PropertyImage {
  id: number
  url: string
  orden: number
}

export interface Advisor {
  id: number
  nombre: string
  email: string
  telefono?: string
  especialidad?: string
  imagen_url?: string // Campo antiguo, mantener por compatibilidad
  avatar_url?: string // Nuevo campo de avatar
  user_id?: number
  activo: boolean
  created_at: string
  updated_at: string
  propiedades?: AdminProperty[]
}

// ==================== REQUEST TYPES ====================

export interface AdminPropertyListParams {
  page?: number
  limit?: number
  estado?: string
  tipo_operacion?: string
  tipo_propiedad?: string
  zona?: string
  user_id?: number
  advisor_id?: number | string
  search?: string
}

export interface CreatePropertyRequest {
  user_id?: number
  titulo: string
  tipo_operacion: string
  precio: number
  moneda: string
  acepta_permuta: boolean
  financia: boolean
  tipo_propiedad: string
  direccion: string
  zona: string
  tipo_marcador: string
  latitud?: number
  longitud?: number
  mostrar_direccion: boolean
  dormitorios: string
  banos: string
  garaje: string
  metros_edificados: number
  metros_terreno: number
  estado: string
  ano_construccion: number
  apto_oficina: boolean
  vivienda_social: boolean
  condominio: boolean
  cantidad_pisos: number
  confort: string[]
  seguridad: string[]
  no_aplica_confort: boolean
  imagenes: { url: string; orden: number }[]
  video_url?: string
  descripcion: string
  terminos_condiciones?: string
  advisor_id?: number
}

export interface UpdatePropertyRequest {
  titulo?: string
  tipo_operacion?: string
  precio?: number
  moneda?: string
  acepta_permuta?: boolean
  financia?: boolean
  tipo_propiedad?: string
  direccion?: string
  zona?: string
  tipo_marcador?: string
  latitud?: number
  longitud?: number
  mostrar_direccion?: boolean
  dormitorios?: string
  banos?: string
  garaje?: string
  metros_edificados?: number
  metros_terreno?: number
  estado?: string
  ano_construccion?: number
  apto_oficina?: boolean
  vivienda_social?: boolean
  condominio?: boolean
  cantidad_pisos?: number
  confort?: string[]
  seguridad?: string[]
  no_aplica_confort?: boolean
  video_url?: string
  descripcion?: string
  terminos_condiciones?: string
  advisor_id?: number
  mostrar_vendedor?: boolean
}

export interface CreateAdvisorRequest {
  nombre: string
  email: string
  password: string
  telefono?: string
  especialidad?: string
  imagen_url?: string // Nueva: foto de perfil
  activo?: boolean
}

export interface UpdateAdvisorRequest {
  nombre?: string
  email?: string
  password?: string
  telefono?: string
  especialidad?: string
  imagen_url?: string // Nueva: foto de perfil
  activo?: boolean
}

// ==================== RESPONSE TYPES ====================

export interface PropertiesListResponse {
  properties: AdminProperty[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface AdvisorsListResponse {
  advisors: Advisor[]
  total: number
  page: number
  limit: number
}

export interface PropertiesStatsResponse {
  total: number
  activos: number
  pendientes: number
  vendidos: number
  rechazados: number
  publicados_hoy: number
  ventas_mes: number
}

// ==================== ADMIN API SERVICE ====================

class AdminApiService {
  private getHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error desconocido' }))
      throw new Error(error.error || error.message || 'Error en la petición')
    }
    return response.json()
  }

  // ==================== PROPIEDADES ====================

  async listProperties(params?: AdminPropertyListParams): Promise<PropertiesListResponse> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.estado) queryParams.append('estado', params.estado)
    if (params?.tipo_operacion) queryParams.append('tipo_operacion', params.tipo_operacion)
    if (params?.tipo_propiedad) queryParams.append('tipo_propiedad', params.tipo_propiedad)
    if (params?.zona) queryParams.append('zona', params.zona)
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString())
    if (params?.advisor_id && params.advisor_id !== '') queryParams.append('advisor_id', params.advisor_id.toString())
    if (params?.search) queryParams.append('search', params.search)

    const response = await fetch(`${getAdminApiUrl()}/properties?${queryParams}`, {
      headers: this.getHeaders(),
    })

    return this.handleResponse<PropertiesListResponse>(response)
  }

  async getProperty(id: number): Promise<AdminProperty> {
    const response = await fetch(`${getAdminApiUrl()}/properties/${id}`, {
      headers: this.getHeaders(),
    })

    return this.handleResponse<AdminProperty>(response)
  }

  async createProperty(data: CreatePropertyRequest): Promise<{ message: string; property: AdminProperty }> {
    const response = await fetch(`${getAdminApiUrl()}/properties`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    return this.handleResponse<{ message: string; property: AdminProperty }>(response)
  }

  async updateProperty(id: number, data: UpdatePropertyRequest): Promise<{ message: string; property: AdminProperty }> {
    const response = await fetch(`${getAdminApiUrl()}/properties/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    return this.handleResponse<{ message: string; property: AdminProperty }>(response)
  }

  async updatePropertyStatus(id: number, estado: string): Promise<{ message: string; property: AdminProperty }> {
    const response = await fetch(`${getAdminApiUrl()}/properties/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ estado }),
    })

    return this.handleResponse<{ message: string; property: AdminProperty }>(response)
  }

  async toggleFeatured(id: number, destacado: boolean): Promise<{ message: string; property: AdminProperty }> {
    const response = await fetch(`${getAdminApiUrl()}/properties/${id}/featured`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ destacado }),
    })

    return this.handleResponse<{ message: string; property: AdminProperty }>(response)
  }

  async deleteProperty(id: number): Promise<{ message: string }> {
    const response = await fetch(`${getAdminApiUrl()}/properties/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })

    return this.handleResponse<{ message: string }>(response)
  }

  async assignAdvisor(propertyId: number, advisorId: number | null): Promise<{ message: string; property: AdminProperty }> {
    const response = await fetch(`${getAdminApiUrl()}/properties/${propertyId}/advisor`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ advisor_id: advisorId }),
    })

    return this.handleResponse<{ message: string; property: AdminProperty }>(response)
  }

  async getPropertiesStats(periodo: '7d' | '30d' | '90d' | 'all' = '30d'): Promise<PropertiesStatsResponse> {
    const response = await fetch(`${getAdminApiUrl()}/properties/stats?periodo=${periodo}`, {
      headers: this.getHeaders(),
    })

    return this.handleResponse<PropertiesStatsResponse>(response)
  }

  // ==================== ASESORES ====================

  async listAdvisors(params?: { page?: number; limit?: number; activo?: boolean; search?: string }): Promise<AdvisorsListResponse> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.activo !== undefined) queryParams.append('activo', params.activo.toString())
    if (params?.search) queryParams.append('search', params.search)

    const response = await fetch(`${getAdminApiUrl()}/advisors?${queryParams}`, {
      headers: this.getHeaders(),
    })

    return this.handleResponse<AdvisorsListResponse>(response)
  }

  async getAdvisor(id: number): Promise<Advisor> {
    const response = await fetch(`${getAdminApiUrl()}/advisors/${id}`, {
      headers: this.getHeaders(),
    })

    return this.handleResponse<Advisor>(response)
  }

  async createAdvisor(data: CreateAdvisorRequest): Promise<{ message: string; advisor: Advisor }> {
    const response = await fetch(`${getAdminApiUrl()}/advisors`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    return this.handleResponse<{ message: string; advisor: Advisor }>(response)
  }

  async updateAdvisor(id: number, data: UpdateAdvisorRequest): Promise<{ message: string; advisor: Advisor }> {
    const response = await fetch(`${getAdminApiUrl()}/advisors/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    return this.handleResponse<{ message: string; advisor: Advisor }>(response)
  }

  async deleteAdvisor(id: number): Promise<{ message: string }> {
    const response = await fetch(`${getAdminApiUrl()}/advisors/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })

    return this.handleResponse<{ message: string }>(response)
  }

  async toggleAdvisorActive(id: number): Promise<{ message: string; advisor: Advisor }> {
    const response = await fetch(`${getAdminApiUrl()}/advisors/${id}/toggle-active`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    })

    return this.handleResponse<{ message: string; advisor: Advisor }>(response)
  }

  // ==================== NUEVOS: MÚLTIPLES ASESORES POR PROPIEDAD ====================

  // Obtener todos los asesores asignados a una propiedad
  async getPropertyAdvisors(propertyId: number): Promise<{ advisors: Advisor[]; total: number }> {
    const response = await fetch(`${getAdminApiUrl()}/properties/${propertyId}/advisors`, {
      headers: this.getHeaders(),
    })

    return this.handleResponse<{ advisors: Advisor[]; total: number }>(response)
  }

  // Asignar un asesor a una propiedad (soporta múltiples)
  async assignAdvisorToProperty(propertyId: number, advisorId: number): Promise<{ message: string; advisor: Advisor }> {
    const response = await fetch(`${getAdminApiUrl()}/properties/${propertyId}/advisors`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ advisor_id: advisorId }),
    })

    return this.handleResponse<{ message: string; advisor: Advisor }>(response)
  }

  // Eliminar un asesor de una propiedad
  async removeAdvisorFromProperty(propertyId: number, advisorId: number): Promise<{ message: string }> {
    const response = await fetch(`${getAdminApiUrl()}/properties/${propertyId}/advisors/${advisorId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })

    return this.handleResponse<{ message: string }>(response)
  }
}

export const adminApi = new AdminApiService()
