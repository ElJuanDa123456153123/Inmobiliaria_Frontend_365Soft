import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      // Backend para imágenes en desarrollo
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/api/imagenes/**',
      },
      // Backend para imágenes en producción (ajustar según tu dominio)
      {
        protocol: 'https',
        hostname: process.env.BACKEND_HOSTNAME || 'tu-backend.com',
        port: '',
        pathname: '/api/imagenes/**',
      },
    ],
    // Permitir imágenes data URLs (base64)
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Configuración para el servidor de desarrollo
  experimental: {
    // Aumentar el tamaño máximo del body
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
