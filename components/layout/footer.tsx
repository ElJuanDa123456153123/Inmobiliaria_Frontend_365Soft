import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

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
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-primary">365SOFT</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Tu plataforma inmobiliaria de confianza en Bolivia
            </p>
            <h3 className="font-semibold text-foreground mb-3 text-sm">
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

          {/* App section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">
              Descargá la app
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Tu nuevo hogar a una descarga de distancia
              </p>
              <p className="text-sm text-muted-foreground">
                Próximamente en iOS y Android
              </p>
            </div>
          </div>

          {/* Social section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">
              Síguenos
            </h3>
            <div className="space-y-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border/40 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              © 2026 365Soft Bolivia S.R.L. Todos los derechos reservados.
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
