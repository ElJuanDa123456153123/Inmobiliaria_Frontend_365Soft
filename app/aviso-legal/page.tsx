import { Building2, MapPin, Phone, Mail, FileCheck, Globe } from "lucide-react"

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <FileCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground font-serif tracking-tight mb-4">
            Aviso Legal
          </h1>
          <p className="text-muted-foreground text-lg">
            Última actualización: Abril 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-background rounded-xl shadow-sm border border-border p-8 md:p-12 space-y-8">
          {/* Company Info */}
          <section className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Datos de la Empresa
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Razón Social:</strong>
                </p>
                <p className="text-base text-foreground font-medium mt-1">
                  365Soft Bolivia S.R.L.
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Nombre Comercial:</strong>
                </p>
                <p className="text-base text-foreground font-medium mt-1">
                  Inmobiliaria Bolivia
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Actividad Principal:</strong>
                </p>
                <p className="text-base text-foreground mt-1">
                  Plataforma digital de intermediación inmobiliaria y servicios relacionados con bienes raíces.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Info */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Datos de Contacto
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-medium text-foreground text-sm">Dirección</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Santa Cruz de la Sierra<br />
                  Bolivia
                </p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <h3 className="font-medium text-foreground text-sm">Teléfono</h3>
                </div>
                <p className="text-sm text-foreground font-medium">
                  +591 333 3444
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Lun - Vie: 9:00 - 18:00
                </p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <h3 className="font-medium text-foreground text-sm">Email</h3>
                </div>
                <p className="text-sm text-foreground font-medium">
                  info@365soft.bo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Respuesta en 24-48 horas
                </p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <h3 className="font-medium text-foreground text-sm">Sitio Web</h3>
                </div>
                <p className="text-sm text-foreground font-medium">
                  www.inmobiliariabolivia.com
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Disponible 24/7
                </p>
              </div>
            </div>
          </section>

          {/* Legal Info */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Información Legal
            </h2>
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-medium text-foreground text-sm mb-2">Naturaleza del Servicio</h3>
                <p className="text-sm text-muted-foreground">
                  Inmobiliaria Bolivia es una <strong className="text-foreground">plataforma digital</strong>
                  que facilita la conexión entre propietarios/vendedores de bienes inmuebles y personas interesadas
                  en comprar, alquilar o anticréticos.
                </p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <h3 className="font-medium text-foreground text-sm mb-2">Rol de la Plataforma</h3>
                <p className="text-sm text-muted-foreground">
                  Actuamos como <strong className="text-foreground">intermediario tecnológico</strong>,
                  proporcionando un espacio para la publicación y búsqueda de propiedades. No somos una inmobiliaria
                  tradicional ni actuamos como agentes inmobiliarios en las transacciones.
                </p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <h3 className="font-medium text-foreground text-sm mb-2">Responsabilidad</h3>
                <p className="text-sm text-muted-foreground">
                  Nos esforzamos por mantener la calidad y veracidad de la información, pero <strong className="text-foreground">
                  no garantizamos</strong> la exactitud, integridad o actualidad de los datos proporcionados por los usuarios.
                  La verificación de la información es responsabilidad de las partes involucradas en cada transacción.
                </p>
              </div>
            </div>
          </section>

          {/* Property Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Derechos de Propiedad Intelectual
            </h2>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-3">
                Todos los derechos de propiedad intelectual sobre el contenido de este sitio web
                (diseño, estructura, base de datos, textos, gráficos, logos, software) son de
                <strong className="text-foreground"> exclusiva propiedad de 365Soft Bolivia S.R.L.</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Queda prohibida la reproducción, distribución, modificación o comunicación pública
                de cualquier contenido sin autorización expresa por escrito.
              </p>
            </div>
          </section>

          {/* Jurisdiction */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Jurisdicción y Legislación Aplicable
            </h2>
            <div className="space-y-3">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Legislación Aplicable:</strong> Las leyes de la
                  República de Bolivia, especialmente el Código de Comercio y leyes relacionadas con
                  comercio electrónico y protección al consumidor.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Jurisdicción:</strong> Para cualquier controversia
                  que pudiera surgir relacionada con el uso de este sitio web, las partes se someten a
                  los tribunales y juzgados de la ciudad de Santa Cruz de la Sierra, Bolivia.
                </p>
              </div>
            </div>
          </section>

          {/* Consumer Protection */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Protección al Consumidor
            </h2>
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-medium text-foreground text-sm mb-2">Derechos de los Usuarios</h3>
                <p className="text-sm text-muted-foreground">
                  Los usuarios tienen derecho a acceder, rectificar y cancelar sus datos personales,
                  así como oponerse al tratamiento de los mismos, de conformidad con la legislación
                  boliviana vigente en materia de protección de datos.
                </p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <h3 className="font-medium text-foreground text-sm mb-2">Reclamaciones</h3>
                <p className="text-sm text-muted-foreground">
                  Cualquier reclamación relacionada con el uso de nuestros servicios puede ser
                  presentada a través de nuestros canales de contacto, respondiendo en un plazo
                  máximo de 15 días hábiles.
                </p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <h3 className="font-medium text-foreground text-sm mb-2">Garantías</h3>
                <p className="text-sm text-muted-foreground">
                  Ofrecemos las garantías establecidas por la ley para servicios digitales,
                  asegurando el acceso continuo al servicio y la corrección de defectos técnicos
                  en un plazo razonable.
                </p>
              </div>
            </div>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Actualización del Aviso Legal
            </h2>
            <p className="text-sm text-muted-foreground">
              365Soft Bolivia S.R.L. se reserva el derecho de modificar este aviso legal en
              cualquier momento para adaptarlo a cambios legislativos o de negocio.
              Los usuarios se comprometen a revisar periódicamente este aviso legal.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-3">
              ¿Necesitas más información legal?
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-foreground">
                <strong>Departamento Legal:</strong> legal@365soft.bo
              </p>
              <p className="text-foreground">
                <strong>Teléfono:</strong> +591 333 3444
              </p>
              <p className="text-foreground">
                <strong>Horario de Atención:</strong> Lun - Vie, 9:00 - 18:00 (Hora Bolivia)
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>
              Este aviso legal tiene validez jurídica y regula el uso de la plataforma
              Inmobiliaria Bolivia operada por 365Soft Bolivia S.R.L.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
