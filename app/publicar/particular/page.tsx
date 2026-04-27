"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function PublicarParticularPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Home className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Publica como Particular
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Vende o alquila tu propiedad de forma rápida y sencilla
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Próximamente</h2>
            <p className="text-muted-foreground mb-6">
              Estamos trabajando en esta sección para que puedas publicar tus propiedades como particular.
            </p>
            <Button onClick={() => window.history.back()}>
              Volver
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
