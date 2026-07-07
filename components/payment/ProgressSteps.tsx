"use client"

import React from 'react'
import { Check, Clock, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressStep {
  id: number
  label: string
  icon: React.ElementType
}

const steps: ProgressStep[] = [
  { id: 1, label: 'Seleccionar Plan', icon: CreditCard },
  { id: 2, label: 'Generar QR', icon: Clock },
  { id: 3, label: 'Confirmar Pago', icon: Check },
]

interface ProgressStepsProps {
  currentStep: number
}

export default function ProgressSteps({ currentStep }: ProgressStepsProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : isCurrent
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/50 scale-110"
                        : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <StepIcon className="w-6 h-6" />
                  )}

                  {/* Pulsing Animation for Current Step */}
                  {isCurrent && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></div>
                      <div className="absolute inset-0 rounded-full bg-primary animate-pulse opacity-40"></div>
                    </>
                  )}
                </div>

                {/* Label */}
                <p
                  className={cn(
                    "mt-2 text-sm font-medium transition-colors duration-300 text-center",
                    isCompleted
                      ? "text-green-600 dark:text-green-400"
                      : isCurrent
                        ? "text-primary font-semibold"
                        : "text-gray-400 dark:text-gray-500"
                  )}
                >
                  {step.label}
                </p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 rounded-full transition-all duration-500 max-w-[100px]",
                    isCompleted ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
