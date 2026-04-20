import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
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
  },
};

export default nextConfig;
