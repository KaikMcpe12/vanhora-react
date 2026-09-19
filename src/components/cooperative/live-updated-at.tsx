import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

function relativeLabel(updatedAt: number, now: number): string {
  const s = Math.max(0, Math.round((now - updatedAt) / 1000))
  if (s < 10) return 'agora mesmo'
  if (s < 60) return `há ${s}s`
  const m = Math.round(s / 60)
  return `há ${m} min`
}

/** Selo "ao vivo": mostra "atualizado há Xs" e faz um fade curto quando o dado muda. */
export function LiveUpdatedAt({
  updatedAt,
  className,
}: {
  updatedAt: number
  className?: string
}) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10_000)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.span
      key={updatedAt}
      initial={{ opacity: 0.35 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'text-muted-foreground inline-flex items-center gap-1.5 text-xs',
        className,
      )}
    >
      <span className="relative flex size-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      Atualizado {relativeLabel(updatedAt, now)}
    </motion.span>
  )
}
