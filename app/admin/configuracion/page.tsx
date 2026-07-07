"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import {
  User,
  Shield,
  Palette,
  Bell,
  Building2,
  Settings as SettingsIcon,
  Key,
  Save,
  CheckCircle2,
  Clock,
  Smartphone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { ThemeToggle } from "@/components/admin/theme-toggle"
import { AccentPicker } from "@/components/admin/accent-picker"

type AccentColor = "cyan" | "blue" | "green" | "purple" | "orange" | "red"

export default function AdminConfiguracionPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [accentColor, setAccentColor] = useState<AccentColor>("cyan" as AccentColor)
  const [saveMessage, setSaveMessage] = useState<string>("")

  // Estado del formulario
  const [formData, setFormData] = useState({
    // Perfil
    nombre: "Administrador",
    email: "admin@365soft.bo",
    telefono: "+591 12345678",
    bio: "",

    // Notificaciones
    emailNotificaciones: true,
    notificacionesClientes: true,
    notificacionesPropiedades: true,
    notificacionesSistema: true,
    resumenDiario: false,
    resumenSemanal: true,

    // Preferencias
    moneda: "BOB",
    formatoPrecio: "conDecimales",
    sistemaMedidas: "m2",
    estadoPorDefecto: "disponible",
    diasDestacados: "7",
  })

  const handleSave = (section: string) => {
    setSaveMessage(`${section} guardado correctamente`)
    setTimeout(() => setSaveMessage(""), 3000)
  }

  const handleAccentChange = (color: AccentColor) => {
    setAccentColor(color)
    handleSave("Color de acento")
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2 dark:text-white">Configuración</h1>
                <p className="text-muted-foreground">
                  Gestiona tu perfil y preferencias del sistema
                </p>
              </div>
              {saveMessage && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">{saveMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="perfil" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto">
              <TabsTrigger value="perfil" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="seguridad" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Seguridad</span>
              </TabsTrigger>
              <TabsTrigger value="apariencia" className="gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Apariencia</span>
              </TabsTrigger>
              <TabsTrigger value="notificaciones" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notificaciones</span>
              </TabsTrigger>
              <TabsTrigger value="preferencias" className="gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Preferencias</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Perfil */}
            <TabsContent value="perfil" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>
                    Actualiza tu información personal y de contacto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre Completo</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={formData.telefono}
                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                        placeholder="+591 12345678"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografía (Opcional)</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Cuéntanos sobre ti..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("Perfil")}>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Perfil
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Actividad Reciente */}
              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>
                    Tu actividad reciente en el sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium dark:text-white">Último acceso</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString("es-BO", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium dark:text-white">Dispositivo actual</p>
                      <p className="text-sm text-muted-foreground">
                        Chrome en Windows - La Paz, Bolivia
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Seguridad */}
            <TabsContent value="seguridad" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cambiar Contraseña</CardTitle>
                  <CardDescription>
                    Actualiza tu contraseña para mantener tu cuenta segura
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Contraseña Actual</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nueva Contraseña</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("Contraseña")}>
                      <Save className="h-4 w-4 mr-2" />
                      Actualizar Contraseña
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Configuración Avanzada
                  </CardTitle>
                  <CardDescription>
                    Opciones adicionales de seguridad
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium dark:text-white">Autenticación de Dos Factores</p>
                      <p className="text-sm text-muted-foreground">
                        Añade una capa extra de seguridad a tu cuenta
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium dark:text-white">Sesiones Activas</p>
                      <p className="text-sm text-muted-foreground">
                        Ver y cerrar sesiones en otros dispositivos
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Gestionar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Apariencia */}
            <TabsContent value="apariencia" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tema</CardTitle>
                  <CardDescription>
                    Personaliza la apariencia del panel de administración
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Tema Claro/Oscuro */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium dark:text-white">Tema Actual</p>
                      <p className="text-sm text-muted-foreground">
                        {theme === "dark" ? "Oscuro" : theme === "light" ? "Claro" : "Sistema"}
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>

                  {/* Color de Acento */}
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium dark:text-white mb-1">Color de Acento</p>
                      <p className="text-sm text-muted-foreground">
                        Elige el color principal para botones, links y elementos destacados
                      </p>
                    </div>
                    <AccentPicker
                      value={accentColor}
                      onChange={handleAccentChange}
                    />
                  </div>

                  {/* Densidad */}
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium dark:text-white mb-1">Densidad de Interfaz</p>
                      <p className="text-sm text-muted-foreground">
                        Ajusta cuán compacta será la interfaz
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant={formData.formatoPrecio === "compacta" ? "default" : "outline"} size="sm">
                        Compacta
                      </Button>
                      <Button variant={formData.formatoPrecio === "comoda" ? "default" : "outline"} size="sm">
                        Cómoda
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("Apariencia")}>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Apariencia
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Notificaciones */}
            <TabsContent value="notificaciones" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferencias de Notificación</CardTitle>
                  <CardDescription>
                    Configura qué notificaciones deseas recibir
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium dark:text-white">Email Notificaciones</p>
                      <p className="text-sm text-muted-foreground">
                        Recibir notificaciones por email
                      </p>
                    </div>
                    <Switch
                      checked={formData.emailNotificaciones}
                      onCheckedChange={(checked) => setFormData({...formData, emailNotificaciones: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium dark:text-white">Nuevos Clientes</p>
                      <p className="text-sm text-muted-foreground">
                        Notificaciones cuando se registra un nuevo cliente
                      </p>
                    </div>
                    <Switch
                      checked={formData.notificacionesClientes}
                      onCheckedChange={(checked) => setFormData({...formData, notificacionesClientes: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium dark:text-white">Propiedades</p>
                      <p className="text-sm text-muted-foreground">
                        Notificaciones sobre propiedades
                      </p>
                    </div>
                    <Switch
                      checked={formData.notificacionesPropiedades}
                      onCheckedChange={(checked) => setFormData({...formData, notificacionesPropiedades: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium dark:text-white">Sistema</p>
                      <p className="text-sm text-muted-foreground">
                        Notificaciones del sistema y actualizaciones
                      </p>
                    </div>
                    <Switch
                      checked={formData.notificacionesSistema}
                      onCheckedChange={(checked) => setFormData({...formData, notificacionesSistema: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium dark:text-white">Resumen Diario</p>
                      <p className="text-sm text-muted-foreground">
                        Recibir un resumen diario de actividad
                      </p>
                    </div>
                    <Switch
                      checked={formData.resumenDiario}
                      onCheckedChange={(checked) => setFormData({...formData, resumenDiario: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium dark:text-white">Resumen Semanal</p>
                      <p className="text-sm text-muted-foreground">
                        Recibir un resumen semanal de actividad
                      </p>
                    </div>
                    <Switch
                      checked={formData.resumenSemanal}
                      onCheckedChange={(checked) => setFormData({...formData, resumenSemanal: checked})}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("Notificaciones")}>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Preferencias
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 5: Preferencias */}
            <TabsContent value="preferencias" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferencias de Inmobiliaria</CardTitle>
                  <CardDescription>
                    Configura las preferencias por defecto para propiedades
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="moneda">Moneda por Defecto</Label>
                      <select
                        id="moneda"
                        value={formData.moneda}
                        onChange={(e) => setFormData({...formData, moneda: e.target.value})}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                      >
                        <option value="BOB">Boliviano (BOB)</option>
                        <option value="USD">Dólar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="formatoPrecio">Formato de Precio</Label>
                      <select
                        id="formatoPrecio"
                        value={formData.formatoPrecio}
                        onChange={(e) => setFormData({...formData, formatoPrecio: e.target.value})}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                      >
                        <option value="conDecimales">Con decimales (1,234.56)</option>
                        <option value="sinDecimales">Sin decimales (1,235)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sistemaMedidas">Sistema de Medidas</Label>
                      <select
                        id="sistemaMedidas"
                        value={formData.sistemaMedidas}
                        onChange={(e) => setFormData({...formData, sistemaMedidas: e.target.value})}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                      >
                        <option value="m2">Metros cuadrados (m²)</option>
                        <option value="ft2">Pies cuadrados (ft²)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estadoPorDefecto">Estado por Defecto</Label>
                      <select
                        id="estadoPorDefecto"
                        value={formData.estadoPorDefecto}
                        onChange={(e) => setFormData({...formData, estadoPorDefecto: e.target.value})}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                      >
                        <option value="disponible">Disponible</option>
                        <option value="reservado">Reservado</option>
                        <option value="vendido">Vendido</option>
                        <option value="alquiler">Alquiler</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diasDestacados">Días Destacados por Defecto</Label>
                    <Input
                      id="diasDestacados"
                      type="number"
                      value={formData.diasDestacados}
                      onChange={(e) => setFormData({...formData, diasDestacados: e.target.value})}
                      placeholder="7"
                      min="1"
                      max="30"
                    />
                    <p className="text-xs text-muted-foreground">
                      Días que una propiedad se muestra como destacada por defecto
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("Preferencias")}>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Preferencias
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Enlaces Rápidos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    Configuración Adicional
                  </CardTitle>
                  <CardDescription>
                    Accesos directos a otras configuraciones del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4"
                    onClick={() => router.push("/admin/accesos")}
                  >
                    <Key className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <p className="font-medium">Gestión de Accesos</p>
                      <p className="text-xs text-muted-foreground">
                        Administra usuarios y permisos
                      </p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4"
                    onClick={() => router.push("/admin/planes")}
                  >
                    <Building2 className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <p className="font-medium">Planes de Suscripción</p>
                      <p className="text-xs text-muted-foreground">
                        Configura planes y precios
                      </p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4"
                    onClick={() => router.push("/admin/asesores")}
                  >
                    <User className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <p className="font-medium">Asesores</p>
                      <p className="text-xs text-muted-foreground">
                        Administra equipo de asesores
                      </p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4"
                    onClick={() => router.push("/admin/analytics")}
                  >
                    <Bell className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <p className="font-medium">Analíticas</p>
                      <p className="text-xs text-muted-foreground">
                        Ver estadísticas del sistema
                      </p>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
