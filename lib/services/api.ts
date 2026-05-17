// Helper para obtener la URL del API en runtime (no en build time)
const getApiUrl = () => {
  // En el servidor, API_URL_INTERNAL está disponible en runtime
  if (process.env.API_URL_INTERNAL) {
    return process.env.API_URL_INTERNAL.replace('/api', '')
  }
  // En el cliente o fallback
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
  }
  return 'http://localhost:3001'
}

interface UserProfile {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  rol: string
  fecha_nacimiento?: string
  sexo?: string
  direccion?: string
  ci?: string
  avatar_url?: string
  nombre_inmobiliaria?: string
  nit?: string
  verificado: boolean
  activo: boolean
  nombre_contacto?: string
  telefono_contacto?: string
  horario_contacto?: string
}

interface UpdateProfileRequest {
  nombre: string
  apellido: string
  email: string
  telefono: string
  fecha_nacimiento?: string
  sexo?: string
  direccion?: string
  ci?: string
  avatar_url?: string
  nueva_password?: string
}

interface DatosPublicosRequest {
  nombre_contacto: string
  telefono_contacto: string
  horario_contacto: string
}

// === PROPIEDADES ===

interface CreatePropertyRequest {
  // === DATOS DE LA OPERACIÓN (PASO 1) ===
  titulo: string
  tipo_operacion: string
  precio: number
  moneda: string
  acepta_permuta: boolean
  financia: boolean

  // === DATOS GENERALES (PASO 2) ===
  tipo_propiedad: string
  direccion: string
  zona: string
  tipo_marcador: string
  latitud?: number
  longitud?: number
  mostrar_direccion: boolean

  // === DETALLES DE LA PROPIEDAD (PASO 3) ===
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

  // === CONFORT Y SEGURIDAD (PASO 4) ===
  confort: string[]
  seguridad: string[]
  no_aplica_confort: boolean

  // === IMÁGENES Y VIDEO (PASO 5) ===
  imagenes?: Array<{
    url: string   // URL de la imagen (ej: /api/imagenes/propiedad-123-1.webp)
    orden: number
  }>
  video_url: string

  // === DESCRIPCIÓN (PASO 6) ===
  descripcion: string
  terminos_condiciones: string
}

interface Property {
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
  video_url: string
  descripcion: string
  terminos_condiciones: string
  estado_propiedad: string
  destacado: boolean
  vistas_contador: number
  fecha_publicacion?: string
  created_at: string
  updated_at: string
  // Datos del vendedor (snapshot)
  vendedor_nombre: string
  vendedor_email?: string
  vendedor_telefono?: string
  vendedor_contacto?: string
  vendedor_horario?: string
  mostrar_vendedor?: boolean // Toggle para mostrar/ocultar vendedor (default: false = 365Soft)
  mostrar_agencia?: boolean // Toggle para mostrar/ocultar agencia (default: false = 365Soft)
  agencia_nombre_personalizado?: string // Nombre personalizado para la agencia
  // Imágenes de la propiedad
  imagenes?: Array<{
    id: number
    property_id: number
    image_url: string
    orden: number
    principal: boolean
  }>
  // Asesores asignados (múltiples)
  asesores_asignados?: Array<{
    id: number
    property_id: number
    advisor_id: number
    asesor?: {
      id: number
      nombre: string
      email: string
      telefono?: string
      especialidad?: string
      imagen_url?: string
      avatar_url?: string
    }
  }>
}

class ApiService {
  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error desconocido' }))
      throw new Error(error.error || 'Error en la petición')
    }
    return response.json()
  }

  // Obtener perfil del usuario actual
  async getProfile(): Promise<UserProfile> {
    const response = await fetch(`${getApiUrl()}/api/auth/me`, {
      headers: this.getHeaders(),
    })

    return this.handleResponse(response)
  }

  // Actualizar perfil del usuario actual
  async updateProfile(data: UpdateProfileRequest): Promise<{ message: string; user: UserProfile }> {
    // Crear payload limpio sin valores undefined o vacíos
    const payload: any = {
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
    }

    // Agregar campos opcionales solo si tienen valor
    if (data.telefono && data.telefono.trim()) {
      payload.telefono = data.telefono.trim()
    }

    if (data.fecha_nacimiento && data.fecha_nacimiento.trim()) {
      // Enviar fecha en formato ISO 8601
      payload.fecha_nacimiento = new Date(data.fecha_nacimiento).toISOString()
    }

    if (data.sexo && data.sexo.trim()) {
      payload.sexo = data.sexo.trim()
    }

    if (data.direccion && data.direccion.trim()) {
      payload.direccion = data.direccion.trim()
    }

    if (data.ci && data.ci.trim()) {
      payload.ci = data.ci.trim()
    }

    if (data.avatar_url && data.avatar_url.trim()) {
      payload.avatar_url = data.avatar_url.trim()
    }

    // Solo enviar nueva_password si tiene valor real
    if (data.nueva_password && data.nueva_password.trim() && data.nueva_password.trim().length > 0) {
      payload.nueva_password = data.nueva_password.trim()
    }

    const response = await fetch(`${getApiUrl()}/api/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    })

    return this.handleResponse(response)
  }

  // Actualizar datos públicos del vendedor
  async updateDatosPublicos(data: DatosPublicosRequest): Promise<{ message: string; user: UserProfile }> {
    const response = await fetch(`${getApiUrl()}/api/auth/datos-publicos`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    return this.handleResponse(response)
  }

  // === PROPIEDADES ===

  // Subir una imagen individual
  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData()
    formData.append('image', file)

    // Crear AbortController para timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 segundos

    try {
      const response = await fetch(`${getApiUrl()}/api/imagenes/upload`, {
        method: 'POST',
        headers: {
          // NO incluir Content-Type al usar FormData, el navegador lo establece automáticamente
          ...(typeof window !== 'undefined' && localStorage.getItem('token')
            ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            : {}),
        },
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error al subir la imagen' }))
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      return response.json()
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('La subida de la imagen tomó demasiado tiempo. Intenta con una imagen más pequeña.')
      }
      throw error
    }
  }

  // Subir una imagen de avatar (separado de las imágenes de propiedades)
  async uploadAvatar(file: File): Promise<{ url: string; filename: string; width: number; height: number }> {
    const formData = new FormData()
    formData.append('image', file)

    // Crear AbortController para timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 segundos

    try {
      const response = await fetch(`${getApiUrl()}/api/avatars/upload`, {
        method: 'POST',
        headers: {
          // NO incluir Content-Type al usar FormData, el navegador lo establece automáticamente
          ...(typeof window !== 'undefined' && localStorage.getItem('token')
            ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            : {}),
        },
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error al subir el avatar' }))
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      return response.json()
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('La subida del avatar tomó demasiado tiempo. Intenta con una imagen más pequeña.')
      }

      throw error
    }
  }

  // Crear una nueva propiedad
  async createProperty(data: CreatePropertyRequest): Promise<{ message: string; property: Property }> {
    const response = await fetch(`${getApiUrl()}/api/properties`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    return this.handleResponse(response)
  }

  // Obtener una propiedad por ID
  async getProperty(id: number): Promise<Property> {
    const response = await fetch(`${getApiUrl()}/api/properties/${id}`, {
      headers: this.getHeaders(),
    })

    return this.handleResponse(response)
  }

  // Listar propiedades (con filtros opcionales)
  async listProperties(params?: {
    tipo_operacion?: string
    tipo_propiedad?: string
    zona?: string
    estado?: string
    limite?: number
    offset?: number
  }): Promise<{ propiedades: Property[]; total: number; limite: number; offset: number }> {
    const queryParams = new URLSearchParams()

    if (params?.tipo_operacion) queryParams.append('tipo_operacion', params.tipo_operacion)
    if (params?.tipo_propiedad) queryParams.append('tipo_propiedad', params.tipo_propiedad)
    if (params?.zona) queryParams.append('zona', params.zona)
    if (params?.estado) queryParams.append('estado', params.estado)
    if (params?.limite) queryParams.append('limite', params.limite.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())

    const url = queryParams.toString()
      ? `${getApiUrl()}/api/properties?${queryParams.toString()}`
      : `${getApiUrl()}/api/properties`

    const response = await fetch(url, {
      headers: this.getHeaders(),
    })

    return this.handleResponse(response)
  }

  // Obtener propiedades del usuario actual
  async getMyProperties(): Promise<Property[]> {
    const response = await fetch(`${getApiUrl()}/api/properties/my`, {
      headers: this.getHeaders(),
    })

    return this.handleResponse(response)
  }

  // Actualizar estado de una propiedad
  async updatePropertyStatus(id: number, estado: string): Promise<{ message: string; property: Property }> {
    const response = await fetch(`${getApiUrl()}/api/properties/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ estado }),
    })

    return this.handleResponse(response)
  }

  // Eliminar una propiedad
  async deleteProperty(id: number): Promise<{ message: string }> {
    const response = await fetch(`${getApiUrl()}/api/properties/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })

    return this.handleResponse(response)
  }

  // === PLANES DE SUSCRIPCIÓN ===

  // Obtener planes activos (público - no requiere autenticación)
  async getPlanes(): Promise<{ planes: Plan[] }> {
    const response = await fetch(`${getApiUrl()}/api/planes`)

    return this.handleResponse(response)
  }

  // Obtener un plan por ID (público)
  async getPlan(id: number): Promise<Plan> {
    const response = await fetch(`${getApiUrl()}/api/planes/${id}`)

    return this.handleResponse(response)
  }
}

// Interface para planes de suscripción
interface Plan {
  id: number
  nombre: string
  precio: number
  descripcion: string
  duracion_meses: number
  limite_propiedades: number
  caracteristicas: string
  destacado: boolean
  activo: boolean
  orden: number
}

export const apiService = new ApiService()
// Exportar como 'api' para compatibilidad con componentes existentes
export const api = apiService
export type { UserProfile, UpdateProfileRequest, DatosPublicosRequest, CreatePropertyRequest, Property, Plan }

