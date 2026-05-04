import { Building2, Check, Shield, Truck } from 'lucide-react'

import { cn } from '@/lib/utils'

interface RoleSelectorProps {
  value?: string | 'admin' | 'cooperative' | 'driver'
  onChange: (value: 'admin' | 'cooperative' | 'driver') => void
  availableRoles: ('admin' | 'cooperative' | 'driver')[]
  disabled?: boolean
}

const ROLE_CONFIG: Record<
  'admin' | 'cooperative' | 'driver',
  { label: string; icon: typeof Shield; color: string }
> = {
  admin: {
    label: 'Administrador',
    icon: Shield,
    color: 'text-indigo-600',
  },
  cooperative: {
    label: 'Cooperativa',
    icon: Building2,
    color: 'text-emerald-600',
  },
  driver: {
    label: 'Motorista',
    icon: Truck,
    color: 'text-sky-600',
  },
}

export function RoleSelector({
  value,
  onChange,
  availableRoles,
  disabled,
}: RoleSelectorProps) {
  return (
    <div className="flex gap-3">
      {availableRoles.map((role) => {
        const config = ROLE_CONFIG[role]
        const Icon = config.icon
        const isSelected = value === role

        return (
          <button
            key={role}
            type="button"
            onClick={() => !disabled && onChange(role)}
            disabled={disabled}
            className={cn(
              'flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              isSelected
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-slate-200 bg-white hover:border-slate-300',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            <div className="relative h-5 w-5">
              {isSelected && (
                <div className="absolute inset-0 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              {!isSelected && (
                <Icon className={cn('h-5 w-5', config.color)} />
              )}
            </div>
            <span className="text-xs font-semibold text-foreground text-center">
              {config.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
