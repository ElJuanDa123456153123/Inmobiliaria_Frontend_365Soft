// Servicio API para el módulo CRM

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// ==================== INTERFACES ====================

export interface Client {
  id: number
  nombre: string
  telefono: string
  whatsapp?: string
  email?: string
  estado: ClientStatus
  origen: ClientOrigin
  property_id?: number
  property?: {
    id: number
    titulo: string
    tipo_propiedad: string
    zona: string
  }
  notas?: string
  proximo_contacto?: string
  advisor_id: number
  created_at: string
  updated_at: string
  interacciones?: Interaction[]
}

export type ClientStatus =
  | 'Nuevo'
  | 'Contactado'
  | 'Interesado'
  | 'EnNegociacion'
  | 'Cerrado'
  | 'Perdido'

export type ClientOrigin =
  | 'Web'
  | 'WhatsApp'
  | 'Referencia'
  | 'Instagram'
  | 'Facebook'
  | 'Telefono'

export interface Interaction {
  id: number
  client_id: number
  advisor_id: number
  tipo: InteractionType
  notas: string
  proximo_contacto?: string
  cliente_estado?: ClientStatus
  created_at: string
  updated_at: string
}

export type InteractionType =
  | 'Llamada'
  | 'WhatsApp'
  | 'Email'
  | 'Visita'
  | 'Nota'
  | 'Reunion'

// ==================== LEAD SCORING ====================

export interface LeadScore {
  id: number
  client_id: number
  score: number
  level: ScoreLevel
  has_budget: boolean
  has_zone: boolean
  recent_interactions_count: number
  has_viewed_properties: boolean
  has_favorites: boolean
  has_specific_property: boolean
  origin_bonus: number
  state_bonus: number
  last_calculated_at?: string
  last_interaction_at?: string
  days_since_last_interaction: number
  created_at: string
  updated_at: string
  client?: Client  // Datos del cliente incluidos opcionalmente
}

export type ScoreLevel = 'ALTO' | 'MEDIO' | 'BAJO'

export interface ScoreStats {
  total: number
  avg_score: number
  high_count: number
  medium_count: number
  low_count: number
}

export interface FunnelStats {
  nuevos: number
  contactados: number
  interesados: number
  en_negociacion: number
  cerrados: number
  perdidos: number
  total: number
}

export interface CreateClientRequest {
  nombre: string
  telefono: string
  whatsapp?: string
  email?: string
  estado: ClientStatus
  origen: ClientOrigin
  property_id?: number
  notas?: string
}

export interface UpdateClientRequest {
  nombre?: string
  telefono?: string
  whatsapp?: string
  email?: string
  estado?: ClientStatus
  notas?: string
  proximo_contacto?: string
}

export interface CreateInteractionRequest {
  client_id: number
  tipo: InteractionType
  notas: string
  proximo_contacto?: string
  cliente_estado?: ClientStatus
}

export interface ClientsListResponse {
  clients: Client[]
  total: number
  page: number
  limit: number
}

// ==================== CRM API SERVICE ====================

class CrmApiService {
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

  // ==================== CLIENTES ====================

  async createClient(req: CreateClientRequest): Promise<Client> {
    const response = await fetch(`${API_URL}/api/crm/clients`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(req),
    })
    return this.handleResponse<Client>(response)
  }

  async getClients(params?: {
    page?: number
    limit?: number
    status?: ClientStatus
    query?: string
  }): Promise<ClientsListResponse> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.query) queryParams.append('query', params.query)

    const url = `${API_URL}/api/crm/clients${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    const response = await fetch(url, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<ClientsListResponse>(response)
  }

  async getClient(clientId: number): Promise<Client> {
    const response = await fetch(`${API_URL}/api/crm/clients/${clientId}`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<Client>(response)
  }

  async updateClient(clientId: number, req: UpdateClientRequest): Promise<Client> {
    const response = await fetch(`${API_URL}/api/crm/clients/${clientId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(req),
    })
    return this.handleResponse<Client>(response)
  }

  async deleteClient(clientId: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/crm/clients/${clientId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    return this.handleResponse<void>(response)
  }

  async getFunnelStats(): Promise<FunnelStats> {
    const response = await fetch(`${API_URL}/api/crm/clients/stats`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<FunnelStats>(response)
  }

  async getUpcomingContacts(days: number = 7): Promise<Client[]> {
    const response = await fetch(`${API_URL}/api/crm/clients/upcoming?days=${days}`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<Client[]>(response)
  }

  // ==================== INTERACCIONES ====================

  async createInteraction(clientId: number, req: CreateInteractionRequest): Promise<Interaction> {
    const response = await fetch(`${API_URL}/api/crm/clients/${clientId}/interactions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(req),
    })
    return this.handleResponse<Interaction>(response)
  }

  async getClientInteractions(clientId: number): Promise<Interaction[]> {
    const response = await fetch(`${API_URL}/api/crm/clients/${clientId}/interactions`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<Interaction[]>(response)
  }

  // ==================== LEAD SCORING ====================

  async getLeadScore(clientId: number): Promise<LeadScore> {
    const response = await fetch(`${API_URL}/api/crm/clients/${clientId}/score`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<LeadScore>(response)
  }

  async recalculateLeadScore(clientId: number): Promise<LeadScore> {
    const response = await fetch(`${API_URL}/api/crm/clients/${clientId}/score/recalculate`, {
      method: 'POST',
      headers: this.getHeaders(),
    })
    return this.handleResponse<LeadScore>(response)
  }

  async getAllLeadScores(recalculate: boolean = false): Promise<{ scores: LeadScore[]; total: number }> {
    const queryParams = new URLSearchParams()
    if (recalculate) queryParams.append('recalculate', 'true')

    const url = `${API_URL}/api/crm/leads/scores${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    const response = await fetch(url, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<{ scores: LeadScore[]; total: number }>(response)
  }

  async getTopLeads(limit: number = 20): Promise<{ leads: LeadScore[]; total: number }> {
    const response = await fetch(`${API_URL}/api/crm/leads/top?limit=${limit}`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<{ leads: LeadScore[]; total: number }>(response)
  }

  async getLeadsByLevel(level: ScoreLevel): Promise<{ leads: LeadScore[]; total: number; level: ScoreLevel }> {
    const response = await fetch(`${API_URL}/api/crm/leads/by-level/${level}`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<{ leads: LeadScore[]; total: number; level: ScoreLevel }>(response)
  }

  async getScoreStats(): Promise<ScoreStats> {
    const response = await fetch(`${API_URL}/api/crm/leads/scores/stats`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<ScoreStats>(response)
  }

  async recalculateAllScores(): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/api/crm/leads/scores/recalculate-all`, {
      method: 'POST',
      headers: this.getHeaders(),
    })
    return this.handleResponse<{ message: string }>(response)
  }
}

export const crmApiService = new CrmApiService()
