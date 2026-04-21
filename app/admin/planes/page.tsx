"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Check, X, Layers, DollarSign, Calendar, Home, Star, LayoutList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

export default function PlanesPage() {
  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState<Partial<Plan>>({
    nombre: "",
    precio: 0,
    descripcion: "",
    duracion_meses: 1,
    limite_propiedades: 5,
    caracteristicas: "",
    destacado: false,
    activo: true,
    orden: 0
  })

  useEffect(() => {
    fetchPlanes()
  }, [])

  const fetchPlanes = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/admin/planes", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPlanes(data.planes || [])
      } else {
        console.error("Error response from server:", response.status)
      }
    } catch (err) {
      console.error("Error fetching planes:", err)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setFormData({
      nombre: "",
      precio: 0,
      descripcion: "",
      duracion_meses: 1,
      limite_propiedades: 5,
      caracteristicas: "",
      destacado: false,
      activo: true,
      orden: planes.length
    })
    setIsEditMode(false)
    setIsModalOpen(true)
    setError("")
  }

  const openEditModal = (plan: Plan) => {
    setFormData(plan)
    setIsEditMode(true)
    setIsModalOpen(true)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const url = isEditMode
        ? `http://localhost:3001/api/admin/planes/${formData.id}`
        : "http://localhost:3001/api/admin/planes"
      const method = isEditMode ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsModalOpen(false)
        fetchPlanes()
      } else {
        const data = await response.json()
        setError(data.error || "Error al guardar el plan")
      }
    } catch (err) {
      setError("Error de conexión con el servidor")
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este plan?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/admin/planes/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchPlanes()
      } else {
        alert("Error al eliminar el plan")
      }
    } catch (err) {
      alert("Error de conexión")
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-500 flex items-center gap-2">
          <Layers className="animate-bounce" /> Cargando planes...
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 pb-20 bg-gray-50/50 min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif tracking-tight flex items-center gap-3">
            <Layers className="h-8 w-8 text-primary" />
            Planes de Suscripción
          </h1>
          <p className="text-gray-500 mt-1">Configura los paquetes y precios para agentes e inmobiliarias.</p>
        </div>
        <Button onClick={openCreateModal} className="shadow-sm">
          <Plus className="h-4 w-4 mr-2" /> Crear Nuevo Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planes.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
            <LayoutList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay planes configurados todavía.</p>
            <Button variant="ghost" className="mt-4" onClick={openCreateModal}>
              Comienza creando uno
            </Button>
          </div>
        ) : (
          planes.map((plan) => (
            <div key={plan.id} className={`bg-white rounded-xl shadow-sm border ${plan.destacado ? 'border-primary ring-1 ring-primary/20' : 'border-gray-200'} overflow-hidden flex flex-col hover:shadow-md transition-shadow`}>
              {plan.destacado && (
                <div className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest py-1 text-center">
                  Recomendado
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{plan.nombre}</h3>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary" onClick={() => openEditModal(plan)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => handleDelete(plan.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-primary">{plan.precio} Bs.</span>
                  <span className="text-gray-400 text-sm ml-1">/ {plan.duracion_meses} {plan.duracion_meses === 1 ? 'mes' : 'meses'}</span>
                </div>
                <p className="text-gray-600 text-sm mb-6 line-clamp-2 h-10">
                  {plan.descripcion || "Sin descripción proporcionada."}
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Home className="h-4 w-4 text-primary opacity-70" />
                    <span>Límite: <strong>{plan.limite_propiedades}</strong> propiedades</span>
                  </div>
                  {plan.caracteristicas && plan.caracteristicas.split(',').map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feat.trim()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${plan.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {plan.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="text-xs text-gray-400">Orden: {plan.orden}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {isEditMode ? <Edit className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                {isEditMode ? "Editar Plan" : "Crear Nuevo Plan"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <X className="h-4 w-4" /> {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plan</label>
                    <Input
                      required
                      placeholder="Ej. Plan Pro, Plan Platino"
                      value={formData.nombre}
                      onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> Precio (Bs.)
                    </label>
                    <Input
                      required
                      type="number"
                      step="0.01"
                      value={Number.isNaN(formData.precio) ? "" : formData.precio}
                      onChange={e => setFormData({ ...formData, precio: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Duración (Meses)
                    </label>
                    <Input
                      required
                      type="number"
                      value={Number.isNaN(formData.duracion_meses) ? "" : formData.duracion_meses}
                      onChange={e => setFormData({ ...formData, duracion_meses: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Home className="h-3 w-3" /> Límite de Propiedades
                    </label>
                    <Input
                      required
                      type="number"
                      value={Number.isNaN(formData.limite_propiedades) ? "" : formData.limite_propiedades}
                      onChange={e => setFormData({ ...formData, limite_propiedades: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Orden de aparición</label>
                    <Input
                      type="number"
                      value={Number.isNaN(formData.orden) ? "" : formData.orden}
                      onChange={e => setFormData({ ...formData, orden: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex flex-col gap-4 py-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={formData.destacado}
                          onChange={e => setFormData({ ...formData, destacado: e.target.checked })}
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${formData.destacado ? 'bg-primary' : 'bg-gray-200'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.destacado ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                      <span className="text-sm text-gray-700 font-medium flex items-center gap-1">
                        <Star className={`h-3 w-3 ${formData.destacado ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} /> Marcar como Destacado
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={formData.activo}
                          onChange={e => setFormData({ ...formData, activo: e.target.checked })}
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${formData.activo ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.activo ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">Plan Visible y Activo</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    className="w-full min-h-[80px] px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Describe brevemente a quién va dirigido este plan..."
                    value={formData.descripcion}
                    onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Características (Separadas por comas)</label>
                  <textarea
                    className="w-full min-h-[100px] px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Soporte 24/7, Reportes VIP, Publicación destacada..."
                    value={formData.caracteristicas}
                    onChange={e => setFormData({ ...formData, caracteristicas: e.target.value })}
                  />
                  <p className="text-[10px] text-gray-400 mt-1 italic">Cada característica separada por una coma aparecerá con un check verde en el sitio.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-100">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitLoading} className="min-w-[140px]">
                  {submitLoading ? "Guardando..." : (isEditMode ? "Guardar Cambios" : "Crear Plan")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
