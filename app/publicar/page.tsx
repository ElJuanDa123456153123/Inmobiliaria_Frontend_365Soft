"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Image as ImageIcon, MapPin, Home, DollarSign, FileText, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

const propertyTypes = [
  { value: "casa", label: "Casa" },
  { value: "departamento", label: "Departamento" },
  { value: "terreno", label: "Terreno" },
  { value: "oficina", label: "Oficina" },
  { value: "local", label: "Local Comercial" },
  { value: "galpon", label: "Galpón" },
]

const operationTypes = [
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
  { value: "anticretico", label: "Anticrético" },
]

const cities = [
  { value: "santa-cruz", label: "Santa Cruz" },
  { value: "la-paz", label: "La Paz" },
  { value: "cochabamba", label: "Cochabamba" },
  { value: "el-alto", label: "El Alto" },
  { value: "sucre", label: "Sucre" },
  { value: "oruro", label: "Oruro" },
]

export default function PublicarPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Paso 1: Información básica
    titulo: "",
    tipo: "",
    operacion: "",
    ciudad: "",
    zona: "",
    direccion: "",
    descripcion: "",
    precio: "",
    moneda: "USD",

    // Paso 2: Características
    bedrooms: "",
    bathrooms: "",
    area: "",
    estacionamiento: "",
    antiguedad: "",

    // Paso 3: Contacto
    nombre: "",
    email: "",
    telefono: "",
    whatsapp: "",

    // Imágenes
    imagenes: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementar envío al backend
    console.log("Publicar propiedad:", formData)
    alert("¡Propiedad publicada correctamente!")
    router.push("/propiedades")
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-gradient-to-br from-primary/5 via-background to-primary/5 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Publica tu Propiedad
            </h1>
            <p className="text-lg text-muted-foreground">
              Gratis y en pocos minutos. Llega a miles de interesados.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                2
              </div>
              <div className={`w-16 h-1 ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            {/* Paso 1: Información básica */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Información Básica</h2>
                  <p className="text-muted-foreground">Cuéntanos sobre tu propiedad</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Tipo de propiedad */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Propiedad</label>
                    <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tipo de operación */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Operación</label>
                    <Select value={formData.operacion} onValueChange={(value) => setFormData({ ...formData, operacion: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la operación" />
                      </SelectTrigger>
                      <SelectContent>
                        {operationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ciudad */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Ciudad</label>
                    <Select value={formData.ciudad} onValueChange={(value) => setFormData({ ...formData, ciudad: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la ciudad" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.value} value={city.value}>
                            {city.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Zona */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Zona/Barrio</label>
                    <Input
                      placeholder="Ej: Urubó, Equipetrol, Norte"
                      value={formData.zona}
                      onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
                    />
                  </div>
                </div>

                {/* Título */}
                <div>
                  <label className="block text-sm font-medium mb-2">Título de la Publicación</label>
                  <Input
                    placeholder="Ej: Hermosa casa en venta en Urubó"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <textarea
                    className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-input bg-background"
                    placeholder="Describe tu propiedad, sus características, amenidades..."
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  />
                </div>

                {/* Precio */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Precio</label>
                    <Input
                      type="number"
                      placeholder="Ej: 150000"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Moneda</label>
                    <Select value={formData.moneda} onValueChange={(value) => setFormData({ ...formData, moneda: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="BOB">Bs (Bolivianos)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 2: Características */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Características</h2>
                  <p className="text-muted-foreground">Agrega los detalles de tu propiedad</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Dormitorios */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Dormitorios</label>
                    <Select value={formData.bedrooms} onValueChange={(value) => setFormData({ ...formData, bedrooms: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Baños */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Baños</label>
                    <Select value={formData.bathrooms} onValueChange={(value) => setFormData({ ...formData, bathrooms: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Área */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Área (m²)</label>
                    <Input
                      type="number"
                      placeholder="Ej: 150"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    />
                  </div>

                  {/* Estacionamiento */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Estacionamientos</label>
                    <Select value={formData.estacionamiento} onValueChange={(value) => setFormData({ ...formData, estacionamiento: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sin estacionamiento</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Antigüedad */}
                <div>
                  <label className="block text-sm font-medium mb-2">Antigüedad</label>
                  <Select value={formData.antiguedad} onValueChange={(value) => setFormData({ ...formData, antiguedad: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="estreno">A estrenar</SelectItem>
                      <SelectItem value="1-5">1-5 años</SelectItem>
                      <SelectItem value="6-10">6-10 años</SelectItem>
                      <SelectItem value="11-20">11-20 años</SelectItem>
                      <SelectItem value="20+">Más de 20 años</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Imágenes */}
                <div>
                  <label className="block text-sm font-medium mb-2">Imágenes</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Arrastra imágenes aquí o haz clic para seleccionar
                    </p>
                    <Button type="button" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar imágenes
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 3: Contacto */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Información de Contacto</h2>
                  <p className="text-muted-foreground">¿Cómo pueden contactarte los interesados?</p>
                </div>

                <div className="space-y-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre Completo</label>
                    <Input
                      placeholder="Tu nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Correo Electrónico</label>
                    <Input
                      type="email"
                      placeholder="tu@correo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Teléfono</label>
                    <Input
                      type="tel"
                      placeholder="+591 XXX XXXXX"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-sm font-medium mb-2">WhatsApp (opcional)</label>
                    <Input
                      type="tel"
                      placeholder="+591 XXX XXXXX"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    />
                  </div>
                </div>

                {/* Resumen */}
                <div className="bg-muted rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Resumen de la Publicación</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Tipo:</span> {propertyTypes.find(t => t.value === formData.tipo)?.label}</p>
                    <p><span className="font-medium">Operación:</span> {operationTypes.find(t => t.value === formData.operacion)?.label}</p>
                    <p><span className="font-medium">Ubicación:</span> {formData.zona}, {cities.find(c => c.value === formData.ciudad)?.label}</p>
                    <p><span className="font-medium">Precio:</span> {formData.moneda === "USD" ? "$" : "Bs"} {formData.precio}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de navegación */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
              >
                Anterior
              </Button>

              {step < 3 ? (
                <Button type="button" onClick={nextStep}>
                  Siguiente
                </Button>
              ) : (
                <Button type="submit" className="min-w-[150px]">
                  Publicar
                </Button>
              )}
            </div>
          </form>

          {/* CTA WhatsApp */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              ¿Prefieres publicar por WhatsApp?
            </p>
            <Button variant="outline" size="lg">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Enviar por WhatsApp
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
