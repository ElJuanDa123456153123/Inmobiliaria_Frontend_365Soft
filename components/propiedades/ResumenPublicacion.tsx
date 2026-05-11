"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, MapPin, Home, DollarSign, Image as ImageIcon, FileText, Edit } from "lucide-react"
import { Imagen } from "@/lib/store/formularioPublicacion"
import Image from "next/image"

interface ResumenPublicacionProps {
  datosOperacion: any
  datosGenerales: any
  detallesPropiedad: any
  confortSeguridad: any
  imagenesDatos: any
  descripcionDatos: any
  onEditarPaso: (paso: number) => void
  onPublicar: () => void
  publishing?: boolean
}

export default function ResumenPublicacion({
  datosOperacion,
  datosGenerales,
  detallesPropiedad,
  confortSeguridad,
  imagenesDatos,
  descripcionDatos,
  onEditarPaso,
  onPublicar,
  publishing = false
}: ResumenPublicacionProps) {

  const getTipoOperacionLabel = (tipo: string) => {
    const tipos = {
      'venta': 'Venta',
      'alquiler': 'Alquiler',
      'anticretico': 'Anticrético'
    }
    return tipos[tipo as keyof typeof tipos] || tipo
  }

  const getTipoPropiedadLabel = (tipo: string) => {
    const tipos = {
      'casa': 'Casa',
      'departamento': 'Departamento',
      'terreno': 'Terreno',
      'oficina': 'Oficina',
      'local': 'Local Comercial'
    }
    return tipos[tipo as keyof typeof tipos] || tipo
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Revisa tu publicación antes de publicarla
        </h2>
        <p className="text-gray-600">
          Puedes editar cada sección haciendo clic en "Editar"
        </p>
      </div>

      {/* Paso 1 - Datos de la operación */}
      <Card className="border-2 border-primary">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Datos de la operación</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditarPaso(1)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Título</p>
              <p className="font-semibold">{datosOperacion.titulo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tipo de operación</p>
              <p className="font-semibold">{getTipoOperacionLabel(datosOperacion.tipoOperacion)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Precio</p>
              <p className="font-semibold text-2xl text-primary">
                {datosOperacion.moneda === 'USD' ? 'U$S' : 'Bs'} {datosOperacion.precio}
              </p>
            </div>
            {/* Condiciones solo para VENTA */}
            {(datosOperacion.aceptaPermuta || datosOperacion.financia) && (
              <div>
                <p className="text-sm text-gray-600">Condiciones</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {datosOperacion.aceptaPermuta && (
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                      ✓ Acepta permuta
                    </span>
                  )}
                  {datosOperacion.financia && (
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      ✓ Financia
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Campos específicos para ALQUILER */}
          {datosOperacion.tipoOperacion === 'alquiler' && (
            <div className="mt-4 pt-4 border-t grid md:grid-cols-2 gap-4">
              {datosOperacion.deposito && (
                <div>
                  <p className="text-sm text-gray-600">Depósito / Garantía</p>
                  <p className="font-semibold">{datosOperacion.deposito}</p>
                </div>
              )}
              {datosOperacion.plazoMinimo && (
                <div>
                  <p className="text-sm text-gray-600">Plazo mínimo</p>
                  <p className="font-semibold">{datosOperacion.plazoMinimo}</p>
                </div>
              )}
              {datosOperacion.serviciosIncluidos && datosOperacion.serviciosIncluidos.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-2">Servicios incluidos</p>
                  <div className="flex flex-wrap gap-2">
                    {datosOperacion.serviciosIncluidos.map((servicio: string, index: number) => (
                      <span key={`servicio-${index}`} className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        ✓ {servicio}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Campos específicos para ANTICRÉTICO */}
          {datosOperacion.tipoOperacion === 'anticretico' && (
            <div className="mt-4 pt-4 border-t grid md:grid-cols-2 gap-4">
              {datosOperacion.duracionContrato && (
                <div>
                  <p className="text-sm text-gray-600">Duración del contrato</p>
                  <p className="font-semibold">{datosOperacion.duracionContrato}</p>
                </div>
              )}
              {datosOperacion.opcionCompra && (
                <div>
                  <p className="text-sm text-gray-600">Opción de compra</p>
                  <p className="font-semibold text-green-600">✓ Sí</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paso 2 - Datos generales */}
      <Card className="border-2 border-primary">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Datos generales</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditarPaso(2)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Tipo de propiedad</p>
              <p className="font-semibold">{getTipoPropiedadLabel(datosGenerales.tipoPropiedad)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Zona</p>
              <p className="font-semibold">{datosGenerales.zona}</p>
            </div>
            {datosGenerales.direccion && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Dirección</p>
                <p className="font-semibold">{datosGenerales.mostrarDireccion ? datosGenerales.direccion : 'No visible (privado)'}</p>
              </div>
            )}
            {(datosGenerales.latitud && datosGenerales.longitud) && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Ubicación en mapa
                </p>
                <p className="text-sm text-gray-500">
                  {datosGenerales.latitud.toFixed(4)}, {datosGenerales.longitud.toFixed(4)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Paso 3 - Detalles de la propiedad */}
      <Card className="border-2 border-primary">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Detalles de la propiedad</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditarPaso(3)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Dormitorios</p>
              <p className="font-semibold text-lg">{detallesPropiedad.dormitorios}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Baños</p>
              <p className="font-semibold text-lg">{detallesPropiedad.banos}</p>
            </div>
            {detallesPropiedad.garaje && detallesPropiedad.garaje !== "0" && (
              <div>
                <p className="text-sm text-gray-600">Garaje</p>
                <p className="font-semibold text-lg">{detallesPropiedad.garaje}</p>
              </div>
            )}
            {(detallesPropiedad.garaje === "0" || !detallesPropiedad.garaje) && (
              <div>
                <p className="text-sm text-gray-600">Garaje</p>
                <p className="font-semibold text-lg text-gray-400">Sin garaje</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Metros edificados</p>
              <p className="font-semibold text-lg">{detallesPropiedad.metrosEdificados} m²</p>
            </div>
            {detallesPropiedad.metrosTerreno && (
              <div>
                <p className="text-sm text-gray-600">Metros terreno</p>
                <p className="font-semibold text-lg">{detallesPropiedad.metrosTerreno} m²</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <p className="font-semibold capitalize">{detallesPropiedad.estado}</p>
            </div>
            {detallesPropiedad.anoConstruccion && (
              <div>
                <p className="text-sm text-gray-600">Año construcción</p>
                <p className="font-semibold">{detallesPropiedad.anoConstruccion}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Pisos</p>
              <p className="font-semibold">{detallesPropiedad.cantidadPisos}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {detallesPropiedad.aptoOficina && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                Apto oficina
              </span>
            )}
            {detallesPropiedad.viviendaSocial && (
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                Vivienda social
              </span>
            )}
            {detallesPropiedad.condominio && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Condominio
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Paso 4 - Confort y seguridad */}
      {!confortSeguridad.noAplica && (confortSeguridad.confort.length > 0 || confortSeguridad.seguridad.length > 0) && (
        <Card className="border-2 border-primary">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Confort y seguridad</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditarPaso(4)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
            </div>

            <div className="space-y-4">
              {confortSeguridad.confort.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Confort</p>
                  <div className="flex flex-wrap gap-2">
                    {confortSeguridad.confort.map((item: string, index: number) => (
                      <span key={`confort-${index}`} className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        {item.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {confortSeguridad.seguridad.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Seguridad</p>
                  <div className="flex flex-wrap gap-2">
                    {confortSeguridad.seguridad.map((item: string, index: number) => (
                      <span key={`seguridad-${index}`} className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        {item.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paso 5 - Imágenes */}
      <Card className="border-2 border-primary">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Imágenes ({imagenesDatos.imagenes.length})</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditarPaso(5)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {imagenesDatos.imagenes.slice(0, 6).map((imagen: Imagen, index: number) => (
              <div key={imagen.id} className="relative aspect-square rounded-lg overflow-hidden border">
                <img
                  src={imagen.preview}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <div className="absolute top-1 left-1 bg-green-500 text-white px-2 py-0.5 rounded text-xs">
                    Principal
                  </div>
                )}
              </div>
            ))}
          </div>

          {imagenesDatos.imagenes.length > 6 && (
            <p className="text-sm text-gray-600 mt-3">
              + {imagenesDatos.imagenes.length - 6} imágenes más
            </p>
          )}
        </CardContent>
      </Card>

      {/* Paso 6 - Descripción */}
      <Card className="border-2 border-primary">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Descripción</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditarPaso(6)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
          </div>

          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: descripcionDatos.descripcion }}
          />

          {descripcionDatos.terminosCondiciones && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Términos y condiciones:</p>
              <p className="text-sm bg-gray-50 p-3 rounded">{descripcionDatos.terminosCondiciones}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botón de publicación */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={onPublicar}
          disabled={publishing}
          size="lg"
          className="bg-primary hover:bg-primary/90 px-12 py-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {publishing ? 'Publicando...' : 'Publicar Propiedad'}
        </Button>
      </div>

      <div className="text-center text-sm text-gray-600">
        Al hacer clic en "Publicar Propiedad", aceptas nuestros términos y condiciones
      </div>
    </div>
  )
}
