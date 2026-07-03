import { useEffect, useRef, type RefObject } from 'react'

export function useOnClickOutside<T extends HTMLElement>(
  handler: () => void,
  active: boolean = true,
): RefObject<T | null> {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!active) return

    function handleClick(event: MouseEvent) {
      const target = event.target as Node
      if (ref.current && !ref.current.contains(target)) {
        handler()
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [handler, active])

  return ref
}
