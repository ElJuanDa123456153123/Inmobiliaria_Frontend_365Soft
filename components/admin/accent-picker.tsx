"use client"

import { Check } from "lucide-react"
import { useEffect, useState } from "react"

type AccentColor = "cyan" | "blue" | "green" | "purple" | "orange" | "red"

interface AccentColorOption {
  value: AccentColor
  label: string
  bgClass: string
}

const accentColors: AccentColorOption[] = [
  { value: "cyan", label: "Cian (Original)", bgClass: "bg-cyan-500" },
  { value: "blue", label: "Azul", bgClass: "bg-blue-500" },
  { value: "green", label: "Verde", bgClass: "bg-green-500" },
  { value: "purple", label: "Púrpura", bgClass: "bg-purple-500" },
  { value: "orange", label: "Naranja", bgClass: "bg-orange-500" },
  { value: "red", label: "Rojo", bgClass: "bg-red-500" },
]

interface AccentPickerProps {
  value: AccentColor
  onChange?: (color: AccentColor) => void
}

export function AccentPicker({ value, onChange }: AccentPickerProps) {
  const [selected, setSelected] = useState<AccentColor>(value)

  const handleSelect = (color: AccentColor) => {
    setSelected(color)
    if (onChange) {
      onChange(color)
    }

    // Aplicar color via data attribute (método más robusto)
    if (color === "cyan") {
      // Remover data-accent para usar el color cyan por defecto
      document.documentElement.removeAttribute('data-accent')
      localStorage.removeItem('accent-color')
    } else {
      // Establecer data-accent para el color seleccionado
      document.documentElement.setAttribute('data-accent', color)
      localStorage.setItem('accent-color', color)
    }
  }

  // Cargar color guardado al montar
  useEffect(() => {
    const saved = localStorage.getItem('accent-color') as AccentColor
    if (saved) {
      setSelected(saved)
      document.documentElement.setAttribute('data-accent', saved)
    }
  }, [])

  return (
    <div className="flex gap-2 flex-wrap">
      {accentColors.map((option) => (
        <button
          key={option.value}
          onClick={() => handleSelect(option.value)}
          className={`
            relative w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-200 hover:scale-110
            ${option.bgClass}
            shadow-md hover:shadow-lg
          `}
          title={option.label}
        >
          {selected === option.value && (
            <Check className="h-5 w-5 text-white" />
          )}
        </button>
      ))}
    </div>
  )
}
