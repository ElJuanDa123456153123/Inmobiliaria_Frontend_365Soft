"use client"

import React, { useState } from 'react'
import { CreditCard, QrCode, Smartphone, Building2, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type PaymentMethod = 'qr' | 'bisa' | 'bcp' | 'transferencia'

interface PaymentMethodOption {
  id: PaymentMethod
  name: string
  icon: React.ElementType
  description: string
  color: string
  badge?: string
  popular?: boolean
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'qr',
    name: 'QR Code',
    icon: QrCode,
    description: 'Escanea el QR con tu app bancaria',
    color: 'from-blue-500 to-cyan-500',
    badge: 'Recomendado',
    popular: true
  },
  {
    id: 'bisa',
    name: 'Bisa',
    icon: Building2,
    description: 'Pago directo desde Banco Bisa',
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 'bcp',
    name: 'BCP',
    icon: CreditCard,
    description: 'Tarjeta de crédito o débito BCP',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'transferencia',
    name: 'Transferencia',
    icon: Smartphone,
    description: 'Transferencia bancaria o billetera',
    color: 'from-green-500 to-emerald-500'
  }
]

interface PaymentMethodSelectorProps {
  selected: PaymentMethod
  onSelect: (method: PaymentMethod) => void
}

export default function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <Card className="border-2 border-primary/20 shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Selecciona Método de Pago
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon
            const isSelected = selected === method.id

            return (
              <button
                key={method.id}
                onClick={() => onSelect(method.id)}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all duration-300 text-left group hover:shadow-lg",
                  isSelected
                    ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-primary/50"
                )}
              >
                {/* Badge Popular */}
                {method.popular && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-primary/80 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                    {method.badge}
                  </div>
                )}

                {/* Check Icon for Selected */}
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-primary rounded-full p-1">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Icon */}
                <div className={cn(
                  "inline-flex p-3 rounded-xl mb-3 bg-gradient-to-br transition-all duration-300",
                  method.color
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h4 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                  {method.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {method.description}
                </p>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/80 rounded-b-lg"></div>
                )}
              </button>
            )
          })}
        </div>

        {/* Info Message */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>El método QR Code es el más rápido y seguro. Recomendamos usarlo para una activación inmediata.</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
