import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { cn } from '@/lib/utils'

type BackLinkProps = {
  href?: string
  label?: string
  className?: string
}

const cls =
  'mb-5 flex cursor-pointer items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground'

export function BackLink({ href, label = 'Voltar', className }: BackLinkProps) {
  const navigate = useNavigate()

  const content = (
    <>
      <ArrowLeft size={14} strokeWidth={1.75} />
      {label}
    </>
  )

  if (href) {
    return (
      <Link to={href} className={cn(cls, className)}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={() => navigate(-1)} className={cn(cls, className)}>
      {content}
    </button>
  )
}
