/**
 * Servicio API para propiedades
 * Conecta el frontend con el backend de Go
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface Property {
  id: number
  titulo: string
  tipo_operacion: string
  precio: number
  moneda: string
  acepta_permuta: boolean
  financia: boolean
  tipo_propiedad: string
  direccion: string
  zona: string
  latitud: number | null
  longitud: number | null
  dormitorios: string
  banos: string
  garaje: string
  metros_edificados: number
  metros_terreno: number
  estado: string
  ano_construccion: number
  descripcion: string
  video_url: string | null
  estado_propiedad: string
  vistas_contador: number
  destacado: boolean
  created_at: string
  vendedor_nombre: string
  vendedor_email: string
  vendedor_telefono: string
  property_images?: PropertyImage[]
}

export interface PropertyImage {
  id: number
  property_id: number
  image_url: string
  orden: number
  principal: boolean
}

export interface ListPropertiesParams {
  page?: number
  limit?: number
  tipo_operacion?: string
  tipo_propiedad?: string
  zona?: string
  estado?: string
  moneda?: string
  precio_min?: number
  precio_max?: number
  metros_min?: number
  metros_max?: number
  dormitorios?: string
  banos?: string
  garaje?: string
  acepta_permuta?: boolean
  financia?: boolean
  condominio?: boolean
  apto_oficina?: boolean
  vivienda_social?: boolean
  search?: string
  order_by?: 'precio' | 'fecha' | 'vistas' | 'metros'
  order?: 'asc' | 'desc'
}

export interface ListPropertiesResponse {
  propiedades: Property[]
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface SearchPropertiesParams {
  q: string
  page?: number
  limit?: number
  tipo_operacion?: string
  tipo_propiedad?: string
  moneda?: string
  precio_min?: number
  precio_max?: number
  metros_min?: number
  metros_max?: number
}

/**
 * Obtiene la lista de propiedades con filtros
 */
export async function listProperties(params: ListPropertiesParams = {}): Promise<ListPropertiesResponse> {
  const searchParams = new URLSearchParams()

  // Parámetros de paginación
  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())

  // Filtros
  if (params.tipo_operacion) searchParams.append('tipo_operacion', params.tipo_operacion)
  if (params.tipo_propiedad) searchParams.append('tipo_propiedad', params.tipo_propiedad)
  if (params.zona) searchParams.append('zona', params.zona)
  if (params.estado) searchParams.append('estado', params.estado)
  if (params.moneda) searchParams.append('moneda', params.moneda)
  if (params.precio_min) searchParams.append('precio_min', params.precio_min.toString())
  if (params.precio_max) searchParams.append('precio_max', params.precio_max.toString())
  if (params.metros_min) searchParams.append('metros_min', params.metros_min.toString())
  if (params.metros_max) searchParams.append('metros_max', params.metros_max.toString())
  if (params.dormitorios) searchParams.append('dormitorios', params.dormitorios)
  if (params.banos) searchParams.append('banos', params.banos)
  if (params.garaje) searchParams.append('garaje', params.garaje)
  if (params.acepta_permuta !== undefined) searchParams.append('acepta_permuta', params.acepta_permuta.toString())
  if (params.financia !== undefined) searchParams.append('financia', params.financia.toString())
  if (params.condominio !== undefined) searchParams.append('condominio', params.condominio.toString())
  if (params.apto_oficina !== undefined) searchParams.append('apto_oficina', params.apto_oficina.toString())
  if (params.vivienda_social !== undefined) searchParams.append('vivienda_social', params.vivienda_social.toString())
  if (params.search) searchParams.append('search', params.search)

  // Ordenamiento
  if (params.order_by) searchParams.append('order_by', params.order_by)
  if (params.order) searchParams.append('order', params.order)

  const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`
  const response = await fetch(`${baseUrl}/properties?${searchParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching properties: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Búsqueda full-text en propiedades
 */
export async function searchProperties(params: SearchPropertiesParams): Promise<ListPropertiesResponse> {
  const searchParams = new URLSearchParams()

  // Query de búsqueda (requerido)
  searchParams.append('q', params.q)

  // Paginación
  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())

  // Filtros opcionales
  if (params.tipo_operacion) searchParams.append('tipo_operacion', params.tipo_operacion)
  if (params.tipo_propiedad) searchParams.append('tipo_propiedad', params.tipo_propiedad)
  if (params.moneda) searchParams.append('moneda', params.moneda)
  if (params.precio_min) searchParams.append('precio_min', params.precio_min.toString())
  if (params.precio_max) searchParams.append('precio_max', params.precio_max.toString())
  if (params.metros_min) searchParams.append('metros_min', params.metros_min.toString())
  if (params.metros_max) searchParams.append('metros_max', params.metros_max.toString())

  const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`
  const response = await fetch(`${baseUrl}/properties/search?${searchParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error searching properties: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Obtiene una propiedad por ID
 */
export async function getProperty(id: number): Promise<Property> {
  const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`
  const response = await fetch(`${baseUrl}/properties/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching property: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Formatea el precio de una propiedad
 */
export function formatPrice(property: Property): string {
  const formattedPrice = new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: property.moneda === 'USD' ? 'USD' : 'BOB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(property.precio)

  if (property.tipo_operacion === 'alquiler') {
    return `${formattedPrice}/mes`
  }

  return formattedPrice
}
