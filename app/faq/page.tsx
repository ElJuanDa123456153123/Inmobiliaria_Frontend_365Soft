"use client"

import { HelpCircle, Building, UserPlus, Search, Shield, CreditCard, Home, MessageSquare, CheckCircle, XCircle } from "lucide-react"
import { useState } from "react"

export default function FAQPage() {
  const [openItem, setOpenItem] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index)
  }

  const faqItems = [
    {
      icon: Home,
      question: "¿Cómo publico una propiedad?",
      answer: "Para publicar una propiedad: 1) Regístrate en la plataforma, 2) Haz clic en 'Publicar Propiedad' en el menú, 3) Completa el formulario con todos los datos de la propiedad, 4) Sube fotos de calidad, 5) Revisa y publica. Tu propiedad será revisada y activada en máximo 24 horas.",
      color: "text-blue-600"
    },
    {
      icon: CreditCard,
      question: "¿Publicar propiedades es gratuito?",
      answer: "Sí, la publicación básica de propiedades es completamente gratuita. Ofrecemos planes premium con beneficios adicionales como destacar propiedades, mayor visibilidad y asesoría personalizada. Revisa nuestra sección de planes para más información.",
      color: "text-emerald-600"
    },
    {
      icon: Search,
      question: "¿Cómo busco propiedades?",
      answer: "Puedes buscar propiedades de varias formas: 1) Usa el buscador principal con filtros por ubicación, tipo y precio, 2) Navega por las categorías en el menú (Venta, Alquiler, Anticrético), 3) Usa los filtros avanzados para refinar por zona, precio, número de dormitorios y más.",
      color: "text-purple-600"
    },
    {
      icon: UserPlus,
      question: "¿Necesito registrarme para ver propiedades?",
      answer: "No, puedes explorar y ver todas las propiedades sin registrarte. Sin embargo, el registro te permite: guardar propiedades en favoritos, contactar a vendedores directamente, publicar tus propias propiedades, y recibir alertas de nuevas propiedades que coincidan con tu búsqueda.",
      color: "text-primary"
    },
    {
      icon: MessageSquare,
      question: "¿Cómo contacto al vendedor de una propiedad?",
      answer: "Una vez registrado, al ver una propiedad encontrarás el formulario de contacto y los datos del vendedor (teléfono y email). Puedes enviar un mensaje directo a través de la plataforma o contactarlo por WhatsApp si el vendedor lo tiene habilitado.",
      color: "text-amber-600"
    },
    {
      icon: Shield,
      question: "¿Es segura la plataforma?",
      answer: "Sí, tomamos varias medidas de seguridad: verificación de correo electrónico, moderación de publicaciones, encriptación de datos (HTTPS), y protección contra spam. Sin embargo, recomendamos precaución al realizar transacciones: verifica la propiedad en persona y usa métodos de pago seguros.",
      color: "text-red-600"
    },
    {
      icon: Building,
      question: "¿Qué tipos de propiedades puedo publicar?",
      answer: "Puedes publicar: casas, departamentos, terrenos, oficinas, locales comerciales, galpones, y otros tipos de inmuebles. Aceptamos propiedades en venta, alquiler y anticrético en todas las zonas de Bolivia.",
      color: "text-blue-600"
    },
    {
      icon: CreditCard,
      question: "¿Cómo funciona el anticrético?",
      answer: "El anticrético es un sistema de alquiler típico de Bolivia donde el inquilino entrega una suma de dinero al propietario como garantía, quien la invierte y devuelve el mismo monto al finalizar el contrato (generalmente 1-3 años). No se paga alquiler mensual. En la plataforma puedes filtrar propiedades específicamente en anticrético.",
      color: "text-emerald-600"
    },
    {
      icon: CheckCircle,
      question: "¿Cuánto tiempo tarda en activarse mi propiedad?",
      answer: "Las propiedades se revisan manualmente para asegurar calidad y veracidad. Este proceso tarda entre 1 y 24 horas hábiles. Recibirás un correo electrónico cuando tu propiedad sea aprobada y activada.",
      color: "text-green-600"
    },
    {
      icon: XCircle,
      question: "¿Puedo editar o eliminar mi publicación?",
      answer: "Sí, puedes editar o eliminar tus publicaciones en cualquier momento desde tu panel de usuario. Solo entra a 'Mis Propiedades', selecciona la propiedad que deseas modificar y haz clic en 'Editar' o 'Eliminar'. Los cambios se aplican inmediatamente.",
      color: "text-destructive"
    },
    {
      icon: MessageSquare,
      question: "¿Puedo tener un asesor inmobiliario?",
      answer: "Sí, contamos con un equipo de asesores inmobiliarios certificados que pueden ayudarte a comprar, vender o alquilar tu propiedad. Puedes solicitar asesoría a través del formulario de contacto o llamar a nuestro teléfono +591 333 3444.",
      color: "text-amber-600"
    },
    {
      icon: Shield,
      question: "¿Qué hago si encuentro una publicación falsa?",
      answer: "Si encuentras una publicación sospechosa o fraudulenta, repórtala inmediatamente usando el botón 'Denunciar' en cada ficha de propiedad o contáctanos a info@365soft.bo. Tomamos acción rápida contra publicaciones fraudulentas y usuarios que violen nuestros términos.",
      color: "text-red-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground font-serif tracking-tight mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-muted-foreground text-lg">
            Encuentra respuestas a las dudas más comunes sobre nuestra plataforma
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button className="bg-background rounded-lg shadow-sm border border-border p-4 hover:border-primary/50 transition-colors">
            <Home className="h-6 w-6 text-blue-600 mb-2" />
            <p className="text-xs font-medium text-foreground">Publicar</p>
          </button>
          <button className="bg-background rounded-lg shadow-sm border border-border p-4 hover:border-primary/50 transition-colors">
            <Search className="h-6 w-6 text-purple-600 mb-2" />
            <p className="text-xs font-medium text-foreground">Buscar</p>
          </button>
          <button className="bg-background rounded-lg shadow-sm border border-border p-4 hover:border-primary/50 transition-colors">
            <MessageSquare className="h-6 w-6 text-amber-600 mb-2" />
            <p className="text-xs font-medium text-foreground">Contactar</p>
          </button>
          <button className="bg-background rounded-lg shadow-sm border border-border p-4 hover:border-primary/50 transition-colors">
            <Shield className="h-6 w-6 text-red-600 mb-2" />
            <p className="text-xs font-medium text-foreground">Seguridad</p>
          </button>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const Icon = item.icon
            const isOpen = openItem === index

            return (
              <div
                key={index}
                className="bg-background rounded-xl shadow-sm border border-border overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-5 flex items-start gap-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className={`flex-shrink-0 ${item.color}`}>
                    <Icon className="h-5 w-5 mt-0.5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm pr-8">
                      {item.question}
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    {isOpen ? (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pl-15">
                    <div className="ml-9 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Still Have Questions */}
        <div className="mt-12 bg-primary/5 border border-primary/20 rounded-xl p-8">
          <div className="text-center max-w-2xl mx-auto">
            <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-3">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="text-muted-foreground mb-6">
              Nuestro equipo de soporte está listo para ayudarte con cualquier duda
              o problema que puedas tener.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:info@365soft.bo"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <MessageSquare className="h-4 w-4" />
                Enviar Email
              </a>
              <a
                href="tel:+59133334444"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-background text-foreground border border-border rounded-lg hover:bg-muted transition-colors font-medium"
              >
                <Shield className="h-4 w-4" />
                Llamar Ahora
              </a>
            </div>
            <div className="mt-6 pt-6 border-t border-border/50 text-sm text-muted-foreground">
              <p>Tiempo de respuesta: 24-48 horas</p>
              <p className="mt-1">Horario: Lun - Vie, 9:00 - 18:00 (Hora Bolivia)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
