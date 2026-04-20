"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Star, Settings, RotateCcw, Building2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function PublicarInmobiliariaPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    consulta: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Consulta enviada:", formData)
    alert("¡Consulta enviada con éxito!")
    setFormData({ nombre: "", email: "", consulta: "" })
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Publica en el mejor Portal Inmobiliario de Bolivia
          </h1>
          <p className="text-2xl md:text-3xl mb-8 text-gray-200">
            Haz crecer tu inmobiliaria
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-12 py-6 text-xl font-semibold"
              onClick={() => router.push("/publicar/inmobiliaria/registro")}
            >
              Publicar ahora
            </Button>
          </div>

          <p className="text-lg text-gray-300">
            ¿Eres un vendedor particular?
          </p>
        </div>
      </section>

      {/* 3 Cards Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Planes adaptados */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Planes adaptados</h3>
                <p className="text-gray-600 leading-relaxed">
                  Tenemos lo que buscabas
                </p>
                <p className="text-gray-600 leading-relaxed mt-2">
                  Planes ideales para tu inmobiliaria, con promociones únicas y varios métodos de pago.
                </p>
              </CardContent>
            </Card>

            {/* Card 2: Publicar es simple */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Settings className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Publicar es simple</h3>
                <p className="text-gray-600 leading-relaxed">
                  Tres pasos, ¡miles de visitas!
                </p>
                <p className="text-gray-600 leading-relaxed mt-2">
                  ¡Sube tus propiedades en 365SOFT y llega a más de 12,000 compradores potenciales diarios!
                </p>
              </CardContent>
            </Card>

            {/* Card 3: Tecnología para Real Estate */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RotateCcw className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Tecnología para Real Estate</h3>
                <p className="text-gray-600 leading-relaxed">
                  Innovando día a día
                </p>
                <p className="text-gray-600 leading-relaxed mt-2">
                  Diseño y usabilidad para que la experiencia de navegar en 365SOFT sea más simple e intuitiva.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-2">¿Buscas más información?</h2>
            <p className="text-xl text-gray-300">Envíanos tu consulta</p>
            <p className="text-gray-400 mt-2">y nos comunicamos contigo a la brevedad.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Tu nombre"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@email.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Consulta <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                value={formData.consulta}
                onChange={(e) => setFormData({ ...formData, consulta: e.target.value })}
                placeholder="Escribe tu consulta aquí..."
                rows={5}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto px-12 bg-primary hover:bg-primary/90 text-white font-semibold"
            >
              Enviar
            </Button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  )
}
