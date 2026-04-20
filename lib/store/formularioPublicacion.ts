import { create } from 'zustand'

export interface Imagen {
  id: string
  file?: File  // Opcional: solo durante la subida
  preview: string  // Puede ser blob URL (temporal) o URL del backend (persistente)
  url?: string  // URL del backend después de subir
  orden: number
  uploading?: boolean  // Estado de subida
  error?: string  // Error de subida
}

export interface Archivo {
  id: string
  file: File
  nombre: string
}

interface DatosOperacion {
  titulo: string
  tipoOperacion: 'venta' | 'alquiler' | 'anticretico'
  precio: string
  moneda: 'USD' | 'BOB'
  aceptaPermuta: boolean
  financia: boolean
}

interface DatosGenerales {
  tipoPropiedad: string
  direccion: string
  zona: string
  tipoMarcador: 'punto-exacto' | 'aproximado'
  latitud?: number
  longitud?: number
  mostrarDireccion: boolean
}

interface DetallesPropiedad {
  dormitorios: string
  banos: string
  garaje: string
  metrosEdificados: string
  metrosTerreno: string
  estado: string
  anoConstruccion: string
  aptoOficina: boolean
  viviendaSocial: boolean
  condominio: boolean
  cantidadPisos: string
}

interface ConfortSeguridad {
  confort: string[]
  seguridad: string[]
  noAplica: boolean
}

interface ImagenesDatos {
  imagenes: Imagen[]
  archivos: Archivo[]
  video: string
}

interface DescripcionDatos {
  descripcion: string
  terminosCondiciones: string
}

export interface FormularioPublicacionState {
  pasoActual: number
  datosOperacion: DatosOperacion
  datosGenerales: DatosGenerales
  detallesPropiedad: DetallesPropiedad
  confortSeguridad: ConfortSeguridad
  imagenesDatos: ImagenesDatos
  descripcionDatos: DescripcionDatos
  planSeleccionado?: string

  setPasoActual: (paso: number) => void
  setDatosOperacion: (datos: Partial<DatosOperacion>) => void
  setDatosGenerales: (datos: Partial<DatosGenerales>) => void
  setDetallesPropiedad: (datos: Partial<DetallesPropiedad>) => void
  setConfortSeguridad: (datos: Partial<ConfortSeguridad>) => void
  setImagenesDatos: (datos: Partial<ImagenesDatos>) => void
  setDescripcionDatos: (datos: Partial<DescripcionDatos>) => void
  setPlanSeleccionado: (plan: string) => void

  addImagen: (imagen: Imagen) => void
  removeImagen: (id: string) => void
  updateImagenOrden: (imagenes: Imagen[]) => void

  addArchivo: (archivo: Archivo) => void
  removeArchivo: (id: string) => void

  resetFormulario: () => void
  limpiarImagenesCorruptas: () => void
}

const initialState = {
  pasoActual: 1,
  datosOperacion: {
    titulo: '',
    tipoOperacion: 'venta' as const,
    precio: '',
    moneda: 'USD' as const,
    aceptaPermuta: false,
    financia: false,
  },
  datosGenerales: {
    tipoPropiedad: '',
    direccion: '',
    zona: '',
    tipoMarcador: 'punto-exacto' as const,
    mostrarDireccion: false,
  },
  detallesPropiedad: {
    dormitorios: '',
    banos: '',
    garaje: '',
    metrosEdificados: '',
    metrosTerreno: '',
    estado: '',
    anoConstruccion: '',
    aptoOficina: false,
    viviendaSocial: false,
    condominio: false,
    cantidadPisos: '1',
  },
  confortSeguridad: {
    confort: [],
    seguridad: [],
    noAplica: false,
  },
  imagenesDatos: {
    imagenes: [],
    archivos: [],
    video: '',
  },
  descripcionDatos: {
    descripcion: '',
    terminosCondiciones: '',
  },
}

export const useFormularioPublicacion = create<FormularioPublicacionState>()((set) => ({
  ...initialState,

  setPasoActual: (paso) => set({ pasoActual: paso }),

  setDatosOperacion: (datos) =>
    set((state) => ({
      datosOperacion: { ...state.datosOperacion, ...datos },
    })),

  setDatosGenerales: (datos) =>
    set((state) => ({
      datosGenerales: { ...state.datosGenerales, ...datos },
    })),

  setDetallesPropiedad: (datos) =>
    set((state) => ({
      detallesPropiedad: { ...state.detallesPropiedad, ...datos },
    })),

  setConfortSeguridad: (datos) =>
    set((state) => ({
      confortSeguridad: { ...state.confortSeguridad, ...datos },
    })),

  setImagenesDatos: (datos) =>
    set((state) => ({
      imagenesDatos: { ...state.imagenesDatos, ...datos },
    })),

  setDescripcionDatos: (datos) =>
    set((state) => ({
      descripcionDatos: { ...state.descripcionDatos, ...datos },
    })),

  setPlanSeleccionado: (plan) => set({ planSeleccionado: plan }),

  addImagen: (imagen) =>
    set((state) => ({
      imagenesDatos: {
        ...state.imagenesDatos,
        imagenes: [...state.imagenesDatos.imagenes, imagen],
      },
    })),

  removeImagen: (id) =>
    set((state) => ({
      imagenesDatos: {
        ...state.imagenesDatos,
        imagenes: state.imagenesDatos.imagenes.filter((img) => img.id !== id),
      },
    })),

  updateImagenOrden: (imagenes) =>
    set((state) => ({
      imagenesDatos: {
        ...state.imagenesDatos,
        imagenes,
      },
    })),

  addArchivo: (archivo) =>
    set((state) => ({
      imagenesDatos: {
        ...state.imagenesDatos,
        archivos: [...state.imagenesDatos.archivos, archivo],
      },
    })),

  removeArchivo: (id) =>
    set((state) => ({
      imagenesDatos: {
        ...state.imagenesDatos,
        archivos: state.imagenesDatos.archivos.filter((arc) => arc.id !== id),
      },
    })),

  resetFormulario: () => set(initialState),

  // Limpiar imágenes corruptas (con blob URLs inválidas)
  limpiarImagenesCorruptas: () =>
    set((state) => ({
      imagenesDatos: {
        ...state.imagenesDatos,
        imagenes: state.imagenesDatos.imagenes.filter((img) => {
          // Eliminar imágenes sin URL válida o con blob URL
          if (!img.url) return false
          if (img.preview?.startsWith('blob:')) {
            // Revocar el blob URL antes de eliminar
            try {
              URL.revokeObjectURL(img.preview)
            } catch (e) {
              // Ignorar errores al revocar
            }
            return false
          }
          return true
        }),
      },
    })),
}))

// Initialize persistence (must be called on client side)
export const initFormularioPersistence = () => {
  if (typeof window === 'undefined') return

  // Hydrate from localStorage
  const storage = localStorage.getItem('formulario-publicacion-storage')
  if (storage) {
    try {
      const parsed = JSON.parse(storage)
      if (parsed.state) {
        // Limpiar imágenes con blob URLs inválidas (no funcionan después de recargar)
        const imagenesLimpias = parsed.state.imagenesDatos?.imagenes?.filter((img: Imagen) => {
          // Solo mantener imágenes que tienen URL del backend (no blob URLs)
          return img.url && !img.preview?.startsWith('blob:')
        }) || []

        // Reconstruir previews desde las URLs del backend
        const imagenesHidratadas = imagenesLimpias.map((img: Imagen) => ({
          ...img,
          preview: img.url, // Usar la URL del backend como preview
          file: undefined, // Los File objects no se pueden persistir
          uploading: false,
        }))

        parsed.state.imagenesDatos = {
          ...parsed.state.imagenesDatos,
          imagenes: imagenesHidratadas,
        }

        useFormularioPublicacion.setState(parsed.state)
      }
    } catch (error) {
      console.error('Error hydrating store:', error)
    }
  }

  // Subscribe to store changes and persist to localStorage
  useFormularioPublicacion.subscribe((state) => {
    // Limpiar imágenes antes de guardar (no guardar File objects ni blob URLs)
    const imagenesLimpias = state.imagenesDatos.imagenes
      ?.filter(img => img.url) // Solo guardar imágenes con URL del backend
      .map(img => ({
        id: img.id,
        url: img.url,
        preview: img.url, // Usar URL como preview (no blob URLs)
        orden: img.orden,
      })) || []

    const stateToPersist = {
      pasoActual: state.pasoActual,
      datosOperacion: state.datosOperacion,
      datosGenerales: state.datosGenerales,
      detallesPropiedad: state.detallesPropiedad,
      confortSeguridad: state.confortSeguridad,
      imagenesDatos: {
        ...state.imagenesDatos,
        imagenes: imagenesLimpias,
      },
      descripcionDatos: state.descripcionDatos,
      planSeleccionado: state.planSeleccionado,
    }
    localStorage.setItem('formulario-publicacion-storage', JSON.stringify({ state: stateToPersist }))
  })
}
