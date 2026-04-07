import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

const footerSections = [
  {
    title: "Alquileres y Ventas",
    links: [
      { name: "Alquiler en Santa Cruz", href: "/alquiler/santa-cruz" },
      { name: "Alquiler en Norte", href: "/alquiler/norte" },
      { name: "Alquiler en La Paz", href: "/alquiler/la-paz" },
      { name: "Alquiler en Achumani", href: "/alquiler/achumani" },
      { name: "Alquiler en Cochabamba", href: "/alquiler/cochabamba" },
    ],
  },
  {
    title: "Alquileres",
    links: [
      { name: "Alquiler de casas en Santa Cruz", href: "/alquiler/casas/santa-cruz" },
      { name: "Alquiler de casas en Norte", href: "/alquiler/casas/norte" },
      { name: "Alquiler de departamentos en Santa Cruz", href: "/alquiler/departamentos/santa-cruz" },
      { name: "Alquiler de departamentos en La Paz", href: "/alquiler/departamentos/la-paz" },
    ],
  },
  {
    title: "Ventas",
    links: [
      { name: "Venta de casas en Santa Cruz", href: "/venta/casas/santa-cruz" },
      { name: "Venta de casas en Norte", href: "/venta/casas/norte" },
      { name: "Venta de departamentos en Santa Cruz", href: "/venta/departamentos/santa-cruz" },
      { name: "Venta de departamentos en La Paz", href: "/venta/departamentos/la-paz" },
    ],
  },
  {
    title: "Alojamientos",
    links: [
      { name: "Alojamientos en Santa Cruz", href: "/alojamientos/santa-cruz" },
      { name: "Alojamientos en Norte", href: "/alojamientos/norte" },
      { name: "Alojamientos en Urubó", href: "/alojamientos/urubo" },
      { name: "Alojamientos en La Paz", href: "/alojamientos/la-paz" },
    ],
  },
]

const legalLinks = [
  { name: "Preguntas Frecuentes", href: "/faq" },
  { name: "Aviso Legal", href: "/aviso-legal" },
  { name: "Términos y Condiciones", href: "/terminos" },
  { name: "Políticas de Privacidad", href: "/privacidad" },
]

const socialLinks = [
  { name: "LinkedIn", href: "https://linkedin.com" },
  { name: "YouTube", href: "https://youtube.com" },
  { name: "Instagram", href: "https://instagram.com" },
  { name: "Facebook", href: "https://facebook.com" },
]

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main sections */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-foreground mb-4 text-sm">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact and App section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">
              Descargá la app
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Tu nuevo hogar a una descarga de distancia
              </p>
            </div>

            <h3 className="font-semibold text-foreground mb-4 text-sm mt-6">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@365soft.bo" className="hover:text-foreground">
                  info@365soft.bo
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a href="tel:+59133334444" className="hover:text-foreground">
                  +591 333 3444
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Santa Cruz, Bolivia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border/40 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">365SOFT</span>
              <span className="text-sm text-muted-foreground">© 2026</span>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {social.name}
                </a>
              ))}
            </div>

            {/* Legal links */}
            <div className="flex items-center gap-4 text-sm">
              {legalLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
