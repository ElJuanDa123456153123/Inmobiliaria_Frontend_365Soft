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
}

export const crmApiService = new CrmApiService()
