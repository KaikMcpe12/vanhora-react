import { cn } from '@/lib/utils'

interface UserAvatarProps {
  name: string
  role: 'admin' | 'cooperative' | 'driver'
  size?: 'sm' | 'md' | 'lg'
}

const ROLE_GRADIENT: Record<'admin' | 'cooperative' | 'driver', string> = {
  admin: 'from-indigo-400 to-purple-600',
  cooperative: 'from-emerald-400 to-teal-600',
  driver: 'from-sky-400 to-blue-600',
}

const SIZE_CLASS: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

export function UserAvatar({ name, role, size = 'md' }: UserAvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-semibold text-white',
        `bg-gradient-to-br ${ROLE_GRADIENT[role]}`,
        SIZE_CLASS[size],
      )}
    >
      {initials}
    </div>
  )
}
