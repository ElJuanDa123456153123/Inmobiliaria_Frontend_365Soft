import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Esta API route actúa como proxy para servir imágenes desde el backend
// Next.js Image Optimization necesita cargar las imágenes desde el mismo dominio
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await params porque en Next.js 16+ son asíncronos
    const { path } = await params

    // Obtener la ruta de la imagen (ej: propiedad-123-1.webp)
    const imagePath = path.join('/')

    // Construir la URL del backend
    // Usar API_URL_INTERNAL para comunicación entre contenedores Docker, o localhost para desarrollo local
    const backendUrl = process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'
    const imageUrl = `${backendUrl}/api/imagenes/${imagePath}`

    // Fetch la imagen desde el backend
    const response = await fetch(imageUrl, {
      headers: {
        // Copiar headers relevantes
        Accept: request.headers.get('Accept') || 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
      // No seguir redirecciones automáticas para tener control
      redirect: 'follow',
    })

    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 })
    }

    // Obtener el tipo de contenido de la imagen
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Obtener los datos de la imagen
    const imageBuffer = await response.arrayBuffer()

    // Devolver la imagen con el tipo de contenido correcto
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': imageBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('Error proxying image:', error)
    return new NextResponse('Error loading image', { status: 500 })
  }
}
