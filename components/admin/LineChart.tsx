"use client"

import React, { useState } from 'react'

interface DataPoint {
  label: string
  value: number
}

interface LineChartProps {
  data: DataPoint[]
  color?: string
  valueFormatter?: (value: number) => string
}

export default function LineChart({ data, color = "#3b82f6", valueFormatter = (v) => v.toString() }: LineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Sin datos disponibles
      </div>
    )
  }

  // Dimensiones
  const width = 600
  const height = 300
  const paddingLeft = 60
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 40

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  // Encontrar valores máximo
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const yTicks = 4

  // Calcular puntos
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth
    const y = paddingTop + (1 - d.value / maxVal) * chartHeight
    return { x, y, label: d.label, value: d.value }
  })

  // Crear d para la línea
  let linePath = ""
  let areaPath = ""
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} `
    for (let i = 1; i < points.length; i++) {
      // Curva suave Bezier
      const cpX1 = points[i - 1].x + chartWidth / (data.length - 1) / 3
      const cpY1 = points[i - 1].y
      const cpX2 = points[i].x - chartWidth / (data.length - 1) / 3
      const cpY2 = points[i].y
      linePath += `C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y} `
    }

    // Cerrar la ruta del área para el gradiente
    areaPath = linePath + `L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
  }

  return (
    <div className="relative w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
      <div className="relative h-64 w-full">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full overflow-visible"
        >
          {/* Definiciones de Gradiente */}
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines horizontales */}
          {Array.from({ length: yTicks + 1 }).map((_, i) => {
            const val = (maxVal / yTicks) * i
            const y = paddingTop + (1 - i / yTicks) * chartHeight
            return (
              <g key={i} className="opacity-40">
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="#e2e8f0" 
                  strokeDasharray="4 4" 
                  className="dark:stroke-gray-600"
                />
                <text 
                  x={paddingLeft - 10} 
                  y={y + 4} 
                  textAnchor="end" 
                  className="text-[10px] fill-gray-400 dark:fill-gray-500 font-medium"
                >
                  {valueFormatter(val)}
                </text>
              </g>
            )
          })}

          {/* Área con gradiente */}
          {areaPath && (
            <path d={areaPath} fill={`url(#gradient-${color.replace('#', '')})`} />
          )}

          {/* Línea principal */}
          {linePath && (
            <path 
              d={linePath} 
              fill="none" 
              stroke={color} 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}

          {/* Eje X (Etiquetas) */}
          {points.map((p, i) => {
            // Mostrar solo algunas etiquetas en el eje X para evitar saturar
            const showLabel = 
              data.length <= 12 || 
              i === 0 || 
              i === points.length - 1 || 
              i === Math.floor(points.length / 2) || 
              (data.length === 30 && i % 7 === 0)
              
            return (
              <g key={i}>
                {showLabel && (
                  <text 
                    x={p.x} 
                    y={height - paddingBottom + 20} 
                    textAnchor="middle" 
                    className="text-[10px] fill-gray-400 dark:fill-gray-500 font-medium"
                  >
                    {p.label}
                  </text>
                )}
                {/* Zona interactiva invisible para hover */}
                <rect
                  x={p.x - chartWidth / Math.max((data.length - 1), 1) / 2}
                  y={paddingTop}
                  width={chartWidth / Math.max((data.length - 1), 1)}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            )
          })}

          {/* Efectos de Hover */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <g>
              {/* Línea vertical de guía */}
              <line
                x1={points[hoveredIndex].x}
                y1={paddingTop}
                x2={points[hoveredIndex].x}
                y2={height - paddingBottom}
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                className="dark:stroke-gray-600"
              />
              {/* Círculo interior */}
              <circle
                cx={points[hoveredIndex].x}
                cy={points[hoveredIndex].y}
                r="6"
                fill={color}
              />
              {/* Círculo exterior */}
              <circle
                cx={points[hoveredIndex].x}
                cy={points[hoveredIndex].y}
                r="10"
                fill={color}
                fillOpacity="0.2"
              />
            </g>
          )}
        </svg>

        {/* Tooltip flotante absoluto */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div 
            className="absolute z-10 bg-gray-900/95 dark:bg-gray-950/95 text-white rounded-lg shadow-xl px-3 py-2 text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full border border-gray-800 backdrop-blur-sm"
            style={{ 
              left: `${(points[hoveredIndex].x / width) * 100}%`, 
              top: `${(points[hoveredIndex].y / height) * 100 - 10}%` 
            }}
          >
            <div className="font-semibold">{points[hoveredIndex].label}</div>
            <div className="text-gray-300 mt-0.5">
              Valor: <span className="font-bold text-white">{valueFormatter(points[hoveredIndex].value)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
