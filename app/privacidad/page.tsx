import { Shield, Eye, Cookie, Trash2, Mail } from "lucide-react"

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground font-serif tracking-tight mb-4">
            Política de Privacidad
          </h1>
          <p className="text-muted-foreground text-lg">
            Última actualización: Abril 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-background rounded-xl shadow-sm border border-border p-8 md:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. Información que Recopilamos
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="flex gap-3">
                <Eye className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground mb-2">Datos Personales</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Nombre completo y número de contacto</li>
                    <li>Correo electrónico</li>
                    <li>Dirección (para propiedades)</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <Cookie className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground mb-2">Datos de Uso</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Propiedades que visitaste</li>
                    <li>Búsquedas realizadas</li>
                    <li>Dispositivo y navegador utilizado</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Purpose */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. ¿Para qué usamos tus datos?
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm">✅ Mostrar propiedades según tu ubicación y preferencias</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm">✅ Facilitar el contacto entre vendedores y compradores</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm">✅ Mejorar nuestros servicios y experiencia de usuario</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm">✅ Enviar notificaciones sobre propiedades de tu interés</p>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              3. Compartir Información
            </h2>
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">No vendemos</strong> tus datos personales a terceros.
                Solo compartimos información cuando es necesario para:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-3">
                <li>Facilitar la transacción inmobiliaria entre partes</li>
                <li>Cumplir con obligaciones legales</li>
                <li>Proteger los derechos y seguridad de nuestra plataforma</li>
              </ul>
            </div>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              4. Tus Derechos
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-foreground text-sm">Acceder</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Solicitar una copia de tus datos personales
                </p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <h3 className="font-medium text-foreground text-sm">Eliminar</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Solicitar la eliminación de tu cuenta y datos
                </p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-foreground text-sm">Actualizar</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Modificar tu información personal cuando quieras
                </p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <h3 className="font-medium text-foreground text-sm">Oponerte</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Oponerte al uso de tus datos para ciertos fines
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-3">
              ¿Tienes dudas sobre tu privacidad?
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Para ejercer tus derechos o consultas sobre privacidad, contáctanos:
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-foreground">
                <strong>Email:</strong> privacidad@365soft.bo
              </p>
              <p className="text-foreground">
                <strong>Teléfono:</strong> +591 333 3444
              </p>
              <p className="text-foreground">
                <strong>Dirección:</strong> Santa Cruz, Bolivia
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>
              Esta política se actualiza periódicamente. El uso continuo de nuestra plataforma
              después de cambios constituye tu aceptación de la nueva política.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
