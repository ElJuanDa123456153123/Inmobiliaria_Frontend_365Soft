import { z } from 'zod'

// Paso 1: Datos de la operación
export const paso1Schema = z.object({
  titulo: z.string()
    .min(10, 'El título debe tener al menos 10 caracteres')
    .max(80, 'El título no puede exceder 80 caracteres'),
  tipoOperacion: z.enum(['venta', 'alquiler', 'anticretico']),
  precio: z.string()
    .min(1, 'Ingresa el precio')
    .regex(/^\d+$/, 'El precio debe ser un número válido'),
  moneda: z.enum(['USD', 'BOB']).default('USD'),
  aceptaPermuta: z.boolean(),
  financia: z.boolean(),
})

// Paso 2: Datos generales
export const paso2Schema = z.object({
  tipoPropiedad: z.string().min(1, 'Selecciona un tipo de propiedad'),
  direccion: z.string().optional(),
  zona: z.string().min(3, 'La zona debe tener al menos 3 caracteres'),
  tipoMarcador: z.enum(['punto-exacto', 'aproximado']).optional(),
  mostrarDireccion: z.boolean(),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
})

// Paso 3: Detalles de la propiedad
export const paso3Schema = z.object({
  dormitorios: z.string().min(1, 'Selecciona cantidad de dormitorios'),
  banos: z.string().min(1, 'Selecciona cantidad de baños'),
  garaje: z.string().optional(),
  metrosEdificados: z.string()
    .min(1, 'Ingresa los metros edificados')
    .regex(/^\d+$/, 'Debe ser un número válido'),
  metrosTerreno: z.string()
    .regex(/^\d*$/, 'Debe ser un número válido')
    .optional(),
  estado: z.string().min(1, 'Selecciona el estado de la propiedad'),
  anoConstruccion: z.string().optional(),
  aptoOficina: z.boolean(),
  viviendaSocial: z.boolean(),
  condominio: z.boolean(),
  cantidadPisos: z.string(),
})

// Paso 4: Confort y seguridad
export const paso4Schema = z.object({
  confort: z.array(z.string()).optional(),
  seguridad: z.array(z.string()).optional(),
  noAplica: z.boolean(),
})

// Paso 5: Imágenes
export const paso5Schema = z.object({
  imagenes: z.array(z.object({
    id: z.string(),
    file: z.any(),
    preview: z.string(),
    orden: z.number(),
  })).min(1, 'Debes subir al menos 1 imagen')
    .max(30, 'Máximo 30 imágenes'),
  archivos: z.array(z.object({
    id: z.string(),
    file: z.any(),
    nombre: z.string(),
  })).optional(),
  video: z.string().url('URL inválida').optional().or(z.literal('')),
})

// Paso 6: Descripción
export const paso6Schema = z.object({
  descripcion: z.string()
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(2000, 'Máximo 2000 caracteres'),
  terminosCondiciones: z.string().max(250, 'Máximo 250 caracteres').optional(),
})

// Tipos inferidos
export type Paso1FormData = z.infer<typeof paso1Schema>
export type Paso2FormData = z.infer<typeof paso2Schema>
export type Paso3FormData = z.infer<typeof paso3Schema>
export type Paso4FormData = z.infer<typeof paso4Schema>
export type Paso5FormData = z.infer<typeof paso5Schema>
export type Paso6FormData = z.infer<typeof paso6Schema>
