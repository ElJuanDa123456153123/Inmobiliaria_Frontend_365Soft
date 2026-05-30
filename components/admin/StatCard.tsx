import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: string | number
    isPositive: boolean
  }
}

export default function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</span>
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend.isPositive 
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
          }`}>
            {trend.value}
          </span>
        )}
      </div>

      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{description}</p>
      )}
    </div>
  )
}
