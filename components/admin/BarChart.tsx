"use client"

import React, { useState } from 'react'

interface DataPoint {
  label: string
  value: number
}

interface BarChartProps {
  data: DataPoint[]
  color?: string
  valueFormatter?: (value: number) => string
}

export default function BarChart({ data, color = "#10b981", valueFormatter = (v) => v.toString() }: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Sin datos disponibles
      </div>
    )
  }

  // Dimensiones
  const width = 500
  const height = 300
  const paddingLeft = 50
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 40

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  // Encontrar valor máximo
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const yTicks = 4

  const slotWidth = chartWidth / data.length
  const barWidth = slotWidth * 0.6

  // Calcular barras
  const bars = data.map((d, index) => {
    const barHeight = (d.value / maxVal) * chartHeight
    const x = paddingLeft + index * slotWidth + (slotWidth - barWidth) / 2
    const y = paddingTop + chartHeight - barHeight
    return { x, y, width: barWidth, height: barHeight, label: d.label, value: d.value }
  })

  return (
    <div className="relative w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
      <div className="relative h-64 w-full">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full overflow-visible"
        >
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

          {/* Barras */}
          {bars.map((bar, i) => {
            const isHovered = hoveredIndex === i
            return (
              <g 
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Eje X (Etiquetas) */}
                <text 
                  x={bar.x + bar.width / 2} 
                  y={height - paddingBottom + 20} 
                  textAnchor="middle" 
                  className="text-[10px] fill-gray-400 dark:fill-gray-500 font-semibold uppercase tracking-wider"
                >
                  {bar.label}
                </text>

                {/* Barra Rectangular con Bordes Redondeados */}
                {bar.height > 0 && (
                  <rect
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    fill={color}
                    fillOpacity={isHovered ? 1.0 : 0.8}
                    rx="6"
                    ry="6"
                    className="transition-all duration-200"
                  />
                )}
                
                {/* Zona interactiva invisible */}
                <rect
                  x={paddingLeft + i * slotWidth}
                  y={paddingTop}
                  width={slotWidth}
                  height={chartHeight}
                  fill="transparent"
                />
              </g>
            )
          })}
        </svg>

        {/* Tooltip flotante absoluto */}
        {hoveredIndex !== null && bars[hoveredIndex] && (
          <div 
            className="absolute z-10 bg-gray-900/95 dark:bg-gray-950/95 text-white rounded-lg shadow-xl px-3 py-2 text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full border border-gray-800 backdrop-blur-sm"
            style={{ 
              left: `${((bars[hoveredIndex].x + bars[hoveredIndex].width / 2) / width) * 100}%`, 
              top: `${(bars[hoveredIndex].y / height) * 100 - 10}%` 
            }}
          >
            <div className="font-semibold uppercase">{bars[hoveredIndex].label}</div>
            <div className="text-gray-300 mt-0.5">
              Propiedades: <span className="font-bold text-white">{valueFormatter(bars[hoveredIndex].value)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
