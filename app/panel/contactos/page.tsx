"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Mail, Phone, Building, Check, CheckCheck, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface PropertyContact {
  id: number
  mensaje: string
  leido: boolean
  respondido: boolean
  created_at: string
  user: {
    id: number
    nombre: string
    email: string
    telefono?: string
  }
  property: {
    id: number
    titulo: string
    tipo_propiedad: string
    zona: string
  }
}

export default function PanelContactosPage() {
  const [contacts, setContacts] = useState<PropertyContact[]>([])
  const [loading, setLoading] = useState(true)
  const [filterLeido, setFilterLeido] = useState<string>("")
  const [filterRespondido, setFilterRespondido] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchContacts()
  }, [filterLeido, filterRespondido])

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem("token")
      let url = "http://localhost:3001/api/panel/contacts"

      const params = new URLSearchParams()
      if (filterLeido) params.append("leido", filterLeido)
      if (filterRespondido) params.append("respondido", filterRespondido)
      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setContacts(data.contactos || [])
        setUnreadCount(data.no_leidos || 0)
      }
    } catch (error) {
      console.error("Error fetching contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (contactId: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/panel/contacts/${contactId}/read`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchContacts()
      }
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }

  const markAsResponded = async (contactId: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/panel/contacts/${contactId}/respond`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchContacts()
      }
    } catch (error) {
      console.error("Error marking as responded:", error)
    }
  }

  const filteredContacts = contacts.filter((contact) =>
    contact.user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Contactos</h1>
        <p className="text-gray-600 mt-1">
          Gestiona los contactos interesados en tus propiedades
          {unreadCount > 0 && ` • ${unreadCount} sin leer`}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterLeido}
              onChange={(e) => setFilterLeido(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos (leído/no leído)</option>
              <option value="true">Leídos</option>
              <option value="false">No leídos</option>
            </select>

            <select
              value={filterRespondido}
              onChange={(e) => setFilterRespondido(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos (respondido/no respondido)</option>
              <option value="true">Respondidos</option>
              <option value="false">No respondidos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      {filteredContacts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay contactos</h3>
          <p className="text-gray-600">
            {searchTerm || filterLeido || filterRespondido
              ? "No se encontraron contactos con los filtros aplicados"
              : "Aún no has recibido contactos interesados en tus propiedades"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`bg-white rounded-xl shadow-sm p-6 ${
                !contact.leido ? "border-l-4 border-blue-500" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                {/* Contact Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-gray-900">{contact.user.nombre}</h3>
                    {!contact.leido && (
                      <Badge className="bg-blue-500">Nuevo</Badge>
                    )}
                    {contact.respondido && (
                      <Badge className="bg-green-500">Respondido</Badge>
                    )}
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {contact.user.email}
                    </div>
                    {contact.user.telefono && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {contact.user.telefono}
                      </div>
                    )}
                  </div>

                  {/* Property */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Building className="w-4 h-4 mr-2" />
                    <Link
                      href={`/propiedades/${contact.property.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {contact.property.titulo}
                    </Link>
                    <span className="mx-2">•</span>
                    <span>{contact.property.zona}</span>
                  </div>

                  {/* Message */}
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                    <p className="text-sm">"{contact.mensaje}"</p>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-gray-500 mt-3">
                    {new Date(contact.created_at).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  {!contact.leido && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsRead(contact.id)}
                      className="whitespace-nowrap"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Marcar leído
                    </Button>
                  )}
                  {!contact.respondido && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsResponded(contact.id)}
                      className="whitespace-nowrap"
                    >
                      <CheckCheck className="w-4 h-4 mr-2" />
                      Marcar respondido
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Responder
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
