import { cn } from '@/lib/utils'

interface CooperativeAvatarProps {
  name: string
  color: string
  size?: 'sm' | 'md'
  className?: string
}

export function CooperativeAvatar({
  name,
  color,
  size = 'sm',
  className,
}: CooperativeAvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  const dim = size === 'sm' ? 22 : 28
  const fontSize = size === 'sm' ? 9 : 11

  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white', className)}
      style={{
        width: dim,
        height: dim,
        fontSize,
        backgroundColor: color,
        lineHeight: 1,
      }}
      aria-label={name}
    >
      {initials}
    </span>
  )
}
