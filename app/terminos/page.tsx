import { FileText, AlertCircle, Ban, Shield, Scale } from "lucide-react"

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground font-serif tracking-tight mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-muted-foreground text-lg">
            Última actualización: Abril 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-background rounded-xl shadow-sm border border-border p-8 md:p-12 space-y-8">
          {/* Introduction */}
          <section className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <p className="text-sm text-muted-foreground">
              Al acceder y usar <strong className="text-foreground">Inmobiliaria Bolivia</strong>,
              aceptas estos términos. Si no estás de acuerdo, por favor no utilices esta plataforma.
            </p>
          </section>

          {/* User Obligations */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. Obligaciones del Usuario
            </h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground text-sm mb-1">Información Verídica</h3>
                  <p className="text-xs text-muted-foreground">
                    Debes proporcionar información verdadera, exacta y completa al registrarte y publicar propiedades.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground text-sm mb-1">Uso Apropiado</h3>
                  <p className="text-xs text-muted-foreground">
                    No usar la plataforma para actividades ilegales, fraudulentas o con fines maliciosos.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground text-sm mb-1">Respeta a otros</h3>
                  <p className="text-xs text-muted-foreground">
                    Tratar con respeto a otros usuarios, asesores y personal de la plataforma.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Prohibitions */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. Prohibiciones
            </h2>
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6 space-y-3">
              <div className="flex gap-3">
                <Ban className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground text-sm">No está permitido:</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground mt-2">
                    <li>Publicar propiedades que no te pertenecen o sin autorización</li>
                    <li>Subir fotos falsas o que no correspondan a la propiedad</li>
                    <li>Proporcionar información de contacto falsa o de terceros sin permiso</li>
                    <li>Intentar acceder a cuentas de otros usuarios</li>
                    <li>Publicar contenido ofensivo, discriminatorio o inapropiado</li>
                    <li>Spam o envío masivo de mensajes no solicitados</li>
                    <li>Copiar, modificar o distribuir el contenido de la plataforma sin autorización</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Property Publications */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              3. Publicación de Propiedades
            </h2>
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-medium text-foreground text-sm mb-2">Responsabilidad</h3>
                <p className="text-xs text-muted-foreground">
                  El usuario es <strong>único responsable</strong> de la veracidad de la información publicada.
                  Inmobiliaria Bolivia no garantiza la exactitud de los datos proporcionados por los usuarios.
                </p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <h3 className="font-medium text-foreground text-sm mb-2">Moderación</h3>
                <p className="text-xs text-muted-foreground">
                  Nos reservamos el derecho de <strong>remover, suspender o rechazar</strong> publicaciones que
                  violen estos términos o que consideremos inapropiadas.
                </p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <h3 className="font-medium text-foreground text-sm mb-2">Fotos y Multimedia</h3>
                <p className="text-xs text-muted-foreground">
                  Al subir fotos, declaras que tienes derecho a publicarlas y que no violan derechos de autor
                  o privacidad de terceros.
                </p>
              </div>
            </div>
          </section>

          {/* Transactions */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              4. Transacciones Inmobiliarias
            </h2>
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Importante:</strong> Inmobiliaria Bolivia actúa únicamente
                    como plataforma de conexión entre vendedores y compradores.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                    <li><strong>No somos parte de la transacción</strong> entre comprador y vendedor</li>
                    <li><strong>No verificamos</strong> la legalidad de las propiedades publicadas</li>
                    <li><strong>No garantizamos</strong> el resultado de ninguna transacción</li>
                    <li>Recomendamos asesoramiento legal antes de realizar cualquier transacción inmobiliaria</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              5. Propiedad Intelectual
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Todo el contenido de Inmobiliaria Bolivia (diseño, logos, texto, software, imágenes, bases de datos)
                es propiedad exclusiva de <strong className="text-foreground">365Soft</strong> o sus licenciantes,
                y está protegido por las leyes de propiedad intelectual.
              </p>
              <p>
                No está permitido copiar, modificar, distribuir o utilizar el contenido de esta plataforma sin
                autorización expresa por escrito.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              6. Limitación de Responsabilidad
            </h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <Scale className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    En la máxima medida permitida por la ley, Inmobiliaria Bolivia <strong className="text-foreground">
                    no será responsable</strong> de:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Pérdidas directas, indirectas, incidentales o consecuentes</li>
                    <li>Daños por virus que afecten tu equipo</li>
                    <li>Errores o interrupciones del servicio</li>
                    <li>Transacciones entre usuarios</li>
                    <li>La veracidad de la información publicada por terceros</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Account Suspension */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              7. Suspensión y Terminación
            </h2>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-3">
                Nos reservamos el derecho de <strong className="text-foreground">suspender o cancelar</strong> cuentas
                que violen estos términos, sin previo aviso y a nuestra entera discreción.
              </p>
              <p className="text-sm text-muted-foreground">
                Causas de suspensión incluyen: fraude, actividad ilegal, violación de propiedad intelectual,
                o cualquier conducta que dañe la plataforma u otros usuarios.
              </p>
            </div>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              8. Modificaciones de los Términos
            </h2>
            <p className="text-sm text-muted-foreground">
              Podemos actualizar estos términos en cualquier momento. Los cambios entrarán en vigor
              al publicarse en esta página. El uso continuo de la plataforma después de cambios
              constituye tu aceptación de los nuevos términos.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-3">
              ¿Tienes preguntas sobre estos términos?
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-foreground">
                <strong>Email:</strong> legal@365soft.bo
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
              Estos términos constituyen un acuerdo legal vinculante entre tú y 365Soft.
              Al usar Inmobiliaria Bolivia, aceptas estar sujeto a estos términos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
