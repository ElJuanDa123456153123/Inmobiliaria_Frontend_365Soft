"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Building2,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Client, Interaction, InteractionType, ClientStatus } from "@/lib/services/crm-api"
import { crmApiService } from "@/lib/services/crm-api"
import { InteractionTimeline } from "@/components/crm/interaction-timeline"
import { AddInteractionModal } from "@/components/crm/add-interaction-modal"
import { EditClientModal } from "@/components/crm/edit-client-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = parseInt(params.id as string)

  const [client, setClient] = useState<Client | null>(null)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddInteraction, setShowAddInteraction] = useState(false)
  const [showEditClient, setShowEditClient] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchClient()
    fetchInteractions()
  }, [clientId])

  const fetchClient = async () => {
    try {
      const data = await crmApiService.getClient(clientId)
      setClient(data)
    } catch (error: any) {
      console.error("Error fetching client:", error)
      toast.error(error.message || "Error al cargar cliente")
    } finally {
      setLoading(false)
    }
  }

  const fetchInteractions = async () => {
    try {
      const data = await crmApiService.getClientInteractions(clientId)
      setInteractions(data)
    } catch (error: any) {
      console.error("Error fetching interactions:", error)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await crmApiService.deleteClient(clientId)
      toast.success("Cliente eliminado exitosamente")
      router.push("/crm/clientes")
    } catch (error: any) {
      console.error("Error deleting client:", error)
      toast.error(error.message || "Error al eliminar cliente")
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleInteractionAdded = () => {
    setShowAddInteraction(false)
    fetchInteractions()
    fetchClient() // Para actualizar el estado si cambió
    toast.success("Interacción registrada")
  }

  const handleClientUpdated = () => {
    setShowEditClient(false)
    fetchClient()
    toast.success("Cliente actualizado")
  }

  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case "Nuevo":
        return "bg-blue-500"
      case "Contactado":
        return "bg-yellow-500"
      case "Interesado":
        return "bg-green-500"
      case "EnNegociacion":
        return "bg-orange-500"
      case "Cerrado":
        return "bg-green-600"
      case "Perdido":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando cliente...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-1 flex items-center justify-center">
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Cliente no encontrado
              </h3>
              <Button onClick={() => router.push("/admin/crm/clientes")}>
                Volver a Clientes
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{client.nombre}</h1>
                  <Badge className={`${getStatusColor(client.estado)} text-white`}>
                    {client.estado}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  Cliente desde el {new Date(client.created_at).toLocaleDateString("es-BO")}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditClient(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddInteraction(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Interacción
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna Izquierda: Información del Cliente */}
            <div className="lg:col-span-1 space-y-6">
              {/* Información de Contacto */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <Phone className="w-4 h-4 mr-3 text-gray-500" />
                      <span className="font-medium">{client.telefono}</span>
                    </div>

                    {client.whatsapp && (
                      <div className="flex items-center text-gray-700">
                        <Phone className="w-4 h-4 mr-3 text-green-500" />
                        <span>{client.whatsapp}</span>
                      </div>
                    )}

                    {client.email && (
                      <div className="flex items-center text-gray-700">
                        <Mail className="w-4 h-4 mr-3 text-gray-500" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Propiedad de Interés */}
              {client.property && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Propiedad de Interés
                    </h3>
                    <div
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => router.push(`/propiedades/${client.property?.id}`)}
                    >
                      <p className="font-medium text-gray-900">{client.property.titulo}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {client.property.tipo_propiedad} en {client.property.zona}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Próximo Contacto */}
              {client.proximo_contacto && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Próximo Contacto
                    </h3>
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center text-orange-800">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="font-medium">
                          {new Date(client.proximo_contacto).toLocaleDateString("es-BO", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notas */}
              {client.notas && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Notas</h3>
                    <p className="text-gray-700 text-sm">{client.notas}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Columna Derecha: Timeline de Interacciones */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-gray-900">
                      Historial de Interacciones
                    </h3>
                    <Button onClick={() => setShowAddInteraction(true)} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Registrar
                    </Button>
                  </div>

                  {interactions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>No hay interacciones registradas</p>
                      <Button
                        onClick={() => setShowAddInteraction(true)}
                        variant="outline"
                        className="mt-4"
                      >
                        Registrar Primera Interacción
                      </Button>
                    </div>
                  ) : (
                    <InteractionTimeline interactions={interactions} />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Modales */}
      {showAddInteraction && (
        <AddInteractionModal
          clientId={clientId}
          currentStatus={client.estado}
          onClose={() => setShowAddInteraction(false)}
          onSuccess={handleInteractionAdded}
        />
      )}

      {showEditClient && (
        <EditClientModal
          client={client}
          onClose={() => setShowEditClient(false)}
          onSuccess={handleClientUpdated}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al cliente {client.nombre} y todo
              su historial de interacciones. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Eliminando..." : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
