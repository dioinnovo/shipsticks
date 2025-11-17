import React from 'react'
import { Button, ButtonProps } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

export interface SectionAction extends Omit<ButtonProps, 'children'> {
  label: string
  icon?: LucideIcon
  onClick?: () => void
}

interface SectionHeaderProps {
  title: string
  description?: string
  actions?: SectionAction[]
  className?: string
}

export function SectionHeader({
  title,
  description,
  actions,
  className = ''
}: SectionHeaderProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>

      {actions && actions.length > 0 && (
        <div className="flex items-center gap-2">
          {actions.map((action, index) => {
            const { label, icon: Icon, onClick, ...buttonProps } = action
            return (
              <Button
                key={index}
                onClick={onClick}
                {...buttonProps}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {label}
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}