"use client"

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type PaymentStep = 'method' | 'proof' | 'confirm' | 'success'

export interface StepConfig {
  id: PaymentStep
  title: string
  description: string
  icon: React.ElementType
}

const steps: StepConfig[] = [
  {
    id: 'method',
    title: 'Método de Pago',
    description: 'Selecciona cómo pagar',
    icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )
  },
  {
    id: 'proof',
    title: 'Comprobante',
    description: 'Sube tu pago',
    icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    id: 'confirm',
    title: 'Confirmar',
    description: 'Verifica tu pago',
    icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
]

interface PaymentWizardProps {
  currentStep: PaymentStep
  onStepChange: (step: PaymentStep) => void
  canProceed: boolean
  onProceed?: () => void
  onBack?: () => void
  children: React.ReactNode
  isSubmitting?: boolean
  /** Sobrescribe los pasos del indicador (ej: flujo QR de 2 pasos) */
  stepsConfig?: StepConfig[]
  /** Oculta los botones Anterior/Siguiente (el paso maneja sus propias acciones) */
  hideNavigation?: boolean
}

export default function PaymentWizard({
  currentStep,
  onStepChange,
  canProceed,
  onProceed,
  onBack,
  children,
  isSubmitting = false,
  stepsConfig,
  hideNavigation = false
}: PaymentWizardProps) {
  const activeSteps = stepsConfig && stepsConfig.length > 0 ? stepsConfig : steps

  const getCurrentStepIndex = () => {
    return activeSteps.findIndex(s => s.id === currentStep)
  }

  const currentIndex = getCurrentStepIndex()

  const handleNext = () => {
    if (canProceed && onProceed) {
      onProceed()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0 && onBack) {
      onBack()
    }
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex <= currentIndex) {
      onStepChange(activeSteps[stepIndex].id)
    }
  }

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'pending'
  }

  return (
    <div className="w-full">
      {/* Progress Header */}
      <div className="mb-8">
        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-4">
          {activeSteps.map((step, index) => {
            const status = getStepStatus(index)
            const Icon = step.icon

            return (
              <React.Fragment key={step.id}>
                {/* Step Circle */}
                <button
                  onClick={() => goToStep(index)}
                  disabled={status === 'pending'}
                  className={cn(
                    "relative flex flex-col items-center flex-1 group transition-all duration-300",
                    status === 'pending' && 'cursor-not-allowed opacity-50'
                  )}
                >
                  {/* Circle */}
                  <div
                    className={cn(
                      "relative flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-300 mb-2",
                      status === 'completed'
                        ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30"
                        : status === 'current'
                          ? "bg-primary border-primary text-white shadow-xl shadow-primary/40 scale-110"
                          : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                    )}
                  >
                    {status === 'completed' ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon />
                    )}

                    {/* Pulsing Animation for Current */}
                    {status === 'current' && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></div>
                        <div className="absolute inset-0 rounded-full bg-primary animate-pulse opacity-40"></div>
                      </>
                    )}
                  </div>

                  {/* Labels */}
                  <p
                    className={cn(
                      "text-xs font-medium text-center transition-colors duration-300",
                      status === 'completed'
                        ? "text-green-600 dark:text-green-400"
                        : status === 'current'
                          ? "text-primary font-semibold"
                          : "text-gray-400 dark:text-gray-500"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
                    {step.description}
                  </p>
                </button>

                {/* Connector Line */}
                {index < activeSteps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-4 mt-7 rounded-full transition-all duration-500 max-w-[80px]",
                      status === 'completed' ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                    )}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="mb-8">{children}</div>

      {/* Navigation Buttons */}
      {!hideNavigation && (
      <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        {/* Back Button */}
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0 || isSubmitting}
          variant="outline"
          size="lg"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>

        {/* Step Indicator */}
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Paso {currentIndex + 1} de {activeSteps.length}
        </div>

        {/* Next/Submit Button */}
        <Button
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          size="lg"
          className={cn(
            "flex items-center gap-2 min-w-[140px]",
            currentIndex === activeSteps.length - 1 && "bg-green-600 hover:bg-green-700"
          )}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </>
          ) : currentIndex === activeSteps.length - 1 ? (
            <>
              Confirmar Pago
              <Check className="w-4 h-4" />
            </>
          ) : (
            <>
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
      )}
    </div>
  )
}
