import { Moon, Sun } from 'lucide-react'

import { useTheme } from './theme-provider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="bg-background flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:scale-105"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-400 transition-all" />
      ) : (
        <Moon className="h-5 w-5 text-zinc-700 transition-all" />
      )}
    </button>
  )
}
