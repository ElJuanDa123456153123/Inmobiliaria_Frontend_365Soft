"use client"

import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface CodeSnippetProps {
  code: string
  label?: string
}

export default function CodeSnippet({ code, label = "Código de Referencia" }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Código copiado al portapapeles')

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      toast.error('Error al copiar código')
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 font-mono text-sm">
          <span className="text-gray-900 dark:text-white">{code}</span>
        </div>
        <Button
          onClick={handleCopy}
          variant={copied ? "default" : "outline"}
          size="icon"
          className={copied ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
